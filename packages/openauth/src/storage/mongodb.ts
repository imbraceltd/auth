/**
 * Configure OpenAuth to use [MongoDB](https://www.mongodb.com/) as a storage adapter.
 *
 * ```ts
 * import { MongoDBStorage } from "@openauthjs/openauth/storage/mongodb"
 *
 * const storage = MongoDBStorage({
 *   connectionString: process.env.MONGODB_URI!,
 *   database: "myapp"
 * })
 *
 * export default issuer({
 *   storage,
 *   // ...
 * })
 * ```
 *
 * @packageDocumentation
 */

import { MongoClient, Db, Collection } from "mongodb"
import { joinKey, StorageAdapter } from "./storage.js"

/**
 * Configure the MongoDB connection and collection.
 *
 * @example
 * ```ts
 * {
 *   connectionString: "mongodb://localhost:27017",
 *   database: "myapp",
 *   collection: "openauth_storage"
 * }
 * ```
 */
export interface MongoDBStorageOptions {
  /**
   * MongoDB connection string.
   * @example "mongodb://user:password@localhost:27017"
   */
  connectionString?: string
  /**
   * MongoDB client instance (alternative to connectionString).
   */
  client?: MongoClient
  /**
   * The name of the database.
   */
  database: string
  /**
   * The name of the collection.
   * @default "openauth_storage"
   */
  collection?: string
}

interface StorageDocument {
  pk: string
  sk: string
  value: any
  expiry?: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Creates a MongoDB storage adapter.
 *
 * Automatically creates indexes:
 * - Composite unique index on `pk + sk`
 * - TTL index on `expiry` for automatic document expiration
 *
 * @param options - The config for the adapter.
 */
export function MongoDBStorage(options: MongoDBStorageOptions): StorageAdapter {
  if (!options.connectionString && !options.client) {
    throw new Error(
      "MongoDBStorage requires either 'connectionString' or 'client' option",
    )
  }

  const collectionName = options.collection || "openauth_storage"

  let client: MongoClient
  let collection: Collection<StorageDocument>
  let initialized = false

  // Match Dynamo's parseKey logic exactly for consistency
  function parseKey(key: string[]) {
    if (key.length === 2) {
      return { pk: key[0], sk: key[1] }
    }
    if (key.length < 2) {
      return { pk: joinKey(key), sk: "" }
    }
    return {
      pk: joinKey(key.slice(0, 2)),
      sk: joinKey(key.slice(2)),
    }
  }

  const notExpired = {
    $or: [
      { expiry: { $exists: false } },
      { expiry: null },
      { expiry: { $gt: new Date() } },
    ],
  }

  async function ensureConnection() {
    if (initialized) return

    if (options.client) {
      client = options.client
    } else {
      client = new MongoClient(options.connectionString!)
      await client.connect()
    }

    const db = client.db(options.database)
    collection = db.collection<StorageDocument>(collectionName)

    try {
      await collection.createIndex(
        { pk: 1, sk: 1 },
        { unique: true, name: "pk_sk_unique" },
      )
      await collection.createIndex(
        { expiry: 1 },
        { expireAfterSeconds: 0, name: "ttl_expiry" },
      )
    } catch {
      // indexes may already exist
    }

    initialized = true
  }

  return {
    async get(key: string[]) {
      await ensureConnection()
      const { pk, sk } = parseKey(key)

      const doc = await collection.findOne({ pk, sk, ...notExpired })
      if (!doc) return undefined
      return doc.value
    },

    async set(key: string[], value: any, expiry?: Date) {
      await ensureConnection()
      const { pk, sk } = parseKey(key)
      const now = new Date()

      await collection.updateOne(
        { pk, sk },
        {
          $set: {
            value,
            expiry: expiry || null,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      )
    },

    async remove(key: string[]) {
      await ensureConnection()
      const { pk, sk } = parseKey(key)
      await collection.deleteOne({ pk, sk })
    },

    async *scan(prefix: string[]) {
      await ensureConnection()
      const prefixPk =
        prefix.length >= 2 ? joinKey(prefix.slice(0, 2)) : prefix[0]
      const prefixSk = prefix.length > 2 ? joinKey(prefix.slice(2)) : ""

      const query: any = { pk: prefixPk, ...notExpired }

      if (prefixSk) {
        query.sk = { $regex: `^${escapeRegex(prefixSk)}` }
      }

      const cursor = collection.find(query).sort({ sk: 1 })
      for await (const doc of cursor) {
        yield [[doc.pk, doc.sk], doc.value]
      }
    },
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

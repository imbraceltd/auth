/**
 * Configure OpenAuth to use [MySQL](https://www.mysql.com/) as a storage adapter.
 *
 * Uses `JSON` column for value storage.
 *
 * ```ts
 * import { MySQLStorage } from "@openauthjs/openauth/storage/mysql"
 *
 * const storage = MySQLStorage({
 *   connectionString: "mysql://user:password@localhost:3306/mydb"
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

import { createPool, Pool, PoolOptions } from "mysql2/promise"
import { joinKey, splitKey, StorageAdapter } from "./storage.js"
import { validateIdentifier } from "./validate.js"

/**
 * Configure the MySQL connection and table.
 *
 * @example
 * ```ts
 * {
 *   connectionString: "mysql://user:password@localhost:3306/dbname",
 *   table: "openauth_storage"
 * }
 * ```
 */
export interface MySQLStorageOptions {
  /**
   * MySQL connection string (URI format).
   * @example "mysql://user:password@localhost:3306/dbname"
   */
  connectionString?: string
  /**
   * MySQL pool options (alternative to connectionString).
   */
  poolOptions?: PoolOptions
  /**
   * The name of the table.
   * @default "openauth_storage"
   */
  table?: string
}

/**
 * Creates a MySQL storage adapter using JSON for value storage.
 *
 * Automatically creates:
 * - Table with `key_id VARCHAR(512) PRIMARY KEY`, `value JSON`, `expiry DATETIME`
 * - Index on `expiry` for faster TTL queries
 *
 * @param options - The config for the adapter.
 */
export function MySQLStorage(options: MySQLStorageOptions): StorageAdapter {
  const table = validateIdentifier(
    options.table || "openauth_storage",
    "Table name",
  )
  const indexName = validateIdentifier(
    `idx_${table}_expiry`,
    "Index name",
  )

  let pool: Pool
  let initialized = false

  async function ensureConnection() {
    if (initialized) return

    pool = options.connectionString
      ? createPool({ uri: options.connectionString })
      : createPool(options.poolOptions!)

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`${table}\` (
        \`key_id\` VARCHAR(512) NOT NULL PRIMARY KEY,
        \`value\` JSON NOT NULL,
        \`expiry\` DATETIME(3) NULL,
        \`created_at\` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `)

    await pool
      .execute(
        `CREATE INDEX \`${indexName}\` ON \`${table}\` (\`expiry\`)`,
      )
      .catch(() => {
        /* index already exists */
      })

    initialized = true
  }

  return {
    async get(key: string[]) {
      await ensureConnection()
      const keyStr = joinKey(key)

      const [rows] = await pool.execute(
        `SELECT \`value\` FROM \`${table}\`
         WHERE \`key_id\` = ? AND (\`expiry\` IS NULL OR \`expiry\` > NOW(3))`,
        [keyStr],
      )

      const result = rows as any[]
      if (result.length === 0) return undefined

      const value = result[0].value
      return typeof value === "string" ? JSON.parse(value) : value
    },

    async set(key: string[], value: any, expiry?: Date) {
      await ensureConnection()
      const keyStr = joinKey(key)
      const jsonValue = JSON.stringify(value)

      await pool.execute(
        `INSERT INTO \`${table}\` (\`key_id\`, \`value\`, \`expiry\`)
         VALUES (?, CAST(? AS JSON), ?)
         ON DUPLICATE KEY UPDATE
           \`value\` = VALUES(\`value\`),
           \`expiry\` = VALUES(\`expiry\`)`,
        [keyStr, jsonValue, expiry || null],
      )
    },

    async remove(key: string[]) {
      await ensureConnection()
      const keyStr = joinKey(key)
      await pool.execute(
        `DELETE FROM \`${table}\` WHERE \`key_id\` = ?`,
        [keyStr],
      )
    },

    async *scan(prefix: string[]) {
      await ensureConnection()
      const prefixStr = joinKey(prefix)

      const [rows] = await pool.execute(
        `SELECT \`key_id\`, \`value\` FROM \`${table}\`
         WHERE \`key_id\` LIKE CONCAT(?, '%')
         AND (\`expiry\` IS NULL OR \`expiry\` > NOW(3))
         ORDER BY \`key_id\``,
        [prefixStr],
      )

      for (const row of rows as any[]) {
        const value =
          typeof row.value === "string" ? JSON.parse(row.value) : row.value
        yield [splitKey(row.key_id), value]
      }
    },
  }
}

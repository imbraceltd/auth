/**
 * Configure OpenAuth to use [PostgreSQL](https://www.postgresql.org/) as a storage adapter.
 *
 * Uses `JSONB` column for values — no extensions required.
 *
 * ```ts
 * import { PostgresStorage } from "@openauthjs/openauth/storage/postgres"
 *
 * const storage = PostgresStorage({
 *   connectionString: "postgres://user:password@localhost:5432/mydb"
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

import { Pool, PoolConfig } from "pg"
import { joinKey, splitKey, StorageAdapter } from "./storage.js"
import { validateIdentifier } from "./validate.js"

/**
 * Configure the PostgreSQL connection and table.
 *
 * @example
 * ```ts
 * {
 *   connectionString: "postgres://user:password@localhost:5432/dbname",
 *   table: "openauth_storage"
 * }
 * ```
 */
export interface PostgresStorageOptions {
  /**
   * PostgreSQL connection string.
   * @example "postgres://user:password@localhost:5432/dbname"
   */
  connectionString?: string
  /**
   * PostgreSQL pool config (alternative to connectionString).
   */
  poolConfig?: PoolConfig
  /**
   * The name of the table.
   * @default "openauth_storage"
   */
  table?: string
}

/**
 * Creates a PostgreSQL storage adapter using JSONB for value storage.
 *
 * Automatically creates:
 * - Table with `id TEXT PRIMARY KEY`, `value JSONB`, `expiry TIMESTAMPTZ`
 * - Partial index on `expiry` for faster TTL queries
 *
 * @param options - The config for the adapter.
 */
export function PostgresStorage(
  options: PostgresStorageOptions,
): StorageAdapter {
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
      ? new Pool({ connectionString: options.connectionString })
      : new Pool(options.poolConfig)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "${table}" (
        id TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        expiry TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS "${indexName}"
      ON "${table}" (expiry)
      WHERE expiry IS NOT NULL
    `)

    initialized = true
  }

  return {
    async get(key: string[]) {
      await ensureConnection()
      const keyStr = joinKey(key)

      const result = await pool.query(
        `SELECT value FROM "${table}"
         WHERE id = $1 AND (expiry IS NULL OR expiry > NOW())`,
        [keyStr],
      )

      if (result.rows.length === 0) return undefined
      return result.rows[0].value
    },

    async set(key: string[], value: any, expiry?: Date) {
      await ensureConnection()
      const keyStr = joinKey(key)

      await pool.query(
        `INSERT INTO "${table}" (id, value, expiry)
         VALUES ($1, $2::jsonb, $3)
         ON CONFLICT (id) DO UPDATE SET
           value = EXCLUDED.value,
           expiry = EXCLUDED.expiry,
           updated_at = NOW()`,
        [keyStr, JSON.stringify(value), expiry || null],
      )
    },

    async remove(key: string[]) {
      await ensureConnection()
      const keyStr = joinKey(key)
      await pool.query(`DELETE FROM "${table}" WHERE id = $1`, [keyStr])
    },

    async *scan(prefix: string[]) {
      await ensureConnection()
      const prefixStr = joinKey(prefix)

      const result = await pool.query(
        `SELECT id, value FROM "${table}"
         WHERE id LIKE $1
         AND (expiry IS NULL OR expiry > NOW())
         ORDER BY id`,
        [`${prefixStr}%`],
      )

      for (const row of result.rows) {
        yield [splitKey(row.id), row.value]
      }
    },
  }
}

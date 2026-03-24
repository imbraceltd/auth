/**
 * Shared validation utilities for SQL-based storage adapters.
 *
 * @internal
 * @packageDocumentation
 */

const TABLE_NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/

/**
 * Validates a SQL table/index name to prevent SQL injection.
 * Only allows alphanumeric characters and underscores, starting with a letter or underscore.
 *
 * @throws {Error} if the name is invalid.
 */
export function validateIdentifier(name: string, label = "Table name"): string {
  if (!TABLE_NAME_RE.test(name)) {
    throw new Error(
      `${label} "${name}" is invalid. Only letters, digits, and underscores are allowed (max 63 chars, must start with a letter or underscore).`,
    )
  }
  return name
}

/**
 * Base result type for database operations.
 * Contains metadata about the operation's impact on the database.
 * Compatible with both better-sqlite3 and expo-sqlite APIs.
 */
export interface DatabaseResult {
  /**
   * The row ID of the last inserted row (for INSERT operations).
   * Only populated for INSERT statements that create a new row.
   * Compatible with both better-sqlite3 (lastInsertRowid) and expo-sqlite APIs.
   */
  lastInsertRowid?: number;

  /**
   * Number of rows affected by the operation.
   * For INSERT: number of rows inserted
   * For UPDATE: number of rows modified
   * For DELETE: number of rows removed
   * For SELECT: 0 (no rows changed)
   */
  changes: number;

  /**
   * Total number of rows affected by the operation.
   * In most cases, this equals `changes`.
   * Some implementations may distinguish between direct and cascading changes.
   */
  affectedRows: number;
}

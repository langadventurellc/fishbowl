import type { DatabaseResult } from "./types/DatabaseResult";

/**
 * Platform-agnostic database interface for all database operations.
 * Provides a clean abstraction layer between shared business logic and
 * platform-specific database implementations (better-sqlite3, expo-sqlite).
 *
 * All methods are asynchronous and return Promises for consistency.
 * Platform-specific implementations handle the actual database operations
 * while maintaining this common interface contract.
 *
 * @example
 * ```typescript
 * // Query with type safety
 * const users = await db.query<User>('SELECT * FROM users WHERE active = ?', [true]);
 *
 * // Execute operations
 * const result = await db.execute('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
 * console.log(`Inserted user with ID: ${result.lastInsertRowid}`);
 *
 * // Transaction operations
 * const newUserId = await db.transaction(async (db) => {
 *   const userResult = await db.execute('INSERT INTO users (name) VALUES (?)', ['Jane']);
 *   await db.execute('INSERT INTO user_profiles (user_id, bio) VALUES (?, ?)', [userResult.lastInsertRowid, 'Bio text']);
 *   return userResult.lastInsertRowid;
 * });
 * ```
 */
export interface DatabaseBridge {
  /**
   * Execute a SELECT query and return typed results.
   * Provides type-safe query execution with automatic result typing.
   *
   * @template T The expected type of each row in the result set
   * @param sql SQL SELECT statement to execute
   * @param params Optional parameters for prepared statement binding
   * @returns Promise resolving to array of typed result rows
   *
   * @example
   * ```typescript
   * interface User { id: number; name: string; email: string; }
   * const users = await db.query<User>('SELECT * FROM users WHERE active = ?', [true]);
   * // users is typed as User[]
   * ```
   */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Execute INSERT, UPDATE, or DELETE operations.
   * Returns metadata about the operation's impact on the database.
   *
   * @param sql SQL statement to execute (INSERT/UPDATE/DELETE)
   * @param params Optional parameters for prepared statement binding
   * @returns Promise resolving to operation result with metadata
   *
   * @example
   * ```typescript
   * const result = await db.execute('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
   * console.log(`Created user ${result.lastInsertRowid}, affected ${result.changes} rows`);
   *
   * const updateResult = await db.execute('UPDATE users SET active = ? WHERE id = ?', [false, 123]);
   * console.log(`Updated ${updateResult.changes} users`);
   * ```
   */
  execute(sql: string, params?: unknown[]): Promise<DatabaseResult>;

  /**
   * Execute multiple SQL statements in sequence (e.g., migration scripts).
   * Uses platform-specific multi-statement execution for complex SQL scripts
   * containing multiple CREATE, INSERT, UPDATE statements separated by semicolons.
   *
   * @param sql SQL script containing multiple statements separated by semicolons
   * @returns Promise resolving to basic operation result
   *
   * @example
   * ```typescript
   * const migrationSql = `
   *   CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
   *   CREATE INDEX idx_users_name ON users(name);
   *   INSERT INTO users (name) VALUES ('Admin');
   * `;
   * await db.executeMultiple(migrationSql);
   * ```
   */
  executeMultiple?(sql: string): Promise<DatabaseResult>;

  /**
   * Execute multiple operations within a single transaction.
   * Automatically handles transaction begin/commit/rollback logic.
   * If the callback throws an error, the transaction is rolled back.
   *
   * @template T The return type of the transaction callback
   * @param callback Function containing database operations to execute atomically
   * @returns Promise resolving to the callback's return value
   *
   * @example
   * ```typescript
   * const newUserId = await db.transaction(async (db) => {
   *   // Both operations succeed or both fail
   *   const userResult = await db.execute('INSERT INTO users (name) VALUES (?)', ['Jane']);
   *   await db.execute('INSERT INTO user_profiles (user_id, bio) VALUES (?, ?)',
   *     [userResult.lastInsertRowid, 'User bio']);
   *   return userResult.lastInsertRowid;
   * });
   * ```
   */
  transaction<T>(callback: (db: DatabaseBridge) => Promise<T>): Promise<T>;

  /**
   * Close the database connection and release resources.
   * Should be called during application shutdown to ensure proper cleanup.
   * After calling close(), no other methods should be called on this instance.
   *
   * @returns Promise resolving when the connection is fully closed
   *
   * @example
   * ```typescript
   * // During app shutdown
   * await db.close();
   * ```
   */
  close(): Promise<void>;

  /**
   * Check if the database connection is currently active.
   * Platform-specific implementations may provide connection state tracking.
   *
   * @returns True if connected and ready for operations, false otherwise
   *
   * @example
   * ```typescript
   * if (db.isConnected?.()) {
   *   const users = await db.query('SELECT * FROM users');
   * }
   * ```
   */
  isConnected?(): boolean;

  /**
   * Create a backup of the database to the specified path.
   * Available on platforms that support file system operations.
   *
   * @param path Destination path for the backup file
   * @returns Promise resolving when backup is complete
   *
   * @example
   * ```typescript
   * // Create daily backup
   * const backupPath = `${userDataDir}/backups/fishbowl-${new Date().toISOString().split('T')[0]}.db`;
   * await db.backup?.(backupPath);
   * ```
   */
  backup?(path: string): Promise<void>;

  /**
   * Optimize database performance by running VACUUM operation.
   * Reclaims unused space and optimizes internal data structures.
   * Available on platforms that support database optimization.
   *
   * @returns Promise resolving when optimization is complete
   *
   * @example
   * ```typescript
   * // Run weekly optimization
   * await db.vacuum?.();
   * ```
   */
  vacuum?(): Promise<void>;

  /**
   * Get database file size in bytes.
   * Available on platforms with file system access.
   *
   * @returns Promise resolving to database file size in bytes
   *
   * @example
   * ```typescript
   * const sizeBytes = await db.getSize?.();
   * const sizeMB = Math.round(sizeBytes / 1024 / 1024);
   * console.log(`Database size: ${sizeMB}MB`);
   * ```
   */
  getSize?(): Promise<number>;
}

/**
 * Configuration options for database connection management.
 * Controls connection pooling, timeouts, and platform-specific settings.
 */
export interface ConnectionOptions {
  /**
   * Maximum time in milliseconds to wait for initial connection.
   * @default 10000 (10 seconds)
   */
  timeout?: number;

  /**
   * Maximum number of concurrent connections in the pool.
   * Note: SQLite is single-writer, so this primarily affects read operations.
   * @default 1
   */
  maxConnections?: number;

  /**
   * Time in milliseconds before an idle connection is closed.
   * @default 300000 (5 minutes)
   */
  idleTimeout?: number;

  /**
   * Number of connection attempts before giving up.
   * @default 3
   */
  retryAttempts?: number;

  /**
   * Delay in milliseconds between connection retry attempts.
   * @default 1000
   */
  retryDelay?: number;

  /**
   * SQLite PRAGMA statements to apply on connection.
   * Key-value pairs where key is the pragma name and value is the setting.
   *
   * @example
   * ```typescript
   * {
   *   journal_mode: "WAL",
   *   synchronous: "NORMAL",
   *   cache_size: -64000,
   *   foreign_keys: "ON"
   * }
   * ```
   * @default undefined
   */
  pragmas?: Record<string, string | number>;

  /**
   * Whether to enable write-ahead logging (WAL) mode.
   * WAL mode can improve concurrency and performance.
   * @default true
   */
  walMode?: boolean;

  /**
   * Custom file path for the database.
   * If not provided, uses default application data directory.
   * @default undefined
   */
  databasePath?: string;

  /**
   * Whether to create the database file if it doesn't exist.
   * @default true
   */
  createIfNotExists?: boolean;
}

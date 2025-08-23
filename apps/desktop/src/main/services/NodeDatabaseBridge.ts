import Database from "better-sqlite3";
import {
  DatabaseBridge,
  DatabaseResult,
  ConstraintViolationError,
  QueryError,
  ConnectionError,
} from "@fishbowl-ai/shared";

/**
 * Node.js implementation of DatabaseBridge using better-sqlite3.
 * Provides SQLite database operations for the Electron desktop application.
 *
 * This implementation handles:
 * - Database connection management with proper pragmas
 * - Synchronous SQLite operations wrapped in promises for interface compliance
 * - Connection state tracking for reliability
 * - Proper cleanup and resource management
 */
export class NodeDatabaseBridge implements DatabaseBridge {
  private db: Database.Database;
  private connected: boolean = false;

  /**
   * Initialize database connection with the specified database path.
   * Configures SQLite pragmas for desktop performance and reliability.
   *
   * @param databasePath Absolute path to the SQLite database file
   */
  constructor(databasePath: string) {
    this.db = new Database(databasePath);
    this.configurePragmas();
    this.connected = true;
  }

  /**
   * Configure SQLite pragmas for optimal desktop performance.
   * Sets WAL mode for better concurrency, enables foreign keys, and configures synchronization.
   *
   * @private
   */
  private configurePragmas(): void {
    // Enable Write-Ahead Logging for better concurrency
    this.db.pragma("journal_mode = WAL");

    // Set synchronous mode to NORMAL for good balance of safety and performance
    this.db.pragma("synchronous = NORMAL");

    // Enable foreign key constraints
    this.db.pragma("foreign_keys = ON");
  }

  /**
   * Execute a SELECT query and return typed results.
   *
   * @template T The expected type of each row in the result set
   * @param _sql SQL SELECT statement to execute
   * @param _params Optional parameters for prepared statement binding
   * @returns Promise resolving to array of typed result rows
   */
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    // Validate connection state
    if (!this.isConnected()) {
      throw new ConnectionError("Database connection is not active");
    }

    try {
      // Create prepared statement
      const statement = this.db.prepare(sql);

      // Execute SELECT query with statement.all()
      const result = statement.all(params || []) as T[];

      // Return typed results
      return result;
    } catch (error: unknown) {
      // Convert SQLite errors to DatabaseError types
      const sqliteError = error as Error & { code?: string };

      if (sqliteError?.code?.startsWith("SQLITE_CONSTRAINT")) {
        if (sqliteError.code === "SQLITE_CONSTRAINT_UNIQUE") {
          throw new ConstraintViolationError(
            sqliteError.message || "Unique constraint violation",
            "unique",
            undefined, // table name not easily extractable
            undefined, // column name not easily extractable
            sqliteError,
          );
        }
        if (sqliteError.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
          throw new ConstraintViolationError(
            sqliteError.message || "Foreign key constraint violation",
            "foreign_key",
            undefined,
            undefined,
            sqliteError,
          );
        }
        if (sqliteError.code === "SQLITE_CONSTRAINT_NOTNULL") {
          throw new ConstraintViolationError(
            sqliteError.message || "Not null constraint violation",
            "not_null",
            undefined,
            undefined,
            sqliteError,
          );
        }
        if (sqliteError.code === "SQLITE_CONSTRAINT_CHECK") {
          throw new ConstraintViolationError(
            sqliteError.message || "Check constraint violation",
            "check",
            undefined,
            undefined,
            sqliteError,
          );
        }
        // Generic constraint violation
        throw new ConstraintViolationError(
          sqliteError.message || "Constraint violation",
          "unique", // Default fallback
          undefined,
          undefined,
          sqliteError,
        );
      }

      // Generic query error for other SQLite errors
      throw new QueryError(
        sqliteError.message || "SQL execution failed",
        sql,
        params,
        sqliteError,
      );
    }
  }

  /**
   * Execute INSERT, UPDATE, or DELETE operations.
   *
   * @param _sql SQL statement to execute (INSERT/UPDATE/DELETE)
   * @param _params Optional parameters for prepared statement binding
   * @returns Promise resolving to operation result with metadata
   */
  async execute(sql: string, params?: unknown[]): Promise<DatabaseResult> {
    // Validate connection state
    if (!this.isConnected()) {
      throw new ConnectionError("Database connection is not active");
    }

    try {
      // Create prepared statement
      const statement = this.db.prepare(sql);

      // Execute DML operation with statement.run()
      const result = statement.run(params || []);

      // Return DatabaseResult object with metadata
      return {
        lastInsertRowid:
          typeof result.lastInsertRowid === "bigint"
            ? Number(result.lastInsertRowid)
            : result.lastInsertRowid,
        changes: result.changes,
        affectedRows: result.changes, // Same as changes for SQLite compatibility
      };
    } catch (error: unknown) {
      // Convert SQLite errors to DatabaseError types
      const sqliteError = error as Error & { code?: string };

      if (sqliteError?.code?.startsWith("SQLITE_CONSTRAINT")) {
        if (sqliteError.code === "SQLITE_CONSTRAINT_UNIQUE") {
          throw new ConstraintViolationError(
            sqliteError.message || "Unique constraint violation",
            "unique",
            undefined, // table name not easily extractable
            undefined, // column name not easily extractable
            sqliteError,
          );
        }
        if (sqliteError.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
          throw new ConstraintViolationError(
            sqliteError.message || "Foreign key constraint violation",
            "foreign_key",
            undefined,
            undefined,
            sqliteError,
          );
        }
        if (sqliteError.code === "SQLITE_CONSTRAINT_NOTNULL") {
          throw new ConstraintViolationError(
            sqliteError.message || "Not null constraint violation",
            "not_null",
            undefined,
            undefined,
            sqliteError,
          );
        }
        if (sqliteError.code === "SQLITE_CONSTRAINT_CHECK") {
          throw new ConstraintViolationError(
            sqliteError.message || "Check constraint violation",
            "check",
            undefined,
            undefined,
            sqliteError,
          );
        }
        // Generic constraint violation
        throw new ConstraintViolationError(
          sqliteError.message || "Constraint violation",
          "unique", // Default fallback
          undefined,
          undefined,
          sqliteError,
        );
      }

      // Generic query error for other SQLite errors
      throw new QueryError(
        sqliteError.message || "SQL execution failed",
        sql,
        params,
        sqliteError,
      );
    }
  }

  /**
   * Execute multiple operations within a single transaction.
   *
   * @template T The return type of the transaction callback
   * @param _callback Function containing database operations to execute atomically
   * @returns Promise resolving to the callback's return value
   */
  async transaction<T>(
    _callback: (db: DatabaseBridge) => Promise<T>,
  ): Promise<T> {
    // TODO: Implement transaction method in separate task
    throw new Error("Method not implemented");
  }

  /**
   * Close the database connection and release resources.
   *
   * @returns Promise resolving when the connection is fully closed
   */
  async close(): Promise<void> {
    if (this.connected) {
      this.db.close();
      this.connected = false;
    }
  }

  /**
   * Check if the database connection is currently active.
   *
   * @returns True if connected and ready for operations, false otherwise
   */
  isConnected(): boolean {
    return this.connected && this.db.open;
  }

  /**
   * Create a backup of the database to the specified path.
   * Uses better-sqlite3's built-in backup functionality.
   *
   * @param _path Destination path for the backup file
   * @returns Promise resolving when backup is complete
   */
  async backup(_path: string): Promise<void> {
    // TODO: Implement backup method in separate task
    throw new Error("Method not implemented");
  }

  /**
   * Optimize database performance by running VACUUM operation.
   *
   * @returns Promise resolving when optimization is complete
   */
  async vacuum(): Promise<void> {
    // TODO: Implement vacuum method in separate task
    throw new Error("Method not implemented");
  }

  /**
   * Get database file size in bytes.
   *
   * @returns Promise resolving to database file size in bytes
   */
  async getSize(): Promise<number> {
    // TODO: Implement getSize method in separate task
    throw new Error("Method not implemented");
  }
}

import Database from "better-sqlite3";
import { dirname } from "path";
import { stat, mkdir } from "fs/promises";
import { existsSync } from "fs";
import {
  DatabaseBridge,
  DatabaseResult,
  ConstraintViolationError,
  QueryError,
  ConnectionError,
  TransactionError,
  createLoggerSync,
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
  private isTransactionActive: boolean = false;
  private readonly logger = createLoggerSync({
    config: { name: "NodeDatabaseBridge", level: "info" },
  });

  /**
   * Initialize database connection with the specified database path.
   * Configures SQLite pragmas for desktop performance and reliability.
   *
   * @param databasePath Absolute path to the SQLite database file
   */
  constructor(databasePath: string) {
    this.logger.info("Initializing database connection", { databasePath });

    try {
      this.db = new Database(databasePath);
      this.configurePragmas();
      this.connected = true;

      this.logger.info("Database connection established successfully", {
        databasePath,
        inMemory: databasePath === ":memory:",
        isOpen: this.db.open,
      });
    } catch (error: unknown) {
      this.logger.error(
        "Failed to initialize database connection",
        error as Error,
        {
          databasePath,
        },
      );
      throw error;
    }
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
   * Uses manual BEGIN/COMMIT/ROLLBACK for async callback support.
   * Automatically rolls back on any error and supports nested transaction detection.
   *
   * @template T The return type of the transaction callback
   * @param callback Function containing database operations to execute atomically
   * @returns Promise resolving to the callback's return value
   */
  async transaction<T>(
    callback: (db: DatabaseBridge) => Promise<T>,
  ): Promise<T> {
    this.logger.debug("Starting transaction");

    // Validate connection state
    if (!this.isConnected()) {
      throw new ConnectionError("Database connection is not active");
    }

    // Handle nested transactions - SQLite doesn't support them, so execute within existing transaction
    if (this.isTransactionActive) {
      this.logger.debug(
        "Nested transaction detected, executing within parent transaction",
      );
      return await callback(this);
    }

    const startTime = Date.now();

    try {
      // Begin transaction manually for async support
      this.db.exec("BEGIN");
      this.isTransactionActive = true;

      this.logger.debug("Transaction begun successfully");

      try {
        // Execute callback with this bridge instance
        const result = await callback(this);

        // Commit on success
        this.db.exec("COMMIT");
        this.isTransactionActive = false;

        const duration = Date.now() - startTime;
        this.logger.info("Transaction committed successfully", { duration });

        return result;
      } catch (error: unknown) {
        // Rollback on failure
        try {
          this.db.exec("ROLLBACK");
          this.logger.debug("Transaction rolled back successfully");
        } catch (rollbackError: unknown) {
          this.logger.error(
            "Failed to rollback transaction",
            rollbackError as Error,
            {
              originalError: error,
            },
          );
        }

        const duration = Date.now() - startTime;
        this.logger.error(
          "Transaction rolled back due to error",
          error as Error,
          {
            duration,
          },
        );

        // Convert to TransactionError with context
        const originalError = error as Error;
        const failedOperation = this.extractFailedOperation(error);

        throw new TransactionError(
          `Transaction failed and was rolled back: ${originalError.message}`,
          failedOperation,
          originalError,
        );
      } finally {
        this.isTransactionActive = false;
      }
    } catch (error: unknown) {
      // Handle BEGIN failures or TransactionError re-throws
      if (error instanceof TransactionError) {
        throw error;
      }

      const beginError = error as Error;
      this.logger.error("Failed to begin transaction", beginError);

      throw new TransactionError(
        `Failed to start transaction: ${beginError.message}`,
        "BEGIN",
        beginError,
      );
    }
  }

  /**
   * Close the database connection and release resources.
   * This method is idempotent - multiple calls are safe.
   *
   * @returns Promise resolving when the connection is fully closed
   */
  async close(): Promise<void> {
    // Check if already closed (idempotent behavior)
    if (!this.connected) {
      this.logger.debug(
        "Database connection already closed, skipping close operation",
      );
      return;
    }

    this.logger.info("Closing database connection");

    try {
      // Close better-sqlite3 database connection
      this.db.close();

      // Update connection state
      this.connected = false;

      this.logger.info("Database connection closed successfully");
    } catch (error: unknown) {
      // Handle close errors appropriately
      const closeError = error as Error;

      // Update connection state even if close() encounters errors
      // to prevent the connection from being left in an invalid state
      this.connected = false;

      this.logger.error(
        "Error occurred while closing database connection",
        closeError,
        {
          connectionWasOpen: true,
          errorMessage: closeError.message,
        },
      );

      // Re-throw the error to let callers know close failed
      throw new ConnectionError(
        `Failed to close database connection: ${closeError.message}`,
      );
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
   * Extract the failed SQL operation from an error for transaction context.
   * Helps provide better error messages by identifying which SQL caused the failure.
   *
   * @private
   * @param error The error to extract operation information from
   * @returns The SQL operation string if available, undefined otherwise
   */
  private extractFailedOperation(error: unknown): string | undefined {
    if (error instanceof QueryError) {
      // QueryError stores SQL in context.sql
      return (error.context?.sql as string) || undefined;
    }

    // Check if error has a query property (common in database errors)
    const errorWithQuery = error as Error & { query?: string };
    if (errorWithQuery?.query) {
      return errorWithQuery.query;
    }

    // Check error message for common SQL keywords to infer operation type
    const errorMessage = (error as Error)?.message?.toLowerCase() || "";
    if (errorMessage.includes("insert")) return "INSERT";
    if (errorMessage.includes("update")) return "UPDATE";
    if (errorMessage.includes("delete")) return "DELETE";
    if (errorMessage.includes("select")) return "SELECT";

    return undefined;
  }

  /**
   * Create a backup of the database to the specified path.
   * Uses better-sqlite3's built-in backup functionality.
   *
   * @param _path Destination path for the backup file
   * @returns Promise resolving when backup is complete
   */
  async backup(path: string): Promise<void> {
    // Validate connection state
    if (!this.isConnected()) {
      throw new ConnectionError("Database connection is not active");
    }

    try {
      this.logger.info("Starting database backup", { destination: path });

      // Ensure backup directory exists
      const backupDir = dirname(path);
      if (!existsSync(backupDir)) {
        await mkdir(backupDir, { recursive: true });
      }

      // Validate backup path is not empty
      if (!path.trim()) {
        throw new QueryError("Backup path cannot be empty", "BACKUP", [path]);
      }

      // Perform backup using better-sqlite3's backup API
      this.db.backup(path);

      this.logger.info("Database backup completed successfully", {
        destination: path,
      });
    } catch (error) {
      this.logger.error("Database backup failed", error as Error, { path });

      if (error instanceof QueryError || error instanceof ConnectionError) {
        throw error;
      }

      throw new ConnectionError(
        `Failed to backup database: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Optimize database performance by running VACUUM operation.
   *
   * @returns Promise resolving when optimization is complete
   */
  async vacuum(): Promise<void> {
    // Validate connection state
    if (!this.isConnected()) {
      throw new ConnectionError("Database connection is not active");
    }

    try {
      this.logger.info("Starting database vacuum operation");

      // Check if in transaction - VACUUM cannot run in a transaction
      if (this.isTransactionActive) {
        throw new TransactionError(
          "VACUUM cannot be performed within a transaction",
          "VACUUM",
        );
      }

      // Execute VACUUM command
      this.db.exec("VACUUM");

      this.logger.info("Database vacuum completed successfully");
    } catch (error) {
      this.logger.error("Database vacuum failed", error as Error);

      if (
        error instanceof TransactionError ||
        error instanceof ConnectionError
      ) {
        throw error;
      }

      throw new QueryError(
        `Failed to vacuum database: ${error instanceof Error ? error.message : String(error)}`,
        "VACUUM",
        [],
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Get database file size in bytes.
   *
   * @returns Promise resolving to database file size in bytes
   */
  async getSize(): Promise<number> {
    // Validate connection state
    if (!this.isConnected()) {
      throw new ConnectionError("Database connection is not active");
    }

    // Handle in-memory databases
    if (this.db.name === ":memory:") {
      throw new QueryError(
        "Cannot get file size for in-memory database",
        "SELECT file_size",
        [],
      );
    }

    try {
      this.logger.debug("Getting database file size", { path: this.db.name });

      // Get file statistics using fs.stat
      const stats = await stat(this.db.name);
      const sizeInBytes = stats.size;

      this.logger.debug("Database file size retrieved", {
        path: this.db.name,
        sizeInBytes,
        sizeInMB: (sizeInBytes / (1024 * 1024)).toFixed(2),
      });

      return sizeInBytes;
    } catch (error) {
      this.logger.error("Failed to get database size", error as Error, {
        path: this.db.name,
      });

      throw new ConnectionError(
        `Failed to get database size: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

import { DatabaseError } from "./DatabaseError";
import { DatabaseErrorCode } from "./DatabaseErrorCode";

/**
 * Error thrown when database connection fails.
 * Includes connection-related failures, timeouts, and database accessibility issues.
 */
export class ConnectionError extends DatabaseError {
  /**
   * Create a new connection error.
   * @param message Human-readable error message
   * @param databasePath Optional path to the database file
   * @param cause Optional underlying error that caused the connection failure
   */
  constructor(message: string, databasePath?: string, cause?: Error) {
    const context = databasePath ? { databasePath } : undefined;
    super(DatabaseErrorCode.CONNECTION_FAILED, message, context, cause);
  }
}

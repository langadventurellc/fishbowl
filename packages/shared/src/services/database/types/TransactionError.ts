import { DatabaseError } from "./DatabaseError";
import { DatabaseErrorCode } from "./DatabaseErrorCode";

/**
 * Error thrown when database transaction operations fail.
 * Includes transaction rollbacks, deadlocks, and transaction-specific errors.
 */
export class TransactionError extends DatabaseError {
  /**
   * Create a new transaction error.
   * @param message Human-readable error message
   * @param operation Optional transaction operation that failed
   * @param cause Optional underlying error from the database engine
   */
  constructor(message: string, operation?: string, cause?: Error) {
    const context = operation ? { operation } : undefined;
    super(DatabaseErrorCode.TRANSACTION_FAILED, message, context, cause);
  }
}

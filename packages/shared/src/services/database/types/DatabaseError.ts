import { DatabaseErrorCode } from "./DatabaseErrorCode";

/**
 * Base class for all database-related errors.
 * Provides consistent error structure with contextual information for debugging.
 * Designed to be serializable for IPC communication between main and renderer processes.
 */
export abstract class DatabaseError extends Error {
  /**
   * Create a new database error.
   * @param code Standardized error code for programmatic handling
   * @param message Human-readable error message
   * @param context Optional context information for debugging
   * @param cause Optional underlying error that caused this error
   */
  constructor(
    public readonly code: DatabaseErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;

    // Ensure proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get a JSON-serializable representation of this error.
   * Excludes stack trace and sensitive information for safe IPC transport.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      cause: this.cause?.message,
    };
  }
}

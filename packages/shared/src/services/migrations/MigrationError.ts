import { MigrationErrorCode } from "./MigrationErrorCode";

/**
 * Error class for all migration-related failures.
 * Provides consistent error structure with migration-specific contextual information.
 * Designed to be serializable for IPC communication between main and renderer processes.
 */
export class MigrationError extends Error {
  /**
   * Create a new migration error.
   * @param code Standardized migration error code for programmatic handling
   * @param message Human-readable error message
   * @param filename Optional migration filename where the error occurred
   * @param context Optional context information for debugging
   * @param cause Optional underlying error that caused this migration error
   */
  constructor(
    public readonly code: MigrationErrorCode,
    message: string,
    public readonly filename?: string,
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "MigrationError";

    // Ensure proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MigrationError);
    }
  }

  /**
   * Get a JSON-serializable representation of this error.
   * Excludes stack trace and sensitive information for safe IPC transport.
   * Includes migration-specific information like filename.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      filename: this.filename,
      context: this.context,
      cause: this.cause?.message,
    };
  }
}

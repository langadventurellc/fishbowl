/**
 * Base class for all file storage related errors.
 * Provides consistent error structure with contextual information.
 */
export abstract class FileStorageError extends Error {
  /**
   * Create a new file storage error.
   * @param message Human-readable error message
   * @param operation The operation that failed (e.g., 'read', 'write', 'mkdir')
   * @param filePath The file path involved in the operation
   * @param cause Optional underlying error that caused this error
   */
  constructor(
    message: string,
    public readonly operation: string,
    public readonly filePath: string,
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
   * Excludes stack trace and sensitive information.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      operation: this.operation,
      filePath: this.filePath,
      cause: this.cause?.message,
    };
  }
}

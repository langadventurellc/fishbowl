/**
 * Custom error class for storage operations.
 * Provides context about which operation failed.
 */
export class StorageError extends Error {
  /**
   * Create a new storage error.
   * @param message - Human-readable error message
   * @param code - Error code for categorization (e.g., "ENCRYPTION_FAILED", "NOT_FOUND")
   */
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "StorageError";

    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

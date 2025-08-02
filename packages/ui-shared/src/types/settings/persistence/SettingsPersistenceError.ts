/**
 * Custom error class for settings persistence operations.
 * Provides context about which operation failed and includes the original cause.
 *
 * @example
 * ```typescript
 * throw new SettingsPersistenceError(
 *   "Failed to write settings file",
 *   "save",
 *   originalError
 * );
 * ```
 */
export class SettingsPersistenceError extends Error {
  /**
   * Creates a new SettingsPersistenceError instance.
   *
   * @param message - A descriptive error message
   * @param operation - The operation that failed ("save", "load", or "reset")
   * @param cause - The underlying error that caused this error (optional)
   */
  constructor(
    message: string,
    public readonly operation: "save" | "load" | "reset",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SettingsPersistenceError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

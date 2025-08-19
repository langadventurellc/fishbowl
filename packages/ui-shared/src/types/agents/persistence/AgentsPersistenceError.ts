/**
 * Custom error class for agents persistence operations.
 * Provides context about which operation failed and includes the original cause.
 *
 * This error class follows the established pattern from SettingsPersistenceError
 * to ensure consistent error handling across all persistence adapters.
 *
 * @example
 * ```typescript
 * throw new AgentsPersistenceError(
 *   "Failed to write agents file",
 *   "save",
 *   originalError
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Error handling in adapter
 * try {
 *   await writeFile(path, data);
 * } catch (error) {
 *   throw new AgentsPersistenceError(
 *     "Unable to save agents to file",
 *     "save",
 *     error
 *   );
 * }
 * ```
 */
export class AgentsPersistenceError extends Error {
  /**
   * Creates a new AgentsPersistenceError instance.
   *
   * @param message - A descriptive error message explaining what went wrong
   * @param operation - The operation that failed ("save", "load", or "reset")
   * @param cause - The underlying error that caused this error (optional)
   */
  constructor(
    message: string,
    public readonly operation: "save" | "load" | "reset",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AgentsPersistenceError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

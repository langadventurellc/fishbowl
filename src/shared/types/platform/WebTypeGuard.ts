/**
 * Web Platform Type Guard Interface
 *
 * Type guard function signature specifically for web browser platform detection.
 * Provides runtime type checking for web browser environment.
 */

/**
 * Type guard function signature for web platform detection
 */
export interface WebTypeGuard {
  /**
   * Checks if the current environment is running in a web browser
   * @returns True if running in web browser, with type narrowing
   */
  (): boolean;
}

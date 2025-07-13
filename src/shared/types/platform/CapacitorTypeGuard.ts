/**
 * Capacitor Platform Type Guard Interface
 *
 * Type guard function signature specifically for Capacitor mobile platform detection.
 * Provides runtime type checking for Capacitor environment.
 */

/**
 * Type guard function signature for Capacitor platform detection
 */
export interface CapacitorTypeGuard {
  /**
   * Checks if the current environment is running in Capacitor
   * @returns True if running in Capacitor, with type narrowing
   */
  (): boolean;
}

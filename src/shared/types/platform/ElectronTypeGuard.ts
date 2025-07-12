/**
 * Electron Platform Type Guard Interface
 *
 * Type guard function signature specifically for Electron platform detection.
 * Provides runtime type checking for Electron environment.
 */

/**
 * Type guard function signature for Electron platform detection
 */
export interface ElectronTypeGuard {
  /**
   * Checks if the current environment is running in Electron
   * @returns True if running in Electron, with type narrowing
   */
  (): boolean;
}

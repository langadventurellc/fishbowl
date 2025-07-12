/**
 * Platform Detection Context Interface
 *
 * Provides environmental context for platform detection operations.
 * Includes information about global objects and runtime environment state.
 */

/**
 * Context information available during platform detection
 */
export interface PlatformDetectionContext {
  /** Whether window object is available */
  hasWindow: boolean;
  /** Whether document object is available */
  hasDocument: boolean;
  /** Whether navigator object is available */
  hasNavigator: boolean;
  /** Whether Electron API is available */
  hasElectronAPI: boolean;
  /** Whether Capacitor API is available */
  hasCapacitorAPI: boolean;
  /** User agent string if available */
  userAgent?: string;
  /** Platform information from navigator */
  navigatorPlatform?: string;
  /** Additional runtime properties */
  runtimeProperties: Record<string, boolean>;
}

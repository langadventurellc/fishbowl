/**
 * Capability Detection Context Interface
 *
 * Environmental context information for capability detection operations.
 * Provides platform and runtime information needed for accurate detection.
 */

import { PlatformType } from '../../../constants/platform/PlatformType';
import { RuntimeEnvironment } from '../../../constants/platform/RuntimeEnvironment';

/**
 * Context information for capability detection operations
 */
export interface CapabilityDetectionContext {
  /** Current platform type */
  platformType: PlatformType;

  /** Current runtime environment */
  runtimeEnvironment: RuntimeEnvironment;

  /** Platform detection timestamp */
  platformDetectedAt: number;

  /** Whether the platform detection is cached */
  isPlatformCached: boolean;

  /** Available global objects (window, navigator, etc.) */
  availableGlobals: {
    hasWindow: boolean;
    hasDocument: boolean;
    hasNavigator: boolean;
    hasElectronAPI: boolean;
    hasCapacitorAPI: boolean;
  };

  /** User agent string if available */
  userAgent?: string;

  /** Platform version information if available */
  platformVersion?: string;

  /** Additional environmental properties */
  environmentProperties: Record<string, unknown>;

  /** Security context information */
  securityContext: {
    isSecureContext: boolean;
    hasPermissionsAPI: boolean;
    supportsCredentials: boolean;
  };

  /** Performance context for optimization */
  performanceContext: {
    detectStartTime: number;
    maxDetectionTime: number;
    enableProfiling: boolean;
  };
}

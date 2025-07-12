/**
 * Platform Error Context Interface
 *
 * Additional context information for platform detection errors.
 * Helps with debugging and error resolution by providing environmental details.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Context information for platform detection errors
 */
export interface PlatformErrorContext {
  /** Platform type that was being detected */
  targetPlatform?: PlatformType;
  /** Current detected platform (if any) */
  currentPlatform?: PlatformType;
  /** Available global objects at time of error */
  availableGlobals: string[];
  /** Missing global objects that were expected */
  missingGlobals?: string[];
  /** User agent string if available */
  userAgent?: string;
  /** Browser/runtime information */
  runtimeInfo?: Record<string, unknown>;
  /** Platform detection method being used */
  detectionMethod?: string;
  /** Whether this is a retry attempt */
  isRetry?: boolean;
  /** Number of retry attempts made */
  retryCount?: number;
  /** Cache state at time of error */
  cacheState?: Record<string, unknown>;
  /** Performance metrics leading up to error */
  performanceMetrics?: Record<string, number>;
}

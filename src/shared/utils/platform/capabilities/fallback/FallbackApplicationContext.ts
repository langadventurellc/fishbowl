import { PlatformType } from '../../../../constants';
import type { CapabilityDetectionResult, PlatformCapabilityId } from '../../../../types/platform';

/**
 * Context information provided to fallback strategies during execution.
 * Contains environmental and detection state needed for strategy decisions.
 */

export interface FallbackApplicationContext {
  /** The capability that failed detection */
  capabilityId: PlatformCapabilityId;

  /** Current platform type where detection failed */
  platformType: PlatformType;

  /** The failed detection result with error information */
  detectionResult: CapabilityDetectionResult;

  /** Additional platform-specific context data */
  platformContext?: Record<string, unknown>;

  /** User preferences or configuration affecting fallback selection */
  userPreferences?: Record<string, unknown>;

  /** Timestamp when fallback execution started */
  executionStartTime: number;
}

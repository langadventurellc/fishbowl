import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import { PlatformType } from '../../../../constants/platform/PlatformType';

/**
 * Configuration for graceful degradation mapping.
 * Defines how capabilities should be degraded when unavailable.
 */
export interface DegradationMapping {
  /** The capability this mapping applies to */
  capabilityId: PlatformCapabilityId;

  /** Platforms where this degradation applies */
  supportedPlatforms: PlatformType[];

  /** The degraded feature set to provide */
  degradedFeatures: Record<string, unknown>;

  /** Human-readable description of the degradation */
  description: string;

  /** Impact level of the degradation (higher = more impact) */
  impactLevel: 'low' | 'medium' | 'high';

  /** Whether the degraded functionality is acceptable for production use */
  productionSafe: boolean;
}

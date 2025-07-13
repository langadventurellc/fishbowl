import { PlatformType } from '../../../../constants/platform/PlatformType';
import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import type { ComponentCapability } from './ComponentCapability';

/**
 * Configuration for capability composition mapping.
 * Defines how complex capabilities can be broken down into simpler components.
 */
export interface CompositionMapping {
  /** The complex capability that can be decomposed */
  complexCapability: PlatformCapabilityId;

  /** Simpler component capabilities that together provide similar functionality */
  componentCapabilities: ComponentCapability[];

  /** Platforms where this composition applies */
  supportedPlatforms: PlatformType[];

  /** How well the components cover the original capability's functionality */
  functionalCoverage: 'complete' | 'substantial' | 'partial' | 'limited';

  /** Complexity of implementing the composition */
  implementationComplexity: 'low' | 'medium' | 'high';

  /** Additional integration notes */
  integrationNotes?: string;

  /** Performance characteristics of the composition vs original */
  performanceComparison: 'better' | 'similar' | 'worse';
}

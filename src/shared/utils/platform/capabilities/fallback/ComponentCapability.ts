import { PlatformType } from '../../../../constants/platform/PlatformType';
import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';

/**
 * Configuration for an individual component capability.
 */
export interface ComponentCapability {
  /** The component capability ID */
  capabilityId: PlatformCapabilityId;

  /** Human-readable name for this component */
  name: string;

  /** Description of what functionality this component provides */
  description: string;

  /** Whether this component is required (true) or optional (false) */
  required: boolean;

  /** How this component integrates with others in the composition */
  integrationRole: 'primary' | 'secondary' | 'auxiliary' | 'optional';

  /** Dependencies on other components in the composition */
  dependsOn: PlatformCapabilityId[];

  /** Platforms where this component is typically available */
  availablePlatforms: PlatformType[];

  /** Estimated implementation effort for this component */
  implementationEffort: 'minimal' | 'moderate' | 'significant';

  /** Example code or approach for implementing this component */
  implementationHint?: string;
}

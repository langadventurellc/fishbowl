/**
 * Platform Capability Interface
 *
 * Defines a platform-specific capability that can be detected and utilized.
 * Provides metadata about feature availability and requirements.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Definition of a platform capability
 */
export interface PlatformCapability {
  /** Unique identifier for the capability */
  id: string;
  /** Human-readable name of the capability */
  name: string;
  /** Description of what this capability provides */
  description: string;
  /** Platforms that support this capability */
  supportedPlatforms: PlatformType[];
  /** Whether this capability is currently available */
  available: boolean;
  /** Confidence level in the availability detection (0-100) */
  confidence: number;
  /** Version or level of support for this capability */
  version?: string;
  /** Additional metadata about the capability */
  metadata?: Record<string, unknown>;
  /** Whether this capability requires special permissions */
  requiresPermissions: boolean;
  /** Error message if capability is not available */
  unavailableReason?: string;
}

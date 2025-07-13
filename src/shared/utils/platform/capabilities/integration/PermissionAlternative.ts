import type { PlatformCapabilityId } from '../../../../types/platform';
import { PermissionLevel } from '../../../../constants/platform/PermissionLevel';

/**
 * Represents a permission-free alternative to a capability
 *
 * Defines an alternative capability that can provide similar functionality
 * without requiring elevated permissions, including effectiveness analysis,
 * implementation guidance, and platform compatibility information.
 */
export interface PermissionAlternative {
  /** ID of the alternative capability */
  capabilityId: PlatformCapabilityId;

  /** Description of this permission-free alternative */
  description: string;

  /** Permission requirements for this alternative */
  permissionRequirements: PermissionLevel[];

  /** How effective this alternative is compared to the original (0-1) */
  effectivenessScore: number;

  /** How easy this alternative is to implement (0-1) */
  implementationEase: number;

  /** Comparison of functionality with the original capability */
  functionalityComparison: string;

  /** Security profile of this alternative */
  securityProfile: string;

  /** Platform support for this alternative */
  platformSupport: Record<string, boolean>;

  /** Steps needed to migrate to this alternative */
  migrationSteps: string[];

  /** Known limitations of this alternative */
  limitations: string[];

  /** Benefits of using this alternative */
  benefits: string[];

  /** Additional metadata about this alternative (optional) */
  metadata?: Record<string, unknown>;
}

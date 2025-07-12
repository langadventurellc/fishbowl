/**
 * Capability Permission Requirement Interface
 *
 * Defines permission requirements for platform capabilities.
 */

import { CapabilityCategory } from '../../constants/platform/CapabilityCategory';
import { PermissionLevel } from '../../constants/platform/PermissionLevel';

/**
 * Permission requirement type for capabilities
 */
export interface CapabilityPermissionRequirement {
  category: CapabilityCategory;
  capability: string;
  required: PermissionLevel;
  current: PermissionLevel;
  sufficient: boolean;
}

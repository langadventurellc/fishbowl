/**
 * RoleNameInput component props interface.
 *
 * Defines the properties for the RoleNameInput component which provides
 * role name input with validation, uniqueness checking, and accessibility features.
 *
 * @module types/ui/components/RoleNameInputProps
 */

import type { CustomRoleViewModel } from "../settings/CustomRoleViewModel";

export interface RoleNameInputProps {
  value: string;
  onChange: (value: string) => void;
  existingRoles?: CustomRoleViewModel[];
  currentRoleId?: string; // For edit mode exclusion
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
}

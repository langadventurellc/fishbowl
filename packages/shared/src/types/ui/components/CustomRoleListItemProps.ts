/**
 * CustomRoleListItem component props interface.
 *
 * Defines the properties for the CustomRoleListItem component which displays
 * individual custom role information in a list format.
 *
 * @module types/ui/components/CustomRoleListItemProps
 */

import type { CustomRole } from "../../settings/CustomRole";

export interface CustomRoleListItemProps {
  role: CustomRole;
  onEdit: (role: CustomRole) => void;
  onDelete: (role: CustomRole) => void;
  className?: string;
}

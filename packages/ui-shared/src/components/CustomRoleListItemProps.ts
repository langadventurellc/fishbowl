/**
 * CustomRoleListItem component props interface.
 *
 * Defines the properties for the CustomRoleListItem component which displays
 * individual custom role information in a list format.
 *
 * @module types/ui/components/CustomRoleListItemProps
 */

import type { CustomRoleViewModel } from "../settings/CustomRoleViewModel";

export interface CustomRoleListItemProps {
  role: CustomRoleViewModel;
  onEdit: (role: CustomRoleViewModel) => void;
  onDelete: (role: CustomRoleViewModel) => void;
  className?: string;
}

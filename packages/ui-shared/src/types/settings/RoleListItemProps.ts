/**
 * RoleListItem component props interface.
 *
 * Defines the properties for the RoleListItem component which displays
 * individual role information in a list format.
 *
 * @module types/ui/components/RoleListItemProps
 */

import type { RoleViewModel } from "./RoleViewModel";

export interface RoleListItemProps {
  role: RoleViewModel;
  onEdit: (role: RoleViewModel) => void;
  onDelete: (role: RoleViewModel) => void;
  className?: string;
}

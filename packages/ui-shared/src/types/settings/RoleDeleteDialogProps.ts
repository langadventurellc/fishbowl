/**
 * RoleDeleteDialog component props interface.
 *
 * @module types/ui/components/RoleDeleteDialogProps
 */

import type { CustomRoleViewModel } from "./CustomRoleViewModel";

export interface RoleDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: CustomRoleViewModel | null;
  onConfirm: (role: CustomRoleViewModel) => void;
  isLoading?: boolean;
}

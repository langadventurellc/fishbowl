/**
 * RoleDeleteDialog component props interface.
 *
 * @module types/ui/components/RoleDeleteDialogProps
 */

import type { RoleViewModel } from "./RoleViewModel";

export interface RoleDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleViewModel | null;
  onConfirm: (role: RoleViewModel) => void;
  isLoading?: boolean;
}

/**
 * RoleDeleteDialog component props interface.
 *
 * @module types/ui/components/RoleDeleteDialogProps
 */

import type { CustomRole } from "../../settings/CustomRole";

export interface RoleDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: CustomRole | null;
  onConfirm: (role: CustomRole) => void;
  isLoading?: boolean;
}

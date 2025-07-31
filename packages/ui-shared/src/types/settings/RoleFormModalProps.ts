/**
 * RoleFormModal component props interface.
 *
 * @module components/settings/types/RoleFormModalProps
 */

import { CustomRoleViewModel } from "./CustomRoleViewModel";
import { RoleFormData } from "./RoleFormData";

export interface RoleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: CustomRoleViewModel;
  onSave: (data: RoleFormData) => void;
  isLoading?: boolean;
}

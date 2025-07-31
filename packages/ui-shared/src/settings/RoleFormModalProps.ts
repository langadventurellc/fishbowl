/**
 * RoleFormModal component props interface.
 *
 * @module components/settings/types/RoleFormModalProps
 */

import { CustomRoleViewModel } from "src/settings/CustomRoleViewModel";
import { RoleFormData } from "src/settings/RoleFormData";

export interface RoleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: CustomRoleViewModel;
  onSave: (data: RoleFormData) => void;
  isLoading?: boolean;
}

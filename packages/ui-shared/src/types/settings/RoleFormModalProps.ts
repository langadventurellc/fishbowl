/**
 * RoleFormModal component props interface.
 *
 * @module components/settings/types/RoleFormModalProps
 */

import { RoleViewModel } from "./RoleViewModel";
import { RoleFormData } from "./RoleFormData";

export interface RoleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: RoleViewModel;
  onSave: (data: RoleFormData) => void;
  isLoading?: boolean;
}

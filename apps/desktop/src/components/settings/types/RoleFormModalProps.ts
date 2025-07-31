/**
 * RoleFormModal component props interface.
 *
 * @module components/settings/types/RoleFormModalProps
 */

import type { CustomRoleViewModel, RoleFormData } from "@fishbowl-ai/ui-shared";

export interface RoleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: CustomRoleViewModel;
  onSave: (data: RoleFormData) => void;
  isLoading?: boolean;
}

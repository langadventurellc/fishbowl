/**
 * Return type for useRoleFormModal hook.
 *
 * @module hooks/types/UseRoleFormModalReturn
 */

import type { CustomRoleViewModel, RoleFormData } from "@fishbowl-ai/shared";

export interface UseRoleFormModalReturn {
  isOpen: boolean;
  mode: "create" | "edit";
  currentRole?: CustomRoleViewModel;
  isLoading: boolean;
  openCreateModal: () => void;
  openEditModal: (role: CustomRoleViewModel) => void;
  closeModal: () => void;
  handleSave: (data: RoleFormData) => Promise<void>;
}

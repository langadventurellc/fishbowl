/**
 * Return type for useRoleFormModal hook.
 *
 * @module hooks/types/UseRoleFormModalReturn
 */

import type { RoleViewModel, RoleFormData } from "@fishbowl-ai/ui-shared";

export interface UseRoleFormModalReturn {
  isOpen: boolean;
  mode: "create" | "edit";
  currentRole?: RoleViewModel;
  isLoading: boolean;
  openCreateModal: () => void;
  openEditModal: (role: RoleViewModel) => void;
  closeModal: () => void;
  handleSave: (data: RoleFormData) => Promise<void>;
}

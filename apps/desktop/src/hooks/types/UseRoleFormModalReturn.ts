/**
 * Return type for useRoleFormModal hook.
 *
 * @module hooks/types/UseRoleFormModalReturn
 */

import type { CustomRole, RoleFormData } from "@fishbowl-ai/shared";

export interface UseRoleFormModalReturn {
  isOpen: boolean;
  mode: "create" | "edit";
  currentRole?: CustomRole;
  isLoading: boolean;
  openCreateModal: () => void;
  openEditModal: (role: CustomRole) => void;
  closeModal: () => void;
  handleSave: (data: RoleFormData) => Promise<void>;
}

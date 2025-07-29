/**
 * RoleFormModal component props interface.
 *
 * @module components/settings/types/RoleFormModalProps
 */

import type { RoleFormData, CustomRole } from "@fishbowl-ai/shared";

export interface RoleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: CustomRole;
  onSave: (data: RoleFormData) => void;
  isLoading?: boolean;
}

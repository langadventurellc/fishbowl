/**
 * Props interface for role creation/editing form components
 *
 * @module types/ui/components/CreateRoleFormProps
 */
import type { CustomRoleViewModel } from "../settings/CustomRoleViewModel";
import type { RoleFormData } from "../settings/RoleFormData";

export interface CreateRoleFormProps {
  mode: "create" | "edit";
  initialData?: Partial<RoleFormData>;
  onSave: (data: RoleFormData) => void;
  onCancel: () => void;
  existingRoles?: CustomRoleViewModel[];
  isLoading?: boolean;
}

/**
 * Props interface for role creation/editing form components
 *
 * @module types/ui/components/CreateRoleFormProps
 */
import type { RoleFormData } from "../../settings/RoleFormData";
import type { CustomRole } from "../../settings/CustomRole";

export interface CreateRoleFormProps {
  mode: "create" | "edit";
  initialData?: Partial<RoleFormData>;
  onSave: (data: RoleFormData) => void;
  onCancel: () => void;
  existingRoles?: CustomRole[];
  isLoading?: boolean;
}

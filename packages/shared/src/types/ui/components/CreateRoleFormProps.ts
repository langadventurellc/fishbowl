/**
 * Props interface for role creation/editing form components
 *
 * @module types/ui/components/CreateRoleFormProps
 */
import type { RoleFormData } from "../../settings/RoleFormData";

export interface CreateRoleFormProps {
  /** Existing role data for editing (undefined for creation) */
  initialData?: RoleFormData;
  /** Callback when form is submitted */
  onSubmit: (data: RoleFormData) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Whether form is in loading state */
  isLoading?: boolean;
  /** Form validation errors */
  errors?: Record<string, string>;
}

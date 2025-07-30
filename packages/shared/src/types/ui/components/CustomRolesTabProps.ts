/**
 * Props interface for CustomRolesTab component
 *
 * @module types/ui/components/CustomRolesTabProps
 */

import type { CustomRoleViewModel } from "../../settings/CustomRole";

export interface CustomRolesTabProps {
  onCreateRole?: () => void;
  onEditRole?: (role: CustomRoleViewModel) => void;
  onDeleteRole?: (role: CustomRoleViewModel) => void;
  className?: string;
}

/**
 * Props interface for CustomRolesTab component
 *
 * @module types/ui/components/CustomRolesTabProps
 */

import type { CustomRole } from "../../settings/CustomRole";

export interface CustomRolesTabProps {
  onDeleteRole: (role: CustomRole) => void;
  className?: string;
}

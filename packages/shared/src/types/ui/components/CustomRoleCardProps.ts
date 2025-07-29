/**
 * Props interface for custom role list item components
 *
 * @module types/ui/components/CustomRoleCardProps
 */
import type { CustomRole } from "../../settings/CustomRole";

export interface CustomRoleCardProps {
  /** Custom role data to display */
  role: CustomRole;
  /** Callback when edit button is clicked */
  onEdit: (role: CustomRole) => void;
  /** Callback when delete button is clicked */
  onDelete: (role: CustomRole) => void;
  /** Additional CSS classes */
  className?: string;
}

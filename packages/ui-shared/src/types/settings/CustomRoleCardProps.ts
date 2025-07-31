/**
 * Props interface for custom role list item components
 *
 * @module types/ui/components/CustomRoleCardProps
 */
import type { CustomRoleViewModel } from "./CustomRoleViewModel";

export interface CustomRoleCardProps {
  /** Custom role data to display */
  role: CustomRoleViewModel;
  /** Callback when edit button is clicked */
  onEdit: (role: CustomRoleViewModel) => void;
  /** Callback when delete button is clicked */
  onDelete: (role: CustomRoleViewModel) => void;
  /** Additional CSS classes */
  className?: string;
}

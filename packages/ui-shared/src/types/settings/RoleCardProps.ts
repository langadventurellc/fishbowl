/**
 * Props interface for predefined role card components
 *
 * @module types/ui/components/RoleCardProps
 */
import type { PredefinedRole } from "./PredefinedRole";

export interface RoleCardProps {
  /** Predefined role data to display */
  role: PredefinedRole;
  /** Optional click handler for role selection */
  onClick?: (role: PredefinedRole) => void;
  /** Additional CSS classes */
  className?: string;
}

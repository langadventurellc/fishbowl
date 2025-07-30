/**
 * Custom user-created role interface for UI components
 *
 * @module types/ui/settings/CustomRoleViewModel
 */
import type { RoleFormData } from "./RoleFormData";

/**
 * Custom user-created role with timestamps for UI display
 */
export interface CustomRoleViewModel extends RoleFormData {
  /** Unique identifier for the custom role */
  id: string;
  /** When the role was created */
  createdAt: string;
  /** When the role was last updated */
  updatedAt: string;
}

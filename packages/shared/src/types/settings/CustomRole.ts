/**
 * Custom user-created role interface
 *
 * @module types/settings/CustomRole
 */
import type { RoleFormData } from "./RoleFormData";

/**
 * Custom user-created role with timestamps
 */
export interface CustomRole extends RoleFormData {
  /** Unique identifier for the custom role */
  id: string;
  /** When the role was created */
  createdAt: string;
  /** When the role was last updated */
  updatedAt: string;
}

/**
 * Role interface for UI components
 *
 * @module types/ui/settings/RoleViewModel
 */
import type { RoleFormData } from "./RoleFormData";

/**
 * Role with timestamps for UI display
 */
export interface RoleViewModel extends RoleFormData {
  /** Unique identifier for the role */
  id: string;
  /** When the role was created (nullable) */
  createdAt?: string;
  /** When the role was last updated (nullable) */
  updatedAt?: string;
}

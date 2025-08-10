/**
 * Role interface for uniform role data structure
 *
 * @module types/ui/settings/PredefinedRole
 */

/**
 * Role data structure without predefined/custom distinctions
 */
export interface PredefinedRole {
  /** Unique identifier for the role */
  id: string;
  /** Display name of the role */
  name: string;
  /** Brief description of the role's purpose */
  description: string;
}

/**
 * Predefined system role interface
 *
 * @module types/ui/settings/PredefinedRole
 */

/**
 * Predefined system role with optional category
 */
export interface PredefinedRole {
  /** Unique identifier for the predefined role */
  id: string;
  /** Display name of the role */
  name: string;
  /** Brief description of the role's purpose */
  description: string;
  /** Optional category for grouping roles */
  category?: string;
}

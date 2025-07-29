/**
 * Predefined system role interface
 *
 * @module types/settings/PredefinedRole
 */

/**
 * Predefined system role with icon and optional category
 */
export interface PredefinedRole {
  /** Unique identifier for the predefined role */
  id: string;
  /** Display name of the role */
  name: string;
  /** Brief description of the role's purpose */
  description: string;
  /** Emoji icon for visual representation */
  icon: string;
  /** Optional category for grouping roles */
  category?: string;
}

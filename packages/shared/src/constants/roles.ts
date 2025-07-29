/**
 * Constants for role management and validation
 *
 * @module constants/roles
 */

/**
 * Role category constants for consistent categorization
 */
export const ROLE_CATEGORIES = {
  MANAGEMENT: "management",
  TECHNICAL: "technical",
  CREATIVE: "creative",
  ANALYTICAL: "analytical",
  SUPPORTIVE: "supportive",
  STRATEGIC: "strategic",
  GENERAL: "general",
} as const;

/**
 * Validation constants for role data
 */
export const ROLE_VALIDATION = {
  /** Maximum length for role names */
  MAX_NAME_LENGTH: 50,
  /** Minimum length for role names */
  MIN_NAME_LENGTH: 2,
  /** Maximum length for role descriptions */
  MAX_DESCRIPTION_LENGTH: 200,
  /** Minimum length for role descriptions */
  MIN_DESCRIPTION_LENGTH: 1,
} as const;

/**
 * UI layout constants for role displays
 */
export const ROLE_UI_CONSTANTS = {
  /** Number of columns in predefined roles grid */
  GRID_COLUMNS: 2,
  /** Gap between role cards in pixels */
  CARD_GAP: 16,
  /** Mobile breakpoint for single column layout */
  MOBILE_BREAKPOINT: 640,
} as const;

/**
 * Type definitions for role categories
 */
export type RoleCategory =
  (typeof ROLE_CATEGORIES)[keyof typeof ROLE_CATEGORIES];

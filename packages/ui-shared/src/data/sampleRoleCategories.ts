/**
 * Category metadata for sample roles (future-proofing).
 *
 * @module data/sampleRoleCategories
 */

/**
 * Maps role IDs to their categories for potential future grouping
 */
export const SAMPLE_ROLE_CATEGORIES = {
  "project-manager": "management",
  "technical-advisor": "technical",
  "creative-director": "creative",
  storyteller: "creative",
  analyst: "analytical",
  coach: "supportive",
  critic: "analytical",
  "business-strategist": "strategic",
  "financial-advisor": "strategic",
  generalist: "general",
} as const;

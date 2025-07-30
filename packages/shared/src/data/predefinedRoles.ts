/**
 * Predefined roles data for Fishbowl AI settings. This is a temporary file that will be replaced with JSON configuration files.
 *
 * @module data/predefinedRoles
 */

import type { PredefinedRole } from "../types/ui/settings/PredefinedRole";

/**
 * Comprehensive predefined roles based on product specification
 * Each role includes icon, name, description, and category for organization
 */
export const PREDEFINED_ROLES: readonly PredefinedRole[] = [
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Focus on timelines, coordination, and project organization",
    category: "management",
  },
  {
    id: "technical-advisor",
    name: "Technical Advisor",
    description: "Provide technical expertise and implementation guidance",
    category: "technical",
  },
  {
    id: "creative-director",
    name: "Creative Director",
    description: "Guide creative vision and artistic decision-making",
    category: "creative",
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Craft narratives and engaging content with rich storytelling",
    category: "creative",
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Provide data-driven insights and logical reasoning",
    category: "analytical",
  },
  {
    id: "coach",
    name: "Coach",
    description: "Support personal development and goal achievement",
    category: "supportive",
  },
  {
    id: "critic",
    name: "Critic",
    description:
      "Identify weaknesses and potential issues with constructive feedback",
    category: "analytical",
  },
  {
    id: "business-strategist",
    name: "Business Strategist",
    description: "Provide market insights and business strategy guidance",
    category: "strategic",
  },
  {
    id: "financial-advisor",
    name: "Financial Advisor",
    description: "Offer financial planning guidance and budget analysis",
    category: "strategic",
  },
  {
    id: "generalist",
    name: "Generalist",
    description:
      "Versatile contributor adaptable to various tasks and contexts",
    category: "general",
  },
] as const;

/**
 * Map of role IDs to role objects for quick lookup
 */
export const PREDEFINED_ROLES_MAP = PREDEFINED_ROLES.reduce(
  (map, role) => {
    map[role.id] = role;
    return map;
  },
  {} as Record<string, PredefinedRole>,
);

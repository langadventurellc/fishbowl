/**
 * Sample roles data for unified roles UI.
 * Transforms predefined roles into CustomRoleViewModel format.
 *
 * @module data/sampleRoles
 */

import type { CustomRoleViewModel } from "../types/settings/CustomRoleViewModel";

/**
 * Sample roles with consistent mock timestamps (January 1, 2025).
 * Includes all current predefined roles transformed to CustomRoleViewModel format.
 */
export const SAMPLE_ROLES: readonly CustomRoleViewModel[] = [
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Focus on timelines, coordination, and project organization",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "technical-advisor",
    name: "Technical Advisor",
    description: "Provide technical expertise and implementation guidance",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "creative-director",
    name: "Creative Director",
    description: "Guide creative vision and artistic decision-making",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Craft narratives and engaging content with rich storytelling",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Provide data-driven insights and logical reasoning",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "coach",
    name: "Coach",
    description: "Support personal development and goal achievement",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "critic",
    name: "Critic",
    description:
      "Identify weaknesses and potential issues with constructive feedback",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "business-strategist",
    name: "Business Strategist",
    description: "Provide market insights and business strategy guidance",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "financial-advisor",
    name: "Financial Advisor",
    description: "Offer financial planning guidance and budget analysis",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    id: "generalist",
    name: "Generalist",
    description:
      "Versatile contributor adaptable to various tasks and contexts",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
] as const;

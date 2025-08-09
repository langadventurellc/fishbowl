import { z } from "zod";

/**
 * Zod schema for validating persisted role data.
 *
 * Features:
 * - Comprehensive validation with security limits
 * - Clear error messages for validation failures
 * - Nullable timestamps for manual JSON editing
 * - No sensitive data exposure in validation errors
 * - Character limits to prevent DoS attacks
 */
export const persistedRoleSchema = z
  .object({
    // Unique identifier - required, non-empty string
    id: z
      .string({ message: "Role ID must be a string" })
      .min(1, "Role ID cannot be empty"),

    // Display name with character limits
    name: z
      .string({ message: "Role name must be a string" })
      .min(1, "Role name is required")
      .max(100, "Role name cannot exceed 100 characters"),

    // Description with security-conscious limits (can be empty)
    description: z
      .string({ message: "Role description must be a string" })
      .max(500, "Role description cannot exceed 500 characters"),

    // System prompt for AI instructions (can be empty)
    systemPrompt: z
      .string({ message: "System prompt must be a string" })
      .max(5000, "System prompt cannot exceed 5000 characters"),

    // Timestamps - nullable and optional for manual JSON edits
    createdAt: z
      .string({ message: "Created timestamp must be a string" })
      .datetime({ message: "Created timestamp must be a valid ISO datetime" })
      .nullable()
      .optional(),

    updatedAt: z
      .string({ message: "Updated timestamp must be a string" })
      .datetime({ message: "Updated timestamp must be a valid ISO datetime" })
      .nullable()
      .optional(),
  })
  .passthrough(); // Allow unknown fields for schema evolution

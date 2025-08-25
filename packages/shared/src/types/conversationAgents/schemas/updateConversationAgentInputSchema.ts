import { z } from "zod";

/**
 * Zod schema for validating conversation agent update input.
 * Validates optional status and display order updates.
 */
export const updateConversationAgentInputSchema = z
  .object({
    is_active: z
      .boolean({ message: "Active status must be a boolean" })
      .optional(),

    display_order: z
      .number({ message: "Display order must be a number" })
      .int("Display order must be an integer")
      .min(0, "Display order cannot be negative")
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided for update",
  });

export type UpdateConversationAgentInputSchema = z.infer<
  typeof updateConversationAgentInputSchema
>;

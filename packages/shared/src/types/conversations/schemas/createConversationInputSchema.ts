import { z } from "zod";

/**
 * Zod schema for validating conversation creation input.
 * Validates optional title with proper constraints.
 */
export const createConversationInputSchema = z.object({
  title: z
    .string({ message: "Title must be a string" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot exceed 255 characters")
    .optional(),
});

export type CreateConversationInputSchema = z.infer<
  typeof createConversationInputSchema
>;

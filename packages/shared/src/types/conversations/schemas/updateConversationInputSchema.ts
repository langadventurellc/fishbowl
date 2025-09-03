import { z } from "zod";

/**
 * Zod schema for validating conversation update input.
 * Validates partial updates with at least one field required.
 */
export const updateConversationInputSchema = z
  .object({
    title: z
      .string({ message: "Title must be a string" })
      .trim()
      .min(1, "Title cannot be empty")
      .max(255, "Title cannot exceed 255 characters")
      .optional(),

    /** Optional chat mode update: manual (user control) or round-robin (automatic rotation) */
    chat_mode: z
      .enum(["manual", "round-robin"], {
        message: "Chat mode must be either 'manual' or 'round-robin'",
      })
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided for update",
  });

export type UpdateConversationInputSchema = z.infer<
  typeof updateConversationInputSchema
>;

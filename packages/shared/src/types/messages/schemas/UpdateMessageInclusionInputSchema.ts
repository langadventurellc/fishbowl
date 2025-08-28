import { z } from "zod";

/**
 * Zod schema for UpdateMessageInclusionInput validation
 */
export const updateMessageInclusionInputSchema = z.object({
  id: z
    .string({ message: "ID must be a string" })
    .uuid("Invalid message ID format"),

  included: z.boolean({ message: "Included must be a boolean" }),
});

/**
 * Inferred TypeScript type from updateMessageInclusionInputSchema
 */
export type UpdateMessageInclusionInputSchema = z.infer<
  typeof updateMessageInclusionInputSchema
>;

import { z } from "zod";

/**
 * Zod schema for validating agent addition input.
 * Validates required IDs and optional display order.
 */
export const addAgentToConversationInputSchema = z.object({
  conversation_id: z
    .string({ message: "Conversation ID must be a string" })
    .uuid("Conversation ID must be a valid UUID"),

  agent_id: z
    .string({ message: "Agent ID must be a string" })
    .min(1, "Agent ID cannot be empty")
    .max(255, "Agent ID cannot exceed 255 characters"),

  display_order: z
    .number({ message: "Display order must be a number" })
    .int("Display order must be an integer")
    .min(0, "Display order cannot be negative")
    .optional(),
});

export type AddAgentToConversationInputSchema = z.infer<
  typeof addAgentToConversationInputSchema
>;

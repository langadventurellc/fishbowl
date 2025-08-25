import { z } from "zod";

/**
 * Zod schema for validating agent removal input.
 * Validates required conversation and agent IDs.
 */
export const removeAgentFromConversationInputSchema = z.object({
  conversation_id: z
    .string({ message: "Conversation ID must be a string" })
    .uuid("Conversation ID must be a valid UUID"),

  agent_id: z
    .string({ message: "Agent ID must be a string" })
    .min(1, "Agent ID cannot be empty")
    .max(255, "Agent ID cannot exceed 255 characters"),
});

export type RemoveAgentFromConversationInputSchema = z.infer<
  typeof removeAgentFromConversationInputSchema
>;

import { z } from "zod";

/**
 * Zod schema for validating complete conversation agent data.
 * Enforces business rules and type safety at runtime.
 */
export const conversationAgentSchema = z.object({
  id: z
    .string({ message: "ID must be a string" })
    .uuid("ID must be a valid UUID"),

  conversation_id: z
    .string({ message: "Conversation ID must be a string" })
    .uuid("Conversation ID must be a valid UUID"),

  agent_id: z
    .string({ message: "Agent ID must be a string" })
    .min(1, "Agent ID cannot be empty")
    .max(255, "Agent ID cannot exceed 255 characters"),

  added_at: z
    .string({ message: "Added date must be a string" })
    .datetime({ message: "Invalid added timestamp" }),

  is_active: z.boolean({ message: "Active status must be a boolean" }),

  display_order: z
    .number({ message: "Display order must be a number" })
    .int("Display order must be an integer")
    .min(0, "Display order cannot be negative"),
});

export type ConversationAgentSchema = z.infer<typeof conversationAgentSchema>;

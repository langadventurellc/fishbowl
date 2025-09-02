import { z } from "zod";

/**
 * Zod schema for CreateMessageInput validation
 */
export const createMessageInputSchema = z
  .object({
    conversation_id: z
      .string({ message: "Conversation ID must be a string" })
      .uuid("Invalid conversation ID format"),

    conversation_agent_id: z
      .string({ message: "Conversation agent ID must be a string" })
      .uuid("Invalid conversation agent ID format")
      .optional(),

    role: z.enum(["user", "agent", "system"], {
      message: "Role must be user, agent, or system",
    }),

    content: z
      .string({ message: "Content must be a string" })
      .min(1, "Message content cannot be empty"),

    included: z.boolean({ message: "Included must be a boolean" }).optional(),
  })
  .refine(
    (data) =>
      data.role === "agent"
        ? typeof data.conversation_agent_id === "string"
        : data.conversation_agent_id === undefined,
    {
      message:
        "conversation_agent_id is required for agent role and must be omitted for user/system roles",
      path: ["conversation_agent_id"],
    },
  );

/**
 * Inferred TypeScript type from createMessageInputSchema
 */
export type CreateMessageInputSchema = z.infer<typeof createMessageInputSchema>;

import { z } from "zod";

/**
 * Zod schema for Message validation
 */
export const messageSchema = z
  .object({
    id: z
      .string({ message: "ID must be a string" })
      .uuid("Invalid message ID format"),

    conversation_id: z
      .string({ message: "Conversation ID must be a string" })
      .uuid("Invalid conversation ID format"),

    conversation_agent_id: z
      .string({ message: "Conversation agent ID must be a string" })
      .uuid("Invalid conversation agent ID format")
      .nullable(),

    role: z.enum(["user", "agent", "system"], {
      message: "Role must be user, agent, or system",
    }),

    content: z
      .string({ message: "Content must be a string" })
      .min(1, "Message content cannot be empty"),

    included: z.boolean({ message: "Included must be a boolean" }),

    created_at: z
      .string({ message: "Created date must be a string" })
      .datetime("Invalid timestamp format"),
  })
  .refine(
    (data) =>
      data.role === "agent"
        ? data.conversation_agent_id !== null
        : data.conversation_agent_id === null,
    {
      message:
        "conversation_agent_id must be present for agent messages and null otherwise",
      path: ["conversation_agent_id"],
    },
  );

/**
 * Inferred TypeScript type from messageSchema
 */
export type MessageSchema = z.infer<typeof messageSchema>;

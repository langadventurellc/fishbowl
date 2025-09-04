import { z } from "zod";

/**
 * Zod schema for validating complete conversation data.
 * Enforces business rules and type safety at runtime.
 */
export const conversationSchema = z.object({
  id: z
    .string({ message: "ID must be a string" })
    .uuid("ID must be a valid UUID"),

  title: z
    .string({ message: "Title must be a string" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot exceed 255 characters"),

  /** Chat mode controlling agent behavior: manual (user control) or round-robin (automatic rotation) */
  chat_mode: z
    .enum(["manual", "round-robin"], {
      message: "Chat mode must be either 'manual' or 'round-robin'",
    })
    .default("manual"),

  created_at: z
    .string({ message: "Created date must be a string" })
    .datetime({ message: "Invalid creation timestamp" }),

  updated_at: z
    .string({ message: "Updated date must be a string" })
    .datetime({ message: "Invalid update timestamp" }),
});

export type ConversationSchema = z.infer<typeof conversationSchema>;

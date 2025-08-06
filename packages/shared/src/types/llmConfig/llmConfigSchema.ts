import { z } from "zod";
import { llmConfigInputSchema } from "./llmConfigInputSchema";

/**
 * Zod schema for validating complete LLM configuration data.
 * Extends input schema with system-generated fields.
 */
export const llmConfigSchema = llmConfigInputSchema.extend({
  id: z
    .string({ message: "ID must be a string" })
    .uuid("ID must be a valid UUID"),

  createdAt: z
    .string({ message: "Created date must be a string" })
    .datetime({ message: "Created date must be a valid ISO datetime" }),

  updatedAt: z
    .string({ message: "Updated date must be a string" })
    .datetime({ message: "Updated date must be a valid ISO datetime" }),
});

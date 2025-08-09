import { z } from "zod";
import { PROVIDER_OPTIONS } from "./Provider";

/**
 * Zod schema for validating LLM configuration input data.
 * Used when creating or updating configurations.
 */
export const llmConfigInputSchema = z
  .object({
    customName: z
      .string({ message: "Custom name must be a string" })
      .min(1, "Custom name is required")
      .max(100, "Custom name cannot exceed 100 characters"),

    provider: z.enum(PROVIDER_OPTIONS),

    apiKey: z
      .string({ message: "API key must be a string" })
      .min(1, "API key is required")
      .max(500, "API key cannot exceed 500 characters"),

    baseUrl: z
      .string({ message: "Base URL must be a string" })
      .url("Base URL must be a valid URL")
      .optional(),

    useAuthHeader: z
      .boolean({ message: "Use auth header must be a boolean" })
      .default(true),
  })
  .passthrough();

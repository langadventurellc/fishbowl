import { z } from "zod";
import { llmConfigSchema } from "./llmConfigSchema";

/**
 * Type inferred from the complete schema for TypeScript usage.
 * This represents the validated and parsed complete LLM configuration data structure.
 */
export type LlmConfigSchemaData = z.infer<typeof llmConfigSchema>;

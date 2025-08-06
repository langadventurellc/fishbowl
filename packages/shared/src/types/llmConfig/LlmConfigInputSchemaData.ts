import { z } from "zod";
import { llmConfigInputSchema } from "./llmConfigInputSchema";

/**
 * Type inferred from the input schema for TypeScript usage.
 * This represents the validated and parsed LLM configuration input data structure.
 */
export type LlmConfigInputSchemaData = z.infer<typeof llmConfigInputSchema>;

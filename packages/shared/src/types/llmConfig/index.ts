// Existing exports (maintain backward compatibility)
export type { LlmConfigMetadata } from "./LlmConfigMetadata";
export type { StorageResult } from "./StorageResult";

// New exports for complete configuration types
export type { LlmConfig } from "./LlmConfig";
export type { LlmConfigInput } from "./LlmConfigInput";

// Provider type and constants
export type { Provider } from "./Provider";
export { PROVIDER_OPTIONS } from "./Provider";

// Zod schemas
export { llmConfigInputSchema } from "./llmConfigInputSchema";
export { llmConfigSchema } from "./llmConfigSchema";

// Validation utilities
export { validateApiKey } from "./validateApiKey";
export { getApiKeyErrorMessage } from "./getApiKeyErrorMessage";

// Inferred types from schemas
export type { LlmConfigInputSchemaData } from "./LlmConfigInputSchemaData";
export type { LlmConfigSchemaData } from "./LlmConfigSchemaData";

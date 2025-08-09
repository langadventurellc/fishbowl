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

// Legacy validation utilities (maintained for backward compatibility)
export { validateApiKey } from "./validateApiKey";
export { getApiKeyErrorMessage } from "./getApiKeyErrorMessage";
export type { ValidationResult } from "./ValidationResult";
export { validateApiKeyWithError } from "./validateApiKeyWithError";
export { validateUniqueConfigName } from "./validateUniqueConfigName";
export { validateProviderRequirements } from "./validateProviderRequirements";
export { validateLlmConfig } from "./validateLlmConfig";

// Inferred types from schemas
export type { LlmConfigInputSchemaData } from "./LlmConfigInputSchemaData";
export type { LlmConfigSchemaData } from "./LlmConfigSchemaData";

// New standardized validation system
export type { ValidationError } from "./ValidationError";
export { ValidationErrorCode } from "./ValidationErrorCode";
export type { StandardizedValidationResult } from "./StandardizedValidationResult";

// Validation utilities
export { formatZodErrors } from "./formatZodErrors";
export { sanitizeValue } from "./sanitizeValue";
export { createValidationError } from "./createValidationError";
export { createValidationResult } from "./createValidationResult";
export { aggregateValidationErrors } from "./aggregateValidationErrors";

// User-friendly error formatting
export { groupErrorsByField } from "./groupErrorsByField";
export { getFieldDisplayName } from "./getFieldDisplayName";
export { getValidationSummary } from "./getValidationSummary";
export { formatErrorsForDisplay } from "./formatErrorsForDisplay";

// Comprehensive validation helper
export { validateWithErrors } from "./validateWithErrors";

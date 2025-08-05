/**
 * Validation type definitions for LLM provider configurations.
 *
 * Provides comprehensive error handling types for field validation,
 * configuration validation, and runtime error management.
 *
 * @fileoverview Validation types for LLM provider system
 * @module types/llm-providers/validation
 */

// Enum
export * from "./LlmValidationErrorCode";

// Interfaces
export * from "./LlmFieldValidationError";
export * from "./LlmValidationResult";
export * from "./LlmValidationContext";
export * from "./LlmProviderValidationError";

// Classes
export * from "./LlmConfigurationError";

// Type guards
export * from "./validationTypeGuards";

// Helper functions
export * from "./createValidResult";
export * from "./createInvalidResult";
export * from "./createFieldError";
export * from "./getDefaultErrorMessage";
export * from "./validateProvidersFile";
export * from "./createEmptyProvidersFile";
export * from "./isValidProvidersFile";

// Field validation schemas
export * from "./BaseFieldConfigSchema";
export * from "./TextFieldSchema";
export * from "./SecureTextFieldSchema";
export * from "./CheckboxFieldSchema";
export * from "./LlmFieldConfigSchema";
export * from "./LlmFieldConfigSchemaWithRefinements";

// Provider validation schemas
export * from "./LlmProviderMetadataSchema";
export * from "./LlmProviderConfigurationSchema";
export * from "./LlmProviderConfigSchema";
export * from "./file.schema";

// Type inference exports
export * from "./InferredTextField";
export * from "./InferredSecureTextField";
export * from "./InferredCheckboxField";
export * from "./InferredLlmFieldConfig";
export * from "./InferredLlmProviderMetadata";
export * from "./InferredLlmProviderConfiguration";
export * from "./InferredLlmProviderConfig";
export * from "./InferredLlmProvidersFile";

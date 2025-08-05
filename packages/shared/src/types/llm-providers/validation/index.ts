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
export * from "./LlmProviderValidationError";
export * from "./LlmValidationContext";
export * from "./LlmValidationResult";

// Classes
export * from "./LlmConfigurationError";

// Type guards
export * from "./validationTypeGuards";

// Helper functions
export * from "./createEmptyProvidersFile";
export * from "./createFieldError";
export * from "./createInvalidResult";
export * from "./createValidResult";
export * from "./getDefaultErrorMessage";
export * from "./isValidProvidersFile";
export * from "./validateProvidersFile";

// Zod error utilities
export * from "./buildValidationResult";
export * from "./formatFieldPath";
export * from "./formatZodMessage";
export * from "./getFieldFromPath";
export * from "./mapZodCodeToErrorCode";
export * from "./zodToFieldErrors";

// Field validation schemas
export * from "./BaseFieldConfigSchema";
export * from "./CheckboxFieldSchema";
export * from "./LlmFieldConfigSchema";
export * from "./LlmFieldConfigSchemaWithRefinements";
export * from "./SecureTextFieldSchema";
export * from "./TextFieldSchema";

// Provider validation schemas
export * from "./file.schema";
export * from "./LlmProviderConfigSchema";
export * from "./LlmProviderConfigurationSchema";
export * from "./LlmProviderMetadataSchema";

// Runtime configuration validation
export * from "./ConfigurationValueSchemas";
export * from "./validateConfigurationValues";
export * from "./validateFieldValue";
export * from "./validatePartialConfigurationValues";

// Type inference exports
export * from "./InferredCheckboxField";
export * from "./InferredLlmFieldConfig";
export * from "./InferredLlmProviderConfig";
export * from "./InferredLlmProviderConfiguration";
export * from "./InferredLlmProviderMetadata";
export * from "./InferredLlmProvidersFile";
export * from "./InferredSecureTextField";
export * from "./InferredTextField";

// Schema utilities
export * from "./applyFieldDefaults";
export * from "./assertFieldConfig";
export * from "./assertProviderConfig";
export * from "./assertProvidersFile";
export * from "./createProviderSchema";
export * from "./extendFieldSchema";
export * from "./getEnhancedFieldDefault";
export * from "./getFieldTypeDefault";
export * from "./isSchemaVersionCompatible";

// Validation service
export * from "./validationService";

// Field validators
export * from "./fieldValidators";

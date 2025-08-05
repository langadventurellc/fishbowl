/**
 * LLM Provider types barrel export.
 *
 * Exports all types, interfaces, and constants for LLM provider configurations.
 *
 * @module types/llm-providers
 */

// Provider types
export * from "./LlmProviderConfiguration";
export * from "./LlmProviderDefinition";
export * from "./LlmProviderId";
export * from "./LlmProviderMetadata";

// Storage interfaces
export * from "./LlmSecureStorageBridge";
export * from "./LlmStorageBridge";
export * from "./LlmStorageEvents";
export * from "./LlmStorageFactory";
export * from "./LlmStorageOptions";

// Validation types
export * from "./validation";

// Branded types
export * from "./InstanceId";
export * from "./ProviderId";

// Type constructors
export * from "./createInstanceId";
export * from "./createProviderId";

// Type guards
export * from "./isValidProvider";

// Re-export existing types for backward compatibility
export * from "./LlmProviderConfiguration";
export * from "./LlmProviderDefinition";
export * from "./LlmProviderId";
export * from "./LlmProviderMetadata";

// Configuration types
export * from "./LlmConfigurationId";
export * from "./LlmConfigurationValues";
export * from "./TypedConfigurationValues";

// Provider instance types
export * from "./LlmProviderInstance";
export * from "./LlmProviderInstanceData";
export * from "./LlmProviderInstanceUpdate";

// Legacy compatibility types
export * from "./LegacyLlmConfigData";

// Helper functions
export * from "./createEmptyValues";
export * from "./generateInstanceId";
export * from "./isConfigurationComplete";
export * from "./toLegacyFormat";
// Base types
export * from "./BaseFieldConfig";

// Field types
export * from "./CheckboxField";
export * from "./SecureTextField";
export * from "./TextField";

// Discriminated union
export * from "./LlmFieldConfig";

// Type guards
export * from "./fieldTypeGuards";

// Utility types
export * from "./ExtractFieldIds";
export * from "./FieldValueType";
export * from "./GetFieldById";

// Helper functions
export * from "./getFieldDefaultValue";
export * from "./isRequiredField";

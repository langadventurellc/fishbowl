---
kind: task
id: T-create-type-utilities-and-helper
title: Create type utilities and helper functions
status: open
priority: normal
prerequisites:
  - T-create-provider-metadata-and
  - T-create-field-configuration-types
  - T-create-runtime-configuration-and
created: "2025-08-04T19:48:57.619376"
updated: "2025-08-04T19:48:57.619376"
schema_version: "1.1"
parent: F-core-type-definitions
---

## Task Description

Create utility types and helper functions across all type files to enhance type safety and developer experience. Add these utilities to the appropriate existing files rather than creating a new utilities file.

## Implementation Steps

### 1. **Add to provider.types.ts**:

```typescript
// Branded types for type safety
export type ProviderId = string & { __brand: "ProviderId" };
export type InstanceId = string & { __brand: "InstanceId" };

// Type constructors
export const createProviderId = (id: string): ProviderId => id as ProviderId;
export const createInstanceId = (id: string): InstanceId => id as InstanceId;

// Provider type guard
export const isValidProvider = (
  provider: unknown,
): provider is LlmProviderDefinition => {
  return (
    typeof provider === "object" &&
    provider !== null &&
    "id" in provider &&
    "name" in provider &&
    "models" in provider &&
    "configuration" in provider
  );
};
```

### 2. **Add to field.types.ts**:

```typescript
// Extract field IDs from field array
export type ExtractFieldIds<T extends readonly LlmFieldConfig[]> =
  T[number]["id"];

// Get field type by ID
export type GetFieldById<
  T extends readonly LlmFieldConfig[],
  Id extends string,
> = Extract<T[number], { id: Id }>;

// Check if field is required
export const isRequiredField = (field: LlmFieldConfig): boolean =>
  field.required;

// Get default value for field
export const getFieldDefaultValue = (
  field: LlmFieldConfig,
): string | boolean | undefined => {
  switch (field.type) {
    case "text":
      return field.defaultValue;
    case "checkbox":
      return field.defaultValue;
    case "secure-text":
      return undefined; // No defaults for secure fields
  }
};
```

### 3. **Add to configuration.types.ts**:

```typescript
// Create empty configuration values
export const createEmptyValues = (
  fields: readonly LlmFieldConfig[],
): LlmConfigurationValues => {
  const values: LlmConfigurationValues = {};
  for (const field of fields) {
    const defaultValue = getFieldDefaultValue(field);
    if (defaultValue !== undefined) {
      values[field.id] = defaultValue;
    }
  }
  return values;
};

// Check if configuration is complete
export const isConfigurationComplete = (
  values: LlmConfigurationValues,
  fields: readonly LlmFieldConfig[],
): boolean => {
  return fields
    .filter(isRequiredField)
    .every((field) => values[field.id] !== undefined);
};

// Convert to legacy LlmConfigData format
export const toLegacyFormat = (
  instance: LlmProviderInstance,
): LlmConfigData => {
  return {
    customName: instance.customName || "",
    apiKey: (instance.values.apiKey as string) || "",
    baseUrl: (instance.values.baseUrl as string) || "",
    useAuthHeader: (instance.values.useAuthHeader as boolean) || false,
  };
};

// Generate unique instance ID
export const generateInstanceId = (): InstanceId => {
  return createInstanceId(
    `llm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );
};
```

### 4. **Add to validation.types.ts**:

```typescript
// Create validation result helpers
export const createValidResult = (): LlmValidationResult => ({
  valid: true,
  errors: [],
});

export const createInvalidResult = (
  errors: LlmFieldValidationError[],
): LlmValidationResult => ({
  valid: false,
  errors,
});

// Create field error helper
export const createFieldError = (
  fieldId: string,
  code: LlmValidationErrorCode,
  message?: string,
): LlmFieldValidationError => ({
  fieldId,
  code,
  message: message || getDefaultErrorMessage(code),
});

// Get default error messages
export const getDefaultErrorMessage = (
  code: LlmValidationErrorCode,
): string => {
  const messages: Record<LlmValidationErrorCode, string> = {
    [LlmValidationErrorCode.REQUIRED_FIELD_MISSING]: "This field is required",
    [LlmValidationErrorCode.INVALID_FIELD_TYPE]: "Invalid field type",
    [LlmValidationErrorCode.PATTERN_MISMATCH]:
      "Value does not match required pattern",
    // ... add all error codes
  };
  return messages[code] || "Validation error";
};
```

## Acceptance Criteria

- ✓ Branded types for ProviderId and InstanceId
- ✓ Type guards with proper runtime checks
- ✓ Utility functions for common operations
- ✓ Helper functions for configuration management
- ✓ Legacy format conversion utilities
- ✓ Comprehensive unit tests for all utilities
- ✓ JSDoc documentation for all exports

## Testing

- Unit tests for all type guards
- Tests for utility functions
- Verify branded type behavior
- Test legacy format conversion

## Notes

- Keep utilities in their respective type files
- Ensure all utilities are pure functions
- Add comprehensive JSDoc comments
- Export all utilities from barrel exports

### Log

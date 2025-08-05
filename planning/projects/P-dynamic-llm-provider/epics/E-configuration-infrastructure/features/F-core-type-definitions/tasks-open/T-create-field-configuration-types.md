---
kind: task
id: T-create-field-configuration-types
title: Create field configuration types with discriminated unions
status: open
priority: high
prerequisites:
  - T-create-directory-structure-and
created: "2025-08-04T19:46:45.451002"
updated: "2025-08-04T19:46:45.451002"
schema_version: "1.1"
parent: F-core-type-definitions
---

## Task Description

Implement field configuration types using TypeScript discriminated unions in `field.types.ts`. This provides type-safe field definitions for different input types in LLM provider configurations.

## Implementation Steps

1. **Create Base Field Interface**:

   ```typescript
   interface BaseFieldConfig {
     id: string; // Field identifier (e.g., 'apiKey', 'baseUrl')
     label: string; // Display label
     placeholder?: string; // Placeholder text
     required: boolean; // Whether field is required
     helperText?: string; // Helper text for UI
   }
   ```

2. **Create Secure Text Field Type**:

   ```typescript
   export interface SecureTextField extends BaseFieldConfig {
     type: "secure-text";
     minLength?: number;
     maxLength?: number;
     pattern?: string; // Regex pattern for validation
     // Indicates this should be stored securely
   }
   ```

3. **Create Text Field Type**:

   ```typescript
   export interface TextField extends BaseFieldConfig {
     type: "text";
     defaultValue?: string;
     minLength?: number;
     maxLength?: number;
     pattern?: string; // Regex pattern
   }
   ```

4. **Create Checkbox Field Type**:

   ```typescript
   export interface CheckboxField extends BaseFieldConfig {
     type: "checkbox";
     defaultValue?: boolean;
   }
   ```

5. **Create Discriminated Union Type**:

   ```typescript
   export type LlmFieldConfig = SecureTextField | TextField | CheckboxField;
   ```

6. **Create Type Guards**:

   ```typescript
   export const isSecureTextField = (
     field: LlmFieldConfig,
   ): field is SecureTextField => field.type === "secure-text";

   export const isTextField = (field: LlmFieldConfig): field is TextField =>
     field.type === "text";

   export const isCheckboxField = (
     field: LlmFieldConfig,
   ): field is CheckboxField => field.type === "checkbox";
   ```

7. **Add Field Value Type Mapping**:
   ```typescript
   export type FieldValueType<T extends LlmFieldConfig> =
     T extends SecureTextField
       ? string
       : T extends TextField
         ? string
         : T extends CheckboxField
           ? boolean
           : never;
   ```

## Reference Examples

From `docs/specifications/llm_providers.json`:

- secure-text: API keys with placeholders like "sk-..."
- text: Base URLs with default values
- checkbox: Boolean options like "useAuthHeader"

## Acceptance Criteria

- ✓ Discriminated union pattern with 'type' as discriminator
- ✓ Type guards for each field type
- ✓ Extensible design for future field types
- ✓ Full JSDoc documentation
- ✓ No `any` types used
- ✓ Unit tests for type guards

## Testing

- Write unit tests for all type guard functions
- Test discriminated union narrowing works correctly
- Ensure field value type mapping is accurate

## File Location

`packages/shared/src/types/llm-providers/field.types.ts`

### Log

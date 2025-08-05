---
kind: task
id: T-create-field-configuration-types
parent: F-core-type-definitions
status: done
title: Create field configuration types with discriminated unions
priority: high
prerequisites:
  - T-create-directory-structure-and
created: "2025-08-04T19:46:45.451002"
updated: "2025-08-04T23:32:28.089643"
schema_version: "1.1"
worktree: null
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

**2025-08-05T04:44:21.493958Z** - Successfully implemented field configuration types with discriminated unions for LLM provider forms. Created a complete type system following the project's one-export-per-file pattern with full TypeScript strict mode compliance. The implementation includes:

- Base field interface with common properties (id, label, placeholder, required, helperText)
- Three specialized field types: SecureTextField (for API keys), TextField (for URLs/text), and CheckboxField (for boolean options)
- Discriminated union using 'type' property as discriminator for TypeScript narrowing
- Type guard functions for runtime type checking and type narrowing
- Field value type mapping utility for type-safe value extraction
- Comprehensive unit tests with 19 test cases covering all scenarios including type narrowing, edge cases, and discriminated union exhaustiveness

All implementation follows project conventions with full JSDoc documentation, no 'any' types, and passes all quality checks including linting, formatting, and TypeScript compilation.

- filesChanged: ["packages/shared/src/types/llm-providers/BaseFieldConfig.ts", "packages/shared/src/types/llm-providers/SecureTextField.ts", "packages/shared/src/types/llm-providers/TextField.ts", "packages/shared/src/types/llm-providers/CheckboxField.ts", "packages/shared/src/types/llm-providers/LlmFieldConfig.ts", "packages/shared/src/types/llm-providers/fieldTypeGuards.ts", "packages/shared/src/types/llm-providers/FieldValueType.ts", "packages/shared/src/types/llm-providers/field.types.ts", "packages/shared/src/types/llm-providers/LlmProviderConfiguration.ts", "packages/shared/src/types/llm-providers/__tests__/fieldTypeGuards.test.ts"]

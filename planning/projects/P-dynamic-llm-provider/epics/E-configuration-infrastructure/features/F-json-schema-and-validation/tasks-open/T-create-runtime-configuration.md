---
kind: task
id: T-create-runtime-configuration
title: Create runtime configuration validation schema
status: open
priority: normal
prerequisites:
  - T-implement-zod-schemas-for-field
created: "2025-08-05T01:32:50.725593"
updated: "2025-08-05T01:32:50.725593"
schema_version: "1.1"
parent: F-json-schema-and-validation
---

## Task: Create runtime configuration validation schema

Implement Zod schemas for validating runtime configuration values that users input when configuring provider instances.

### Implementation Steps:

1. Create `packages/shared/src/types/llm-providers/validation/configuration.schema.ts`

2. Import field schemas and existing types:

   ```typescript
   import type {
     LlmConfigurationValues,
     LlmProviderInstance,
     FieldValueType,
   } from "../";
   import type { LlmFieldConfig } from "../LlmFieldConfig";
   import type { LlmValidationResult } from "./LlmValidationResult";
   import {
     createValidResult,
     createInvalidResult,
     createFieldError,
   } from "./";
   ```

3. Create value validation schemas for each field type:

   ```typescript
   // Text field value validation
   const TextFieldValueSchema = z.string().min(1, "Value is required");

   // Secure text field value validation (same as text)
   const SecureTextFieldValueSchema = z.string().min(1, "Value is required");

   // Checkbox field value validation
   const CheckboxFieldValueSchema = z.boolean();

   // Union of all value types
   const FieldValueSchema = z.union([
     TextFieldValueSchema,
     SecureTextFieldValueSchema,
     CheckboxFieldValueSchema,
   ]);
   ```

4. Create configuration values schema:

   ```typescript
   const LlmConfigurationValuesSchema = z.record(
     z.string(), // Field ID
     FieldValueSchema,
   );
   ```

5. Create provider instance validation:

   ```typescript
   const LlmProviderInstanceSchema = z.object({
     id: z.string().min(1),
     providerId: z.string().min(1),
     name: z.string().min(1),
     modelId: z.string().min(1),
     values: LlmConfigurationValuesSchema,
     createdAt: z.string().datetime(),
     updatedAt: z.string().datetime(),
   });
   ```

6. Create validation function with field requirements:

   ```typescript
   export function validateConfigurationValues(
     values: unknown,
     fields: LlmFieldConfig[],
   ): LlmValidationResult {
     // Validate each field value against its definition
     // Check required fields are present
     // Return validation result with field-specific errors
   }
   ```

7. Update the existing barrel export at `packages/shared/src/types/llm-providers/validation/index.ts`:
   ```typescript
   // Add to existing exports
   export * from "./configuration.schema";
   ```

### Technical Approach:

- Support dynamic validation based on field definitions
- Integrate with existing validation result types
- Handle secure field values appropriately
- Support partial validation for incremental updates

### Acceptance Criteria:

- ✓ Value schemas for all field types
- ✓ Configuration values validated as record
- ✓ Provider instance schema matches type
- ✓ Required field validation
- ✓ Integration with LlmValidationResult
- ✓ Partial validation support
- ✓ Unit tests for all scenarios

### Testing:

Create `packages/shared/src/types/llm-providers/validation/__tests__/configuration.schema.test.ts`:

- Valid values for each field type
- Missing required fields
- Invalid value types
- Empty string for required text fields
- Partial updates with subset of fields
- Unknown field IDs in values

### Performance:

- Configuration validation < 5ms
- Efficient for configurations with many fields

### Integration:

- Uses validation types from `packages/shared/src/types/llm-providers/validation/`
- Returns LlmValidationResult for consistency

### Related:

- Validation types: `packages/shared/src/types/llm-providers/validation/`
- Field types: `packages/shared/src/types/llm-providers/field.types.ts`

### Log

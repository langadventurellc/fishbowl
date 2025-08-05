---
kind: task
id: T-implement-zod-schemas-for-field
parent: F-json-schema-and-validation
status: done
title: Implement Zod schemas for field types with discriminated unions
priority: high
prerequisites: []
created: "2025-08-05T01:31:37.658970"
updated: "2025-08-05T01:50:47.579180"
schema_version: "1.1"
worktree: null
---

## Task: Implement Zod schemas for field types with discriminated unions

Create Zod validation schemas for all LLM provider field types using discriminated unions. This will provide runtime validation for the field configurations already defined in the types.

### Implementation Steps:

1. Create `packages/shared/src/types/llm-providers/validation/field.schema.ts`

2. Import existing field types and validation utilities:
   - Import BaseFieldConfig, TextField, SecureTextField, CheckboxField from parent directory
   - Use existing validation types and utilities from the same directory

3. Implement individual field schemas:

   ```typescript
   // Example pattern from feature spec
   const SecureTextFieldSchema = z.object({
     type: z.literal("secure-text"),
     id: z.string().min(1),
     label: z.string(),
     placeholder: z.string().optional(),
     required: z.boolean(),
     helperText: z.string().optional(),
   });
   ```

4. Create discriminated union schema:

   ```typescript
   const LlmFieldConfigSchema = z.discriminatedUnion("type", [
     TextFieldSchema,
     SecureTextFieldSchema,
     CheckboxFieldSchema,
   ]);
   ```

5. Add type inference exports:
   ```typescript
   export type InferredTextField = z.infer<typeof TextFieldSchema>;
   // Verify it matches TextField from types
   ```

### Technical Approach:

- Use `z.discriminatedUnion()` for efficient type discrimination
- Add custom error messages for better user feedback
- Ensure schemas exactly match existing TypeScript types
- Reference pattern from `packages/shared/src/types/settings/appearanceSettingsSchema.ts`

### Acceptance Criteria:

- ✓ All field types have corresponding Zod schemas
- ✓ Discriminated union properly handles all field types
- ✓ Type inference produces types matching existing interfaces
- ✓ Custom error messages provide clear feedback
- ✓ Unit tests verify valid/invalid cases for each field type
- ✓ Performance: Field validation < 1ms

5. Update the existing barrel export at `packages/shared/src/types/llm-providers/validation/index.ts`:
   ```typescript
   // Add to existing exports
   export * from "./field.schema";
   ```

### Testing:

Create `packages/shared/src/types/llm-providers/validation/__tests__/field.schema.test.ts`:

- Test valid field configurations
- Test invalid configurations with missing required fields
- Test discriminated union type narrowing
- Test custom error messages
- Verify inferred types match existing interfaces

### Dependencies:

- Existing field types in parent directory (`../field.types.ts`, `../TextField.ts`, etc.)
- Existing validation utilities in same directory
- Pattern reference: Settings schemas in shared package

### Log

**2025-08-05T07:15:42.136375Z** - Successfully implemented comprehensive Zod validation schemas for LLM provider field types with discriminated unions, cross-field validation, and extensive test coverage

- filesChanged: ["packages/shared/src/types/llm-providers/validation/BaseFieldConfigSchema.ts", "packages/shared/src/types/llm-providers/validation/TextFieldSchema.ts", "packages/shared/src/types/llm-providers/validation/SecureTextFieldSchema.ts", "packages/shared/src/types/llm-providers/validation/CheckboxFieldSchema.ts", "packages/shared/src/types/llm-providers/validation/LlmFieldConfigSchema.ts", "packages/shared/src/types/llm-providers/validation/LlmFieldConfigSchemaWithRefinements.ts", "packages/shared/src/types/llm-providers/validation/InferredTextField.ts", "packages/shared/src/types/llm-providers/validation/InferredSecureTextField.ts", "packages/shared/src/types/llm-providers/validation/InferredCheckboxField.ts", "packages/shared/src/types/llm-providers/validation/InferredLlmFieldConfig.ts", "packages/shared/src/types/llm-providers/validation/index.ts", "packages/shared/src/types/llm-providers/validation/__tests__/BaseFieldConfigSchema.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/TextFieldSchema.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/SecureTextFieldSchema.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/CheckboxFieldSchema.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/LlmFieldConfigSchema.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/LlmFieldConfigSchemaWithRefinements.test.ts"]

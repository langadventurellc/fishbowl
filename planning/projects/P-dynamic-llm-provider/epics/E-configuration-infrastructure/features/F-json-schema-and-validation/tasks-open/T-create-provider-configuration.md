---
kind: task
id: T-create-provider-configuration
title: Create provider configuration Zod schema with validation
status: open
priority: high
prerequisites:
  - T-implement-zod-schemas-for-field
created: "2025-08-05T01:32:00.417667"
updated: "2025-08-05T01:32:00.417667"
schema_version: "1.1"
parent: F-json-schema-and-validation
---

## Task: Create provider configuration Zod schema with validation

Implement the Zod schema for LLM provider configurations, including metadata validation and business rule refinements.

### Implementation Steps:

1. Create `packages/shared/src/types/llm-providers/validation/provider.schema.ts`

2. Import field schema and existing types:

   ```typescript
   import { LlmFieldConfigSchema } from "./field.schema";
   import type {
     LlmProviderMetadata,
     LlmProviderConfiguration,
   } from "../LlmProviderMetadata";
   import type { LlmProviderDefinition } from "../LlmProviderDefinition";
   ```

3. Implement metadata schema:

   ```typescript
   const LlmProviderMetadataSchema = z.object({
     displayName: z.string().min(1),
     description: z.string().optional(),
     icon: z.string().optional(),
     capabilities: z
       .object({
         supportsChatCompletion: z.boolean().optional(),
         supportsStreaming: z.boolean().optional(),
         supportsCustomInstructions: z.boolean().optional(),
         supportsFunctionCalling: z.boolean().optional(),
       })
       .optional(),
   });
   ```

4. Implement provider configuration schema:

   ```typescript
   const LlmProviderConfigurationSchema = z.object({
     fields: z.array(LlmFieldConfigSchema),
   });
   ```

5. Implement full provider schema with refinements:

   ```typescript
   const LlmProviderConfigSchema = z
     .object({
       id: z
         .string()
         .regex(
           /^[a-z0-9-]+$/,
           "Provider ID must be lowercase alphanumeric with hyphens",
         ),
       name: z.string().min(1),
       models: z.record(z.string(), z.string()),
       configuration: LlmProviderConfigurationSchema,
       metadata: LlmProviderMetadataSchema.optional(),
     })
     .refine(
       (data) => {
         // Business rule: At least one model must be defined
         return Object.keys(data.models).length > 0;
       },
       { message: "At least one model must be defined" },
     );
   ```

6. Add validation for field ID uniqueness within a provider

7. Update the existing barrel export at `packages/shared/src/types/llm-providers/validation/index.ts`:
   ```typescript
   // Add to existing exports
   export * from "./provider.schema";
   ```

### Technical Approach:

- Use refinements for cross-field validation
- Add specific regex patterns for ID validation
- Include helpful error messages for common issues
- Ensure schema matches LlmProviderDefinition type

### Acceptance Criteria:

- ✓ Provider schema validates all required fields
- ✓ ID format validation with clear error messages
- ✓ Model map validation ensures at least one model
- ✓ Field array validates using field schema
- ✓ Metadata validation is optional but structured
- ✓ Type inference matches existing interfaces
- ✓ Unit tests cover all validation rules

### Testing:

Create `packages/shared/src/types/llm-providers/validation/__tests__/provider.schema.test.ts`:

- Valid provider configurations
- Invalid ID formats (uppercase, spaces, special chars)
- Empty models object
- Duplicate field IDs
- Missing required fields
- Metadata validation

### Performance:

- Provider validation < 5ms for typical configurations
- Efficient validation for providers with many fields

### Related:

- Types: `packages/shared/src/types/llm-providers/LlmProviderDefinition.ts`
- Field schema: Created in previous task

### Log

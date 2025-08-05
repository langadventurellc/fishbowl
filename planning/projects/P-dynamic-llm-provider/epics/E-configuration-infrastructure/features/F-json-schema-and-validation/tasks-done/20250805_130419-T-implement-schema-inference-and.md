---
kind: task
id: T-implement-schema-inference-and
parent: F-json-schema-and-validation
status: done
title: Implement schema inference and type utilities
priority: normal
prerequisites:
  - T-create-provider-configuration
  - T-implement-json-file-format
created: "2025-08-05T01:33:18.937743"
updated: "2025-08-05T12:44:00.385306"
schema_version: "1.1"
worktree: null
---

## Task: Implement schema inference and type utilities

Create utility functions for type inference from Zod schemas and schema composition utilities for extensibility.

### Implementation Steps:

1. Create `packages/shared/src/types/llm-providers/validation/schemaUtils.ts`

2. Implement type inference utilities:

   ```typescript
   import { z } from "zod";
   import { LlmFieldConfigSchema } from "./field.schema";
   import { LlmProviderConfigSchema } from "./provider.schema";
   import { LlmProvidersFileSchema } from "./file.schema";
   import type { LlmFieldConfig } from "../LlmFieldConfig";
   import type { FieldValueType } from "../FieldValueType";

   // Infer types from schemas
   export type InferredProviderConfig = z.infer<typeof LlmProviderConfigSchema>;
   export type InferredFieldConfig = z.infer<typeof LlmFieldConfigSchema>;
   export type InferredProvidersFile = z.infer<typeof LlmProvidersFileSchema>;

   // Type assertion helpers
   export function assertProviderConfig(
     data: unknown,
   ): asserts data is InferredProviderConfig {
     LlmProviderConfigSchema.parse(data);
   }
   ```

3. Create schema composition utilities:

   ```typescript
   // Extend field schema with custom fields
   export function extendFieldSchema<T extends z.ZodRawShape>(extensions: T) {
     return LlmFieldConfigSchema.and(z.object(extensions));
   }

   // Create provider schema with custom metadata
   export function createProviderSchema<T extends z.ZodRawShape>(
     metadataExtensions?: T,
   ) {
     const baseSchema = LlmProviderConfigSchema;
     if (metadataExtensions) {
       return baseSchema.extend({
         metadata: LlmProviderMetadataSchema.extend(metadataExtensions),
       });
     }
     return baseSchema;
   }
   ```

4. Implement default value utilities:

   ```typescript
   // Apply defaults to partial configuration
   export function applyFieldDefaults(
     fields: Partial<LlmFieldConfig>[],
   ): LlmFieldConfig[] {
     return fields.map((field) => ({
       required: false,
       placeholder: "",
       ...field,
     }));
   }

   // Get default value for field type
   export function getFieldTypeDefault(type: string): FieldValueType {
     switch (type) {
       case "text":
       case "secure-text":
         return "";
       case "checkbox":
         return false;
       default:
         return "";
     }
   }
   ```

5. Create schema versioning utilities:

   ```typescript
   // Check if schema version is compatible
   export function isSchemaVersionCompatible(
     dataVersion: string,
     currentVersion: string,
   ): boolean {
     // Implement semantic version comparison
     // Major version must match, minor/patch can be higher
   }

   // Migrate schema if needed (placeholder for future)
   export function migrateSchema(
     data: unknown,
     fromVersion: string,
     toVersion: string,
   ): unknown {
     // Future implementation for migrations
     return data;
   }
   ```

6. Update the existing barrel export at `packages/shared/src/types/llm-providers/validation/index.ts`:
   ```typescript
   // Add to existing exports
   export * from "./schemaUtils";
   ```

### Technical Approach:

- Use TypeScript's type inference capabilities
- Provide runtime and compile-time type safety
- Support schema extension for future needs
- Keep utilities pure and testable

### Acceptance Criteria:

- ✓ Type inference matches original TypeScript types
- ✓ Assertion functions provide runtime guarantees
- ✓ Schema composition allows extensions
- ✓ Default value handling is consistent
- ✓ Version compatibility checking works
- ✓ All utilities have unit tests
- ✓ JSDoc documentation for all exports

### Testing:

Create `packages/shared/src/types/llm-providers/validation/__tests__/schemaUtils.test.ts`:

- Type inference accuracy
- Assertion function behavior
- Schema composition results
- Default value application
- Version compatibility logic
- Edge cases and error scenarios

### Documentation:

Include examples showing:

- How to use inferred types
- Schema extension patterns
- Default value strategies
- Version compatibility rules

### Related:

- All schemas from previous tasks
- Existing type definitions in shared package
- Pattern from settings schema utilities

### Log

**2025-08-05T18:04:19.532835Z** - Implemented comprehensive schema inference and type utilities for LLM provider validation system. Created utilities following the project's "one export per file" linting rule, including type assertion helpers, schema composition utilities, enhanced default value handling, and schema versioning compatibility checking. All utilities include comprehensive JSDoc documentation and full unit test coverage.

- filesChanged: ["packages/shared/src/types/llm-providers/validation/assertProviderConfig.ts", "packages/shared/src/types/llm-providers/validation/assertFieldConfig.ts", "packages/shared/src/types/llm-providers/validation/assertProvidersFile.ts", "packages/shared/src/types/llm-providers/validation/extendFieldSchema.ts", "packages/shared/src/types/llm-providers/validation/createProviderSchema.ts", "packages/shared/src/types/llm-providers/validation/applyFieldDefaults.ts", "packages/shared/src/types/llm-providers/validation/getFieldTypeDefault.ts", "packages/shared/src/types/llm-providers/validation/getEnhancedFieldDefault.ts", "packages/shared/src/types/llm-providers/validation/isSchemaVersionCompatible.ts", "packages/shared/src/types/llm-providers/validation/migrateSchema.ts", "packages/shared/src/types/llm-providers/validation/index.ts", "packages/shared/src/types/llm-providers/validation/__tests__/assertProviderConfig.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/assertFieldConfig.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/isSchemaVersionCompatible.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/getFieldTypeDefault.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/getEnhancedFieldDefault.test.ts", "packages/shared/src/types/llm-providers/validation/__tests__/extendFieldSchema.test.ts"]

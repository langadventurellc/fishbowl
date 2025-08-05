---
kind: task
id: T-implement-json-file-format
parent: F-json-schema-and-validation
status: done
title: Implement JSON file format schema with versioning
priority: high
prerequisites:
  - T-create-provider-configuration
created: "2025-08-05T01:32:24.314831"
updated: "2025-08-05T12:05:28.031323"
schema_version: "1.1"
worktree: null
---

## Task: Implement JSON file format schema with versioning

Create the Zod schema for validating complete LLM provider configuration files, including version support for future migrations.

### Implementation Steps:

1. Create `packages/shared/src/types/llm-providers/validation/file.schema.ts`

2. Import provider schema and version utilities:

   ```typescript
   import { LlmProviderConfigSchema } from "./provider.schema";
   import { isValidSchemaVersion } from "../../../services/storage/utils/isValidSchemaVersion";
   ```

3. Define version constant:

   ```typescript
   export const LLM_PROVIDERS_SCHEMA_VERSION = "1.0.0";
   ```

4. Implement file schema:

   ```typescript
   const LlmProvidersFileSchema = z
     .object({
       version: z
         .string()
         .regex(
           /^\d+\.\d+\.\d+$/,
           "Version must follow semantic versioning (e.g., 1.0.0)",
         )
         .refine(isValidSchemaVersion, "Invalid schema version format"),
       providers: z
         .array(LlmProviderConfigSchema)
         .min(1, "At least one provider must be defined"),
       metadata: z
         .object({
           lastUpdated: z.string().datetime().optional(),
           description: z.string().optional(),
         })
         .optional(),
     })
     .passthrough(); // Allow unknown fields for forward compatibility
   ```

5. Add validation for provider ID uniqueness across the file:

   ```typescript
   .refine(
     (data) => {
       const ids = data.providers.map(p => p.id);
       return ids.length === new Set(ids).size;
     },
     { message: "Provider IDs must be unique within the file" }
   );
   ```

6. Create helper functions:

   ```typescript
   export function validateProvidersFile(data: unknown) {
     return LlmProvidersFileSchema.safeParse(data);
   }

   export function createEmptyProvidersFile() {
     return {
       version: LLM_PROVIDERS_SCHEMA_VERSION,
       providers: [],
     };
   }
   ```

7. Update the existing barrel export at `packages/shared/src/types/llm-providers/validation/index.ts`:
   ```typescript
   // Add to existing exports
   export * from "./file.schema";
   ```

### Technical Approach:

- Use semantic versioning for future migration support
- Allow passthrough for forward compatibility
- Validate provider ID uniqueness at file level
- Include metadata for tracking changes

### Acceptance Criteria:

- ✓ File schema validates version format
- ✓ Providers array validated with provider schema
- ✓ Provider ID uniqueness enforced
- ✓ Passthrough allows unknown fields
- ✓ Helper functions for common operations
- ✓ Type inference provides correct structure
- ✓ Unit tests cover all validation scenarios

### Testing:

Create `packages/shared/src/types/llm-providers/validation/__tests__/file.schema.test.ts`:

- Valid configuration files
- Invalid version formats
- Empty providers array
- Duplicate provider IDs
- Forward compatibility with unknown fields
- Large files with many providers (performance)

### Performance:

- File validation < 50ms for files with 20+ providers
- Efficient duplicate ID detection

### Documentation:

Include JSDoc comments explaining:

- Version format requirements
- Migration strategy
- Forward compatibility approach

### Related:

- Version validation: `packages/shared/src/services/storage/utils/isValidSchemaVersion.ts`
- Pattern reference: `packages/shared/src/types/settings/persistedSettingsSchema.ts`

### Log

**2025-08-05T17:19:13.339190Z** - Successfully implemented JSON file format schema with versioning for LLM provider configurations. Created comprehensive Zod validation schema that validates version format using semantic versioning, enforces provider ID uniqueness at file level, supports optional metadata with ISO datetime validation, and provides forward compatibility via passthrough. Implementation follows project's "one export per file" rule by splitting functions into separate modules. Added comprehensive test suite with 32 passing tests covering all validation scenarios, performance requirements, and error handling. All quality checks (lint, format, type-check) pass successfully.

- filesChanged: ["packages/shared/src/types/llm-providers/validation/file.schema.ts", "packages/shared/src/types/llm-providers/validation/validateProvidersFile.ts", "packages/shared/src/types/llm-providers/validation/createEmptyProvidersFile.ts", "packages/shared/src/types/llm-providers/validation/isValidProvidersFile.ts", "packages/shared/src/types/llm-providers/validation/InferredLlmProvidersFile.ts", "packages/shared/src/types/llm-providers/validation/index.ts", "packages/shared/src/types/llm-providers/validation/__tests__/file.schema.test.ts"]

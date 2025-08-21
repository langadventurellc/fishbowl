---
id: T-create-llm-models-schema-and
title: Create LLM models schema and type definitions
status: done
priority: high
parent: F-configurable-llm-models
prerequisites: []
affectedFiles:
  packages/shared/src/types/settings/llmModelsSchema.ts:
    Created main schema file
    with Zod validation schemas for LLM models, providers, and settings.
    Includes version constants, security validation limits, and comprehensive
    JSDoc documentation.
  packages/shared/src/types/settings/PersistedLlmModelsSettingsData.ts:
    Created TypeScript type definition for complete LLM models settings file
    structure inferred from Zod schema.
  packages/shared/src/types/settings/PersistedLlmProviderData.ts:
    Created TypeScript type definition for single LLM provider configuration
    inferred from Zod schema.
  packages/shared/src/types/settings/PersistedLlmModelData.ts:
    Created TypeScript type definition for single LLM model configuration
    inferred from Zod schema.
  packages/shared/src/types/settings/index.ts:
    Updated exports to include new LLM
    models schemas and type definitions following established patterns.
  packages/shared/src/types/settings/__tests__/llmModelsSchema.test.ts:
    Added comprehensive unit tests (56 test cases) covering all validation
    scenarios, edge cases, security limits, and error handling.
log:
  - Successfully implemented foundational TypeScript types and Zod validation
    schemas for LLM models configuration following established patterns. Created
    comprehensive schema validation with security-conscious limits, clear error
    messages, and extensive test coverage. All quality checks pass and shared
    packages rebuilt successfully.
schema: v1.0
childrenIds: []
created: 2025-08-21T19:35:43.960Z
updated: 2025-08-21T19:35:43.960Z
---

## Context

Create the foundational TypeScript types and Zod validation schemas for LLM models configuration, following the established pattern used by roles and personalities in the codebase.

This task establishes the data structure and validation rules that will be used throughout the system. The pattern is well-established in:

- `packages/shared/src/types/settings/personalitiesSettingsSchema.ts`
- `packages/shared/src/types/settings/PersistedPersonalitiesSettingsData.ts`

## Specific Implementation Requirements

### 1. Create LLM Models Schema (`packages/shared/src/types/settings/llmModelsSchema.ts`)

Follow the exact pattern from `personalitiesSettingsSchema.ts`:

- **Schema Version**: Export `LLM_MODELS_SCHEMA_VERSION = "1.0.0"` constant
- **Provider Schema**: Zod object with `id` (string), `name` (string), `models` (array)
- **Model Schema**: Zod object with `id` (string), `name` (string), `contextLength` (number)
- **Root Schema**: Include `schemaVersion`, `providers` array, `lastUpdated` timestamp
- **Validation Rules**: Same security patterns (string lengths, required fields)
- **Passthrough**: Enable `.passthrough()` for schema evolution

### 2. Create Type Definitions

Create these files following the patterns:

**`packages/shared/src/types/settings/PersistedLlmModelsSettingsData.ts`**:

```typescript
import { z } from "zod";
import { persistedLlmModelsSettingsSchema } from "./llmModelsSchema";

export type PersistedLlmModelsSettingsData = z.infer<
  typeof persistedLlmModelsSettingsSchema
>;
```

**`packages/shared/src/types/settings/PersistedLlmProviderData.ts`**:

```typescript
import { z } from "zod";
import { persistedLlmProviderSchema } from "./llmModelsSchema";

export type PersistedLlmProviderData = z.infer<
  typeof persistedLlmProviderSchema
>;
```

**`packages/shared/src/types/settings/PersistedLlmModelData.ts`**:

```typescript
import { z } from "zod";
import { persistedLlmModelSchema } from "./llmModelsSchema";

export type PersistedLlmModelData = z.infer<typeof persistedLlmModelSchema>;
```

### 3. Update Shared Types Index

Add exports to `packages/shared/src/types/settings/index.ts`:

```typescript
export * from "./llmModelsSchema";
export * from "./PersistedLlmModelsSettingsData";
export * from "./PersistedLlmProviderData";
export * from "./PersistedLlmModelData";
```

## Technical Approach

1. **Copy personalitiesSettingsSchema.ts** as starting template
2. **Replace personality-specific fields** with LLM model fields
3. **Simplify validation rules** - LLM models are simpler than personalities
4. **Use same security patterns** - string length limits, required field validation
5. **Follow same file naming conventions** - Persisted\* prefix for data types
6. **Include comprehensive JSDoc** documentation with validation examples

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Schema validates provider objects with id, name, and models array
- ✅ Schema validates model objects with id, name, and contextLength
- ✅ Root schema includes schemaVersion, providers array, and lastUpdated
- ✅ All string fields have appropriate length limits (prevent DoS attacks)
- ✅ contextLength field accepts reasonable numeric values (1000 to 1000000)
- ✅ Schema provides clear error messages for validation failures
- ✅ TypeScript types are properly inferred from Zod schemas

### Security Requirements

- ✅ String length limits prevent memory exhaustion attacks
- ✅ Numeric validation prevents injection attacks
- ✅ Required field validation prevents undefined behavior
- ✅ Schema passthrough allows future extensions safely

### Integration Requirements

- ✅ Types are exported from shared package index
- ✅ Schema follows same patterns as existing settings schemas
- ✅ File organization matches established conventions
- ✅ Documentation includes usage examples

### Testing Requirements

- ✅ Include unit tests in same file using Jest
- ✅ Test valid configuration parsing
- ✅ Test validation errors for invalid data
- ✅ Test schema evolution compatibility
- ✅ Test security edge cases (very long strings, invalid numbers)

## Dependencies

None - this is a foundational task that other tasks will depend on.

## Security Considerations

- **Input Validation**: Strict Zod schemas prevent malformed data
- **DoS Prevention**: String length limits prevent memory exhaustion
- **Type Safety**: TypeScript ensures compile-time validation
- **No Sensitive Data**: Configuration contains only model metadata

## Files Created

- `packages/shared/src/types/settings/llmModelsSchema.ts`
- `packages/shared/src/types/settings/PersistedLlmModelsSettingsData.ts`
- `packages/shared/src/types/settings/PersistedLlmProviderData.ts`
- `packages/shared/src/types/settings/PersistedLlmModelData.ts`

## Files Modified

- `packages/shared/src/types/settings/index.ts` - Add new exports

---
kind: task
id: T-add-complete-llmconfig-types-and
parent: F-repository-pattern
status: done
title: Add complete LlmConfig types and Zod validation schemas
priority: high
prerequisites: []
created: "2025-08-06T17:02:09.275407"
updated: "2025-08-06T17:04:01.684806"
schema_version: "1.1"
worktree: null
---

# Add Complete LlmConfig Types and Zod Validation Schemas

## Context

The current implementation only has `LlmConfigMetadata` type, but the feature specification requires complete `LlmConfig` and `LlmConfigInput` interfaces that include decrypted API keys, plus Zod validation schemas for type safety.

## Implementation Requirements

### 1. Create Complete LlmConfig Interface

Add to `packages/shared/src/types/llmConfig/`:

```typescript
// LlmConfig.ts - Complete configuration including decrypted API key
export interface LlmConfig {
  id: string;
  customName: string;
  provider: string;
  apiKey: string; // Decrypted when read from repository
  baseUrl?: string;
  authHeaderType?: string;
  createdAt: string;
  updatedAt: string;
}

// LlmConfigInput.ts - Input type for create/update operations
export interface LlmConfigInput {
  customName: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  authHeaderType?: string;
}
```

### 2. Create Zod Validation Schemas

Add `packages/shared/src/types/llmConfig/llmConfigSchema.ts`:

```typescript
import { z } from "zod";

export const llmConfigInputSchema = z.object({
  customName: z.string().min(1, "Custom name is required"),
  provider: z.string().min(1, "Provider is required"),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Base URL must be valid URL").optional(),
  authHeaderType: z.string().optional(),
});

export const llmConfigSchema = llmConfigInputSchema.extend({
  id: z.string().uuid("ID must be valid UUID"),
  createdAt: z.string().datetime("Created date must be valid ISO datetime"),
  updatedAt: z.string().datetime("Updated date must be valid ISO datetime"),
});

export type LlmConfigInput = z.infer<typeof llmConfigInputSchema>;
export type LlmConfig = z.infer<typeof llmConfigSchema>;
```

### 3. Update Type Exports

Update `packages/shared/src/types/llmConfig/index.ts`:

- Export new interfaces and schemas
- Maintain backward compatibility with existing `LlmConfigMetadata`

## Acceptance Criteria

- ✓ `LlmConfig` interface includes all fields from specification with decrypted API key
- ✓ `LlmConfigInput` interface for create/update operations without timestamps/id
- ✓ Zod schemas validate all required fields with appropriate constraints
- ✓ API key validation ensures non-empty string
- ✓ Base URL validation ensures valid URL format when provided
- ✓ All types properly exported from index files
- ✓ Backward compatibility maintained with existing `LlmConfigMetadata`

## Files to Modify

- `packages/shared/src/types/llmConfig/LlmConfig.ts` (new)
- `packages/shared/src/types/llmConfig/LlmConfigInput.ts` (new)
- `packages/shared/src/types/llmConfig/llmConfigSchema.ts` (new)
- `packages/shared/src/types/llmConfig/index.ts` (update exports)
- `packages/shared/src/types/index.ts` (update exports)

## Testing Requirements

- Unit tests for Zod schema validation with valid/invalid data
- Type checking ensures interfaces match schema inferences
- Verify all required fields are properly validated

### Log

**2025-08-06T22:16:53.364302Z** - Implemented complete LlmConfig types and Zod validation schemas with comprehensive test coverage. Created separate files following the one-export-per-file rule, including LlmConfig interface with decrypted API key, LlmConfigInput interface for create/update operations, and robust Zod schemas with detailed validation rules. All schemas include proper error messages, length limits, URL validation for baseUrl, and UUID validation for IDs. Added comprehensive test suite with 36 passing tests covering boundary conditions, error cases, and type inference. All quality checks pass and shared package has been rebuilt.

- filesChanged: ["packages/shared/src/types/llmConfig/LlmConfig.ts", "packages/shared/src/types/llmConfig/LlmConfigInput.ts", "packages/shared/src/types/llmConfig/llmConfigInputSchema.ts", "packages/shared/src/types/llmConfig/llmConfigSchema.ts", "packages/shared/src/types/llmConfig/LlmConfigInputSchemaData.ts", "packages/shared/src/types/llmConfig/LlmConfigSchemaData.ts", "packages/shared/src/types/llmConfig/__tests__/llmConfigSchema.test.ts", "packages/shared/src/types/llmConfig/index.ts"]

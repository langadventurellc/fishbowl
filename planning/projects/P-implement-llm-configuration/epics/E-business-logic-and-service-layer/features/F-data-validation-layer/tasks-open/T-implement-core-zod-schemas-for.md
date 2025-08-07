---
kind: task
id: T-implement-core-zod-schemas-for
title: Implement core Zod schemas for LLM configuration validation
status: open
priority: high
prerequisites: []
created: "2025-08-07T01:35:46.866852"
updated: "2025-08-07T01:35:46.866852"
schema_version: "1.1"
parent: F-data-validation-layer
---

# Implement Core Zod Schemas for LLM Configuration Validation

## Context

This task implements the foundational Zod validation schemas for LLM configurations. These schemas will be used across both desktop and mobile platforms, so they belong in the shared package.

## Technical Approach

Create the core validation schemas in `packages/shared/src/types/llmConfig/`:

### 1. Input Schema (`llmConfigInputSchema.ts`)

```typescript
import { z } from "zod";

export const llmConfigInputSchema = z.object({
  customName: z
    .string()
    .min(1, "Configuration name is required")
    .max(100, "Configuration name must be 100 characters or less"),
  provider: z.enum(["openai", "anthropic", "google", "custom"], {
    errorMap: () => ({
      message: "Provider must be openai, anthropic, google, or custom",
    }),
  }),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Base URL must be a valid URL").optional(),
  useAuthHeader: z.boolean().default(true),
});

export type LlmConfigInput = z.infer<typeof llmConfigInputSchema>;
```

### 2. Complete Schema (`llmConfigSchema.ts`)

```typescript
import { z } from "zod";
import { llmConfigInputSchema } from "./llmConfigInputSchema.js";

export const llmConfigSchema = llmConfigInputSchema.extend({
  id: z.string().uuid("ID must be a valid UUID"),
  createdAt: z
    .string()
    .datetime("Created timestamp must be valid ISO datetime"),
  updatedAt: z
    .string()
    .datetime("Updated timestamp must be valid ISO datetime"),
});

export type LlmConfig = z.infer<typeof llmConfigSchema>;
```

### 3. Barrel Export (`index.ts`)

```typescript
export * from "./llmConfigInputSchema.js";
export * from "./llmConfigSchema.js";
export * from "./validators.js";
```

## Implementation Requirements

### File Structure

```
packages/shared/src/types/llmConfig/
├── llmConfigInputSchema.ts    # Input validation schema
├── llmConfigSchema.ts         # Complete configuration schema
├── index.ts                   # Barrel export
└── __tests__/
    └── schemas.test.ts        # Unit tests for schemas
```

### Schema Features

- **Required Fields**: customName, provider, apiKey
- **Optional Fields**: baseUrl (when provided, must be valid URL)
- **Default Values**: useAuthHeader defaults to true
- **Field Constraints**:
  - customName: 1-100 characters
  - provider: enum validation with clear error messages
  - apiKey: non-empty string (provider-specific validation comes later)
  - baseUrl: valid URL format when provided
- **System Fields**: id (UUID), createdAt/updatedAt (ISO datetime)

## Unit Tests to Implement

Test scenarios in `__tests__/schemas.test.ts`:

1. **Valid Configurations**:
   - Valid configuration for each provider
   - Optional fields handled correctly
   - Default values applied

2. **Required Field Validation**:
   - Missing customName, provider, apiKey
   - Empty string validation

3. **Field Type Validation**:
   - Invalid provider enum values
   - Invalid URL formats
   - Invalid UUID formats

4. **Field Constraint Validation**:
   - customName length limits (too short/long)
   - Boolean useAuthHeader validation

5. **Error Message Quality**:
   - Clear, actionable error messages
   - Field-specific error identification

## Acceptance Criteria

- ✓ Input schema validates all required fields with appropriate constraints
- ✓ Complete schema includes system fields (id, timestamps)
- ✓ Provider enum only accepts valid values with clear error messages
- ✓ baseUrl validation only applies when field is provided
- ✓ Default values are applied correctly (useAuthHeader = true)
- ✓ All error messages are user-friendly and actionable
- ✓ Schemas are exported through barrel export
- ✓ Unit tests cover all validation scenarios with 100% path coverage
- ✓ TypeScript types are properly inferred from schemas

## Dependencies

- None (foundational task)

## File Locations

- Implementation: `packages/shared/src/types/llmConfig/`
- Tests: `packages/shared/src/types/llmConfig/__tests__/`

### Log

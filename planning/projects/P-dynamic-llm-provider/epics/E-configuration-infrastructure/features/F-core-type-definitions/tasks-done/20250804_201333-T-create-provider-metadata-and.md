---
kind: task
id: T-create-provider-metadata-and
parent: F-core-type-definitions
status: done
title: Create provider metadata and configuration types
priority: high
prerequisites:
  - T-create-directory-structure-and
created: "2025-08-04T19:46:18.060375"
updated: "2025-08-04T20:06:03.147038"
schema_version: "1.1"
worktree: null
---

## Task Description

Implement the core provider metadata and configuration interfaces in `provider.types.ts`. These types define how LLM providers are structured and configured in the system.

## Implementation Steps

1. **Create Provider Metadata Interface**:

   ```typescript
   export interface LlmProviderMetadata {
     id: string; // 'openai', 'anthropic', 'ollama', etc.
     name: string; // Display name like 'OpenAI', 'Anthropic'
     models: Record<string, string>; // Model ID to display name mapping
   }
   ```

2. **Create Provider Configuration Interface**:

   ```typescript
   export interface LlmProviderConfiguration {
     fields: LlmFieldConfig[]; // Array of field configurations
   }
   ```

3. **Create Complete Provider Definition**:

   ```typescript
   export interface LlmProviderDefinition extends LlmProviderMetadata {
     configuration: LlmProviderConfiguration;
   }
   ```

4. **Add JSDoc Documentation**:
   - Document each interface and property
   - Include examples in documentation
   - Reference the JSON specification structure

5. **Create Provider ID Type**:
   ```typescript
   export type LlmProviderId = string; // Consider branded type in future
   ```

## Reference Implementation

Based on `docs/specifications/llm_providers.json`:

- Providers have id, name, models mapping
- Configuration contains array of field definitions
- Each provider can have different field requirements

## Acceptance Criteria

- ✓ All interfaces exported and properly typed
- ✓ No use of `any` type
- ✓ Comprehensive JSDoc documentation
- ✓ Types match JSON specification structure
- ✓ Follows TypeScript strict mode requirements
- ✓ Unit tests for any utility functions

## Dependencies

- Requires task T-create-directory-structure-and to be completed
- Will be used by field configuration types (next task)

## Testing

- Write unit tests if any type guards are created
- Ensure types correctly represent the JSON structure
- Run `pnpm quality` for type checking

## File Location

`packages/shared/src/types/llm-providers/provider.types.ts`

### Log

**2025-08-05T01:13:33.601537Z** - Successfully implemented core provider metadata and configuration types for the dynamic LLM provider system. Created four separate TypeScript interfaces following the one-export-per-file rule: LlmProviderId (string type for provider identification), LlmProviderMetadata (provider info and models), LlmProviderConfiguration (field schema definition), and LlmProviderDefinition (complete provider definition extending metadata with configuration). All types match the JSON specification structure exactly, include comprehensive JSDoc documentation with examples, follow TypeScript strict mode requirements, and pass all quality checks. The temporary field type will be replaced with LlmFieldConfig[] when field types are implemented in the next task.

- filesChanged: ["packages/shared/src/types/llm-providers/LlmProviderId.ts", "packages/shared/src/types/llm-providers/LlmProviderMetadata.ts", "packages/shared/src/types/llm-providers/LlmProviderConfiguration.ts", "packages/shared/src/types/llm-providers/LlmProviderDefinition.ts", "packages/shared/src/types/llm-providers/provider.types.ts", "packages/shared/src/types/llm-providers/index.ts"]

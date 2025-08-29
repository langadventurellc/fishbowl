---
id: T-create-llm-provider-factory
title: Create LLM provider factory with switch-based instantiation
status: open
priority: medium
parent: F-llm-provider-system
prerequisites:
  - T-implement-openai-provider
  - T-implement-anthropic-provider
  - T-create-mockprovider-for
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T01:57:47.733Z
updated: 2025-08-29T01:57:47.733Z
---

# Create LLM Provider Factory with Switch-Based Instantiation

## Context

Part of the LLM Provider System Implementation feature (F-llm-provider-system). Provides simple factory functions for creating provider instances based on provider type.

## Implementation Requirements

Create `packages/shared/src/services/llm/LlmProviderFactory.ts`:

### Core Functionality:

**Factory Functions:**

1. `createProvider(provider: Provider): LlmProvider` - Production factory
2. `createMockProvider(): LlmProvider` - Testing/development factory

### Provider Mapping:

- `'openai'` → `new OpenAIProvider()`
- `'anthropic'` → `new AnthropicProvider()`
- Unknown provider → throw descriptive error

### Error Handling:

- Clear error message for unsupported providers
- Type-safe with Provider type from existing types

## Technical Approach

- Use simple switch statement (preferred over maps for simplicity)
- Import `Provider` type from existing `@fishbowl-ai/shared/types/llmConfig`
- Import all provider implementations
- Keep factory functions pure (no state, no configuration)
- Follow existing factory patterns in codebase

## Factory Implementation Pattern:

```typescript
export function createProvider(provider: Provider): LlmProvider {
  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
      return new AnthropicProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

## Acceptance Criteria

- [ ] LlmProviderFactory file created with factory functions
- [ ] createProvider function handles all Provider enum values
- [ ] createMockProvider function returns MockProvider instance
- [ ] Clear error for unknown provider types
- [ ] Uses switch statement (not object mapping)
- [ ] Proper imports from all provider implementations
- [ ] Type-safe with existing Provider type
- [ ] Unit tests cover:
  - [ ] Successful provider creation for all supported types
  - [ ] Error handling for unknown provider types
  - [ ] Mock provider creation
  - [ ] Type safety verification
- [ ] TypeScript compilation passes

## Dependencies

- T-implement-openai-provider (OpenAIProvider class)
- T-implement-anthropic-provider (AnthropicProvider class)
- T-create-mockprovider-for (MockProvider class)

## Out of Scope

- Provider configuration or initialization logic
- Complex factory patterns or dependency injection
- Provider registration mechanisms

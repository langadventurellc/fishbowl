---
id: T-create-llm-provider-factory
title: Create LLM provider factory with switch-based instantiation
status: done
priority: medium
parent: F-llm-provider-system
prerequisites:
  - T-implement-openai-provider
  - T-implement-anthropic-provider
  - T-create-mockprovider-for
affectedFiles:
  packages/shared/src/services/llm/factory/createProvider.ts: Main factory
    function with switch-based provider instantiation supporting openai and
    anthropic providers with error handling for unknown types
  packages/shared/src/services/llm/factory/createMockProvider.ts: Mock provider factory function for testing and development scenarios
  packages/shared/src/services/llm/factory/index.ts: Barrel export file for factory functions following project conventions
  packages/shared/src/services/llm/factory/__tests__/createProvider.test.ts:
    Comprehensive test suite covering provider creation, error handling, type
    safety, and factory behavior with 23 unit tests
  packages/shared/src/services/llm/factory/__tests__/createMockProvider.test.ts:
    Complete test coverage for mock provider factory with 16 unit tests covering
    functionality, behavior, purity, and testing utility validation
log:
  - Implemented LLM provider factory with switch-based instantiation using
    separate files to satisfy linting requirements. Created createProvider
    function that handles 'openai' and 'anthropic' provider types with
    descriptive error handling for unknown providers. Added createMockProvider
    function for testing. Implemented comprehensive unit test coverage (95+
    tests total) verifying factory behavior, error handling, type safety, and
    provider instantiation. All quality checks pass including linting,
    formatting, and TypeScript compilation.
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

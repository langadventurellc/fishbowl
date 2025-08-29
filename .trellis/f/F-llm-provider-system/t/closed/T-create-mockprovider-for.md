---
id: T-create-mockprovider-for
title: Create MockProvider for testing and development
status: done
priority: medium
parent: F-llm-provider-system
prerequisites:
  - T-create-core-llm-provider
  - T-create-llm-provider-error
affectedFiles:
  packages/shared/src/services/llm/providers/MockProvider.ts:
    Created MockProvider
    class implementing LlmProvider interface with deterministic rotating
    responses, realistic timing simulation, and proper error-free operation for
    testing purposes
log:
  - Implemented MockProvider for testing and development without external API
    calls. The provider implements the LlmProvider interface and provides
    deterministic, cycling responses from a predefined array. Features include
    realistic response timing simulation (100-600ms), call counter for
    deterministic behavior, and proper TypeScript compilation. All quality
    checks (lint, format, type-check) pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-29T01:56:51.328Z
updated: 2025-08-29T01:56:51.328Z
---

# Create MockProvider for Testing and Development

## Context

Part of the LLM Provider System Implementation feature (F-llm-provider-system). Provides deterministic responses for unit tests and development without external API calls.

## Implementation Requirements

Create `packages/shared/src/services/llm/providers/MockProvider.ts`:

### Core Functionality:

**MockProvider Class:**

- Implements `LlmProvider` interface
- Provides deterministic, rotating responses
- Simulates realistic response timing
- No external API calls
- Ignores sampling parameters

### Response Behavior:

- Predefined array of mock responses
- Cycle through responses using call counter
- Reset counter to prevent overflow

### Sample Responses:

- "This is a mock response from the test provider."
- "Another predefined response for testing purposes."
- "Mock provider: I understand your request and here's my response."
- "Testing response with some variety in content."

## Technical Approach

- Implement `LlmProvider` interface
- Use internal call counter for deterministic cycling
- Ignore all sampling parameters (temperature, topP, maxTokens)
- Never throw errors (reliable for testing)

## Acceptance Criteria

- [ ] MockProvider class implements LlmProvider interface
- [ ] Provides deterministic rotating responses
- [ ] Simulates realistic response timing (100-600ms)
- [ ] Ignores sampling parameters appropriately
- [ ] Never makes external network calls
- [ ] Call counter cycles through responses predictably
- [ ] TypeScript compilation passes

## Dependencies

- T-create-core-llm-provider (LlmProvider interface)
- T-create-llm-provider-error (error types for consistency)

## Out of Scope

- Complex error simulation scenarios
- Configuration options for response patterns
- Streaming simulation (future feature)

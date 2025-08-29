---
id: T-create-core-llm-provider
title: Create core LLM provider interfaces and types
status: done
priority: high
parent: F-llm-provider-system
prerequisites: []
affectedFiles:
  packages/shared/src/services/llm/interfaces/LlmProvider.ts: Core LLM provider interface with single sendMessage method
  packages/shared/src/services/llm/interfaces/LlmRequestParams.ts:
    Request parameters interface with system prompt, model, messages, config,
    and sampling
  packages/shared/src/services/llm/interfaces/FormattedMessage.ts: Provider-formatted message interface with user/assistant roles
  packages/shared/src/services/llm/interfaces/LlmResponse.ts: Simple provider response interface with content string
  packages/shared/src/services/llm/interfaces/index.ts: Barrel export file for all LLM interfaces
log:
  - Successfully created core LLM provider interfaces and types as foundational
    contracts for the LLM Provider System. All interfaces follow the exact
    specifications from the feature description, including proper TypeScript
    typing, import of existing LlmConfig type, and adherence to the
    one-export-per-file pattern. The interfaces provide clean contracts for LLM
    providers with support for different message roles, sampling parameters, and
    future streaming capabilities. All quality checks (linting, formatting,
    TypeScript compilation) pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-29T01:56:07.831Z
updated: 2025-08-29T01:56:07.831Z
---

# Create Core LLM Provider Interfaces and Types

## Context

Part of the LLM Provider System Implementation feature (F-llm-provider-system). This task creates the foundational contracts and type definitions that all other components will depend on.

## Implementation Requirements

Create the following interfaces and types in `packages/shared/src/services/llm/interfaces/`:

### Files to Create:

1. `LlmProvider.ts` - Core provider interface
2. `LlmRequestParams.ts` - Request parameters type
3. `FormattedMessage.ts` - Provider-formatted message type
4. `LlmResponse.ts` - Provider response type
5. `index.ts` - Barrel export file

### Interface Specifications:

**LlmProvider Interface:**

- Single method: `sendMessage(params: LlmRequestParams): Promise<LlmResponse>`
- Pure interface, no implementation details

**LlmRequestParams Interface:**

- `systemPrompt: string` (pre-constructed by caller)
- `model: string` (from agent settings)
- `messages: FormattedMessage[]` (formatted message array)
- `config: LlmConfig` (auth + baseUrl + useAuthHeader - import from existing types)
- `sampling: { temperature: number; topP: number; maxTokens: number }` (always provided)
- `stream?: false | undefined` (reserved for future streaming)

**FormattedMessage Interface:**

- `role: 'user' | 'assistant'` (note: different from internal Message.role)
- `content: string`

**LlmResponse Interface:**

- `content: string` (simple response, no metadata yet)

## Technical Approach

- Use one export per file pattern (as per project conventions)
- Import existing `LlmConfig` from `@fishbowl-ai/shared/types/llmConfig`
- Follow TypeScript interface patterns used elsewhere in the codebase
- No Zod schemas required (rely on TypeScript types)

## Acceptance Criteria

- [ ] All interface files created in correct directory structure
- [ ] Interfaces match exact specifications from feature description
- [ ] Proper imports of existing types (LlmConfig)
- [ ] Barrel export file includes all interfaces
- [ ] TypeScript compilation passes

## Dependencies

None - this is a foundational task

## Out of Scope

- Implementation classes (separate tasks)
- Zod schema validation
- Error handling classes

---
id: T-create-core-llm-provider
title: Create core LLM provider interfaces and types
status: open
priority: high
parent: F-llm-provider-system
prerequisites: []
affectedFiles: {}
log: []
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

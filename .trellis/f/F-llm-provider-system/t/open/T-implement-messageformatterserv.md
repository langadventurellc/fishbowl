---
id: T-implement-messageformatterserv
title: Implement MessageFormatterService for provider message formatting
status: open
priority: high
parent: F-llm-provider-system
prerequisites:
  - T-create-core-llm-provider
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T01:56:37.634Z
updated: 2025-08-29T01:56:37.634Z
---

# Implement MessageFormatterService for Provider Message Formatting

## Context

Part of the LLM Provider System Implementation feature (F-llm-provider-system). This service converts internal Message[] arrays to provider-ready FormattedMessage[] arrays with proper role mapping and name attribution.

## Implementation Requirements

Create `packages/shared/src/services/llm/services/MessageFormatterService.ts`:

### Core Functionality:

**Method: `formatMessages(messages: Message[], targetAgentId: string, agentNameByConversationAgentId: Record<string, string>): FormattedMessage[]`**

### Formatting Rules:

1. **Filtering**: Include only `included === true` messages
2. **Exclusion**: Exclude all `role === 'system'` messages
3. **Order**: Preserve chronological order
4. **Role Mapping**:
   - User messages (`role === 'user'`) → `{ role: 'user', content }`
   - Target agent messages (`conversation_agent_id === targetAgentId`) → `{ role: 'assistant', content }`
   - Other agent messages → `{ role: 'user', content: '${displayName}: ${content}' }`
5. **Name Resolution**: Use `agentNameByConversationAgentId` map, fallback to "Unknown Agent"

### Key Design Points:

- Pure function (no I/O, no side effects)
- No provider-specific alternation enforcement (handled in provider implementations)
- Caller provides name resolution to avoid coupling to repositories
- Input validation: never called with zero messages (precondition guaranteed by caller)

## Technical Approach

- Import `Message` from `@fishbowl-ai/shared/types/messages`
- Import `FormattedMessage` from `../interfaces`
- Follow existing service patterns in `packages/shared/src/services/`
- Class-based service with static-like method
- Focus on readability and testability

## Acceptance Criteria

- [ ] MessageFormatterService class created with formatMessages method
- [ ] Correctly filters included messages only
- [ ] Excludes all system role messages
- [ ] Preserves chronological message order
- [ ] Maps user messages to 'user' role
- [ ] Maps target agent messages to 'assistant' role
- [ ] Maps other agent messages to 'user' role with name prefix
- [ ] Handles missing agent names gracefully (fallback to "Unknown Agent")
- [ ] Unit tests cover all formatting rules:
  - [ ] Inclusion filtering
  - [ ] System message exclusion
  - [ ] Role mapping scenarios
  - [ ] Name prefixing for non-target agents
  - [ ] Order preservation
  - [ ] Missing name handling
- [ ] TypeScript compilation passes

## Dependencies

- T-create-core-llm-provider (interfaces)

## Out of Scope

- Provider-specific message validation (handled in providers)
- System prompt generation (separate concern)
- Message repository integration (caller responsibility)

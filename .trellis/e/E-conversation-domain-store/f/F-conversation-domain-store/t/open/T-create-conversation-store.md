---
id: T-create-conversation-store
title: Create conversation store type definitions and interfaces
status: open
priority: high
parent: F-conversation-domain-store
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T04:37:36.780Z
updated: 2025-09-01T04:37:36.780Z
---

## Context

Create the TypeScript type definitions and interfaces for the conversation domain store, following existing store patterns in the codebase like `useChatStore` and `ErrorState`.

## Implementation Requirements

**File to create**: `packages/ui-shared/src/stores/conversation/types.ts`

**Type definitions to implement**:

1. **ConversationStoreState interface** - Main store state matching the specification:
   - `activeConversationId: string | null`
   - `conversations: _Conversation[]`
   - `activeMessages: _Message[]`
   - `activeConversationAgents: _ConversationAgent[]`
   - `activeRequestToken: string | null`
   - `loading` object with conversations, messages, agents, sending booleans
   - `error` object with optional ErrorState for each operation
   - `maximumMessages: number`

2. **ConversationStoreActions interface** - All store actions:
   - `initialize(service: ConversationService): void`
   - `loadConversations(): Promise<void>`
   - `selectConversation(id: string | null): Promise<void>`
   - `createConversationAndSelect(title?: string): Promise<void>`
   - `refreshActiveConversation(): Promise<void>`
   - `sendUserMessage(content?: string): Promise<void>`
   - `addAgent(conversationId: string, agentId: string): Promise<void>`
   - `removeAgent(conversationId: string, agentId: string): Promise<void>`
   - `toggleAgentEnabled(conversationAgentId: string): Promise<void>`

3. **ConversationStore type** - Combined interface extending both State and Actions

**Technical Approach**:

- Import types from `@fishbowl-ai/shared` following codebase patterns: `_Conversation`, `_Message`, `_ConversationAgent`
- Import `ErrorState` from `../ErrorState`
- Import `ConversationService` from `@fishbowl-ai/shared`
- Follow existing type definition patterns from other store files
- Use clear TypeScript interfaces with proper JSDoc comments

## Acceptance Criteria

- [ ] All type definitions compile without TypeScript errors
- [ ] Types match the store state shape specified in feature requirements
- [ ] All required imports resolve correctly
- [ ] Action signatures support the required store operations
- [ ] Types are properly exported for use by store implementation
- [ ] JSDoc comments explain the purpose of complex interfaces
- [ ] Error state types use existing ErrorState pattern

## Testing Requirements

- [ ] Create basic unit test verifying type compilation
- [ ] Test import resolution for all external types
- [ ] Validate interface completeness matches specification

## Dependencies

- Requires existing `ErrorState` interface
- Requires `ConversationService` interface from shared package
- Requires conversation/message/agent types from shared package

## Out of Scope

- Store implementation logic (separate task)
- Selectors or utility functions
- Component integration

---
id: T-create-chatmodehandler
title: Create ChatModeHandler interface and ChatModeIntent type
status: open
priority: high
parent: F-chat-mode-strategy-pattern
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T20:23:21.706Z
updated: 2025-09-03T20:23:21.706Z
---

# Create ChatModeHandler Interface and ChatModeIntent Type

## Context

Implement the foundational interfaces for the chat mode strategy pattern system. This establishes the contract that all chat mode implementations must follow, using an intent-based API for safe state updates.

## Technical Approach

Create two separate files following repository quality guidelines (one export per file):

- `packages/ui-shared/src/chat-modes/ChatModeHandler.ts` - Interface only
- `packages/ui-shared/src/chat-modes/ChatModeIntent.ts` - Type definition only

## Detailed Implementation Requirements

### ChatModeHandler Interface (packages/ui-shared/src/chat-modes/ChatModeHandler.ts)

````typescript
import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { ChatModeIntent } from "./ChatModeIntent";

/**
 * Strategy interface for handling chat mode behavior
 *
 * Chat mode handlers manage how agents are enabled/disabled in different modes.
 * All methods return intent objects to enable safe, predictable state updates.
 *
 * @example
 * ```typescript
 * const handler = createChatModeHandler("round-robin");
 * const intent = handler.handleAgentAdded(agents, newAgentId);
 * // Apply intent: enable intent.toEnable, disable intent.toDisable
 * ```
 */
export interface ChatModeHandler {
  /** The name of this chat mode (e.g., "manual", "round-robin") */
  readonly name: string;

  /**
   * Handle addition of a new agent to the conversation
   *
   * @param agents - Current conversation agents array
   * @param newAgentId - ID of the newly added agent
   * @returns Intent specifying which agents to enable/disable
   */
  handleAgentAdded(
    agents: ConversationAgent[],
    newAgentId: string,
  ): ChatModeIntent;

  /**
   * Handle manual toggle of an agent's enabled state
   *
   * @param agents - Current conversation agents array
   * @param toggledAgentId - ID of the agent being toggled
   * @returns Intent specifying which agents to enable/disable
   */
  handleAgentToggle(
    agents: ConversationAgent[],
    toggledAgentId: string,
  ): ChatModeIntent;

  /**
   * Handle progression after an agent completes a response
   *
   * @param agents - Current conversation agents array
   * @returns Intent specifying which agents to enable/disable for next turn
   */
  handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent;
}
````

### ChatModeIntent Type (packages/ui-shared/src/chat-modes/ChatModeIntent.ts)

````typescript
/**
 * Intent object specifying agent state changes
 *
 * Used by chat mode handlers to specify which agents should be enabled
 * or disabled without directly mutating state. This enables safe, predictable
 * updates and easier testing.
 *
 * @example
 * ```typescript
 * const intent: ChatModeIntent = {
 *   toEnable: ["agent-1"],
 *   toDisable: ["agent-2", "agent-3"]
 * };
 * ```
 */
export interface ChatModeIntent {
  /** Array of ConversationAgent IDs to enable */
  toEnable: string[];
  /** Array of ConversationAgent IDs to disable */
  toDisable: string[];
}
````

## Acceptance Criteria

- [ ] **File Structure**: Two separate files created with single exports each
- [ ] **Interface Definition**: ChatModeHandler interface with all three required methods
- [ ] **Type Definition**: ChatModeIntent interface with toEnable and toDisable arrays
- [ ] **Documentation**: Comprehensive JSDoc with examples for all interfaces
- [ ] **Type Safety**: Full TypeScript compliance with proper imports from @fishbowl-ai/shared
- [ ] **Method Signatures**: All methods accept correct parameters and return ChatModeIntent
- [ ] **Quality Compliance**: Files pass repository linting for single export rule

## Dependencies

- Requires ConversationAgent type from @fishbowl-ai/shared
- Must run `pnpm build:libs` after implementation to make types available

## Testing Requirements

Unit tests will be implemented in subsequent tasks along with concrete implementations.

## Security Considerations

- Interfaces define immutable contracts (readonly name property)
- Intent-based API prevents direct state mutation
- Input validation deferred to concrete implementations

## Performance Requirements

- Interface definitions have zero runtime impact
- Type-only imports for optimal tree-shaking

## Out of Scope

- Concrete implementations (handled in separate tasks)
- Factory functions (handled in separate task)
- Unit tests (implemented with concrete classes)

---
id: F-chat-mode-strategy-pattern
title: Chat Mode Strategy Pattern
status: open
priority: medium
parent: E-chat-modes-system
prerequisites:
  - F-database-schema-and-core-types
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T18:34:12.709Z
updated: 2025-09-03T18:34:12.709Z
---

# Chat Mode Strategy Pattern Feature

## Overview

Implement the core chat mode strategy pattern that provides extensible behavior for different chat modes. This feature creates the business logic foundation for Manual and Round Robin modes using a clean, testable architecture with proper file separation.

## Functionality

### Strategy Pattern Architecture

- Define `ChatModeHandler` interface with intent-based API
- Implement `ManualChatMode` for current behavior (no-op operations)
- Implement `RoundRobinChatMode` for single-agent rotation logic
- Create mode registry and factory functions for extensibility
- Ensure proper file separation per repository quality guidelines

### Intent-Based Updates

- Return `ChatModeIntent` objects with `toEnable` and `toDisable` arrays
- Prevent direct state mutation for safer updates
- Enable clear separation between mode logic and state management

## Acceptance Criteria

### File Structure and Separation

- [ ] **Separate Interface File**: `ChatModeHandler.ts` contains only the handler interface
- [ ] **Separate Intent File**: `ChatModeIntent.ts` contains only the intent type definition
- [ ] **One Class Per File**: `ManualChatMode.ts` and `RoundRobinChatMode.ts` each contain single class
- [ ] **Barrel Export**: `index.ts` provides clean exports and factory functions
- [ ] **Linting Compliance**: All files pass repository quality checks for multiple exports

### Interface Definition

- [ ] **ChatModeHandler Interface**: Defines three core methods (handleAgentAdded, handleAgentToggle, handleConversationProgression)
- [ ] **ChatModeIntent Type**: Contains `toEnable: string[]` and `toDisable: string[]` fields
- [ ] **Method Signatures**: All handler methods accept agents array and relevant ID, return ChatModeIntent
- [ ] **Documentation**: Comprehensive JSDoc with examples for all public interfaces
- [ ] **Type Safety**: Full TypeScript compliance with strict mode enabled

### Manual Mode Implementation

- [ ] **No-Op Behavior**: All methods return empty intent objects (`{toEnable: [], toDisable: []}`)
- [ ] **Backward Compatibility**: Preserves exact current behavior for existing workflows
- [ ] **Error Handling**: Gracefully handles edge cases (empty agent arrays, invalid IDs)
- [ ] **Performance**: Operations complete in <1ms for typical agent counts
- [ ] **Naming Consistency**: Uses 'round-robin' literals consistently

### Round Robin Mode Implementation

- [ ] **Agent Addition Logic**:
  - First agent: returns `{toEnable: [newAgentId], toDisable: []}`
  - Subsequent agents: returns `{toEnable: [], toDisable: []}` (preserves current enabled agent)
- [ ] **Agent Toggle Logic**:
  - Disable current enabled: returns `{toEnable: [], toDisable: [toggledAgentId]}`
  - Enable different agent: returns `{toEnable: [toggledAgentId], toDisable: [currentEnabledId]}`
- [ ] **Conversation Progression Logic**: Returns next agent in rotation sequence
- [ ] **Rotation Order**: Uses `display_order` then `added_at` timestamp for deterministic ordering
- [ ] **Edge Cases**: Single agent no-op rotation, empty agent arrays, all agents disabled

### Factory and Registry

- [ ] **Mode Factory**: `createChatModeHandler(mode: string)` returns appropriate handler instance
- [ ] **Mode Registry**: Maps mode strings to handler constructors
- [ ] **Error Handling**: Throws descriptive errors for unknown modes
- [ ] **Extensibility**: Easy addition of new modes without modifying existing code

### Testing Requirements

- [ ] **Unit Tests**: Comprehensive coverage for all handler methods and edge cases
- [ ] **Intent Validation**: Verify returned intents contain only valid ConversationAgent IDs
- [ ] **Behavior Testing**: Test sequences (add agents, toggle, progress conversation)
- [ ] **Performance Testing**: Verify operations complete within time requirements
- [ ] **Error Testing**: Invalid inputs handled gracefully

## Implementation Guidance

### File Structure

```
packages/ui-shared/src/chat-modes/
├── ChatModeHandler.ts             # Interface only
├── ChatModeIntent.ts              # Intent type only
├── ManualChatMode.ts              # Manual mode class only
├── RoundRobinChatMode.ts          # Round robin class only
├── index.ts                       # Factory and exports
└── __tests__/
    ├── ManualChatMode.test.ts
    ├── RoundRobinChatMode.test.ts
    └── factory.test.ts
```

### Interface Implementation

```typescript
// ChatModeHandler.ts
export interface ChatModeHandler {
  readonly name: string;
  handleAgentAdded(
    agents: ConversationAgent[],
    newAgentId: string,
  ): ChatModeIntent;
  handleAgentToggle(
    agents: ConversationAgent[],
    toggledAgentId: string,
  ): ChatModeIntent;
  handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent;
}

// ChatModeIntent.ts
export interface ChatModeIntent {
  toEnable: string[]; // ConversationAgent IDs to enable
  toDisable: string[]; // ConversationAgent IDs to disable
}
```

### Round Robin Logic Examples

```typescript
// RoundRobinChatMode.ts - Agent addition
handleAgentAdded(agents: ConversationAgent[], newAgentId: string): ChatModeIntent {
  const enabledAgents = agents.filter(a => a.enabled);
  return enabledAgents.length === 0
    ? { toEnable: [newAgentId], toDisable: [] }
    : { toEnable: [], toDisable: [] };
}

// Conversation progression - rotate to next agent
handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent {
  const sortedAgents = agents.sort((a, b) =>
    a.display_order - b.display_order ||
    new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
  );

  const currentIndex = sortedAgents.findIndex(a => a.enabled);
  if (currentIndex === -1 || sortedAgents.length <= 1) {
    return { toEnable: [], toDisable: [] }; // No rotation needed
  }

  const nextIndex = (currentIndex + 1) % sortedAgents.length;
  return {
    toEnable: [sortedAgents[nextIndex].id],
    toDisable: [sortedAgents[currentIndex].id]
  };
}
```

### Factory Implementation

```typescript
// index.ts
import type { ChatModeHandler } from "./ChatModeHandler";
import { ManualChatMode } from "./ManualChatMode";
import { RoundRobinChatMode } from "./RoundRobinChatMode";

export function createChatModeHandler(
  mode: "manual" | "round-robin",
): ChatModeHandler {
  switch (mode) {
    case "manual":
      return new ManualChatMode();
    case "round-robin":
      return new RoundRobinChatMode();
    default:
      throw new Error(`Unknown chat mode: ${mode}`);
  }
}

export { ChatModeHandler } from "./ChatModeHandler";
export { ChatModeIntent } from "./ChatModeIntent";
export { ManualChatMode } from "./ManualChatMode";
export { RoundRobinChatMode } from "./RoundRobinChatMode";
```

### Files to Create

- `packages/ui-shared/src/chat-modes/ChatModeHandler.ts` (new)
- `packages/ui-shared/src/chat-modes/ChatModeIntent.ts` (new)
- `packages/ui-shared/src/chat-modes/ManualChatMode.ts` (new)
- `packages/ui-shared/src/chat-modes/RoundRobinChatMode.ts` (new)
- `packages/ui-shared/src/chat-modes/index.ts` (new)

### Security Considerations

- **Input Validation**: Validate agent arrays and IDs before processing
- **Immutability**: Never mutate input arrays, return new intent objects
- **Error Boundaries**: Prevent exceptions from crashing the application

### Performance Requirements

- **Response Time**: All operations complete within 10ms for up to 50 agents
- **Memory Usage**: Minimal memory allocation, no memory leaks
- **CPU Usage**: Efficient sorting and filtering algorithms

## Dependencies

- `F-database-schema-and-core-types` (requires ConversationAgent type)

## Success Metrics

- [ ] All unit tests pass with >95% code coverage
- [ ] Manual mode preserves existing behavior exactly
- [ ] Round Robin mode implements correct rotation logic using 'round-robin'
- [ ] Factory supports dynamic mode creation
- [ ] Performance benchmarks met for typical usage patterns
- [ ] Repository quality checks pass for all files

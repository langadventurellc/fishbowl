---
id: F-chat-mode-strategy-pattern
title: Chat Mode Strategy Pattern
status: done
priority: medium
parent: E-chat-modes-system
prerequisites:
  - F-database-schema-and-core-types
affectedFiles:
  packages/ui-shared/src/types/chat-modes/ChatModeIntent.ts:
    Created comprehensive
    ChatModeIntent interface with toEnable and toDisable string arrays,
    extensive JSDoc documentation with examples for different scenarios (first
    agent, round robin, disable all, no-op)
  packages/ui-shared/src/types/chat-modes/ChatModeHandler.ts: Created
    ChatModeHandler interface with readonly name property and three core methods
    (handleAgentAdded, handleAgentToggle, handleConversationProgression),
    comprehensive JSDoc with detailed examples for manual and round-robin modes,
    proper imports from @fishbowl-ai/shared
  packages/ui-shared/src/types/chat-modes/index.ts:
    Created barrel file exporting
    ChatModeHandler and ChatModeIntent types with JSDoc module description
  packages/ui-shared/src/types/index.ts: Added export for chat-modes module to
    main types barrel file, maintaining alphabetical order
  packages/ui-shared/src/chat-modes/ManualChatMode.ts: Created ManualChatMode
    class implementing ChatModeHandler interface with no-op behavior for all
    three methods (handleAgentAdded, handleAgentToggle,
    handleConversationProgression), comprehensive JSDoc documentation with
    examples, and proper TypeScript typing with unused parameter prefixes
  packages/ui-shared/src/chat-modes/__tests__/ManualChatMode.test.ts:
    Created comprehensive unit test suite with 32 tests covering constructor,
    all handler methods, performance requirements (<1ms for 50 agents),
    immutability, error handling, edge cases, and consistency validation.
    Includes helper functions for creating mock ConversationAgent objects
  packages/ui-shared/src/chat-modes/index.ts: Created barrel export file for
    chat-modes directory with module documentation and ManualChatMode export;
    Added barrel export for RoundRobinChatMode class to enable import from
    @fishbowl-ai/ui-shared package; Updated with factory function, registry
    pattern, utility functions, and comprehensive barrel exports. Added
    createChatModeHandler() with registry-based mode creation,
    getSupportedChatModes() and isSupportedChatMode() utility functions,
    ChatModeName type, and re-exports for all chat mode types and classes with
    comprehensive JSDoc documentation.
  packages/ui-shared/src/index.ts: Added export for chat-modes module to main
    ui-shared package exports, maintaining alphabetical order
  packages/ui-shared/src/chat-modes/RoundRobinChatMode.ts: "Created
    RoundRobinChatMode class implementing ChatModeHandler interface with
    single-agent-enabled rotation logic. Features: deterministic agent ordering
    by display_order then added_at, wrap-around rotation, manual override
    support, <10ms performance for 50 agents, and comprehensive JSDoc
    documentation with examples."
  packages/ui-shared/src/chat-modes/__tests__/RoundRobinChatMode.test.ts:
    "Created comprehensive unit test suite with 38 tests covering all
    functionality: constructor, handleAgentAdded, handleAgentToggle,
    handleConversationProgression, edge cases, performance requirements,
    immutability verification, consistency checks, and integration scenarios.
    Includes helper functions for creating mock ConversationAgent objects."
  packages/ui-shared/src/chat-modes/__tests__/factory.test.ts:
    Created comprehensive unit test suite with 37 test cases covering factory
    function creation, error handling for invalid inputs, utility function
    validation, type safety verification, integration testing with existing
    modes, performance testing, and barrel export validation. Tests include edge
    cases, TypeScript type guard functionality, and extensibility pattern
    documentation.
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-chat-modes-directory
  - T-create-chatmodehandler
  - T-create-factory-function-and
  - T-implement-manualchatmode
  - T-implement-roundrobinchatmode
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

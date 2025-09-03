---
id: T-implement-manualchatmode
title: Implement ManualChatMode class with unit tests
status: open
priority: medium
parent: F-chat-mode-strategy-pattern
prerequisites:
  - T-create-chatmodehandler
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T20:23:57.308Z
updated: 2025-09-03T20:23:57.308Z
---

# Implement ManualChatMode Class with Unit Tests

## Context

Implement the ManualChatMode class that preserves the current application behavior where users have complete control over agent enabled/disabled state. This mode implements no-op behavior for all chat mode operations, maintaining backward compatibility.

## Technical Approach

Create implementation file and comprehensive unit tests:

- `packages/ui-shared/src/chat-modes/ManualChatMode.ts` - Single class export
- `packages/ui-shared/src/chat-modes/__tests__/ManualChatMode.test.ts` - Complete test coverage

## Detailed Implementation Requirements

### ManualChatMode Class (packages/ui-shared/src/chat-modes/ManualChatMode.ts)

````typescript
import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { ChatModeHandler } from "./ChatModeHandler";
import type { ChatModeIntent } from "./ChatModeIntent";

/**
 * Manual chat mode implementation
 *
 * Provides complete user control over agent enabled/disabled state.
 * All operations return empty intents, preserving existing application behavior.
 *
 * @example
 * ```typescript
 * const mode = new ManualChatMode();
 * const intent = mode.handleAgentAdded(agents, "new-agent-id");
 * // Returns: { toEnable: [], toDisable: [] }
 * ```
 */
export class ManualChatMode implements ChatModeHandler {
  readonly name = "manual";

  /**
   * Handle agent addition - no automatic behavior in manual mode
   *
   * @param agents - Current conversation agents (unused in manual mode)
   * @param newAgentId - ID of newly added agent (unused in manual mode)
   * @returns Empty intent - no automatic changes
   */
  handleAgentAdded(
    agents: ConversationAgent[],
    newAgentId: string,
  ): ChatModeIntent {
    return { toEnable: [], toDisable: [] };
  }

  /**
   * Handle agent toggle - no automatic behavior in manual mode
   *
   * @param agents - Current conversation agents (unused in manual mode)
   * @param toggledAgentId - ID of toggled agent (unused in manual mode)
   * @returns Empty intent - no automatic changes
   */
  handleAgentToggle(
    agents: ConversationAgent[],
    toggledAgentId: string,
  ): ChatModeIntent {
    return { toEnable: [], toDisable: [] };
  }

  /**
   * Handle conversation progression - no automatic behavior in manual mode
   *
   * @param agents - Current conversation agents (unused in manual mode)
   * @returns Empty intent - no automatic changes
   */
  handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent {
    return { toEnable: [], toDisable: [] };
  }
}
````

### Unit Tests (packages/ui-shared/src/chat-modes/**tests**/ManualChatMode.test.ts)

```typescript
import { ManualChatMode } from "../ManualChatMode";
import type { ConversationAgent } from "@fishbowl-ai/shared";

describe("ManualChatMode", () => {
  let mode: ManualChatMode;

  beforeEach(() => {
    mode = new ManualChatMode();
  });

  describe("constructor", () => {
    it("should set name to 'manual'", () => {
      expect(mode.name).toBe("manual");
    });
  });

  describe("handleAgentAdded", () => {
    it("should return empty intent for first agent", () => {
      const agents: ConversationAgent[] = [];
      const intent = mode.handleAgentAdded(agents, "agent-1");

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should return empty intent for additional agents", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleAgentAdded(agents, "agent-2");

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle empty agent arrays", () => {
      const intent = mode.handleAgentAdded([], "new-agent");
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle multiple enabled agents", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", true, 1),
      ];
      const intent = mode.handleAgentAdded(agents, "agent-3");

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("handleAgentToggle", () => {
    it("should return empty intent when toggling enabled agent", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleAgentToggle(agents, "agent-1");

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should return empty intent when toggling disabled agent", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
      ];
      const intent = mode.handleAgentToggle(agents, "agent-1");

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle non-existent agent IDs gracefully", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleAgentToggle(agents, "non-existent");

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle empty agent arrays", () => {
      const intent = mode.handleAgentToggle([], "any-agent");
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("handleConversationProgression", () => {
    it("should return empty intent with single agent", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleConversationProgression(agents);

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should return empty intent with multiple agents", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
        createMockAgent("agent-3", false, 2),
      ];
      const intent = mode.handleConversationProgression(agents);

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should return empty intent with no enabled agents", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
        createMockAgent("agent-2", false, 1),
      ];
      const intent = mode.handleConversationProgression(agents);

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle empty agent arrays", () => {
      const intent = mode.handleConversationProgression([]);
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("performance", () => {
    it("should complete operations quickly", () => {
      const largeAgentArray = Array.from({ length: 50 }, (_, i) =>
        createMockAgent(`agent-${i}`, i % 2 === 0, i),
      );

      const start = performance.now();
      mode.handleAgentAdded(largeAgentArray, "new-agent");
      mode.handleAgentToggle(largeAgentArray, "agent-25");
      mode.handleConversationProgression(largeAgentArray);
      const end = performance.now();

      expect(end - start).toBeLessThan(1); // < 1ms requirement
    });
  });

  describe("immutability", () => {
    it("should not modify input agent arrays", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const originalAgents = JSON.parse(JSON.stringify(agents));

      mode.handleAgentAdded(agents, "new-agent");
      mode.handleAgentToggle(agents, "agent-1");
      mode.handleConversationProgression(agents);

      expect(agents).toEqual(originalAgents);
    });
  });
});

// Helper function for creating mock agents
function createMockAgent(
  id: string,
  enabled: boolean,
  displayOrder: number,
): ConversationAgent {
  return {
    id,
    enabled,
    display_order: displayOrder,
    added_at: new Date().toISOString(),
    // Add other required ConversationAgent fields as needed
  } as ConversationAgent;
}
```

## Acceptance Criteria

- [ ] **Single Class Export**: ManualChatMode.ts contains only the ManualChatMode class
- [ ] **Interface Implementation**: Correctly implements ChatModeHandler interface
- [ ] **No-Op Behavior**: All methods return `{toEnable: [], toDisable: []}`
- [ ] **Name Property**: readonly name property equals "manual"
- [ ] **Error Handling**: Gracefully handles edge cases (empty arrays, invalid IDs)
- [ ] **Performance**: Operations complete in <1ms for 50 agents
- [ ] **Immutability**: Never modifies input agent arrays
- [ ] **Unit Tests**: >95% code coverage with comprehensive test cases
- [ ] **Documentation**: JSDoc with examples for class and methods
- [ ] **Type Safety**: Full TypeScript compliance with proper imports

## Dependencies

- Requires T-create-chatmodehandler (ChatModeHandler and ChatModeIntent interfaces)
- Requires ConversationAgent type from @fishbowl-ai/shared
- Must run `pnpm build:libs` after implementation

## Testing Requirements

- Unit tests cover all three handler methods
- Edge cases: empty arrays, invalid IDs, mixed agent states
- Performance tests verify <1ms completion time
- Immutability tests ensure input arrays unchanged
- Comprehensive behavior validation

## Security Considerations

- Input validation for edge cases (null/undefined handling)
- No direct agent array mutation
- Safe handling of invalid agent IDs

## Performance Requirements

- All operations complete within 1ms for typical usage (up to 50 agents)
- Minimal memory allocation
- No memory leaks or object retention

## Out of Scope

- Integration with state management (handled in separate feature)
- Factory function (handled in separate task)
- UI components (separate epic)

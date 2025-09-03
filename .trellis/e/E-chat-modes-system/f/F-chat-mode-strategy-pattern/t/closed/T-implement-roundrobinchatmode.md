---
id: T-implement-roundrobinchatmode
title: Implement RoundRobinChatMode class with unit tests
status: done
priority: medium
parent: F-chat-mode-strategy-pattern
prerequisites:
  - T-create-chatmodehandler
affectedFiles:
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
  packages/ui-shared/src/chat-modes/index.ts: Added barrel export for
    RoundRobinChatMode class to enable import from @fishbowl-ai/ui-shared
    package
log:
  - Successfully implemented RoundRobinChatMode class with comprehensive unit
    tests. The implementation manages single-agent-enabled rotation logic where
    only one agent is enabled at a time, with automatic progression through
    agents in deterministic order by display_order then added_at timestamp. All
    38 unit tests pass, covering functionality, edge cases, performance (<10ms
    for 50 agents), immutability, and consistency requirements. Quality checks
    pass with proper TypeScript compliance.
schema: v1.0
childrenIds: []
created: 2025-09-03T20:24:53.857Z
updated: 2025-09-03T20:24:53.857Z
---

# Implement RoundRobinChatMode Class with Unit Tests

## Context

Implement the RoundRobinChatMode class that manages single-agent-enabled rotation logic. This mode ensures only one agent is enabled at a time and handles automatic progression through agents in deterministic order.

## Technical Approach

Create implementation file and comprehensive unit tests:

- `packages/ui-shared/src/chat-modes/RoundRobinChatMode.ts` - Single class export
- `packages/ui-shared/src/chat-modes/__tests__/RoundRobinChatMode.test.ts` - Complete test coverage

## Detailed Implementation Requirements

### RoundRobinChatMode Class (packages/ui-shared/src/chat-modes/RoundRobinChatMode.ts)

````typescript
import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { ChatModeHandler } from "./ChatModeHandler";
import type { ChatModeIntent } from "./ChatModeIntent";

/**
 * Round Robin chat mode implementation
 *
 * Manages single-agent-enabled rotation logic where only one agent
 * is enabled at a time, with automatic progression after responses.
 *
 * Rotation order: display_order (ascending) then added_at timestamp (ascending)
 *
 * @example
 * ```typescript
 * const mode = new RoundRobinChatMode();
 * const intent = mode.handleAgentAdded([], "first-agent");
 * // Returns: { toEnable: ["first-agent"], toDisable: [] }
 * ```
 */
export class RoundRobinChatMode implements ChatModeHandler {
  readonly name = "round-robin";

  /**
   * Handle agent addition - enable first agent, preserve current for others
   *
   * @param agents - Current conversation agents
   * @param newAgentId - ID of newly added agent
   * @returns Intent to enable first agent or maintain current state
   */
  handleAgentAdded(
    agents: ConversationAgent[],
    newAgentId: string,
  ): ChatModeIntent {
    const enabledAgents = agents.filter((agent) => agent.enabled);

    // First agent: enable it
    if (enabledAgents.length === 0) {
      return { toEnable: [newAgentId], toDisable: [] };
    }

    // Subsequent agents: preserve current enabled agent
    return { toEnable: [], toDisable: [] };
  }

  /**
   * Handle agent toggle - maintain single-enabled invariant
   *
   * @param agents - Current conversation agents
   * @param toggledAgentId - ID of agent being toggled
   * @returns Intent to maintain single-enabled state
   */
  handleAgentToggle(
    agents: ConversationAgent[],
    toggledAgentId: string,
  ): ChatModeIntent {
    const toggledAgent = agents.find((agent) => agent.id === toggledAgentId);
    if (!toggledAgent) {
      // Invalid agent ID - no changes
      return { toEnable: [], toDisable: [] };
    }

    const currentEnabledAgent = agents.find((agent) => agent.enabled);

    if (toggledAgent.enabled) {
      // Disabling current enabled agent
      return { toEnable: [], toDisable: [toggledAgentId] };
    } else {
      // Enabling different agent - disable current, enable new
      if (currentEnabledAgent) {
        return {
          toEnable: [toggledAgentId],
          toDisable: [currentEnabledAgent.id],
        };
      } else {
        return { toEnable: [toggledAgentId], toDisable: [] };
      }
    }
  }

  /**
   * Handle conversation progression - rotate to next agent
   *
   * @param agents - Current conversation agents
   * @returns Intent to rotate to next agent in sequence
   */
  handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent {
    if (agents.length <= 1) {
      // Single agent or empty - no rotation needed
      return { toEnable: [], toDisable: [] };
    }

    // Sort agents by display_order then added_at for deterministic order
    const sortedAgents = agents.slice().sort((a, b) => {
      const orderDiff = a.display_order - b.display_order;
      if (orderDiff !== 0) return orderDiff;

      return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
    });

    const currentEnabledIndex = sortedAgents.findIndex(
      (agent) => agent.enabled,
    );
    if (currentEnabledIndex === -1) {
      // No enabled agents - no rotation
      return { toEnable: [], toDisable: [] };
    }

    // Calculate next agent index (wrap around)
    const nextIndex = (currentEnabledIndex + 1) % sortedAgents.length;
    const currentAgent = sortedAgents[currentEnabledIndex];
    const nextAgent = sortedAgents[nextIndex];

    return {
      toEnable: [nextAgent.id],
      toDisable: [currentAgent.id],
    };
  }
}
````

### Unit Tests (packages/ui-shared/src/chat-modes/**tests**/RoundRobinChatMode.test.ts)

```typescript
import { RoundRobinChatMode } from "../RoundRobinChatMode";
import type { ConversationAgent } from "@fishbowl-ai/shared";

describe("RoundRobinChatMode", () => {
  let mode: RoundRobinChatMode;

  beforeEach(() => {
    mode = new RoundRobinChatMode();
  });

  describe("constructor", () => {
    it("should set name to 'round-robin'", () => {
      expect(mode.name).toBe("round-robin");
    });
  });

  describe("handleAgentAdded", () => {
    it("should enable first agent when none exist", () => {
      const intent = mode.handleAgentAdded([], "agent-1");
      expect(intent).toEqual({ toEnable: ["agent-1"], toDisable: [] });
    });

    it("should enable first agent when all current agents disabled", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("existing-1", false, 0),
      ];
      const intent = mode.handleAgentAdded(agents, "agent-2");
      expect(intent).toEqual({ toEnable: ["agent-2"], toDisable: [] });
    });

    it("should preserve current enabled agent for subsequent additions", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleAgentAdded(agents, "agent-2");
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should preserve current enabled agent with multiple existing agents", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
        createMockAgent("agent-2", true, 1),
        createMockAgent("agent-3", false, 2),
      ];
      const intent = mode.handleAgentAdded(agents, "agent-4");
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("handleAgentToggle", () => {
    it("should disable currently enabled agent", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleAgentToggle(agents, "agent-1");
      expect(intent).toEqual({ toEnable: [], toDisable: ["agent-1"] });
    });

    it("should enable different agent and disable current", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
      ];
      const intent = mode.handleAgentToggle(agents, "agent-2");
      expect(intent).toEqual({
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      });
    });

    it("should enable agent when none currently enabled", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
        createMockAgent("agent-2", false, 1),
      ];
      const intent = mode.handleAgentToggle(agents, "agent-2");
      expect(intent).toEqual({ toEnable: ["agent-2"], toDisable: [] });
    });

    it("should return empty intent for non-existent agent", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleAgentToggle(agents, "non-existent");
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle empty agent arrays gracefully", () => {
      const intent = mode.handleAgentToggle([], "any-agent");
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("handleConversationProgression", () => {
    it("should return empty intent for single agent", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should return empty intent for empty agent array", () => {
      const intent = mode.handleConversationProgression([]);
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should rotate to next agent by display order", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
        createMockAgent("agent-3", false, 2),
      ];
      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      });
    });

    it("should wrap around to first agent", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
        createMockAgent("agent-2", false, 1),
        createMockAgent("agent-3", true, 2),
      ];
      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({
        toEnable: ["agent-1"],
        toDisable: ["agent-3"],
      });
    });

    it("should sort by display_order then added_at", () => {
      const baseTime = new Date("2024-01-01T00:00:00Z");
      const agents: ConversationAgent[] = [
        createMockAgent(
          "agent-1",
          false,
          1,
          new Date(baseTime.getTime() + 1000),
        ),
        createMockAgent(
          "agent-2",
          true,
          0,
          new Date(baseTime.getTime() + 2000),
        ),
        createMockAgent(
          "agent-3",
          false,
          0,
          new Date(baseTime.getTime() + 1500),
        ),
      ];

      // Expected order: agent-3 (order 0, earlier time), agent-2 (order 0, later time), agent-1 (order 1)
      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({
        toEnable: ["agent-1"],
        toDisable: ["agent-2"],
      });
    });

    it("should return empty intent when no agents enabled", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
        createMockAgent("agent-2", false, 1),
      ];
      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("edge cases", () => {
    it("should handle agents with same display_order and added_at", () => {
      const sameTime = new Date("2024-01-01T00:00:00Z");
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0, sameTime),
        createMockAgent("agent-2", false, 0, sameTime),
      ];

      const intent = mode.handleConversationProgression(agents);
      expect(intent.toEnable).toHaveLength(1);
      expect(intent.toDisable).toEqual(["agent-1"]);
    });

    it("should handle negative display_order values", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, -1),
        createMockAgent("agent-2", true, 0),
      ];

      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({
        toEnable: ["agent-1"],
        toDisable: ["agent-2"],
      });
    });
  });

  describe("performance", () => {
    it("should complete operations quickly with large agent arrays", () => {
      const largeAgentArray = Array.from({ length: 50 }, (_, i) =>
        createMockAgent(`agent-${i}`, i === 25, i),
      );

      const start = performance.now();
      mode.handleAgentAdded(largeAgentArray, "new-agent");
      mode.handleAgentToggle(largeAgentArray, "agent-30");
      mode.handleConversationProgression(largeAgentArray);
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // <10ms requirement
    });
  });

  describe("immutability", () => {
    it("should not modify input agent arrays", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
      ];
      const originalAgents = JSON.parse(JSON.stringify(agents));

      mode.handleAgentAdded(agents, "new-agent");
      mode.handleAgentToggle(agents, "agent-2");
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
  addedAt: Date = new Date(),
): ConversationAgent {
  return {
    id,
    enabled,
    display_order: displayOrder,
    added_at: addedAt.toISOString(),
    // Add other required ConversationAgent fields as needed
  } as ConversationAgent;
}
```

## Acceptance Criteria

- [ ] **Single Class Export**: RoundRobinChatMode.ts contains only the RoundRobinChatMode class
- [ ] **Interface Implementation**: Correctly implements ChatModeHandler interface
- [ ] **Name Property**: readonly name property equals "round-robin"
- [ ] **Agent Addition Logic**: First agent enabled, subsequent agents preserve current state
- [ ] **Agent Toggle Logic**: Maintains single-enabled invariant with proper transitions
- [ ] **Conversation Progression**: Rotates through agents using display_order then added_at
- [ ] **Wrap-Around Logic**: Correctly wraps from last agent to first agent
- [ ] **Edge Cases**: Handles single agent, empty arrays, invalid IDs gracefully
- [ ] **Performance**: Operations complete in <10ms for 50 agents
- [ ] **Immutability**: Never modifies input agent arrays
- [ ] **Unit Tests**: >95% code coverage with comprehensive test cases
- [ ] **Type Safety**: Full TypeScript compliance with proper imports

## Dependencies

- Requires T-create-chatmodehandler (ChatModeHandler and ChatModeIntent interfaces)
- Requires ConversationAgent type from @fishbowl-ai/shared
- Must run `pnpm build:libs` after implementation

## Testing Requirements

- Unit tests cover all three handler methods and edge cases
- Rotation logic tests with various agent configurations
- Sorting behavior tests (display_order and added_at)
- Performance tests verify <10ms completion time
- Immutability tests ensure input arrays unchanged
- Comprehensive behavior validation for single-enabled invariant

## Security Considerations

- Input validation for edge cases (null/undefined handling)
- Safe handling of invalid agent IDs
- No direct agent array mutation
- Deterministic sorting for predictable behavior

## Performance Requirements

- All operations complete within 10ms for typical usage (up to 50 agents)
- Efficient sorting algorithm usage
- Minimal memory allocation
- No memory leaks or object retention

## Out of Scope

- Integration with state management (handled in separate feature)
- Factory function (handled in separate task)
- UI components (separate epic)
- Complex rotation patterns beyond simple sequential rotation

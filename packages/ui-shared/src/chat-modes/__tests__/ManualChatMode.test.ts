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

    it("should handle mixed agent states", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
        createMockAgent("agent-3", true, 2),
      ];
      const intent = mode.handleAgentAdded(agents, "agent-4");

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle null/undefined agent ID gracefully", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleAgentAdded(agents, "");

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

    it("should handle multiple agents with different states", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
        createMockAgent("agent-3", true, 2),
      ];
      const intent = mode.handleAgentToggle(agents, "agent-2");

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle null/undefined agent ID gracefully", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const intent = mode.handleAgentToggle(agents, "");

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

    it("should return empty intent with all enabled agents", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", true, 1),
        createMockAgent("agent-3", true, 2),
      ];
      const intent = mode.handleConversationProgression(agents);

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle empty agent arrays", () => {
      const intent = mode.handleConversationProgression([]);
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle single disabled agent", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
      ];
      const intent = mode.handleConversationProgression(agents);

      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("performance", () => {
    it("should complete operations quickly with large agent arrays", () => {
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

    it("should handle extremely large arrays efficiently", () => {
      const extraLargeArray = Array.from({ length: 100 }, (_, i) =>
        createMockAgent(`agent-${i}`, i % 3 === 0, i),
      );

      const start = performance.now();
      const intent1 = mode.handleAgentAdded(extraLargeArray, "new-agent");
      const intent2 = mode.handleAgentToggle(extraLargeArray, "agent-50");
      const intent3 = mode.handleConversationProgression(extraLargeArray);
      const end = performance.now();

      expect(intent1).toEqual({ toEnable: [], toDisable: [] });
      expect(intent2).toEqual({ toEnable: [], toDisable: [] });
      expect(intent3).toEqual({ toEnable: [], toDisable: [] });
      expect(end - start).toBeLessThan(2); // Allow slightly more time for large arrays
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
      mode.handleAgentToggle(agents, "agent-1");
      mode.handleConversationProgression(agents);

      expect(agents).toEqual(originalAgents);
    });

    it("should return new intent objects on each call", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];

      const intent1 = mode.handleAgentAdded(agents, "agent-2");
      const intent2 = mode.handleAgentAdded(agents, "agent-3");

      expect(intent1).not.toBe(intent2); // Different object references
      expect(intent1).toEqual(intent2); // Same content
    });

    it("should not retain references to input parameters", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const agentId = "test-agent";

      const intent = mode.handleAgentAdded(agents, agentId);

      // Modify original arrays and strings
      agents.push(createMockAgent("agent-2", false, 1));

      // Intent should remain unchanged
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("error handling", () => {
    it("should handle malformed agent objects gracefully", () => {
      const malformedAgents = [
        { id: "agent-1" } as ConversationAgent, // Missing required fields
        createMockAgent("agent-2", true, 1),
      ];

      expect(() => {
        mode.handleAgentAdded(malformedAgents, "agent-3");
        mode.handleAgentToggle(malformedAgents, "agent-1");
        mode.handleConversationProgression(malformedAgents);
      }).not.toThrow();
    });

    it("should handle undefined/null agent arrays gracefully", () => {
      expect(() => {
        mode.handleAgentAdded(
          undefined as unknown as ConversationAgent[],
          "agent-1",
        );
        mode.handleAgentToggle(
          null as unknown as ConversationAgent[],
          "agent-1",
        );
        mode.handleConversationProgression(
          undefined as unknown as ConversationAgent[],
        );
      }).not.toThrow();
    });

    it("should handle special characters in agent IDs", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];
      const specialIds = [
        "agent-with-spaces",
        "agent@with#special$chars%",
        "agent-with-unicode-™",
        "agent-with-numbers-123",
        "",
      ];

      specialIds.forEach((id) => {
        expect(() => {
          const intent = mode.handleAgentAdded(agents, id);
          expect(intent).toEqual({ toEnable: [], toDisable: [] });
        }).not.toThrow();
      });
    });
  });

  describe("edge cases", () => {
    it("should handle agents with identical IDs", () => {
      const duplicateAgents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-1", false, 1), // Duplicate ID
      ];

      expect(() => {
        const intent = mode.handleAgentAdded(duplicateAgents, "agent-2");
        expect(intent).toEqual({ toEnable: [], toDisable: [] });
      }).not.toThrow();
    });

    it("should handle agents with negative display_order", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, -1),
        createMockAgent("agent-2", false, -5),
      ];

      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });

    it("should handle agents with future timestamps", () => {
      const futureDate = new Date("2099-12-31T23:59:59.999Z").toISOString();
      const agents: ConversationAgent[] = [
        createMockAgentWithDate("agent-1", true, 0, futureDate),
      ];

      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({ toEnable: [], toDisable: [] });
    });
  });

  describe("consistency", () => {
    it("should return identical results for identical inputs", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
      ];

      const intent1 = mode.handleAgentAdded(agents, "agent-3");
      const intent2 = mode.handleAgentAdded(agents, "agent-3");
      const intent3 = mode.handleAgentToggle(agents, "agent-1");
      const intent4 = mode.handleAgentToggle(agents, "agent-1");
      const intent5 = mode.handleConversationProgression(agents);
      const intent6 = mode.handleConversationProgression(agents);

      expect(intent1).toEqual(intent2);
      expect(intent3).toEqual(intent4);
      expect(intent5).toEqual(intent6);
    });

    it("should maintain consistent behavior across different instances", () => {
      const mode1 = new ManualChatMode();
      const mode2 = new ManualChatMode();
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];

      const intent1 = mode1.handleAgentAdded(agents, "agent-2");
      const intent2 = mode2.handleAgentAdded(agents, "agent-2");

      expect(intent1).toEqual(intent2);
      expect(mode1.name).toBe(mode2.name);
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
    conversation_id: "conv-123",
    agent_id: "agent-config-456",
    added_at: new Date().toISOString(),
    is_active: true,
    enabled,
    color: "--agent-1",
    display_order: displayOrder,
  };
}

// Helper function for creating mock agents with specific date
function createMockAgentWithDate(
  id: string,
  enabled: boolean,
  displayOrder: number,
  addedAt: string,
): ConversationAgent {
  return {
    id,
    conversation_id: "conv-123",
    agent_id: "agent-config-456",
    added_at: addedAt,
    is_active: true,
    enabled,
    color: "--agent-1",
    display_order: displayOrder,
  };
}

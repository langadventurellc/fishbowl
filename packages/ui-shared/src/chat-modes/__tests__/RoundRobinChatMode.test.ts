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

    it("should handle multiple disabled agents", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
        createMockAgent("agent-2", false, 1),
        createMockAgent("agent-3", false, 2),
      ];
      const intent = mode.handleAgentAdded(agents, "agent-4");
      expect(intent).toEqual({ toEnable: ["agent-4"], toDisable: [] });
    });

    it("should handle empty string agent ID", () => {
      const intent = mode.handleAgentAdded([], "");
      expect(intent).toEqual({ toEnable: [""], toDisable: [] });
    });

    it("should handle special character agent IDs", () => {
      const specialIds = ["agent-!@#", "agent with spaces", "агент-кириллица"];

      specialIds.forEach((id) => {
        const intent = mode.handleAgentAdded([], id);
        expect(intent).toEqual({ toEnable: [id], toDisable: [] });
      });
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

    it("should handle multiple agents with same enabled state", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", false, 0),
        createMockAgent("agent-2", false, 1),
        createMockAgent("agent-3", false, 2),
      ];
      const intent = mode.handleAgentToggle(agents, "agent-2");
      expect(intent).toEqual({ toEnable: ["agent-2"], toDisable: [] });
    });

    it("should handle null/undefined edge cases gracefully", () => {
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];

      // These should be handled gracefully without throwing
      expect(() => {
        const intent = mode.handleAgentToggle(agents, "");
        expect(intent).toEqual({ toEnable: [], toDisable: [] });
      }).not.toThrow();
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
        createMockAgentWithDate(
          "agent-1",
          false,
          1,
          new Date(baseTime.getTime() + 1000).toISOString(),
        ),
        createMockAgentWithDate(
          "agent-2",
          true,
          0,
          new Date(baseTime.getTime() + 2000).toISOString(),
        ),
        createMockAgentWithDate(
          "agent-3",
          false,
          0,
          new Date(baseTime.getTime() + 1500).toISOString(),
        ),
      ];

      // Expected order: agent-3 (order 0, earlier time), agent-2 (order 0, later time), agent-1 (order 1)
      // Current enabled is agent-2 (index 1 in sorted order), next should be agent-1 (index 2)
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

    it("should handle complex sorting scenarios", () => {
      const baseTime = new Date("2024-01-01T00:00:00Z");
      const agents: ConversationAgent[] = [
        createMockAgentWithDate(
          "agent-A",
          false,
          5,
          new Date(baseTime.getTime() + 1000).toISOString(),
        ),
        createMockAgentWithDate(
          "agent-B",
          false,
          1,
          new Date(baseTime.getTime() + 3000).toISOString(),
        ),
        createMockAgentWithDate(
          "agent-C",
          true,
          1,
          new Date(baseTime.getTime() + 2000).toISOString(),
        ),
        createMockAgentWithDate(
          "agent-D",
          false,
          1,
          new Date(baseTime.getTime() + 1000).toISOString(),
        ),
      ];

      // Expected order: agent-D (order 1, earliest time), agent-C (order 1, middle time), agent-B (order 1, latest time), agent-A (order 5)
      // Current enabled is agent-C (index 1), next should be agent-B (index 2)
      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({
        toEnable: ["agent-B"],
        toDisable: ["agent-C"],
      });
    });
  });

  describe("edge cases", () => {
    it("should handle agents with same display_order and added_at", () => {
      const sameTime = new Date("2024-01-01T00:00:00Z");
      const agents: ConversationAgent[] = [
        createMockAgentWithDate("agent-1", true, 0, sameTime.toISOString()),
        createMockAgentWithDate("agent-2", false, 0, sameTime.toISOString()),
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

    it("should handle very large display_order values", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 999999),
        createMockAgent("agent-2", false, 1000000),
      ];

      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      });
    });

    it("should handle duplicate agent IDs", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("duplicate-id", true, 0),
        createMockAgent("duplicate-id", false, 1), // Duplicate ID
      ];

      // Should handle gracefully without throwing
      expect(() => {
        const intent = mode.handleConversationProgression(agents);
        expect(intent).toBeDefined();
      }).not.toThrow();
    });

    it("should handle future and past timestamps", () => {
      const pastDate = new Date("1990-01-01T00:00:00Z").toISOString();
      const futureDate = new Date("2099-12-31T23:59:59Z").toISOString();

      const agents: ConversationAgent[] = [
        createMockAgentWithDate("past-agent", true, 0, pastDate),
        createMockAgentWithDate("future-agent", false, 0, futureDate),
      ];

      const intent = mode.handleConversationProgression(agents);
      expect(intent).toEqual({
        toEnable: ["future-agent"],
        toDisable: ["past-agent"],
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

    it("should handle very large arrays efficiently", () => {
      const veryLargeArray = Array.from({ length: 100 }, (_, i) =>
        createMockAgent(`agent-${i}`, i === 50, i),
      );

      const start = performance.now();
      const intent = mode.handleConversationProgression(veryLargeArray);
      const end = performance.now();

      expect(end - start).toBeLessThan(20); // Reasonable performance for 100 agents
      expect(intent).toEqual({
        toEnable: ["agent-51"],
        toDisable: ["agent-50"],
      });
    });

    it("should maintain consistent performance across multiple calls", () => {
      const agents = Array.from({ length: 30 }, (_, i) =>
        createMockAgent(`agent-${i}`, i === 15, i),
      );

      const times: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        mode.handleConversationProgression(agents);
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(avgTime).toBeLessThan(5); // Average should be well under limit
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

    it("should not modify individual agent objects", () => {
      const agent1 = createMockAgent("agent-1", true, 0);
      const agent2 = createMockAgent("agent-2", false, 1);
      const agents = [agent1, agent2];

      const originalAgent1 = { ...agent1 };
      const originalAgent2 = { ...agent2 };

      mode.handleConversationProgression(agents);

      expect(agent1).toEqual(originalAgent1);
      expect(agent2).toEqual(originalAgent2);
    });

    it("should create new arrays for sorting without modifying originals", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("c-agent", false, 2),
        createMockAgent("a-agent", true, 0),
        createMockAgent("b-agent", false, 1),
      ];
      const originalOrder = agents.map((a) => a.id);

      mode.handleConversationProgression(agents);

      // Original array order should be unchanged
      expect(agents.map((a) => a.id)).toEqual(originalOrder);
    });
  });

  describe("consistency", () => {
    it("should return identical results for identical inputs", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
      ];

      const intent1 = mode.handleConversationProgression(agents);
      const intent2 = mode.handleConversationProgression(agents);

      expect(intent1).toEqual(intent2);
    });

    it("should maintain consistent behavior across different instances", () => {
      const mode1 = new RoundRobinChatMode();
      const mode2 = new RoundRobinChatMode();
      const agents: ConversationAgent[] = [createMockAgent("agent-1", true, 0)];

      const intent1 = mode1.handleAgentAdded(agents, "agent-2");
      const intent2 = mode2.handleAgentAdded(agents, "agent-2");

      expect(intent1).toEqual(intent2);
      expect(mode1.name).toBe(mode2.name);
    });

    it("should produce deterministic results with same timestamps", () => {
      const sameTime = new Date("2024-01-01T00:00:00Z").toISOString();
      const agents: ConversationAgent[] = [
        createMockAgentWithDate("agent-A", false, 0, sameTime),
        createMockAgentWithDate("agent-B", true, 0, sameTime),
        createMockAgentWithDate("agent-C", false, 0, sameTime),
      ];

      const intent1 = mode.handleConversationProgression(agents);
      const intent2 = mode.handleConversationProgression(agents);

      expect(intent1).toEqual(intent2);
      expect(intent1.toEnable).toHaveLength(1);
      expect(intent1.toDisable).toEqual(["agent-B"]);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete workflow: add agents, toggle, progress", () => {
      let agents: ConversationAgent[] = [];

      // Add first agent
      const addIntent1 = mode.handleAgentAdded(agents, "agent-1");
      expect(addIntent1).toEqual({ toEnable: ["agent-1"], toDisable: [] });

      // Simulate agent enabled
      agents = [createMockAgent("agent-1", true, 0)];

      // Add second agent
      const addIntent2 = mode.handleAgentAdded(agents, "agent-2");
      expect(addIntent2).toEqual({ toEnable: [], toDisable: [] });

      // Simulate agent added
      agents.push(createMockAgent("agent-2", false, 1));

      // Progress conversation
      const progressIntent = mode.handleConversationProgression(agents);
      expect(progressIntent).toEqual({
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      });
    });

    it("should handle rapid agent additions and progressions", () => {
      const agents: ConversationAgent[] = [
        createMockAgent("agent-1", true, 0),
        createMockAgent("agent-2", false, 1),
        createMockAgent("agent-3", false, 2),
        createMockAgent("agent-4", false, 3),
      ];

      // Multiple progressions should cycle through correctly
      const progression1 = mode.handleConversationProgression(agents);
      expect(progression1).toEqual({
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      });

      // Simulate progression applied
      agents[0]!.enabled = false;
      agents[1]!.enabled = true;

      const progression2 = mode.handleConversationProgression(agents);
      expect(progression2).toEqual({
        toEnable: ["agent-3"],
        toDisable: ["agent-2"],
      });
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
    display_order: displayOrder,
  };
}

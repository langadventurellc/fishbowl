/**
 * Unit tests for selectAgentColor utility function.
 * Tests color assignment logic, duplicate avoidance, and round-robin fallback.
 */

import type { ConversationAgent } from "@fishbowl-ai/shared";
import { selectAgentColor } from "../selectAgentColor";

// Helper function to create minimal ConversationAgent objects for testing
function createMockAgent(id: string, color: string): ConversationAgent {
  return {
    id,
    conversation_id: "test-conversation",
    agent_id: `agent-${id}`,
    color,
    display_order: 1,
    added_at: new Date().toISOString(),
    is_active: true,
    enabled: true,
  };
}

describe("selectAgentColor", () => {
  describe("empty conversation", () => {
    it("should return --agent-1 for empty conversation", () => {
      const result = selectAgentColor([]);
      expect(result).toBe("--agent-1");
    });
  });

  describe("partial color usage", () => {
    it("should return first available color when some colors are used", () => {
      const existingAgents = [
        createMockAgent("1", "--agent-1"),
        createMockAgent("2", "--agent-3"),
        createMockAgent("3", "--agent-5"),
      ];

      const result = selectAgentColor(existingAgents);
      expect(result).toBe("--agent-2");
    });

    it("should return next sequential available color", () => {
      const existingAgents = [
        createMockAgent("1", "--agent-1"),
        createMockAgent("2", "--agent-2"),
        createMockAgent("3", "--agent-3"),
      ];

      const result = selectAgentColor(existingAgents);
      expect(result).toBe("--agent-4");
    });

    it("should handle non-sequential color usage", () => {
      const existingAgents = [
        createMockAgent("1", "--agent-2"),
        createMockAgent("2", "--agent-4"),
        createMockAgent("3", "--agent-7"),
      ];

      const result = selectAgentColor(existingAgents);
      expect(result).toBe("--agent-1");
    });
  });

  describe("round-robin fallback", () => {
    it("should use round-robin when all 8 colors are used", () => {
      const existingAgents = [
        createMockAgent("1", "--agent-1"),
        createMockAgent("2", "--agent-2"),
        createMockAgent("3", "--agent-3"),
        createMockAgent("4", "--agent-4"),
        createMockAgent("5", "--agent-5"),
        createMockAgent("6", "--agent-6"),
        createMockAgent("7", "--agent-7"),
        createMockAgent("8", "--agent-8"),
      ];

      const result = selectAgentColor(existingAgents);
      // 8 existing agents, modulo 8 = 0, so should return first color
      expect(result).toBe("--agent-1");
    });

    it("should handle 9th agent correctly", () => {
      const existingAgents = Array.from({ length: 8 }, (_, i) =>
        createMockAgent((i + 1).toString(), `--agent-${i + 1}`),
      );

      // Add 9th agent to test modulo logic
      existingAgents.push(createMockAgent("9", "--agent-1"));

      const result = selectAgentColor(existingAgents);
      // 9 existing agents, modulo 8 = 1, so should return second color
      expect(result).toBe("--agent-2");
    });

    it("should handle 10th agent correctly", () => {
      const existingAgents = Array.from({ length: 10 }, (_, i) =>
        createMockAgent((i + 1).toString(), `--agent-${(i % 8) + 1}`),
      );

      const result = selectAgentColor(existingAgents);
      // 10 existing agents, modulo 8 = 2, so should return third color
      expect(result).toBe("--agent-3");
    });
  });

  describe("edge cases", () => {
    it("should handle agents with duplicate colors gracefully", () => {
      const existingAgents = [
        createMockAgent("1", "--agent-1"),
        createMockAgent("2", "--agent-1"), // Duplicate color
        createMockAgent("3", "--agent-3"),
      ];

      const result = selectAgentColor(existingAgents);
      expect(result).toBe("--agent-2");
    });

    it("should always return a valid agent color", () => {
      const validColors = [
        "--agent-1",
        "--agent-2",
        "--agent-3",
        "--agent-4",
        "--agent-5",
        "--agent-6",
        "--agent-7",
        "--agent-8",
      ];

      // Test with various agent counts
      for (let i = 0; i <= 15; i++) {
        const existingAgents = Array.from({ length: i }, (_, index) =>
          createMockAgent(index.toString(), `--agent-${(index % 8) + 1}`),
        );

        const result = selectAgentColor(existingAgents);
        expect(validColors).toContain(result);
        expect(typeof result).toBe("string");
        expect(result).toMatch(/^--agent-[1-8]$/);
      }
    });

    it("should be deterministic for same input", () => {
      const existingAgents = [
        createMockAgent("1", "--agent-1"),
        createMockAgent("2", "--agent-3"),
      ];

      const result1 = selectAgentColor(existingAgents);
      const result2 = selectAgentColor(existingAgents);
      expect(result1).toBe(result2);
    });
  });
});

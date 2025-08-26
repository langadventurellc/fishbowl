import { DuplicateAgentError } from "../DuplicateAgentError";

describe("DuplicateAgentError", () => {
  describe("constructor", () => {
    it("should create error with proper message format", () => {
      const conversationId = "conv-123";
      const agentId = "agent-456";
      const error = new DuplicateAgentError(conversationId, agentId);

      expect(error.message).toBe(
        "Agent agent-456 is already in conversation conv-123",
      );
      expect(error.conversationId).toBe(conversationId);
      expect(error.agentId).toBe(agentId);
      expect(error.name).toBe("DuplicateAgentError");
    });

    it("should handle different ID formats", () => {
      const testCases = [
        {
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
          agentId: "agent-config-abc123",
        },
        {
          conversationId: "temp-conversation",
          agentId: "settings-agent-1",
        },
        {
          conversationId: "conv_123",
          agentId: "agent_456",
        },
      ];

      testCases.forEach(({ conversationId, agentId }) => {
        const error = new DuplicateAgentError(conversationId, agentId);
        expect(error.message).toBe(
          `Agent ${agentId} is already in conversation ${conversationId}`,
        );
        expect(error.conversationId).toBe(conversationId);
        expect(error.agentId).toBe(agentId);
      });
    });

    it("should handle empty string IDs", () => {
      const error = new DuplicateAgentError("", "");
      expect(error.message).toBe("Agent  is already in conversation ");
      expect(error.conversationId).toBe("");
      expect(error.agentId).toBe("");
    });

    it("should handle long IDs", () => {
      const longConversationId = "conversation-".repeat(10) + "id";
      const longAgentId = "agent-".repeat(20) + "config";
      const error = new DuplicateAgentError(longConversationId, longAgentId);

      expect(error.message).toBe(
        `Agent ${longAgentId} is already in conversation ${longConversationId}`,
      );
      expect(error.conversationId).toBe(longConversationId);
      expect(error.agentId).toBe(longAgentId);
    });
  });

  describe("inheritance", () => {
    it("should extend Error", () => {
      const error = new DuplicateAgentError("conv-123", "agent-456");

      expect(error).toBeInstanceOf(DuplicateAgentError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should maintain proper prototype chain", () => {
      const error = new DuplicateAgentError("conv-123", "agent-456");

      expect(Object.getPrototypeOf(error)).toBe(DuplicateAgentError.prototype);
      expect(error.constructor).toBe(DuplicateAgentError);
    });
  });

  describe("toJSON", () => {
    it("should serialize correctly", () => {
      const conversationId = "conv-789";
      const agentId = "agent-012";
      const error = new DuplicateAgentError(conversationId, agentId);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "DuplicateAgentError",
        message: "Agent agent-012 is already in conversation conv-789",
        conversationId: "conv-789",
        agentId: "agent-012",
        stack: error.stack,
      });
    });

    it("should include stack trace in serialization", () => {
      const error = new DuplicateAgentError("test-conv", "test-agent");
      const json = error.toJSON();

      expect(json.stack).toBeDefined();
      expect(typeof json.stack).toBe("string");
    });

    it("should serialize special characters correctly", () => {
      const conversationId = "conv-with-<special>-chars";
      const agentId = "agent-with-&-ampersand";
      const error = new DuplicateAgentError(conversationId, agentId);
      const json = error.toJSON();

      expect(json.conversationId).toBe(conversationId);
      expect(json.agentId).toBe(agentId);
      expect(json.message).toContain(conversationId);
      expect(json.message).toContain(agentId);
    });
  });

  describe("error properties", () => {
    it("should have correct error name", () => {
      const error = new DuplicateAgentError("conv-123", "agent-456");
      expect(error.name).toBe("DuplicateAgentError");
    });

    it("should preserve conversation ID as readonly property", () => {
      const conversationId = "readonly-test-conv";
      const error = new DuplicateAgentError(conversationId, "agent-123");

      expect(error.conversationId).toBe(conversationId);
      // TypeScript enforces readonly at compile time
      // Runtime property is still writable but TypeScript prevents reassignment
    });

    it("should preserve agent ID as readonly property", () => {
      const agentId = "readonly-test-agent";
      const error = new DuplicateAgentError("conv-123", agentId);

      expect(error.agentId).toBe(agentId);
      // TypeScript enforces readonly at compile time
      // Runtime property is still writable but TypeScript prevents reassignment
    });

    it("should have stack trace", () => {
      const error = new DuplicateAgentError("conv-123", "agent-456");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("DuplicateAgentError");
    });
  });

  describe("message formatting", () => {
    it("should maintain consistent message format", () => {
      const testCases = [
        { conversationId: "a", agentId: "b" },
        { conversationId: "conversation-1", agentId: "agent-configuration-1" },
        { conversationId: "CONV_123", agentId: "AGENT_456" },
      ];

      testCases.forEach(({ conversationId, agentId }) => {
        const error = new DuplicateAgentError(conversationId, agentId);
        const expectedMessage = `Agent ${agentId} is already in conversation ${conversationId}`;
        expect(error.message).toBe(expectedMessage);
      });
    });

    it("should not modify ID values in message", () => {
      const originalConversationId = "  conv-with-spaces  ";
      const originalAgentId = "  agent-with-spaces  ";
      const error = new DuplicateAgentError(
        originalConversationId,
        originalAgentId,
      );

      // Should preserve the exact values passed in
      expect(error.conversationId).toBe(originalConversationId);
      expect(error.agentId).toBe(originalAgentId);
      expect(error.message).toBe(
        `Agent ${originalAgentId} is already in conversation ${originalConversationId}`,
      );
    });
  });
});

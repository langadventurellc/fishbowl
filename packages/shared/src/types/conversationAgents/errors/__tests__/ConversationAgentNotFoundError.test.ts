import { ConversationAgentNotFoundError } from "../ConversationAgentNotFoundError";

describe("ConversationAgentNotFoundError", () => {
  describe("constructor with conversationAgentId", () => {
    it("should create error with conversationAgentId", () => {
      const conversationAgentId = "ca-123";
      const error = new ConversationAgentNotFoundError({ conversationAgentId });

      expect(error.message).toBe("Conversation agent not found: ID: ca-123");
      expect(error.conversationAgentId).toBe(conversationAgentId);
      expect(error.name).toBe("ConversationAgentNotFoundError");
    });
  });

  describe("constructor with conversation and agent IDs", () => {
    it("should create error with conversation and agent IDs", () => {
      const conversationId = "conv-123";
      const agentId = "agent-456";
      const error = new ConversationAgentNotFoundError({
        conversationId,
        agentId,
      });

      expect(error.message).toBe(
        "Conversation agent not found: conversation: conv-123, agent: agent-456",
      );
      expect(error.conversationId).toBe(conversationId);
      expect(error.agentId).toBe(agentId);
      expect(error.name).toBe("ConversationAgentNotFoundError");
    });
  });

  describe("constructor with all parameters", () => {
    it("should prioritize conversationAgentId in message", () => {
      const conversationAgentId = "ca-123";
      const conversationId = "conv-456";
      const agentId = "agent-789";
      const error = new ConversationAgentNotFoundError({
        conversationAgentId,
        conversationId,
        agentId,
      });

      expect(error.message).toBe(
        "Conversation agent not found: ID: ca-123 conversation: conv-456, agent: agent-789",
      );
      expect(error.conversationAgentId).toBe(conversationAgentId);
      expect(error.conversationId).toBe(conversationId);
      expect(error.agentId).toBe(agentId);
    });
  });

  describe("constructor with minimal parameters", () => {
    it("should handle conversationId only", () => {
      const conversationId = "conv-123";
      const error = new ConversationAgentNotFoundError({ conversationId });

      expect(error.message).toBe("Conversation agent not found: ");
      expect(error.conversationId).toBe(conversationId);
      expect(error.agentId).toBeUndefined();
      expect(error.conversationAgentId).toBeUndefined();
    });

    it("should handle agentId only", () => {
      const agentId = "agent-123";
      const error = new ConversationAgentNotFoundError({ agentId });

      expect(error.message).toBe("Conversation agent not found: ");
      expect(error.agentId).toBe(agentId);
      expect(error.conversationId).toBeUndefined();
      expect(error.conversationAgentId).toBeUndefined();
    });

    it("should handle empty parameters", () => {
      const error = new ConversationAgentNotFoundError({});

      expect(error.message).toBe("Conversation agent not found: ");
      expect(error.conversationAgentId).toBeUndefined();
      expect(error.conversationId).toBeUndefined();
      expect(error.agentId).toBeUndefined();
    });
  });

  describe("inheritance", () => {
    it("should extend Error", () => {
      const error = new ConversationAgentNotFoundError({
        conversationAgentId: "test",
      });

      expect(error).toBeInstanceOf(ConversationAgentNotFoundError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should maintain proper prototype chain", () => {
      const error = new ConversationAgentNotFoundError({
        conversationAgentId: "test",
      });

      expect(Object.getPrototypeOf(error)).toBe(
        ConversationAgentNotFoundError.prototype,
      );
      expect(error.constructor).toBe(ConversationAgentNotFoundError);
    });
  });

  describe("toJSON", () => {
    it("should serialize with conversationAgentId", () => {
      const conversationAgentId = "ca-456";
      const error = new ConversationAgentNotFoundError({ conversationAgentId });
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConversationAgentNotFoundError",
        message: "Conversation agent not found: ID: ca-456",
        conversationAgentId: "ca-456",
        conversationId: undefined,
        agentId: undefined,
        stack: error.stack,
      });
    });

    it("should serialize with all fields", () => {
      const params = {
        conversationAgentId: "ca-123",
        conversationId: "conv-456",
        agentId: "agent-789",
      };
      const error = new ConversationAgentNotFoundError(params);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConversationAgentNotFoundError",
        message: error.message,
        conversationAgentId: "ca-123",
        conversationId: "conv-456",
        agentId: "agent-789",
        stack: error.stack,
      });
    });

    it("should include stack trace in serialization", () => {
      const error = new ConversationAgentNotFoundError({
        conversationAgentId: "test",
      });
      const json = error.toJSON();

      expect(json.stack).toBeDefined();
      expect(typeof json.stack).toBe("string");
    });
  });

  describe("error properties", () => {
    it("should have correct error name", () => {
      const error = new ConversationAgentNotFoundError({
        conversationAgentId: "test",
      });
      expect(error.name).toBe("ConversationAgentNotFoundError");
    });

    it("should have stack trace", () => {
      const error = new ConversationAgentNotFoundError({
        conversationAgentId: "test",
      });
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ConversationAgentNotFoundError");
    });
  });
});

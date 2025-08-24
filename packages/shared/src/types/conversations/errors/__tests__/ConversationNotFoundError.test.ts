import { ConversationNotFoundError } from "../ConversationNotFoundError";

describe("ConversationNotFoundError", () => {
  describe("constructor", () => {
    it("should create error with proper message format", () => {
      const conversationId = "conv-123";
      const error = new ConversationNotFoundError(conversationId);

      expect(error.message).toBe("Conversation not found: conv-123");
      expect(error.conversationId).toBe(conversationId);
      expect(error.name).toBe("ConversationNotFoundError");
    });

    it("should handle different conversation ID formats", () => {
      const testIds = [
        "conv-abc123",
        "12345678-1234-1234-1234-123456789abc", // UUID format
        "conversation_id",
        "temp-conversation",
      ];

      testIds.forEach((id) => {
        const error = new ConversationNotFoundError(id);
        expect(error.message).toBe(`Conversation not found: ${id}`);
        expect(error.conversationId).toBe(id);
      });
    });
  });

  describe("inheritance", () => {
    it("should extend Error", () => {
      const error = new ConversationNotFoundError("test-id");

      expect(error).toBeInstanceOf(ConversationNotFoundError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should maintain proper prototype chain", () => {
      const error = new ConversationNotFoundError("test-id");

      expect(Object.getPrototypeOf(error)).toBe(
        ConversationNotFoundError.prototype,
      );
      expect(error.constructor).toBe(ConversationNotFoundError);
    });
  });

  describe("toJSON", () => {
    it("should serialize correctly", () => {
      const conversationId = "conv-456";
      const error = new ConversationNotFoundError(conversationId);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConversationNotFoundError",
        message: "Conversation not found: conv-456",
        conversationId: "conv-456",
        stack: error.stack,
      });
    });

    it("should include stack trace in serialization", () => {
      const error = new ConversationNotFoundError("test-id");
      const json = error.toJSON();

      expect(json.stack).toBeDefined();
      expect(typeof json.stack).toBe("string");
    });
  });

  describe("error properties", () => {
    it("should have correct error name", () => {
      const error = new ConversationNotFoundError("test-id");

      expect(error.name).toBe("ConversationNotFoundError");
    });

    it("should preserve conversation ID as readonly property", () => {
      const conversationId = "readonly-test";
      const error = new ConversationNotFoundError(conversationId);

      expect(error.conversationId).toBe(conversationId);
      // TypeScript enforces readonly at compile time
      // Runtime property is still writable but TypeScript prevents reassignment
    });

    it("should have stack trace", () => {
      const error = new ConversationNotFoundError("stack-test");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ConversationNotFoundError");
    });
  });
});

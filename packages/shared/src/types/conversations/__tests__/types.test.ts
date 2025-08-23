import type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationResult,
} from "../index";

describe("Conversation Types", () => {
  describe("Conversation interface", () => {
    it("should have all required fields", () => {
      const conversation: Conversation = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Test Conversation",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      };

      expect(conversation).toBeDefined();
      expect(typeof conversation.id).toBe("string");
      expect(typeof conversation.title).toBe("string");
      expect(typeof conversation.created_at).toBe("string");
      expect(typeof conversation.updated_at).toBe("string");
    });
  });

  describe("CreateConversationInput type", () => {
    it("should accept optional title", () => {
      const input: CreateConversationInput = {};
      expect(input).toBeDefined();
    });

    it("should accept title when provided", () => {
      const input: CreateConversationInput = {
        title: "New Conversation",
      };
      expect(input.title).toBe("New Conversation");
    });
  });

  describe("UpdateConversationInput type", () => {
    it("should accept optional title", () => {
      const input: UpdateConversationInput = {};
      expect(input).toBeDefined();
    });

    it("should accept title when provided", () => {
      const input: UpdateConversationInput = {
        title: "Updated Title",
      };
      expect(input.title).toBe("Updated Title");
    });
  });

  describe("ConversationResult type", () => {
    it("should accept success result", () => {
      const result: ConversationResult = {
        success: true,
        data: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "Test",
          created_at: "2023-01-01T00:00:00.000Z",
          updated_at: "2023-01-01T00:00:00.000Z",
        },
      };
      expect(result.success).toBe(true);
    });

    it("should accept error result", () => {
      const result: ConversationResult = {
        success: false,
        error: new Error("Test error"),
      };
      expect(result.success).toBe(false);
    });
  });
});

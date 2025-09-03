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
        chat_mode: "manual",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      };

      expect(conversation).toBeDefined();
      expect(typeof conversation.id).toBe("string");
      expect(typeof conversation.title).toBe("string");
      expect(typeof conversation.chat_mode).toBe("string");
      expect(["manual", "round-robin"]).toContain(conversation.chat_mode);
      expect(typeof conversation.created_at).toBe("string");
      expect(typeof conversation.updated_at).toBe("string");
    });

    it("should require chat_mode field", () => {
      // TypeScript compilation test - this should fail if chat_mode is not required
      const conversation: Conversation = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Test Conversation",
        chat_mode: "round-robin",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      };

      expect(conversation.chat_mode).toBe("round-robin");
    });

    it("should only accept 'manual' or 'round-robin' values for chat_mode", () => {
      // Test manual mode
      const manualConversation: Conversation = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Manual Conversation",
        chat_mode: "manual",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      };

      // Test round-robin mode
      const roundRobinConversation: Conversation = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        title: "Round Robin Conversation",
        chat_mode: "round-robin",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      };

      expect(manualConversation.chat_mode).toBe("manual");
      expect(roundRobinConversation.chat_mode).toBe("round-robin");
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

    it("should accept optional chat_mode field", () => {
      const inputEmpty: UpdateConversationInput = {};
      expect(inputEmpty).toBeDefined();

      const inputWithChatMode: UpdateConversationInput = {
        chat_mode: "round-robin",
      };
      expect(inputWithChatMode.chat_mode).toBe("round-robin");
    });

    it("should accept both 'manual' and 'round-robin' values for chat_mode", () => {
      const manualInput: UpdateConversationInput = {
        title: "Updated Title",
        chat_mode: "manual",
      };

      const roundRobinInput: UpdateConversationInput = {
        title: "Another Title",
        chat_mode: "round-robin",
      };

      expect(manualInput.chat_mode).toBe("manual");
      expect(roundRobinInput.chat_mode).toBe("round-robin");
    });
  });

  describe("ConversationResult type", () => {
    it("should accept success result", () => {
      const result: ConversationResult = {
        success: true,
        data: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "Test",
          chat_mode: "manual",
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

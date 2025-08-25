import { addAgentToConversationInputSchema } from "../addAgentToConversationInputSchema";

describe("addAgentToConversationInputSchema", () => {
  const validInput = {
    conversation_id: "550e8400-e29b-41d4-a716-446655440001",
    agent_id: "agent-config-123",
  };

  describe("valid inputs", () => {
    it("should validate input without optional fields", () => {
      const result = addAgentToConversationInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate input with optional display_order", () => {
      const inputWithOrder = {
        ...validInput,
        display_order: 5,
      };
      const result =
        addAgentToConversationInputSchema.safeParse(inputWithOrder);
      expect(result.success).toBe(true);
    });

    it("should accept zero as display_order", () => {
      const inputWithZero = {
        ...validInput,
        display_order: 0,
      };
      const result = addAgentToConversationInputSchema.safeParse(inputWithZero);
      expect(result.success).toBe(true);
    });

    it("should accept maximum length agent_id", () => {
      const longAgentId = "a".repeat(255);
      const inputWithLongId = {
        ...validInput,
        agent_id: longAgentId,
      };
      const result =
        addAgentToConversationInputSchema.safeParse(inputWithLongId);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid conversation_id field", () => {
    it("should reject non-string conversation_id", () => {
      const input = {
        ...validInput,
        conversation_id: 123,
      };
      const result = addAgentToConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Conversation ID must be a string",
        );
      }
    });

    it("should reject invalid UUID format for conversation_id", () => {
      const input = {
        ...validInput,
        conversation_id: "invalid-uuid",
      };
      const result = addAgentToConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Conversation ID must be a valid UUID",
        );
      }
    });
  });

  describe("invalid agent_id field", () => {
    it("should reject non-string agent_id", () => {
      const input = {
        ...validInput,
        agent_id: 123,
      };
      const result = addAgentToConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Agent ID must be a string",
        );
      }
    });

    it("should reject empty agent_id", () => {
      const input = {
        ...validInput,
        agent_id: "",
      };
      const result = addAgentToConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Agent ID cannot be empty",
        );
      }
    });

    it("should reject agent_id exceeding 255 characters", () => {
      const longAgentId = "a".repeat(256);
      const input = {
        ...validInput,
        agent_id: longAgentId,
      };
      const result = addAgentToConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Agent ID cannot exceed 255 characters",
        );
      }
    });
  });

  describe("invalid display_order field", () => {
    it("should reject non-number display_order", () => {
      const input = {
        ...validInput,
        display_order: "5",
      };
      const result = addAgentToConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order must be a number",
        );
      }
    });

    it("should reject non-integer display_order", () => {
      const input = {
        ...validInput,
        display_order: 1.5,
      };
      const result = addAgentToConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order must be an integer",
        );
      }
    });

    it("should reject negative display_order", () => {
      const input = {
        ...validInput,
        display_order: -1,
      };
      const result = addAgentToConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order cannot be negative",
        );
      }
    });
  });

  describe("missing required fields", () => {
    it("should reject missing conversation_id", () => {
      const { conversation_id, ...inputWithoutConversationId } = validInput;
      const result = addAgentToConversationInputSchema.safeParse(
        inputWithoutConversationId,
      );
      expect(result.success).toBe(false);
    });

    it("should reject missing agent_id", () => {
      const { agent_id, ...inputWithoutAgentId } = validInput;
      const result =
        addAgentToConversationInputSchema.safeParse(inputWithoutAgentId);
      expect(result.success).toBe(false);
    });
  });
});

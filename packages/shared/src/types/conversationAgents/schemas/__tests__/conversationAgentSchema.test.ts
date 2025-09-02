import { conversationAgentSchema } from "../conversationAgentSchema";

describe("conversationAgentSchema", () => {
  const validConversationAgent = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    conversation_id: "550e8400-e29b-41d4-a716-446655440001",
    agent_id: "agent-config-123",
    added_at: "2023-01-01T00:00:00.000Z",
    is_active: true,
    enabled: true,
    display_order: 0,
  };

  describe("valid inputs", () => {
    it("should validate a complete valid conversation agent", () => {
      const result = conversationAgentSchema.safeParse(validConversationAgent);
      expect(result.success).toBe(true);
    });

    it("should accept maximum length agent_id", () => {
      const longAgentId = "a".repeat(255);
      const conversationAgent = {
        ...validConversationAgent,
        agent_id: longAgentId,
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(true);
    });

    it("should accept various display_order values", () => {
      const testValues = [0, 1, 100, 999];
      testValues.forEach((value) => {
        const conversationAgent = {
          ...validConversationAgent,
          display_order: value,
        };
        const result = conversationAgentSchema.safeParse(conversationAgent);
        expect(result.success).toBe(true);
      });
    });

    it("should accept both active states", () => {
      [true, false].forEach((isActive) => {
        const conversationAgent = {
          ...validConversationAgent,
          is_active: isActive,
        };
        const result = conversationAgentSchema.safeParse(conversationAgent);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("invalid id field", () => {
    it("should reject non-string id", () => {
      const conversationAgent = {
        ...validConversationAgent,
        id: 123,
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("ID must be a string");
      }
    });

    it("should reject invalid UUID format", () => {
      const conversationAgent = {
        ...validConversationAgent,
        id: "not-a-uuid",
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("ID must be a valid UUID");
      }
    });
  });

  describe("invalid conversation_id field", () => {
    it("should reject non-string conversation_id", () => {
      const conversationAgent = {
        ...validConversationAgent,
        conversation_id: 123,
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Conversation ID must be a string",
        );
      }
    });

    it("should reject invalid UUID format for conversation_id", () => {
      const conversationAgent = {
        ...validConversationAgent,
        conversation_id: "invalid-uuid",
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
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
      const conversationAgent = {
        ...validConversationAgent,
        agent_id: 123,
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Agent ID must be a string",
        );
      }
    });

    it("should reject empty agent_id", () => {
      const conversationAgent = {
        ...validConversationAgent,
        agent_id: "",
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Agent ID cannot be empty",
        );
      }
    });

    it("should reject agent_id exceeding 255 characters", () => {
      const longAgentId = "a".repeat(256);
      const conversationAgent = {
        ...validConversationAgent,
        agent_id: longAgentId,
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Agent ID cannot exceed 255 characters",
        );
      }
    });
  });

  describe("invalid timestamp fields", () => {
    it("should reject non-string added_at", () => {
      const conversationAgent = {
        ...validConversationAgent,
        added_at: Date.now(),
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Added date must be a string",
        );
      }
    });

    it("should reject invalid added_at format", () => {
      const conversationAgent = {
        ...validConversationAgent,
        added_at: "not-a-date",
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Invalid added timestamp");
      }
    });
  });

  describe("invalid boolean fields", () => {
    it("should reject non-boolean is_active", () => {
      const conversationAgent = {
        ...validConversationAgent,
        is_active: "true",
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Active status must be a boolean",
        );
      }
    });
  });

  describe("invalid display_order field", () => {
    it("should reject non-number display_order", () => {
      const conversationAgent = {
        ...validConversationAgent,
        display_order: "0",
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order must be a number",
        );
      }
    });

    it("should reject non-integer display_order", () => {
      const conversationAgent = {
        ...validConversationAgent,
        display_order: 1.5,
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order must be an integer",
        );
      }
    });

    it("should reject negative display_order", () => {
      const conversationAgent = {
        ...validConversationAgent,
        display_order: -1,
      };
      const result = conversationAgentSchema.safeParse(conversationAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order cannot be negative",
        );
      }
    });
  });

  describe("missing fields", () => {
    it("should reject missing id", () => {
      const { id, ...conversationAgentWithoutId } = validConversationAgent;
      const result = conversationAgentSchema.safeParse(
        conversationAgentWithoutId,
      );
      expect(result.success).toBe(false);
    });

    it("should reject missing conversation_id", () => {
      const { conversation_id, ...conversationAgentWithoutConversationId } =
        validConversationAgent;
      const result = conversationAgentSchema.safeParse(
        conversationAgentWithoutConversationId,
      );
      expect(result.success).toBe(false);
    });

    it("should reject missing agent_id", () => {
      const { agent_id, ...conversationAgentWithoutAgentId } =
        validConversationAgent;
      const result = conversationAgentSchema.safeParse(
        conversationAgentWithoutAgentId,
      );
      expect(result.success).toBe(false);
    });

    it("should reject missing added_at", () => {
      const { added_at, ...conversationAgentWithoutAddedAt } =
        validConversationAgent;
      const result = conversationAgentSchema.safeParse(
        conversationAgentWithoutAddedAt,
      );
      expect(result.success).toBe(false);
    });

    it("should reject missing is_active", () => {
      const { is_active, ...conversationAgentWithoutIsActive } =
        validConversationAgent;
      const result = conversationAgentSchema.safeParse(
        conversationAgentWithoutIsActive,
      );
      expect(result.success).toBe(false);
    });

    it("should reject missing display_order", () => {
      const { display_order, ...conversationAgentWithoutDisplayOrder } =
        validConversationAgent;
      const result = conversationAgentSchema.safeParse(
        conversationAgentWithoutDisplayOrder,
      );
      expect(result.success).toBe(false);
    });
  });
});

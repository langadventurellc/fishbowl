import { conversationSchema } from "../conversationSchema";

describe("conversationSchema", () => {
  const validConversation = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Test Conversation",
    chat_mode: "manual" as const,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  };

  describe("valid inputs", () => {
    it("should validate a complete valid conversation", () => {
      const result = conversationSchema.safeParse(validConversation);
      expect(result.success).toBe(true);
    });

    it("should trim whitespace from title", () => {
      const conversationWithWhitespace = {
        ...validConversation,
        title: "  Test Conversation  ",
      };
      const result = conversationSchema.safeParse(conversationWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Test Conversation");
      }
    });

    it("should accept maximum length title", () => {
      const longTitle = "a".repeat(255);
      const conversation = {
        ...validConversation,
        title: longTitle,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(true);
    });

    it("should accept valid chat_mode 'manual'", () => {
      const conversation = {
        ...validConversation,
        chat_mode: "manual" as const,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chat_mode).toBe("manual");
      }
    });

    it("should accept valid chat_mode 'round-robin'", () => {
      const conversation = {
        ...validConversation,
        chat_mode: "round-robin" as const,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chat_mode).toBe("round-robin");
      }
    });

    it("should apply default chat_mode value when missing", () => {
      const { chat_mode, ...conversationWithoutChatMode } = validConversation;
      const result = conversationSchema.safeParse(conversationWithoutChatMode);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chat_mode).toBe("manual");
      }
    });
  });

  describe("invalid id field", () => {
    it("should reject non-string id", () => {
      const conversation = {
        ...validConversation,
        id: 123,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("ID must be a string");
      }
    });

    it("should reject invalid UUID format", () => {
      const conversation = {
        ...validConversation,
        id: "not-a-uuid",
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("ID must be a valid UUID");
      }
    });
  });

  describe("invalid title field", () => {
    it("should reject non-string title", () => {
      const conversation = {
        ...validConversation,
        title: 123,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });

    it("should reject empty title", () => {
      const conversation = {
        ...validConversation,
        title: "",
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title cannot be empty");
      }
    });

    it("should reject whitespace-only title", () => {
      const conversation = {
        ...validConversation,
        title: "   ",
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title cannot be empty");
      }
    });

    it("should reject title exceeding 255 characters", () => {
      const longTitle = "a".repeat(256);
      const conversation = {
        ...validConversation,
        title: longTitle,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Title cannot exceed 255 characters",
        );
      }
    });
  });

  describe("invalid chat_mode field", () => {
    it("should reject non-string chat_mode", () => {
      const conversation = {
        ...validConversation,
        chat_mode: 123,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Chat mode must be either 'manual' or 'round-robin'",
        );
      }
    });

    it("should reject invalid chat_mode values", () => {
      const invalidValues = ["invalid", "auto", "random", ""];

      for (const invalidValue of invalidValues) {
        const conversation = {
          ...validConversation,
          chat_mode: invalidValue,
        };
        const result = conversationSchema.safeParse(conversation);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            "Chat mode must be either 'manual' or 'round-robin'",
          );
        }
      }
    });

    it("should reject null chat_mode", () => {
      const conversation = {
        ...validConversation,
        chat_mode: null,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Chat mode must be either 'manual' or 'round-robin'",
        );
      }
    });

    it("should reject boolean chat_mode", () => {
      const conversation = {
        ...validConversation,
        chat_mode: true,
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Chat mode must be either 'manual' or 'round-robin'",
        );
      }
    });

    it("should reject array chat_mode", () => {
      const conversation = {
        ...validConversation,
        chat_mode: ["manual"],
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Chat mode must be either 'manual' or 'round-robin'",
        );
      }
    });
  });

  describe("invalid timestamp fields", () => {
    it("should reject non-string created_at", () => {
      const conversation = {
        ...validConversation,
        created_at: Date.now(),
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Created date must be a string",
        );
      }
    });

    it("should reject invalid created_at format", () => {
      const conversation = {
        ...validConversation,
        created_at: "not-a-date",
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Invalid creation timestamp",
        );
      }
    });

    it("should reject non-string updated_at", () => {
      const conversation = {
        ...validConversation,
        updated_at: Date.now(),
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Updated date must be a string",
        );
      }
    });

    it("should reject invalid updated_at format", () => {
      const conversation = {
        ...validConversation,
        updated_at: "not-a-date",
      };
      const result = conversationSchema.safeParse(conversation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Invalid update timestamp",
        );
      }
    });
  });

  describe("missing fields", () => {
    it("should reject missing id", () => {
      const { id, ...conversationWithoutId } = validConversation;
      const result = conversationSchema.safeParse(conversationWithoutId);
      expect(result.success).toBe(false);
    });

    it("should reject missing title", () => {
      const { title, ...conversationWithoutTitle } = validConversation;
      const result = conversationSchema.safeParse(conversationWithoutTitle);
      expect(result.success).toBe(false);
    });

    it("should reject missing created_at", () => {
      const { created_at, ...conversationWithoutCreatedAt } = validConversation;
      const result = conversationSchema.safeParse(conversationWithoutCreatedAt);
      expect(result.success).toBe(false);
    });

    it("should reject missing updated_at", () => {
      const { updated_at, ...conversationWithoutUpdatedAt } = validConversation;
      const result = conversationSchema.safeParse(conversationWithoutUpdatedAt);
      expect(result.success).toBe(false);
    });
  });
});

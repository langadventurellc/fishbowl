import { createConversationInputSchema } from "../createConversationInputSchema";

describe("createConversationInputSchema", () => {
  describe("valid inputs", () => {
    it("should validate empty object (no title provided)", () => {
      const input = {};
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate with valid title", () => {
      const input = { title: "Test Conversation" };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should trim whitespace from title", () => {
      const input = { title: "  Test Conversation  " };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Test Conversation");
      }
    });

    it("should accept maximum length title", () => {
      const longTitle = "a".repeat(255);
      const input = { title: longTitle };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept single character title", () => {
      const input = { title: "a" };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid title field", () => {
    it("should reject non-string title", () => {
      const input = { title: 123 };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });

    it("should reject empty title", () => {
      const input = { title: "" };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title cannot be empty");
      }
    });

    it("should reject whitespace-only title", () => {
      const input = { title: "   " };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title cannot be empty");
      }
    });

    it("should reject title exceeding 255 characters", () => {
      const longTitle = "a".repeat(256);
      const input = { title: longTitle };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Title cannot exceed 255 characters",
        );
      }
    });

    it("should reject null title", () => {
      const input = { title: null };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });

    it("should accept undefined title explicitly set", () => {
      const input = { title: undefined };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should accept object with unknown properties", () => {
      const input = { title: "Test", unknownProp: "value" };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // Unknown properties should be stripped
        expect(result.data).toEqual({ title: "Test" });
      }
    });

    it("should handle boolean false title", () => {
      const input = { title: false };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });

    it("should handle array title", () => {
      const input = { title: ["test"] };
      const result = createConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });
  });
});

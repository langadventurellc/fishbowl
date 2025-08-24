import { updateConversationInputSchema } from "../updateConversationInputSchema";

describe("updateConversationInputSchema", () => {
  describe("valid inputs", () => {
    it("should validate with valid title", () => {
      const input = { title: "Updated Conversation" };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should trim whitespace from title", () => {
      const input = { title: "  Updated Conversation  " };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Updated Conversation");
      }
    });

    it("should accept maximum length title", () => {
      const longTitle = "a".repeat(255);
      const input = { title: longTitle };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept single character title", () => {
      const input = { title: "a" };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs - empty object", () => {
    it("should reject empty object (no fields provided)", () => {
      const input = {};
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "At least one field must be provided for update",
        );
      }
    });

    it("should reject object with only undefined values", () => {
      const input = { title: undefined };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "At least one field must be provided for update",
        );
      }
    });
  });

  describe("invalid title field", () => {
    it("should reject non-string title", () => {
      const input = { title: 123 };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });

    it("should reject empty title", () => {
      const input = { title: "" };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title cannot be empty");
      }
    });

    it("should reject whitespace-only title", () => {
      const input = { title: "   " };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title cannot be empty");
      }
    });

    it("should reject title exceeding 255 characters", () => {
      const longTitle = "a".repeat(256);
      const input = { title: longTitle };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Title cannot exceed 255 characters",
        );
      }
    });

    it("should reject null title", () => {
      const input = { title: null };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });

    it("should reject boolean title", () => {
      const input = { title: false };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });

    it("should reject array title", () => {
      const input = { title: ["test"] };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title must be a string");
      }
    });
  });

  describe("edge cases", () => {
    it("should accept object with unknown properties", () => {
      const input = { title: "Test", unknownProp: "value" };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // Unknown properties should be stripped
        expect(result.data).toEqual({ title: "Test" });
      }
    });
  });

  describe("partial update validation", () => {
    it("should validate when title is provided", () => {
      const input = { title: "New Title" };
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should require at least one valid field", () => {
      const input = {};
      const result = updateConversationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "At least one field must be provided for update",
        );
      }
    });
  });
});

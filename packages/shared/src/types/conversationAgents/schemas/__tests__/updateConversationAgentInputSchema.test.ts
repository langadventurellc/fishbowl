import { updateConversationAgentInputSchema } from "../updateConversationAgentInputSchema";

describe("updateConversationAgentInputSchema", () => {
  describe("valid inputs", () => {
    it("should validate input with only is_active", () => {
      const input = { is_active: true };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate input with only display_order", () => {
      const input = { display_order: 5 };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should validate input with both fields", () => {
      const input = { is_active: false, display_order: 10 };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept zero as display_order", () => {
      const input = { display_order: 0 };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept both boolean values for is_active", () => {
      const trueInput = { is_active: true };
      const falseInput = { is_active: false };

      expect(
        updateConversationAgentInputSchema.safeParse(trueInput).success,
      ).toBe(true);
      expect(
        updateConversationAgentInputSchema.safeParse(falseInput).success,
      ).toBe(true);
    });
  });

  describe("invalid is_active field", () => {
    it("should reject non-boolean is_active", () => {
      const input = { is_active: "true" };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Active status must be a boolean",
        );
      }
    });

    it("should reject numeric is_active", () => {
      const input = { is_active: 1 };
      const result = updateConversationAgentInputSchema.safeParse(input);
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
      const input = { display_order: "5" };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order must be a number",
        );
      }
    });

    it("should reject non-integer display_order", () => {
      const input = { display_order: 1.5 };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order must be an integer",
        );
      }
    });

    it("should reject negative display_order", () => {
      const input = { display_order: -1 };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Display order cannot be negative",
        );
      }
    });
  });

  describe("empty input validation", () => {
    it("should reject completely empty input", () => {
      const input = {};
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "At least one field must be provided for update",
        );
      }
    });

    it("should reject input with undefined values", () => {
      const input = { is_active: undefined, display_order: undefined };
      const result = updateConversationAgentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "At least one field must be provided for update",
        );
      }
    });
  });

  describe("null and undefined handling", () => {
    it("should reject null values", () => {
      const inputWithNullActive = { is_active: null };
      const inputWithNullOrder = { display_order: null };

      expect(
        updateConversationAgentInputSchema.safeParse(inputWithNullActive)
          .success,
      ).toBe(false);
      expect(
        updateConversationAgentInputSchema.safeParse(inputWithNullOrder)
          .success,
      ).toBe(false);
    });
  });
});

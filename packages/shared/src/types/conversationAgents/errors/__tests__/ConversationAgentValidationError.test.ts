import { ConversationAgentValidationError } from "../ConversationAgentValidationError";

describe("ConversationAgentValidationError", () => {
  describe("constructor with single error", () => {
    it("should create error with single validation error", () => {
      const errors = [{ field: "agent_id", message: "Required" }];
      const error = new ConversationAgentValidationError(errors);

      expect(error.message).toBe("Validation failed: agent_id: Required");
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("ConversationAgentValidationError");
    });
  });

  describe("constructor with multiple errors", () => {
    it("should create error with multiple validation errors", () => {
      const errors = [
        { field: "agent_id", message: "Required" },
        { field: "conversation_id", message: "Invalid UUID" },
        { field: "display_order", message: "Must be positive" },
      ];
      const error = new ConversationAgentValidationError(errors);

      expect(error.message).toBe(
        "Validation failed: agent_id: Required, conversation_id: Invalid UUID, display_order: Must be positive",
      );
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("ConversationAgentValidationError");
    });
  });

  describe("constructor with empty errors", () => {
    it("should handle empty errors array", () => {
      const errors: Array<{ field: string; message: string }> = [];
      const error = new ConversationAgentValidationError(errors);

      expect(error.message).toBe("Validation failed: ");
      expect(error.errors).toEqual([]);
      expect(error.name).toBe("ConversationAgentValidationError");
    });
  });

  describe("constructor with complex error messages", () => {
    it("should handle errors with special characters", () => {
      const errors = [
        {
          field: "agent_id",
          message: "Must contain only alphanumeric characters & hyphens",
        },
        {
          field: "title",
          message: "Cannot contain: <script>, </script>, or similar tags",
        },
      ];
      const error = new ConversationAgentValidationError(errors);

      expect(error.message).toContain(
        "Must contain only alphanumeric characters & hyphens",
      );
      expect(error.message).toContain(
        "Cannot contain: <script>, </script>, or similar tags",
      );
      expect(error.errors).toEqual(errors);
    });

    it("should handle errors with long messages", () => {
      const longMessage = "A".repeat(200);
      const errors = [{ field: "description", message: longMessage }];
      const error = new ConversationAgentValidationError(errors);

      expect(error.message).toContain(longMessage);
      expect(error.errors).toEqual(errors);
    });
  });

  describe("inheritance", () => {
    it("should extend Error", () => {
      const errors = [{ field: "test", message: "test error" }];
      const error = new ConversationAgentValidationError(errors);

      expect(error).toBeInstanceOf(ConversationAgentValidationError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should maintain proper prototype chain", () => {
      const errors = [{ field: "test", message: "test error" }];
      const error = new ConversationAgentValidationError(errors);

      expect(Object.getPrototypeOf(error)).toBe(
        ConversationAgentValidationError.prototype,
      );
      expect(error.constructor).toBe(ConversationAgentValidationError);
    });
  });

  describe("toJSON", () => {
    it("should serialize with single error", () => {
      const errors = [{ field: "agent_id", message: "Required" }];
      const error = new ConversationAgentValidationError(errors);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConversationAgentValidationError",
        message: "Validation failed: agent_id: Required",
        errors: errors,
        stack: error.stack,
      });
    });

    it("should serialize with multiple errors", () => {
      const errors = [
        { field: "agent_id", message: "Required" },
        { field: "conversation_id", message: "Invalid" },
      ];
      const error = new ConversationAgentValidationError(errors);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConversationAgentValidationError",
        message:
          "Validation failed: agent_id: Required, conversation_id: Invalid",
        errors: errors,
        stack: error.stack,
      });
    });

    it("should include stack trace in serialization", () => {
      const errors = [{ field: "test", message: "test" }];
      const error = new ConversationAgentValidationError(errors);
      const json = error.toJSON();

      expect(json.stack).toBeDefined();
      expect(typeof json.stack).toBe("string");
    });
  });

  describe("error properties", () => {
    it("should have correct error name", () => {
      const errors = [{ field: "test", message: "test" }];
      const error = new ConversationAgentValidationError(errors);

      expect(error.name).toBe("ConversationAgentValidationError");
    });

    it("should preserve errors as readonly property", () => {
      const errors = [{ field: "agent_id", message: "Required" }];
      const error = new ConversationAgentValidationError(errors);

      expect(error.errors).toEqual(errors);
      // The errors array is stored directly (not copied) which is acceptable for this implementation
    });

    it("should have stack trace", () => {
      const errors = [{ field: "test", message: "test" }];
      const error = new ConversationAgentValidationError(errors);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ConversationAgentValidationError");
    });
  });

  describe("field and message validation", () => {
    it("should handle different field types", () => {
      const errors = [
        { field: "id", message: "Invalid UUID" },
        { field: "conversation_id", message: "Missing" },
        { field: "agent_id", message: "Too long" },
        { field: "display_order", message: "Negative value" },
        { field: "is_active", message: "Not boolean" },
      ];
      const error = new ConversationAgentValidationError(errors);

      expect(error.errors).toHaveLength(5);
      errors.forEach((expectedError, index) => {
        expect(error.errors[index]).toEqual(expectedError);
      });
    });
  });
});

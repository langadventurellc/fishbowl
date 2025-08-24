import { ConversationValidationError } from "../ConversationValidationError";

describe("ConversationValidationError", () => {
  describe("constructor", () => {
    it("should create error with single validation error", () => {
      const errors = [{ field: "title", message: "Title is required" }];
      const error = new ConversationValidationError(errors);

      expect(error.message).toBe("Validation failed: title: Title is required");
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe("ConversationValidationError");
    });

    it("should create error with multiple validation errors", () => {
      const errors = [
        { field: "title", message: "Title is too long" },
        { field: "id", message: "Invalid UUID format" },
      ];
      const error = new ConversationValidationError(errors);

      expect(error.message).toBe(
        "Validation failed: title: Title is too long, id: Invalid UUID format",
      );
      expect(error.errors).toEqual(errors);
    });

    it("should handle empty errors array", () => {
      const errors: Array<{ field: string; message: string }> = [];
      const error = new ConversationValidationError(errors);

      expect(error.message).toBe("Validation failed: ");
      expect(error.errors).toEqual(errors);
    });

    it("should handle various field names and messages", () => {
      const errors = [
        { field: "created_at", message: "Invalid date format" },
        { field: "updated_at", message: "Cannot be in the future" },
        { field: "title", message: "Must be between 1 and 255 characters" },
      ];
      const error = new ConversationValidationError(errors);

      expect(error.message).toContain("created_at: Invalid date format");
      expect(error.message).toContain("updated_at: Cannot be in the future");
      expect(error.message).toContain(
        "title: Must be between 1 and 255 characters",
      );
      expect(error.errors).toEqual(errors);
    });
  });

  describe("inheritance", () => {
    it("should extend Error", () => {
      const errors = [{ field: "test", message: "test error" }];
      const error = new ConversationValidationError(errors);

      expect(error).toBeInstanceOf(ConversationValidationError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should maintain proper prototype chain", () => {
      const errors = [{ field: "test", message: "test error" }];
      const error = new ConversationValidationError(errors);

      expect(Object.getPrototypeOf(error)).toBe(
        ConversationValidationError.prototype,
      );
      expect(error.constructor).toBe(ConversationValidationError);
    });
  });

  describe("toJSON", () => {
    it("should serialize correctly with single error", () => {
      const errors = [{ field: "title", message: "Title is required" }];
      const error = new ConversationValidationError(errors);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConversationValidationError",
        message: "Validation failed: title: Title is required",
        errors: [{ field: "title", message: "Title is required" }],
        stack: error.stack,
      });
    });

    it("should serialize correctly with multiple errors", () => {
      const errors = [
        { field: "title", message: "Too long" },
        { field: "id", message: "Invalid format" },
      ];
      const error = new ConversationValidationError(errors);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConversationValidationError",
        message: "Validation failed: title: Too long, id: Invalid format",
        errors: errors,
        stack: error.stack,
      });
    });

    it("should include stack trace in serialization", () => {
      const errors = [{ field: "test", message: "test error" }];
      const error = new ConversationValidationError(errors);
      const json = error.toJSON();

      expect(json.stack).toBeDefined();
      expect(typeof json.stack).toBe("string");
    });
  });

  describe("error properties", () => {
    it("should have correct error name", () => {
      const errors = [{ field: "test", message: "test error" }];
      const error = new ConversationValidationError(errors);

      expect(error.name).toBe("ConversationValidationError");
    });

    it("should preserve errors as readonly property", () => {
      const errors = [{ field: "title", message: "Required" }];
      const error = new ConversationValidationError(errors);

      expect(error.errors).toEqual(errors);
      // TypeScript enforces readonly at compile time
      // Runtime property is still writable but TypeScript prevents reassignment
    });

    it("should have stack trace", () => {
      const errors = [{ field: "test", message: "test error" }];
      const error = new ConversationValidationError(errors);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ConversationValidationError");
    });
  });

  describe("edge cases", () => {
    it("should handle errors with special characters in messages", () => {
      const errors = [
        { field: "title", message: "Contains invalid characters: <script>" },
        { field: "description", message: 'Cannot contain: & < > "' },
      ];
      const error = new ConversationValidationError(errors);

      expect(error.errors).toEqual(errors);
      expect(error.message).toContain("Contains invalid characters: <script>");
    });

    it("should handle very long field names and messages", () => {
      const longFieldName = "very".repeat(50);
      const longMessage =
        "This is a very long validation error message that goes on and on".repeat(
          10,
        );
      const errors = [{ field: longFieldName, message: longMessage }];
      const error = new ConversationValidationError(errors);

      expect(error.errors).toHaveLength(1);
      expect(error.errors[0]?.field).toBe(longFieldName);
      expect(error.errors[0]?.message).toBe(longMessage);
    });
  });
});

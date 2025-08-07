import {
  LlmConfigError,
  DuplicateConfigError,
  ConfigNotFoundError,
  InvalidConfigError,
  ConfigOperationError,
} from "../index";

describe("LlmConfigError", () => {
  describe("Base LlmConfigError", () => {
    it("should set all properties correctly", () => {
      const cause = new Error("Original error");
      const error = new LlmConfigError(
        "Test message",
        "TEST_CODE",
        { testProp: "value" },
        cause,
      );

      expect(error.message).toBe("Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.context).toEqual({ testProp: "value" });
      expect(error.cause).toBe(cause);
      expect(error.name).toBe("LlmConfigError");
    });

    it("should work without optional parameters", () => {
      const error = new LlmConfigError("Test message", "TEST_CODE");

      expect(error.message).toBe("Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.context).toBeUndefined();
      expect(error.cause).toBeUndefined();
    });

    it("should be instance of Error", () => {
      const error = new LlmConfigError("Test", "TEST_CODE");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LlmConfigError);
    });

    it("should have proper stack trace", () => {
      const error = new LlmConfigError("Test", "TEST_CODE");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack).toContain("LlmConfigError");
    });

    describe("toJSON", () => {
      it("should serialize error with all properties", () => {
        const cause = new Error("Original error");
        const error = new LlmConfigError(
          "Test message",
          "TEST_CODE",
          { testProp: "value" },
          cause,
        );
        const json = error.toJSON();

        expect(json).toEqual({
          name: "LlmConfigError",
          message: "Test message",
          code: "TEST_CODE",
          context: { testProp: "value" },
          cause: "Original error",
        });
      });

      it("should serialize error without optional properties", () => {
        const error = new LlmConfigError("Test", "TEST_CODE");
        const json = error.toJSON();

        expect(json).toEqual({
          name: "LlmConfigError",
          message: "Test",
          code: "TEST_CODE",
          context: undefined,
          cause: undefined,
        });
      });

      it("should not include stack trace in JSON", () => {
        const error = new LlmConfigError("Test", "TEST_CODE");
        const json = error.toJSON();

        expect(json).not.toHaveProperty("stack");
      });

      it("should be properly serializable", () => {
        const error = new LlmConfigError("Test", "TEST_CODE", { data: "test" });
        const json = error.toJSON();

        expect(() => JSON.stringify(json)).not.toThrow();
        const serialized = JSON.stringify(json);
        expect(() => JSON.parse(serialized)).not.toThrow();
      });

      it("should handle circular reference in context safely", () => {
        const circularContext: any = { name: "test" };
        circularContext.self = circularContext;

        const error = new LlmConfigError("Test", "TEST_CODE", circularContext);
        const json = error.toJSON();

        // The toJSON method itself doesn't throw, but JSON.stringify may
        expect(json.context).toBe(circularContext);
        expect(json.name).toBe("LlmConfigError");
      });
    });
  });

  describe("DuplicateConfigError", () => {
    it("should create error with correct message and code", () => {
      const error = new DuplicateConfigError("My Config");

      expect(error.message).toBe(
        "Configuration with name 'My Config' already exists",
      );
      expect(error.code).toBe("DUPLICATE_CONFIG_NAME");
      expect(error.context).toEqual({ attemptedName: "My Config" });
      expect(error.name).toBe("DuplicateConfigError");
    });

    it("should extend LlmConfigError", () => {
      const error = new DuplicateConfigError("Test");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LlmConfigError);
      expect(error).toBeInstanceOf(DuplicateConfigError);
    });

    it("should work with cause parameter", () => {
      const cause = new Error("Database error");
      const error = new DuplicateConfigError("Test Config", cause);

      expect(error.cause).toBe(cause);
      expect(error.message).toBe(
        "Configuration with name 'Test Config' already exists",
      );
    });

    it("should serialize properly", () => {
      const error = new DuplicateConfigError("My Config");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "DuplicateConfigError",
        message: "Configuration with name 'My Config' already exists",
        code: "DUPLICATE_CONFIG_NAME",
        context: { attemptedName: "My Config" },
        cause: undefined,
      });
    });
  });

  describe("ConfigNotFoundError", () => {
    it("should create error with correct message and code", () => {
      const error = new ConfigNotFoundError("uuid-123");

      expect(error.message).toBe("Configuration with ID 'uuid-123' not found");
      expect(error.code).toBe("CONFIG_NOT_FOUND");
      expect(error.context).toEqual({ configId: "uuid-123" });
      expect(error.name).toBe("ConfigNotFoundError");
    });

    it("should extend LlmConfigError", () => {
      const error = new ConfigNotFoundError("test-id");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LlmConfigError);
      expect(error).toBeInstanceOf(ConfigNotFoundError);
    });

    it("should work with cause parameter", () => {
      const cause = new Error("Storage error");
      const error = new ConfigNotFoundError("test-id", cause);

      expect(error.cause).toBe(cause);
      expect(error.message).toBe("Configuration with ID 'test-id' not found");
    });
  });

  describe("InvalidConfigError", () => {
    it("should create error with validation details", () => {
      const validationErrors = { field: "apiKey", issue: "required" };
      const error = new InvalidConfigError(
        "Validation failed",
        validationErrors,
      );

      expect(error.message).toBe("Validation failed");
      expect(error.code).toBe("INVALID_CONFIG_DATA");
      expect(error.context).toEqual({ validationErrors });
      expect(error.name).toBe("InvalidConfigError");
    });

    it("should extend LlmConfigError", () => {
      const error = new InvalidConfigError("Validation failed");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LlmConfigError);
      expect(error).toBeInstanceOf(InvalidConfigError);
    });

    it("should work without validation errors", () => {
      const error = new InvalidConfigError("Invalid data");

      expect(error.message).toBe("Invalid data");
      expect(error.context).toEqual({ validationErrors: undefined });
    });

    it("should work with cause parameter", () => {
      const cause = new Error("Schema error");
      const error = new InvalidConfigError(
        "Validation failed",
        { field: "test" },
        cause,
      );

      expect(error.cause).toBe(cause);
      expect(error.context).toEqual({ validationErrors: { field: "test" } });
    });
  });

  describe("ConfigOperationError", () => {
    it("should create error with operation details", () => {
      const error = new ConfigOperationError("create", "Storage unavailable", {
        provider: "openai",
      });

      expect(error.message).toBe("Storage unavailable");
      expect(error.code).toBe("CONFIG_OPERATION_FAILED");
      expect(error.context).toEqual({
        operation: "create",
        provider: "openai",
      });
      expect(error.name).toBe("ConfigOperationError");
    });

    it("should extend LlmConfigError", () => {
      const error = new ConfigOperationError("read", "Failed to read");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LlmConfigError);
      expect(error).toBeInstanceOf(ConfigOperationError);
    });

    it("should work without additional context", () => {
      const error = new ConfigOperationError("delete", "Failed to delete");

      expect(error.message).toBe("Failed to delete");
      expect(error.context).toEqual({ operation: "delete" });
    });

    it("should merge operation with additional context", () => {
      const error = new ConfigOperationError("update", "Update failed", {
        configId: "123",
        reason: "locked",
      });

      expect(error.context).toEqual({
        operation: "update",
        configId: "123",
        reason: "locked",
      });
    });

    it("should work with cause parameter", () => {
      const cause = new Error("Network error");
      const error = new ConfigOperationError("sync", "Sync failed", {}, cause);

      expect(error.cause).toBe(cause);
      expect(error.context).toEqual({ operation: "sync" });
    });
  });

  describe("Error immutability", () => {
    it("should have readonly code property", () => {
      const error = new LlmConfigError("Test", "TEST_CODE");

      expect(error.code).toBe("TEST_CODE");
      // Readonly enforcement is checked at TypeScript compile time
    });

    it("should have readonly context property", () => {
      const error = new LlmConfigError("Test", "TEST_CODE", { data: "test" });

      expect(error.context).toEqual({ data: "test" });
      // Readonly enforcement is checked at TypeScript compile time
    });

    it("should have readonly cause property", () => {
      const cause = new Error("Original");
      const error = new LlmConfigError("Test", "TEST_CODE", undefined, cause);

      expect(error.cause).toBe(cause);
      // Readonly enforcement is checked at TypeScript compile time
    });
  });

  describe("Security considerations", () => {
    it("should not expose sensitive data in error messages", () => {
      // Test that API keys or other sensitive data don't appear in errors
      const error = new InvalidConfigError("API key validation failed");

      expect(error.message).not.toContain("sk-");
      expect(error.message).not.toContain("password");
      expect(error.message).not.toContain("token");
    });

    it("should not include sensitive data in context", () => {
      const error = new ConfigOperationError("create", "Failed", {
        provider: "openai",
      });
      const json = error.toJSON();

      expect(JSON.stringify(json)).not.toContain("sk-");
      expect(JSON.stringify(json)).not.toContain("password");
    });
  });

  describe("Error chaining", () => {
    it("should properly chain multiple errors", () => {
      const originalError = new Error("Network timeout");
      const storageError = new Error("Storage failed");
      (storageError as any).cause = originalError;

      const configError = new ConfigOperationError(
        "save",
        "Save operation failed",
        {},
        storageError,
      );

      expect(configError.cause).toBe(storageError);
      expect(configError.toJSON().cause).toBe("Storage failed");
    });

    it("should handle undefined cause gracefully", () => {
      const error = new LlmConfigError("Test", "TEST_CODE", {}, undefined);

      expect(error.cause).toBeUndefined();
      expect(error.toJSON().cause).toBeUndefined();
    });
  });
});

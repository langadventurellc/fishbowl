import type { ConfigurationErrorContext } from "../";
import {
  ConfigurationLoadError,
  ConfigurationValidationError,
  ERROR_MESSAGES,
  ErrorRecovery,
  extractLineNumber,
  HotReloadError,
} from "../";
import type { LlmProviderDefinition } from "../../../../types/llm-providers";
import type { FormattedValidationError } from "../../validation/FormattedValidationError";

describe("ConfigurationErrors", () => {
  const mockFilePath = "/path/to/config.json";
  const developmentContext: ConfigurationErrorContext = {
    environment: "development",
    includeStackTrace: true,
  };
  const productionContext: ConfigurationErrorContext = {
    environment: "production",
    includeStackTrace: false,
  };

  describe("ConfigurationLoadError", () => {
    it("should create error with proper inheritance", () => {
      const error = new ConfigurationLoadError(
        mockFilePath,
        "load",
        "Test error",
        undefined,
        developmentContext,
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ConfigurationLoadError");
      expect(error.message).toBe("Test error");
      expect(error.filePath).toBe(mockFilePath);
      expect(error.operation).toBe("load");
      expect(error.context).toBe(developmentContext);
    });

    it("should maintain backward compatibility with old constructor", () => {
      const validationErrors = [
        { path: "test", message: "test error", code: "invalid" },
      ];
      const error = new ConfigurationLoadError(
        "Test error",
        mockFilePath,
        validationErrors,
        new Error("cause"),
      );

      expect(error.name).toBe("ConfigurationLoadError");
      expect(error.message).toBe("Test error");
      expect(error.filePath).toBe(mockFilePath);
      expect(error.validationErrors).toBe(validationErrors);
    });

    it("should generate recovery suggestions for load operation", () => {
      const cause = new Error("ENOENT: no such file or directory");
      const error = new ConfigurationLoadError(
        mockFilePath,
        "load",
        "File not found",
        cause,
      );

      const suggestions = error.getRecoverySuggestions();
      expect(suggestions).toContain(
        `Create configuration file at '${mockFilePath}'`,
      );
      expect(suggestions).toContain("Use default configuration as fallback");
    });

    it("should generate recovery suggestions for parse operation", () => {
      const error = new ConfigurationLoadError(
        mockFilePath,
        "parse",
        "Invalid JSON",
      );

      const suggestions = error.getRecoverySuggestions();
      expect(suggestions).toContain(
        "Check JSON syntax for missing commas or brackets",
      );
      expect(suggestions).toContain(
        "Validate JSON using an online JSON validator",
      );
    });

    it("should generate recovery suggestions for validate operation", () => {
      const error = new ConfigurationLoadError(
        mockFilePath,
        "validate",
        "Validation failed",
      );

      const suggestions = error.getRecoverySuggestions();
      expect(suggestions).toContain("Review the validation errors below");
      expect(suggestions).toContain("Check field types match expected schemas");
    });

    it("should include cause in detailed message for development", () => {
      const cause = new Error("Original error");
      const error = new ConfigurationLoadError(
        mockFilePath,
        "load",
        "Test error",
        cause,
        developmentContext,
      );

      const detailedMessage = error.getDetailedMessage();
      expect(detailedMessage).toContain("Test error");
      expect(detailedMessage).toContain("Cause: Original error");
    });

    it("should not include cause in detailed message for production", () => {
      const cause = new Error("Original error");
      const error = new ConfigurationLoadError(
        mockFilePath,
        "load",
        "Test error",
        cause,
        productionContext,
      );

      const detailedMessage = error.getDetailedMessage();
      expect(detailedMessage).toContain("Test error");
      expect(detailedMessage).not.toContain("Cause: Original error");
    });

    it("should serialize to JSON with context", () => {
      const error = new ConfigurationLoadError(
        mockFilePath,
        "load",
        "Test error",
        undefined,
        developmentContext,
      );

      const json = error.toJSON();
      expect(json.name).toBe("ConfigurationLoadError");
      expect(json.message).toBe("Test error");
      expect(json.filePath).toBe(mockFilePath);
      expect(json.context).toBe(developmentContext);
      expect(json.timestamp).toBeDefined();
    });

    it("should include stack trace in development", () => {
      const error = new ConfigurationLoadError(
        mockFilePath,
        "load",
        "Test error",
        undefined,
        developmentContext,
      );

      const json = error.toJSON();
      expect(json.stack).toBeDefined();
    });

    it("should not include stack trace in production", () => {
      const error = new ConfigurationLoadError(
        mockFilePath,
        "load",
        "Test error",
        undefined,
        productionContext,
      );

      const json = error.toJSON();
      expect(json.stack).toBeUndefined();
    });
  });

  describe("ConfigurationValidationError", () => {
    const mockValidationErrors: FormattedValidationError[] = [
      {
        path: "providers.0.id",
        field: "id",
        message: "Required field is missing",
        code: "invalid_type",
        line: 5,
      },
      {
        path: "providers.0.name",
        field: "name",
        message: "Must be a string",
        code: "invalid_type",
        line: 7,
      },
    ];

    it("should create validation error with proper inheritance", () => {
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
      );

      expect(error).toBeInstanceOf(ConfigurationLoadError);
      expect(error.name).toBe("ConfigurationValidationError");
      expect(error.operation).toBe("validate");
      expect(error.validationErrors).toBe(mockValidationErrors);
    });

    it("should generate appropriate error message", () => {
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
      );

      expect(error.message).toContain("Configuration validation failed");
      expect(error.message).toContain(mockFilePath);
      expect(error.message).toContain("2 errors");
    });

    it("should handle single error message", () => {
      const singleError = [mockValidationErrors[0]!];
      const error = new ConfigurationValidationError(mockFilePath, singleError);

      expect(error.message).not.toContain("errors");
      expect(error.message).toContain("1 error");
    });

    it("should group field errors correctly", () => {
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
      );

      const fieldErrors = error.getFieldErrors();
      expect(fieldErrors.id).toEqual(["Required field is missing"]);
      expect(fieldErrors.name).toEqual(["Must be a string"]);
    });

    it("should return first error", () => {
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
      );

      const firstError = error.getFirstError();
      expect(firstError).toBe(mockValidationErrors[0]);
    });

    it("should return null for first error when no errors", () => {
      const error = new ConfigurationValidationError(mockFilePath, []);

      const firstError = error.getFirstError();
      expect(firstError).toBeNull();
    });

    it("should detect field errors correctly", () => {
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
      );

      expect(error.hasFieldError("providers.0.id")).toBe(true);
      expect(error.hasFieldError("id")).toBe(true);
      expect(error.hasFieldError("nonexistent")).toBe(false);
    });

    it("should generate detailed message with line numbers", () => {
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
      );

      const detailedMessage = error.getDetailedMessage();
      expect(detailedMessage).toContain("Validation errors:");
      expect(detailedMessage).toContain(
        "providers.0.id: Required field is missing (line 5)",
      );
      expect(detailedMessage).toContain(
        "providers.0.name: Must be a string (line 7)",
      );
    });

    it("should include validation errors in JSON output", () => {
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
      );

      const json = error.toJSON();
      expect(json.validationErrors).toBe(mockValidationErrors);
    });

    it("should include raw data when configured", () => {
      const rawData = { invalid: "data" };
      const context: ConfigurationErrorContext = {
        environment: "development",
        includeRawData: true,
      };
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
        rawData,
        context,
      );

      const json = error.toJSON();
      expect(json.rawData).toBe(rawData);
    });

    it("should not include raw data when not configured", () => {
      const rawData = { invalid: "data" };
      const context: ConfigurationErrorContext = {
        environment: "production",
        includeRawData: false,
      };
      const error = new ConfigurationValidationError(
        mockFilePath,
        mockValidationErrors,
        rawData,
        context,
      );

      const json = error.toJSON();
      expect(json.rawData).toBeUndefined();
    });
  });

  describe("HotReloadError", () => {
    const mockLastValidConfig: LlmProviderDefinition[] = [
      {
        id: "test-provider",
        name: "Test Provider",
        models: { "test-model": "Test Model" },
        configuration: { fields: [] },
      },
    ];

    it("should create hot-reload error with proper inheritance", () => {
      const cause = new Error("File changed");
      const error = new HotReloadError(
        mockFilePath,
        1,
        cause,
        mockLastValidConfig,
      );

      expect(error).toBeInstanceOf(ConfigurationLoadError);
      expect(error.name).toBe("HotReloadError");
      expect(error.operation).toBe("load");
      expect(error.reloadAttempt).toBe(1);
      expect(error.lastValidConfiguration).toBe(mockLastValidConfig);
    });

    it("should generate appropriate error message", () => {
      const cause = new Error("File changed");
      const error = new HotReloadError(mockFilePath, 2, cause);

      expect(error.message).toContain("Hot-reload failed");
      expect(error.message).toContain(mockFilePath);
      expect(error.message).toContain("(attempt 2)");
    });

    it("should detect valid fallback correctly", () => {
      const errorWithFallback = new HotReloadError(
        mockFilePath,
        1,
        new Error("test"),
        mockLastValidConfig,
      );
      const errorWithoutFallback = new HotReloadError(
        mockFilePath,
        1,
        new Error("test"),
      );

      expect(errorWithFallback.hasValidFallback()).toBe(true);
      expect(errorWithoutFallback.hasValidFallback()).toBe(false);
    });

    it("should determine retry eligibility correctly", () => {
      const earlyAttempt = new HotReloadError(
        mockFilePath,
        1,
        new Error("test"),
      );
      const lateAttempt = new HotReloadError(
        mockFilePath,
        4,
        new Error("test"),
      );

      expect(earlyAttempt.shouldRetryReload()).toBe(true);
      expect(lateAttempt.shouldRetryReload()).toBe(false);
    });

    it("should calculate exponential backoff delay", () => {
      const attempt1 = new HotReloadError(mockFilePath, 1, new Error("test"));
      const attempt2 = new HotReloadError(mockFilePath, 2, new Error("test"));
      const attempt3 = new HotReloadError(mockFilePath, 3, new Error("test"));

      expect(attempt1.getRetryDelay()).toBe(1000); // 1s
      expect(attempt2.getRetryDelay()).toBe(2000); // 2s
      expect(attempt3.getRetryDelay()).toBe(4000); // 4s
    });

    it("should include fallback info in recovery suggestions", () => {
      const error = new HotReloadError(
        mockFilePath,
        1,
        new Error("test"),
        mockLastValidConfig,
      );

      const suggestions = error.getRecoverySuggestions();
      expect(suggestions).toContain(
        "Using last valid configuration as fallback",
      );
    });

    it("should include retry info in recovery suggestions", () => {
      const error = new HotReloadError(mockFilePath, 1, new Error("test"));

      const suggestions = error.getRecoverySuggestions();
      expect(suggestions).toContain("Will retry in 1000ms");
    });

    it("should indicate max attempts reached", () => {
      const error = new HotReloadError(mockFilePath, 4, new Error("test"));

      const suggestions = error.getRecoverySuggestions();
      expect(suggestions).toContain("Maximum retry attempts reached");
      expect(suggestions).toContain("Manual intervention required");
    });

    it("should include retry information in JSON output", () => {
      const error = new HotReloadError(mockFilePath, 2, new Error("test"));

      const json = error.toJSON();
      expect(json.reloadAttempt).toBe(2);
      expect(json.hasValidFallback).toBe(false);
      expect(json.shouldRetry).toBe(true);
      expect(json.retryDelay).toBe(2000);
    });
  });

  describe("ErrorRecovery", () => {
    describe("suggestionsForError", () => {
      it("should provide fallback suggestion for HotReloadError with valid config", () => {
        const mockConfig = [
          {
            id: "test",
            name: "Test",
            models: {},
            configuration: { fields: [] },
          },
        ];
        const error = new HotReloadError(
          mockFilePath,
          1,
          new Error("test"),
          mockConfig,
        );

        const suggestions = ErrorRecovery.suggestionsForError(error);
        expect(suggestions).toHaveLength(1);
        expect(suggestions[0]!.type).toBe("fallback");
        expect(suggestions[0]!.message).toContain("last valid configuration");
      });

      it("should provide user action for ConfigurationValidationError", () => {
        const validationErrors: FormattedValidationError[] = [
          {
            path: "test",
            field: "testField",
            message: "test error",
            code: "invalid",
          },
        ];
        const error = new ConfigurationValidationError(
          mockFilePath,
          validationErrors,
        );

        const suggestions = ErrorRecovery.suggestionsForError(error);
        expect(suggestions).toHaveLength(1);
        expect(suggestions[0]!.type).toBe("user_action");
        expect(suggestions[0]!.message).toContain("Fix validation error");
        expect(suggestions[0]!.message).toContain("testField");
      });

      it("should provide auto-fix suggestion for file not found", () => {
        const cause = new Error("ENOENT: no such file");
        const error = new ConfigurationLoadError(
          mockFilePath,
          "load",
          "File not found",
          cause,
        );

        const suggestions = ErrorRecovery.suggestionsForError(error);
        expect(suggestions).toHaveLength(1);
        expect(suggestions[0]!.type).toBe("auto_fix");
        expect(suggestions[0]!.message).toContain(
          "Create default configuration",
        );
        expect(suggestions[0]!.action).toBeDefined();
      });

      it("should provide user action for permission denied", () => {
        const cause = new Error("EACCES: permission denied");
        const error = new ConfigurationLoadError(
          mockFilePath,
          "load",
          "Permission denied",
          cause,
        );

        const suggestions = ErrorRecovery.suggestionsForError(error);
        expect(suggestions).toHaveLength(1);
        expect(suggestions[0]!.type).toBe("user_action");
        expect(suggestions[0]!.message).toContain("Check file permissions");
      });
    });

    describe("canRecover", () => {
      it("should return true for file not found errors", () => {
        const cause = new Error("ENOENT: no such file");
        const error = new ConfigurationLoadError(
          mockFilePath,
          "load",
          "File not found",
          cause,
        );

        expect(ErrorRecovery.canRecover(error)).toBe(true);
      });

      it("should return true for HotReloadError with fallback", () => {
        const mockConfig = [
          {
            id: "test",
            name: "Test",
            models: {},
            configuration: { fields: [] },
          },
        ];
        const error = new HotReloadError(
          mockFilePath,
          1,
          new Error("test"),
          mockConfig,
        );

        expect(ErrorRecovery.canRecover(error)).toBe(true);
      });

      it("should return true for validation errors", () => {
        const validationErrors: FormattedValidationError[] = [
          { path: "test", field: "test", message: "error", code: "invalid" },
        ];
        const error = new ConfigurationValidationError(
          mockFilePath,
          validationErrors,
        );

        expect(ErrorRecovery.canRecover(error)).toBe(true);
      });

      it("should return false for generic errors", () => {
        const error = new ConfigurationLoadError(
          mockFilePath,
          "parse",
          "Generic error",
        );

        expect(ErrorRecovery.canRecover(error)).toBe(false);
      });
    });

    describe("attemptRecovery", () => {
      it("should recover from file not found with empty configuration", async () => {
        const cause = new Error("ENOENT: no such file");
        const error = new ConfigurationLoadError(
          mockFilePath,
          "load",
          "File not found",
          cause,
        );

        const result = await ErrorRecovery.attemptRecovery(error);
        expect(result.success).toBe(true);
        expect(result.fallbackData).toEqual([]);
        expect(result.appliedFixes).toContain(
          "Created empty configuration fallback",
        );
      });

      it("should not recover from validation errors", async () => {
        const validationErrors: FormattedValidationError[] = [
          { path: "test", field: "test", message: "error", code: "invalid" },
        ];
        const error = new ConfigurationValidationError(
          mockFilePath,
          validationErrors,
        );

        const result = await ErrorRecovery.attemptRecovery(error);
        expect(result.success).toBe(false);
        expect(result.remainingErrors).toContain(error);
      });

      it("should recover from hot-reload error with fallback", async () => {
        const mockConfig = [
          {
            id: "test",
            name: "Test",
            models: {},
            configuration: { fields: [] },
          },
        ];
        const error = new HotReloadError(
          mockFilePath,
          1,
          new Error("test"),
          mockConfig,
        );

        const result = await ErrorRecovery.attemptRecovery(error);
        expect(result.success).toBe(true);
        expect(result.fallbackData).toBe(mockConfig);
        expect(result.appliedFixes).toContain(
          "Reverted to last valid configuration",
        );
      });

      it("should not recover from parse errors", async () => {
        const error = new ConfigurationLoadError(
          mockFilePath,
          "parse",
          "Invalid JSON",
        );

        const result = await ErrorRecovery.attemptRecovery(error);
        expect(result.success).toBe(false);
        expect(result.fallbackData).toEqual([]);
        expect(result.remainingErrors).toContain(error);
      });

      it("should not recover from unknown error types", async () => {
        const error = new ConfigurationLoadError(
          mockFilePath,
          "load",
          "Unknown error",
        );

        const result = await ErrorRecovery.attemptRecovery(error);
        expect(result.success).toBe(false);
        expect(result.remainingErrors).toContain(error);
      });
    });
  });

  describe("ERROR_MESSAGES", () => {
    it("should generate file not found message", () => {
      const message = ERROR_MESSAGES.FILE_NOT_FOUND(mockFilePath);
      expect(message).toContain(mockFilePath);
      expect(message).toContain("not found");
    });

    it("should generate invalid JSON message without line number", () => {
      const message = ERROR_MESSAGES.INVALID_JSON(mockFilePath);
      expect(message).toContain(mockFilePath);
      expect(message).toContain("Invalid JSON syntax");
      expect(message).not.toContain("line");
    });

    it("should generate invalid JSON message with line number", () => {
      const message = ERROR_MESSAGES.INVALID_JSON(mockFilePath, 5);
      expect(message).toContain(mockFilePath);
      expect(message).toContain("Invalid JSON syntax");
      expect(message).toContain("line 5");
    });

    it("should generate validation failed message for single error", () => {
      const message = ERROR_MESSAGES.VALIDATION_FAILED(mockFilePath, 1);
      expect(message).toContain(mockFilePath);
      expect(message).toContain("1 error");
      expect(message).not.toContain("errors");
    });

    it("should generate validation failed message for multiple errors", () => {
      const message = ERROR_MESSAGES.VALIDATION_FAILED(mockFilePath, 3);
      expect(message).toContain(mockFilePath);
      expect(message).toContain("3 errors");
    });

    it("should generate hot-reload failed message", () => {
      const message = ERROR_MESSAGES.HOT_RELOAD_FAILED(mockFilePath, 2);
      expect(message).toContain(mockFilePath);
      expect(message).toContain("Hot-reload failed");
      expect(message).toContain("(attempt 2)");
    });

    it("should generate permission denied message", () => {
      const message = ERROR_MESSAGES.PERMISSION_DENIED(mockFilePath);
      expect(message).toContain(mockFilePath);
      expect(message).toContain("Permission denied");
    });

    it("should generate unknown error message", () => {
      const originalMessage = "Something went wrong";
      const message = ERROR_MESSAGES.UNKNOWN_ERROR(
        mockFilePath,
        originalMessage,
      );
      expect(message).toContain(mockFilePath);
      expect(message).toContain("Unexpected error");
      expect(message).toContain(originalMessage);
    });
  });

  describe("extractLineNumber", () => {
    it("should extract line number from error message", () => {
      const error = new Error("JSON parse error at line 42");
      const lineNumber = extractLineNumber(error);
      expect(lineNumber).toBe(42);
    });

    it("should handle case insensitive line extraction", () => {
      const error = new Error("Error at LINE 123");
      const lineNumber = extractLineNumber(error);
      expect(lineNumber).toBe(123);
    });

    it("should return undefined when no line number found", () => {
      const error = new Error("Generic error message");
      const lineNumber = extractLineNumber(error);
      expect(lineNumber).toBeUndefined();
    });

    it("should return first line number when multiple found", () => {
      const error = new Error("Error at line 10, referenced from line 20");
      const lineNumber = extractLineNumber(error);
      expect(lineNumber).toBe(10);
    });
  });
});

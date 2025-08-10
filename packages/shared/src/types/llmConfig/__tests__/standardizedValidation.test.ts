import { z } from "zod";
import { ValidationErrorCode } from "../ValidationErrorCode";
import { sanitizeValue } from "../../../validation/sanitizeValue";
import { createValidationError } from "../createValidationError";
import { createValidationResult } from "../createValidationResult";
import { aggregateValidationErrors } from "../aggregateValidationErrors";
import { formatZodErrors } from "../../../validation/formatZodErrors";
import { getFieldDisplayName } from "../getFieldDisplayName";
import { getValidationSummary } from "../getValidationSummary";
import { formatErrorsForDisplay } from "../formatErrorsForDisplay";
import { validateWithErrors } from "../validateWithErrors";

describe("Standardized Validation System", () => {
  describe("sanitizeValue", () => {
    it("should redact API keys", () => {
      expect(sanitizeValue("apiKey", "sk-1234567890")).toBe("[REDACTED]");
      expect(sanitizeValue("token", "some-secret")).toBe("[REDACTED]");
      expect(sanitizeValue("myApiKey", "secret")).toBe("[REDACTED]");
    });

    it("should redact values that look like secrets", () => {
      expect(sanitizeValue("field", "sk-secret")).toBe("[REDACTED]");
      expect(sanitizeValue("field", "pk-secret")).toBe("[REDACTED]");
    });

    it("should truncate long strings", () => {
      const longString = "a".repeat(60);
      const result = sanitizeValue("field", longString);
      expect(result).toBe("a".repeat(47) + "...");
    });

    it("should handle short strings normally", () => {
      expect(sanitizeValue("field", "short")).toBe("short");
    });

    it("should handle null and undefined", () => {
      expect(sanitizeValue("field", null)).toBe(null);
      expect(sanitizeValue("field", undefined)).toBe(undefined);
    });

    it("should handle arrays and objects", () => {
      expect(sanitizeValue("field", [1, 2, 3])).toBe("Array(3)");
      expect(sanitizeValue("field", { a: 1 })).toBe("[Object]");
    });

    it("should handle other primitive types", () => {
      expect(sanitizeValue("field", 123)).toBe(123);
      expect(sanitizeValue("field", true)).toBe(true);
    });
  });

  describe("createValidationError", () => {
    it("should create a validation error with sanitized values", () => {
      const error = createValidationError(
        "apiKey",
        ValidationErrorCode.API_KEY_FORMAT,
        "Invalid API key",
        "sk-secret",
      );

      expect(error).toEqual({
        field: "apiKey",
        code: ValidationErrorCode.API_KEY_FORMAT,
        message: "Invalid API key",
        value: "[REDACTED]",
      });
    });

    it("should create a validation error without value", () => {
      const error = createValidationError(
        "customName",
        ValidationErrorCode.REQUIRED,
        "Name is required",
      );

      expect(error).toEqual({
        field: "customName",
        code: ValidationErrorCode.REQUIRED,
        message: "Name is required",
        value: undefined,
      });
    });
  });

  describe("createValidationResult", () => {
    it("should create successful result with data", () => {
      const data = { name: "test" };
      const result = createValidationResult(data);

      expect(result).toEqual({
        success: true,
        data,
        errors: [],
      });
    });

    it("should create failed result with errors", () => {
      const errors = [
        createValidationError(
          "field",
          ValidationErrorCode.REQUIRED,
          "Required",
        ),
      ];
      const result = createValidationResult(undefined, errors);

      expect(result).toEqual({
        success: false,
        data: undefined,
        errors,
      });
    });
  });

  describe("aggregateValidationErrors", () => {
    it("should aggregate errors from multiple results", () => {
      const errors1 = [
        createValidationError(
          "field1",
          ValidationErrorCode.REQUIRED,
          "Error 1",
        ),
      ];
      const errors2 = [
        createValidationError(
          "field2",
          ValidationErrorCode.INVALID_FORMAT,
          "Error 2",
        ),
      ];

      const result1 = createValidationResult(undefined, errors1);
      const result2 = createValidationResult(undefined, errors2);

      const aggregated = aggregateValidationErrors(result1, result2);

      expect(aggregated).toHaveLength(2);
      expect(aggregated[0]?.field).toBe("field1");
      expect(aggregated[1]?.field).toBe("field2");
    });

    it("should remove duplicate errors", () => {
      const error = createValidationError(
        "field",
        ValidationErrorCode.REQUIRED,
        "Required",
      );
      const duplicateError = createValidationError(
        "field",
        ValidationErrorCode.REQUIRED,
        "Required",
      );

      const aggregated = aggregateValidationErrors([error], [duplicateError]);

      expect(aggregated).toHaveLength(1);
      expect(aggregated[0]?.field).toBe("field");
    });

    it("should handle array inputs directly", () => {
      const errors = [
        createValidationError(
          "field1",
          ValidationErrorCode.REQUIRED,
          "Error 1",
        ),
        createValidationError(
          "field2",
          ValidationErrorCode.INVALID_FORMAT,
          "Error 2",
        ),
      ];

      const aggregated = aggregateValidationErrors(errors);

      expect(aggregated).toHaveLength(2);
    });
  });

  describe("formatZodErrors", () => {
    it("should format Zod validation errors", () => {
      const schema = z.object({
        name: z.string().min(1, "Name is required"),
        age: z.number(),
      });

      const result = schema.safeParse({ name: "", age: "not-a-number" });
      if (!result.success) {
        const formatted = formatZodErrors(result.error);

        expect(formatted).toHaveLength(2);
        const nameError = formatted.find((e) => e.field === "name");
        const ageError = formatted.find((e) => e.field === "age");
        expect(nameError).toBeDefined();
        expect(ageError).toBeDefined();
      }
    });

    it("should handle custom Zod errors", () => {
      const schema = z.string().refine((val) => val.includes("test"), {
        message: "Must contain 'test'",
      });

      const result = schema.safeParse("invalid");
      if (!result.success) {
        const formatted = formatZodErrors(result.error);

        expect(formatted).toHaveLength(1);
        expect(formatted[0]?.code).toBe(ValidationErrorCode.CUSTOM_RULE);
        expect(formatted[0]?.message).toBe("Must contain 'test'");
      }
    });
  });

  describe("getFieldDisplayName", () => {
    it("should convert technical field names to display names", () => {
      expect(getFieldDisplayName("customName")).toBe("Configuration Name");
      expect(getFieldDisplayName("apiKey")).toBe("API Key");
      expect(getFieldDisplayName("baseUrl")).toBe("Base URL");
      expect(getFieldDisplayName("provider")).toBe("Provider");
      expect(getFieldDisplayName("useAuthHeader")).toBe("Use Auth Header");
    });

    it("should handle nested field paths", () => {
      expect(getFieldDisplayName("customName.first")).toBe(
        "Configuration Name (first)",
      );
      expect(getFieldDisplayName("apiKey.secret.key")).toBe(
        "API Key (secret.key)",
      );
    });

    it("should handle unknown field names", () => {
      expect(getFieldDisplayName("unknownField")).toBe("unknownField");
    });

    it("should handle empty field names", () => {
      expect(getFieldDisplayName("")).toBe("Configuration");
    });
  });

  describe("getValidationSummary", () => {
    it("should return empty string for no errors", () => {
      expect(getValidationSummary([])).toBe("");
    });

    it("should return single error message for one error", () => {
      const errors = [
        createValidationError(
          "field",
          ValidationErrorCode.REQUIRED,
          "Field is required",
        ),
      ];
      expect(getValidationSummary(errors)).toBe("Field is required");
    });

    it("should return field-specific summary for multiple errors on same field", () => {
      const errors = [
        createValidationError(
          "customName",
          ValidationErrorCode.REQUIRED,
          "Required",
        ),
        createValidationError(
          "customName",
          ValidationErrorCode.INVALID_LENGTH,
          "Too long",
        ),
      ];
      expect(getValidationSummary(errors)).toBe(
        "Configuration Name has 2 validation issues",
      );
    });

    it("should return multi-field summary for errors on different fields", () => {
      const errors = [
        createValidationError(
          "customName",
          ValidationErrorCode.REQUIRED,
          "Required",
        ),
        createValidationError(
          "apiKey",
          ValidationErrorCode.INVALID_FORMAT,
          "Invalid format",
        ),
      ];
      expect(getValidationSummary(errors)).toBe(
        "2 fields have validation errors",
      );
    });
  });

  describe("formatErrorsForDisplay", () => {
    it("should format errors grouped by field", () => {
      const errors = [
        createValidationError(
          "customName",
          ValidationErrorCode.REQUIRED,
          "Name required",
        ),
        createValidationError(
          "customName",
          ValidationErrorCode.INVALID_LENGTH,
          "Name too long",
        ),
        createValidationError(
          "apiKey",
          ValidationErrorCode.INVALID_FORMAT,
          "Invalid format",
        ),
      ];

      const formatted = formatErrorsForDisplay(errors);

      expect(formatted).toHaveLength(2);

      const nameField = formatted.find((f) => f.field === "Configuration Name");
      expect(nameField?.messages).toEqual(["Name required", "Name too long"]);

      const apiKeyField = formatted.find((f) => f.field === "API Key");
      expect(apiKeyField?.messages).toEqual(["Invalid format"]);
    });
  });

  describe("validateWithErrors", () => {
    const validInput = {
      customName: "Test Config",
      provider: "openai" as const,
      apiKey: "sk-1234567890123456789012345678901234567890",
      useAuthHeader: true,
    };

    it("should validate correct input successfully", () => {
      const result = validateWithErrors(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
      expect(result.errors).toHaveLength(0);
    });

    it("should return schema validation errors", () => {
      const invalidInput = {
        customName: "",
        provider: "invalid-provider",
        apiKey: "",
      };

      const result = validateWithErrors(invalidInput);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should check for duplicate names", () => {
      const result = validateWithErrors(validInput, ["Test Config"]);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe(ValidationErrorCode.DUPLICATE_NAME);
    });

    it("should validate API key format", () => {
      const invalidInput = {
        ...validInput,
        apiKey: "invalid-key",
      };

      const result = validateWithErrors(invalidInput);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe(ValidationErrorCode.API_KEY_FORMAT);
    });

    it("should aggregate multiple validation errors", () => {
      const invalidInput = {
        customName: "Duplicate Name",
        provider: "openai" as const,
        apiKey: "invalid-key",
      };

      const result = validateWithErrors(invalidInput, ["Duplicate Name"]);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors.length).toBeGreaterThan(1);

      // Should have both duplicate name and API key format errors
      const errorCodes = result.errors.map((e) => e.code);
      expect(errorCodes).toContain(ValidationErrorCode.DUPLICATE_NAME);
      expect(errorCodes).toContain(ValidationErrorCode.API_KEY_FORMAT);
    });
  });
});

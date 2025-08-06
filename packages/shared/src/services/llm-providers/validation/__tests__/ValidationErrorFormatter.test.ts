import { z } from "zod";
import type { LlmFieldValidationError } from "../../../../types/llm-providers/validation/LlmFieldValidationError";
import { LlmValidationErrorCode } from "../../../../types/llm-providers/validation/LlmValidationErrorCode";
import { ValidationErrorFormatter } from "../ValidationErrorFormatter";

describe("ValidationErrorFormatter", () => {
  let formatter: ValidationErrorFormatter;

  beforeEach(() => {
    formatter = new ValidationErrorFormatter({
      mode: "development",
      includeRawData: true,
      maxErrorCount: 5,
    });
  });

  describe("formatZodError", () => {
    it("should format basic Zod error", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = schema.safeParse({ name: 123, age: "invalid" });
      expect(result.success).toBe(false);

      const formatted = formatter.formatZodError(result.error as z.ZodError);

      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toEqual({
        path: "name",
        field: "name",
        message: "Invalid input: expected string, received number",
        code: "invalid_type",
        value: undefined,
        expectedType: "string",
      });
      expect(formatted[1]).toEqual({
        path: "age",
        field: "age",
        message: "Invalid input: expected number, received string",
        code: "invalid_type",
        value: undefined,
        expectedType: "number",
      });
    });

    it("should truncate errors when exceeding maxErrorCount", () => {
      const schema = z.object({
        field1: z.string(),
        field2: z.string(),
        field3: z.string(),
        field4: z.string(),
        field5: z.string(),
        field6: z.string(),
      });

      const result = schema.safeParse({
        field1: 1,
        field2: 2,
        field3: 3,
        field4: 4,
        field5: 5,
        field6: 6,
      });
      expect(result.success).toBe(false);

      const formatted = formatter.formatZodError(result.error as z.ZodError);

      expect(formatted).toHaveLength(6); // 5 errors + 1 truncation message
      expect(formatted[5]).toEqual({
        path: "",
        field: "",
        message: "...and 1 more errors",
        code: "TRUNCATED",
      });
    });

    it("should handle nested object paths", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
          }),
        }),
      });

      const result = schema.safeParse({
        user: { profile: { name: 123 } },
      });
      expect(result.success).toBe(false);

      const formatted = formatter.formatZodError(result.error as z.ZodError);

      expect(formatted[0]).toEqual({
        path: "user.profile.name",
        field: "name",
        message: "Invalid input: expected string, received number",
        code: "invalid_type",
        value: undefined,
        expectedType: "string",
      });
    });
  });

  describe("formatJsonError", () => {
    it("should format JSON parse error with position", () => {
      const error = new SyntaxError("Unexpected token } at position 25");
      const content = '{"valid": "json", "invalid"}';

      const formatted = formatter.formatJsonError(
        error,
        "/test/file.json",
        content,
      );

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toEqual({
        path: "/test/file.json",
        field: "",
        message: "Unexpected token } at position 25",
        code: "JSON_PARSE_ERROR",
        line: 1,
        column: 26,
      });
    });

    it("should format JSON error without position", () => {
      const error = new SyntaxError("Invalid JSON");

      const formatted = formatter.formatJsonError(error, "/test/file.json");

      expect(formatted[0]).toEqual({
        path: "/test/file.json",
        field: "",
        message: "Invalid JSON",
        code: "JSON_PARSE_ERROR",
        line: undefined,
        column: undefined,
      });
    });

    it("should use production message in production mode", () => {
      const prodFormatter = new ValidationErrorFormatter({
        mode: "production",
      });
      const error = new SyntaxError("Unexpected token } at position 25");

      const formatted = prodFormatter.formatJsonError(error, "/test/file.json");

      expect(formatted[0]?.message).toBe(
        "Invalid JSON syntax in configuration file",
      );
    });
  });

  describe("formatFileError", () => {
    it("should format file error in development", () => {
      const error = new Error("ENOENT: no such file or directory");
      error.name = "FileNotFoundError";

      const formatted = formatter.formatFileError(error, "/test/missing.json");

      expect(formatted).toEqual({
        path: "/test/missing.json",
        field: "",
        message: "ENOENT: no such file or directory",
        code: "FileNotFoundError",
      });
    });

    it("should use generic message in production", () => {
      const prodFormatter = new ValidationErrorFormatter({
        mode: "production",
      });
      const error = new Error("ENOENT: no such file or directory");

      const formatted = prodFormatter.formatFileError(
        error,
        "/test/missing.json",
      );

      expect(formatted.message).toBe("Failed to read configuration file");
    });
  });

  describe("formatValidationErrors", () => {
    it("should format LlmFieldValidationError array", () => {
      const errors: LlmFieldValidationError[] = [
        {
          fieldId: "apiKey",
          message: "API key is required",
          code: LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
          value: "",
        },
        {
          fieldId: "baseUrl",
          message: "Invalid URL format",
          code: LlmValidationErrorCode.PATTERN_MISMATCH,
          value: "not-a-url",
        },
      ];

      const formatted = formatter.formatValidationErrors(errors);

      expect(formatted).toEqual([
        {
          path: "apiKey",
          field: "apiKey",
          message: "API key is required",
          code: LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
          value: "",
        },
        {
          path: "baseUrl",
          field: "baseUrl",
          message: "Invalid URL format",
          code: LlmValidationErrorCode.PATTERN_MISMATCH,
          value: "not-a-url",
        },
      ]);
    });
  });

  describe("createDeveloperMessage", () => {
    it("should create detailed developer message", () => {
      const errors = [
        {
          path: "providers[0].apiKey",
          field: "apiKey",
          message: "Required field is missing",
          code: LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
          expectedType: "string",
          value: undefined,
        },
        {
          path: "providers[1].baseUrl",
          field: "baseUrl",
          message: "Invalid URL format",
          code: LlmValidationErrorCode.PATTERN_MISMATCH,
          line: 15,
          column: 20,
        },
      ];

      const message = formatter.createDeveloperMessage(errors);

      expect(message).toContain("Configuration validation failed:");
      expect(message).toContain(
        "providers[0].apiKey: Required field is missing",
      );
      expect(message).toContain("Expected: string");
      expect(message).toContain(
        "providers[1].baseUrl (line 15, column 20): Invalid URL format",
      );
    });
  });

  describe("createUserMessage", () => {
    it("should return success message for empty errors", () => {
      const message = formatter.createUserMessage([]);
      expect(message).toBe("Validation successful");
    });

    it("should return single error message", () => {
      const errors: LlmFieldValidationError[] = [
        {
          fieldId: "apiKey",
          message: "API key is required",
          code: LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
          value: "",
        },
      ];

      const message = formatter.createUserMessage(errors);
      expect(message).toBe("API key is required");
    });

    it("should return summary for multiple errors", () => {
      const errors: LlmFieldValidationError[] = [
        {
          fieldId: "apiKey",
          message: "API key is required",
          code: LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
          value: "",
        },
        {
          fieldId: "baseUrl",
          message: "Invalid URL format",
          code: LlmValidationErrorCode.PATTERN_MISMATCH,
          value: "not-a-url",
        },
      ];

      const message = formatter.createUserMessage(errors);
      expect(message).toBe(
        "Configuration has 2 validation errors. Please check the following fields: apiKey, baseUrl",
      );
    });
  });

  describe("formatMessage", () => {
    it("should simplify technical messages in production mode", () => {
      const prodFormatter = new ValidationErrorFormatter({
        mode: "production",
      });

      const testCases = [
        {
          input: "Expected string, received number",
          expected: "Invalid value type",
        },
        {
          input: "String must contain at least 5 character(s)",
          expected: "Value is too short",
        },
        {
          input: "Invalid input",
          expected: "Invalid value",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        // Access private method for testing
        const result = (
          prodFormatter as unknown as {
            formatMessage: (message: string) => string;
          }
        ).formatMessage(input);
        expect(result).toBe(expected);
      });
    });

    it("should preserve original messages in development mode", () => {
      const message = "Expected string, received number";
      const result = (
        formatter as unknown as { formatMessage: (message: string) => string }
      ).formatMessage(message);
      expect(result).toBe(message);
    });
  });

  describe("position helpers", () => {
    const content = "Line 1\nLine 2\nLine 3 with error here\nLine 4";

    it("should calculate line from position", () => {
      const position = 20; // Position in "Line 3"
      const line = (
        formatter as unknown as {
          getLineFromPosition: (content: string, position: number) => number;
        }
      ).getLineFromPosition(content, position);
      expect(line).toBe(3);
    });

    it("should calculate column from position", () => {
      const position = 20; // Position in "Line 3"
      const column = (
        formatter as unknown as {
          getColumnFromPosition: (content: string, position: number) => number;
        }
      ).getColumnFromPosition(content, position);
      expect(column).toBe(7);
    });
  });
});

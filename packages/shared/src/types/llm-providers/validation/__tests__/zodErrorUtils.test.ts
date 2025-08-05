import { z } from "zod";
import {
  mapZodCodeToErrorCode,
  formatZodMessage,
  zodToFieldErrors,
  formatFieldPath,
  getFieldFromPath,
  buildValidationResult,
  LlmValidationErrorCode,
} from "../";
import type { LlmFieldConfig } from "../../LlmFieldConfig";

describe("zodErrorUtils", () => {
  const mockFieldConfigs: LlmFieldConfig[] = [
    {
      type: "secure-text",
      id: "apiKey",
      label: "API Key",
      required: true,
      placeholder: "Enter your API key",
    },
    {
      type: "text",
      id: "baseUrl",
      label: "Base URL",
      required: false,
      placeholder: "https://api.example.com",
    },
  ];

  describe("mapZodCodeToErrorCode", () => {
    it("should map too_small to REQUIRED_FIELD_MISSING", () => {
      const issue = { code: "too_small" } as z.ZodIssue;
      expect(mapZodCodeToErrorCode(issue)).toBe(
        LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
      );
    });

    it("should map too_big to VALUE_TOO_LONG", () => {
      const issue = { code: "too_big" } as z.ZodIssue;
      expect(mapZodCodeToErrorCode(issue)).toBe(
        LlmValidationErrorCode.VALUE_TOO_LONG,
      );
    });

    it("should map invalid_type to INVALID_FIELD_TYPE", () => {
      const issue = { code: "invalid_type" } as z.ZodIssue;
      expect(mapZodCodeToErrorCode(issue)).toBe(
        LlmValidationErrorCode.INVALID_FIELD_TYPE,
      );
    });

    it("should map invalid_format to PATTERN_MISMATCH", () => {
      const issue = { code: "invalid_format" } as z.ZodIssue;
      expect(mapZodCodeToErrorCode(issue)).toBe(
        LlmValidationErrorCode.PATTERN_MISMATCH,
      );
    });

    it("should map unknown codes to INVALID_CONFIGURATION", () => {
      const issue = { code: "custom" } as z.ZodIssue;
      expect(mapZodCodeToErrorCode(issue)).toBe(
        LlmValidationErrorCode.INVALID_CONFIGURATION,
      );
    });
  });

  describe("formatZodMessage", () => {
    it("should use field label for too_small errors", () => {
      const issue = {
        code: "too_small",
        message: "String must contain at least 1 character(s)",
      } as z.ZodIssue;
      const field = mockFieldConfigs[0];

      expect(formatZodMessage(issue, field)).toBe("API Key is required");
    });

    it("should use field label for invalid_type errors", () => {
      const issue = {
        code: "invalid_type",
        message: "Expected string, received number",
      } as z.ZodIssue;
      const field = mockFieldConfigs[1];

      expect(formatZodMessage(issue, field)).toBe(
        "Base URL must be a valid value",
      );
    });

    it("should use field label for invalid_format errors", () => {
      const issue = {
        code: "invalid_format",
        message: "Invalid format",
      } as z.ZodIssue;
      const field = mockFieldConfigs[0];

      expect(formatZodMessage(issue, field)).toBe("API Key format is invalid");
    });

    it("should fallback to Zod message when no field provided", () => {
      const issue = {
        code: "too_small",
        message: "String must contain at least 1 character(s)",
      } as z.ZodIssue;

      expect(formatZodMessage(issue)).toBe(
        "String must contain at least 1 character(s)",
      );
    });

    it("should use generic field name for unknown field", () => {
      const issue = {
        code: "too_small",
        message: "String must contain at least 1 character(s)",
      } as z.ZodIssue;
      const unknownField: LlmFieldConfig = {
        ...mockFieldConfigs[0]!,
        label: "Unknown Field",
      };

      expect(formatZodMessage(issue, unknownField)).toBe(
        "Unknown Field is required",
      );
    });
  });

  describe("zodToFieldErrors", () => {
    it("should convert Zod errors to field validation errors", () => {
      const schema = z.object({
        apiKey: z.string().min(1),
        baseUrl: z.string().url(),
      });

      const result = schema.safeParse({ apiKey: "", baseUrl: "invalid-url" });
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = zodToFieldErrors(result.error, mockFieldConfigs);

        expect(errors).toHaveLength(2);
        expect(errors[0]?.fieldId).toBe("apiKey");
        expect(errors[0]?.code).toBe(
          LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        );
        expect(errors[0]?.message).toBe("API Key is required");

        expect(errors[1]?.fieldId).toBe("baseUrl");
        expect(errors[1]?.code).toBe(LlmValidationErrorCode.PATTERN_MISMATCH);
        expect(errors[1]?.message).toBe("Base URL format is invalid");
      }
    });

    it("should handle missing field configs gracefully", () => {
      const schema = z.object({
        unknownField: z.string().min(1),
      });

      const result = schema.safeParse({ unknownField: "" });
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = zodToFieldErrors(result.error);

        expect(errors).toHaveLength(1);
        expect(errors[0]?.fieldId).toBe("unknownField");
        expect(errors[0]?.code).toBe(
          LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        );
        // Should fallback to Zod's message
        expect(errors[0]?.message).toContain(
          "expected string to have >=1 characters",
        );
      }
    });

    it("should extract field IDs from nested paths", () => {
      const schema = z.object({
        config: z.object({
          values: z.object({
            apiKey: z.string().min(1),
          }),
        }),
      });

      const result = schema.safeParse({ config: { values: { apiKey: "" } } });
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = zodToFieldErrors(result.error, mockFieldConfigs);

        expect(errors).toHaveLength(1);
        expect(errors[0]?.fieldId).toBe("apiKey");
        expect(errors[0]?.message).toBe("API Key is required");
      }
    });
  });

  describe("formatFieldPath", () => {
    it("should format simple paths", () => {
      expect(formatFieldPath(["apiKey"])).toBe("apiKey");
    });

    it("should format nested paths with objects", () => {
      expect(formatFieldPath(["config", "values", "apiKey"])).toBe(
        "config.values.apiKey",
      );
    });

    it("should format paths with array indices", () => {
      expect(formatFieldPath(["providers", 0, "configuration"])).toBe(
        "providers[0].configuration",
      );
    });

    it("should handle mixed paths", () => {
      expect(formatFieldPath(["providers", 0, "fields", 1, "id"])).toBe(
        "providers[0].fields[1].id",
      );
    });

    it("should handle empty paths", () => {
      expect(formatFieldPath([])).toBe("");
    });
  });

  describe("getFieldFromPath", () => {
    it("should find field by simple path", () => {
      const path = ["apiKey"];
      const field = getFieldFromPath(path, mockFieldConfigs);

      expect(field).toBeDefined();
      expect(field?.id).toBe("apiKey");
      expect(field?.label).toBe("API Key");
    });

    it("should find field by nested path", () => {
      const path = ["config", "values", "baseUrl"];
      const field = getFieldFromPath(path, mockFieldConfigs);

      expect(field).toBeDefined();
      expect(field?.id).toBe("baseUrl");
      expect(field?.label).toBe("Base URL");
    });

    it("should return undefined for unknown field", () => {
      const path = ["unknownField"];
      const field = getFieldFromPath(path, mockFieldConfigs);

      expect(field).toBeUndefined();
    });

    it("should handle empty paths", () => {
      const path: (string | number)[] = [];
      const field = getFieldFromPath(path, mockFieldConfigs);

      expect(field).toBeUndefined();
    });
  });

  describe("buildValidationResult", () => {
    it("should return valid result for successful parsing", () => {
      const schema = z.object({ name: z.string() });
      const result = schema.safeParse({ name: "test" });

      const validationResult = buildValidationResult(result, mockFieldConfigs);

      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it("should return invalid result with field errors for failed parsing", () => {
      const schema = z.object({
        apiKey: z.string().min(1),
        baseUrl: z.string().url(),
      });

      const result = schema.safeParse({
        apiKey: "",
        baseUrl: "invalid-url",
      });

      const validationResult = buildValidationResult(result, mockFieldConfigs);

      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toHaveLength(2);
      expect(validationResult.errors[0]?.message).toBe("API Key is required");
      expect(validationResult.errors[1]?.message).toBe(
        "Base URL format is invalid",
      );
    });

    it("should handle missing error gracefully", () => {
      const mockResult = { success: false };
      const validationResult = buildValidationResult(
        mockResult,
        mockFieldConfigs,
      );

      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toHaveLength(0);
    });
  });
});

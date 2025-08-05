import { validateConfigurationValues } from "../validateConfigurationValues";
import type { LlmFieldConfig } from "../../LlmFieldConfig";
import { LlmValidationErrorCode } from "../LlmValidationErrorCode";

describe("validateConfigurationValues", () => {
  const mockTextField: LlmFieldConfig = {
    id: "apiKey",
    label: "API Key",
    type: "text",
    required: true,
    placeholder: "sk-...",
    minLength: 10,
    maxLength: 100,
    pattern: "^sk-",
  };

  const mockSecureTextField: LlmFieldConfig = {
    id: "secretToken",
    label: "Secret Token",
    type: "secure-text",
    required: true,
    placeholder: "Enter secret token",
  };

  const mockOptionalTextField: LlmFieldConfig = {
    id: "baseUrl",
    label: "Base URL",
    type: "text",
    required: false,
    defaultValue: "https://api.openai.com",
    pattern: "^https?://",
  };

  const mockCheckboxField: LlmFieldConfig = {
    id: "useAuth",
    label: "Use Authorization",
    type: "checkbox",
    required: false,
  };

  describe("successful validation", () => {
    it("should validate complete configuration with all required fields", () => {
      const values = {
        apiKey: "sk-1234567890abcdef",
        secretToken: "secret123",
        baseUrl: "https://api.openai.com",
        useAuth: true,
      };
      const fields = [
        mockTextField,
        mockSecureTextField,
        mockOptionalTextField,
        mockCheckboxField,
      ];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate configuration with only required fields", () => {
      const values = {
        apiKey: "sk-1234567890abcdef",
        secretToken: "secret123",
      };
      const fields = [
        mockTextField,
        mockSecureTextField,
        mockOptionalTextField,
        mockCheckboxField,
      ];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate empty configuration when no fields are required", () => {
      const values = {};
      const fields = [mockOptionalTextField, mockCheckboxField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("missing required fields", () => {
    it("should fail when required text field is missing", () => {
      const values = {
        secretToken: "secret123",
      };
      const fields = [mockTextField, mockSecureTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("apiKey");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
      );
      expect(result.errors[0]!.message).toContain(
        "Required field 'API Key' is missing",
      );
    });

    it("should fail when multiple required fields are missing", () => {
      const values = {};
      const fields = [mockTextField, mockSecureTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map((e) => e.fieldId)).toContain("apiKey");
      expect(result.errors.map((e) => e.fieldId)).toContain("secretToken");
      expect(
        result.errors.every(
          (e) => e.code === LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        ),
      ).toBe(true);
    });
  });

  describe("unknown fields", () => {
    it("should fail when configuration contains unknown field", () => {
      const values = {
        apiKey: "sk-1234567890abcdef",
        unknownField: "value",
      };
      const fields = [mockTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("unknownField");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.INVALID_CONFIGURATION,
      );
      expect(result.errors[0]!.message).toBe("Unknown field: unknownField");
    });

    it("should fail when multiple unknown fields are present", () => {
      const values = {
        apiKey: "sk-1234567890abcdef",
        unknownField1: "value1",
        unknownField2: "value2",
      };
      const fields = [mockTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map((e) => e.fieldId)).toContain("unknownField1");
      expect(result.errors.map((e) => e.fieldId)).toContain("unknownField2");
      expect(
        result.errors.every(
          (e) => e.code === LlmValidationErrorCode.INVALID_CONFIGURATION,
        ),
      ).toBe(true);
    });
  });

  describe("field value validation", () => {
    it("should fail when text field value is wrong type", () => {
      const values = {
        apiKey: 12345,
      };
      const fields = [mockTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("apiKey");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.INVALID_FIELD_TYPE,
      );
    });

    it("should fail when checkbox field value is wrong type", () => {
      const values = {
        useAuth: "true",
      };
      const fields = [mockCheckboxField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("useAuth");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.INVALID_FIELD_TYPE,
      );
    });

    it("should fail when required field is empty string", () => {
      const values = {
        apiKey: "",
      };
      const fields = [mockTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("apiKey");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
      );
    });

    it("should fail when value is too short", () => {
      const values = {
        apiKey: "sk-123",
      };
      const fields = [mockTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("apiKey");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.VALUE_TOO_SHORT,
      );
    });

    it("should fail when value is too long", () => {
      const values = {
        apiKey: "sk-" + "a".repeat(200),
      };
      const fields = [mockTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("apiKey");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.VALUE_TOO_LONG,
      );
    });

    it("should fail when value doesn't match pattern", () => {
      const values = {
        apiKey: "invalid-key-format",
      };
      const fields = [mockTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("apiKey");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.PATTERN_MISMATCH,
      );
    });
  });

  describe("multiple validation errors", () => {
    it("should collect multiple errors from different fields", () => {
      const values = {
        apiKey: 12345,
        useAuth: "invalid",
        unknownField: "value",
      };
      const fields = [mockTextField, mockCheckboxField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.map((e) => e.fieldId)).toContain("apiKey");
      expect(result.errors.map((e) => e.fieldId)).toContain("useAuth");
      expect(result.errors.map((e) => e.fieldId)).toContain("unknownField");
    });

    it("should collect errors for missing fields and invalid values", () => {
      const values = {
        apiKey: "invalid-key-format-long-enough",
      };
      const fields = [mockTextField, mockSecureTextField];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(
        result.errors.some(
          (e) =>
            e.fieldId === "apiKey" &&
            e.code === LlmValidationErrorCode.PATTERN_MISMATCH,
        ),
      ).toBe(true);
      expect(
        result.errors.some(
          (e) =>
            e.fieldId === "secretToken" &&
            e.code === LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        ),
      ).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle empty field array", () => {
      const values = {};
      const fields: LlmFieldConfig[] = [];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle empty values with empty fields", () => {
      const values = {};
      const fields: LlmFieldConfig[] = [];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when values provided but no fields defined", () => {
      const values = {
        someField: "value",
      };
      const fields: LlmFieldConfig[] = [];

      const result = validateConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("someField");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.INVALID_CONFIGURATION,
      );
    });
  });
});

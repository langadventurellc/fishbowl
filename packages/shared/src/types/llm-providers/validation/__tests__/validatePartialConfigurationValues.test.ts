import { validatePartialConfigurationValues } from "../validatePartialConfigurationValues";
import type { LlmFieldConfig } from "../../LlmFieldConfig";
import { LlmValidationErrorCode } from "../LlmValidationErrorCode";

describe("validatePartialConfigurationValues", () => {
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

  describe("successful partial validation", () => {
    it("should validate partial configuration with valid values", () => {
      const values = {
        apiKey: "sk-1234567890abcdef",
      };
      const fields = [
        mockTextField,
        mockSecureTextField,
        mockOptionalTextField,
        mockCheckboxField,
      ];

      const result = validatePartialConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate empty partial configuration", () => {
      const values = {};
      const fields = [
        mockTextField,
        mockSecureTextField,
        mockOptionalTextField,
        mockCheckboxField,
      ];

      const result = validatePartialConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate subset of fields without requiring all required fields", () => {
      const values = {
        baseUrl: "https://api.custom.com",
        useAuth: false,
      };
      const fields = [
        mockTextField,
        mockSecureTextField,
        mockOptionalTextField,
        mockCheckboxField,
      ];

      const result = validatePartialConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("partial validation with unknown fields", () => {
    it("should fail when configuration contains unknown field", () => {
      const values = {
        apiKey: "sk-1234567890abcdef",
        unknownField: "value",
      };
      const fields = [mockTextField];

      const result = validatePartialConfigurationValues(values, fields);

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
        unknownField1: "value1",
        unknownField2: "value2",
      };
      const fields = [mockTextField];

      const result = validatePartialConfigurationValues(values, fields);

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

  describe("partial validation with invalid field values", () => {
    it("should fail when provided field value is wrong type", () => {
      const values = {
        apiKey: 12345,
      };
      const fields = [mockTextField, mockSecureTextField];

      const result = validatePartialConfigurationValues(values, fields);

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

      const result = validatePartialConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("useAuth");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.INVALID_FIELD_TYPE,
      );
    });

    it("should fail when required field is provided as empty string", () => {
      const values = {
        apiKey: "",
      };
      const fields = [mockTextField];

      const result = validatePartialConfigurationValues(values, fields);

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

      const result = validatePartialConfigurationValues(values, fields);

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

      const result = validatePartialConfigurationValues(values, fields);

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

      const result = validatePartialConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("apiKey");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.PATTERN_MISMATCH,
      );
    });
  });

  describe("key difference from full validation", () => {
    it("should NOT fail when required fields are missing (partial validation)", () => {
      const values = {
        baseUrl: "https://api.custom.com",
      };
      const fields = [
        mockTextField,
        mockSecureTextField,
        mockOptionalTextField,
      ];

      const result = validatePartialConfigurationValues(values, fields);

      // This is the key difference: partial validation doesn't check for missing required fields
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate multiple valid partial fields without requiring all", () => {
      const values = {
        baseUrl: "https://api.custom.com",
        useAuth: true,
      };
      const fields = [
        mockTextField,
        mockSecureTextField,
        mockOptionalTextField,
        mockCheckboxField,
      ];

      const result = validatePartialConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty field array", () => {
      const values = {};
      const fields: LlmFieldConfig[] = [];

      const result = validatePartialConfigurationValues(values, fields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when values provided but no fields defined", () => {
      const values = {
        someField: "value",
      };
      const fields: LlmFieldConfig[] = [];

      const result = validatePartialConfigurationValues(values, fields);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.fieldId).toBe("someField");
      expect(result.errors[0]!.code).toBe(
        LlmValidationErrorCode.INVALID_CONFIGURATION,
      );
    });
  });
});

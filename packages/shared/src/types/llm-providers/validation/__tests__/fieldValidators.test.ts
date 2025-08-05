import {
  TextFieldValidator,
  SecureTextFieldValidator,
  CheckboxFieldValidator,
  FieldValidatorFactory,
} from "../fieldValidators";
import { LlmValidationErrorCode } from "../LlmValidationErrorCode";
import type { TextField } from "../../TextField";
import type { SecureTextField } from "../../SecureTextField";
import type { CheckboxField } from "../../CheckboxField";
import type { LlmFieldConfig } from "../../LlmFieldConfig";

describe("FieldValidators", () => {
  describe("TextFieldValidator", () => {
    describe("basic validation", () => {
      it("should validate required field with valid string", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: true,
        };
        const validator = new TextFieldValidator(field);
        const result = validator.validate("valid value");

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it("should reject required field with empty string", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: true,
        };
        const validator = new TextFieldValidator(field);
        const result = validator.validate("");

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]?.code).toBe(
          LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        );
        expect(result.errors[0]?.fieldId).toBe("testField");
      });

      it("should reject required field with whitespace only", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: true,
        };
        const validator = new TextFieldValidator(field);
        const result = validator.validate("   ");

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]?.code).toBe(
          LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        );
      });

      it("should accept optional field with empty value", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: false,
        };
        const validator = new TextFieldValidator(field);
        const result = validator.validate("");

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it("should reject non-string values", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: false,
        };
        const validator = new TextFieldValidator(field);
        const result = validator.validate(123);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe("length validation", () => {
      it("should validate minLength constraint", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: false,
          minLength: 5,
        };
        const validator = new TextFieldValidator(field);

        expect(validator.validate("test").valid).toBe(false);
        expect(validator.validate("testing").valid).toBe(true);
      });

      it("should validate maxLength constraint", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: false,
          maxLength: 5,
        };
        const validator = new TextFieldValidator(field);

        expect(validator.validate("test").valid).toBe(true);
        expect(validator.validate("testing").valid).toBe(false);
      });

      it("should validate both minLength and maxLength", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: false,
          minLength: 3,
          maxLength: 10,
        };
        const validator = new TextFieldValidator(field);

        expect(validator.validate("ab").valid).toBe(false);
        expect(validator.validate("abc").valid).toBe(true);
        expect(validator.validate("abcdefghij").valid).toBe(true);
        expect(validator.validate("abcdefghijk").valid).toBe(false);
      });
    });

    describe("pattern validation", () => {
      it("should validate regex pattern", () => {
        const field: TextField = {
          type: "text",
          id: "urlField",
          label: "URL Field",
          required: false,
          pattern: "^https?://",
        };
        const validator = new TextFieldValidator(field);

        expect(validator.validate("http://example.com").valid).toBe(true);
        expect(validator.validate("https://example.com").valid).toBe(true);
        expect(validator.validate("ftp://example.com").valid).toBe(false);
        expect(validator.validate("example.com").valid).toBe(false);
      });

      it("should provide error message for pattern mismatch", () => {
        const field: TextField = {
          type: "text",
          id: "urlField",
          label: "URL Field",
          required: false,
          pattern: "^https?://",
        };
        const validator = new TextFieldValidator(field);
        const result = validator.validate("invalid-url");

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]?.message).toContain("format is invalid");
      });
    });
  });

  describe("SecureTextFieldValidator", () => {
    describe("inheritance behavior", () => {
      it("should inherit basic text validation", () => {
        const field: SecureTextField = {
          type: "secure-text",
          id: "apiKey",
          label: "API Key",
          required: true,
          minLength: 10,
        };
        const validator = new SecureTextFieldValidator(field);

        expect(validator.validate("").valid).toBe(false);
        expect(validator.validate("short").valid).toBe(false);
        expect(validator.validate("long-enough-key").valid).toBe(true);
      });
    });
  });

  describe("CheckboxFieldValidator", () => {
    describe("boolean validation", () => {
      it("should accept boolean values", () => {
        const field: CheckboxField = {
          type: "checkbox",
          id: "enableFeature",
          label: "Enable Feature",
          required: false,
        };
        const validator = new CheckboxFieldValidator(field);

        expect(validator.validate(true).valid).toBe(true);
        expect(validator.validate(false).valid).toBe(true);
      });

      it("should normalize null/undefined to false", () => {
        const field: CheckboxField = {
          type: "checkbox",
          id: "enableFeature",
          label: "Enable Feature",
          required: false,
        };
        const validator = new CheckboxFieldValidator(field);

        expect(validator.validate(null).valid).toBe(true);
        expect(validator.validate(undefined).valid).toBe(true);
      });

      it("should reject non-boolean values", () => {
        const field: CheckboxField = {
          type: "checkbox",
          id: "enableFeature",
          label: "Enable Feature",
          required: false,
        };
        const validator = new CheckboxFieldValidator(field);

        expect(validator.validate("true").valid).toBe(false);
        expect(validator.validate(1).valid).toBe(false);
        expect(validator.validate(0).valid).toBe(false);
        expect(validator.validate("false").valid).toBe(false);
      });
    });
  });

  describe("FieldValidatorFactory", () => {
    describe("validator creation", () => {
      it("should create TextFieldValidator for text fields", () => {
        const field: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: false,
        };
        const validator = FieldValidatorFactory.create(field);

        expect(validator).toBeInstanceOf(TextFieldValidator);
      });

      it("should create SecureTextFieldValidator for secure-text fields", () => {
        const field: SecureTextField = {
          type: "secure-text",
          id: "apiKey",
          label: "API Key",
          required: false,
        };
        const validator = FieldValidatorFactory.create(field);

        expect(validator).toBeInstanceOf(SecureTextFieldValidator);
      });

      it("should create CheckboxFieldValidator for checkbox fields", () => {
        const field: CheckboxField = {
          type: "checkbox",
          id: "enableFeature",
          label: "Enable Feature",
          required: false,
        };
        const validator = FieldValidatorFactory.create(field);

        expect(validator).toBeInstanceOf(CheckboxFieldValidator);
      });

      it("should throw error for unknown field types", () => {
        const invalidField = {
          type: "unknown",
          id: "testField",
          label: "Test Field",
          required: false,
        } as unknown as LlmFieldConfig;

        expect(() => FieldValidatorFactory.create(invalidField)).toThrow(
          "Unknown field type: unknown",
        );
      });
    });

    describe("direct field validation", () => {
      it("should validate field using appropriate validator", () => {
        const textField: TextField = {
          type: "text",
          id: "testField",
          label: "Test Field",
          required: true,
        };

        const result = FieldValidatorFactory.validateField("valid", textField);
        expect(result.valid).toBe(true);

        const emptyResult = FieldValidatorFactory.validateField("", textField);
        expect(emptyResult.valid).toBe(false);
        expect(emptyResult.errors[0]?.code).toBe(
          LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        );
      });

      it("should validate checkbox field", () => {
        const checkboxField: CheckboxField = {
          type: "checkbox",
          id: "enableFeature",
          label: "Enable Feature",
          required: false,
        };

        expect(
          FieldValidatorFactory.validateField(true, checkboxField).valid,
        ).toBe(true);
        expect(
          FieldValidatorFactory.validateField(false, checkboxField).valid,
        ).toBe(true);
        expect(
          FieldValidatorFactory.validateField("true", checkboxField).valid,
        ).toBe(false);
      });
    });
  });

  describe("BaseFieldValidator", () => {
    // Test the abstract class through concrete implementations
    describe("hasValue method", () => {
      it("TextFieldValidator should detect string values correctly", () => {
        const field: TextField = {
          type: "text",
          id: "test",
          label: "Test",
          required: false,
        };
        const validator = new TextFieldValidator(field);

        // Use public validate method to test protected hasValue indirectly
        expect(validator.validate("value").valid).toBe(true);
        expect(validator.validate("").valid).toBe(true); // Optional field
        expect(validator.validate("   ").valid).toBe(true); // Optional field
      });

      it("CheckboxFieldValidator should handle null/undefined correctly", () => {
        const field: CheckboxField = {
          type: "checkbox",
          id: "test",
          label: "Test",
          required: false,
        };
        const validator = new CheckboxFieldValidator(field);

        expect(validator.validate(null).valid).toBe(true);
        expect(validator.validate(undefined).valid).toBe(true);
        expect(validator.validate(true).valid).toBe(true);
        expect(validator.validate(false).valid).toBe(true);
      });
    });
  });
});

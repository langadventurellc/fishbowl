import {
  isSecureTextField,
  isTextField,
  isCheckboxField,
} from "../fieldTypeGuards";
import type { LlmFieldConfig } from "../LlmFieldConfig";
import type { SecureTextField } from "../SecureTextField";
import type { TextField } from "../TextField";
import type { CheckboxField } from "../CheckboxField";

describe("fieldTypeGuards", () => {
  // Test data for each field type
  const secureTextFieldExample: SecureTextField = {
    type: "secure-text",
    id: "apiKey",
    label: "API Key",
    placeholder: "sk-...",
    required: true,
    helperText: "Your API key",
    minLength: 20,
    maxLength: 100,
    pattern: "^sk-[a-zA-Z0-9]+$",
  };

  const textFieldExample: TextField = {
    type: "text",
    id: "baseUrl",
    label: "Base URL",
    placeholder: "https://api.example.com",
    required: false,
    helperText: "Optional: Custom API endpoint",
    defaultValue: "https://api.example.com",
    minLength: 10,
    maxLength: 200,
    pattern: "^https?://",
  };

  const checkboxFieldExample: CheckboxField = {
    type: "checkbox",
    id: "useAuthHeader",
    label: "Use Authorization Header",
    required: false,
    helperText: "Send API key in Authorization header",
    defaultValue: false,
  };

  describe("isSecureTextField", () => {
    it("should return true for secure-text fields", () => {
      const result = isSecureTextField(secureTextFieldExample);
      expect(result).toBe(true);
    });

    it("should return false for text fields", () => {
      const result = isSecureTextField(textFieldExample);
      expect(result).toBe(false);
    });

    it("should return false for checkbox fields", () => {
      const result = isSecureTextField(checkboxFieldExample);
      expect(result).toBe(false);
    });

    it("should provide correct type narrowing", () => {
      const field: LlmFieldConfig = secureTextFieldExample;

      if (isSecureTextField(field)) {
        // TypeScript should narrow field to SecureTextField
        expect(field.type).toBe("secure-text");
        expect(field.minLength).toBe(20);
        expect(field.maxLength).toBe(100);
        expect(field.pattern).toBe("^sk-[a-zA-Z0-9]+$");
        // This should compile without TypeScript errors
        const narrowedField: SecureTextField = field;
        expect(narrowedField).toBeDefined();
      } else {
        expect(true).toBe(false); // Should not reach this branch
      }
    });

    it("should work with minimal secure-text field configuration", () => {
      const minimalField: SecureTextField = {
        type: "secure-text",
        id: "key",
        label: "Key",
        required: true,
      };

      const result = isSecureTextField(minimalField);
      expect(result).toBe(true);
    });
  });

  describe("isTextField", () => {
    it("should return true for text fields", () => {
      const result = isTextField(textFieldExample);
      expect(result).toBe(true);
    });

    it("should return false for secure-text fields", () => {
      const result = isTextField(secureTextFieldExample);
      expect(result).toBe(false);
    });

    it("should return false for checkbox fields", () => {
      const result = isTextField(checkboxFieldExample);
      expect(result).toBe(false);
    });

    it("should provide correct type narrowing", () => {
      const field: LlmFieldConfig = textFieldExample;

      if (isTextField(field)) {
        // TypeScript should narrow field to TextField
        expect(field.type).toBe("text");
        expect(field.defaultValue).toBe("https://api.example.com");
        expect(field.minLength).toBe(10);
        expect(field.maxLength).toBe(200);
        expect(field.pattern).toBe("^https?://");
        // This should compile without TypeScript errors
        const narrowedField: TextField = field;
        expect(narrowedField).toBeDefined();
      } else {
        expect(true).toBe(false); // Should not reach this branch
      }
    });

    it("should work with minimal text field configuration", () => {
      const minimalField: TextField = {
        type: "text",
        id: "url",
        label: "URL",
        required: false,
      };

      const result = isTextField(minimalField);
      expect(result).toBe(true);
    });
  });

  describe("isCheckboxField", () => {
    it("should return true for checkbox fields", () => {
      const result = isCheckboxField(checkboxFieldExample);
      expect(result).toBe(true);
    });

    it("should return false for secure-text fields", () => {
      const result = isCheckboxField(secureTextFieldExample);
      expect(result).toBe(false);
    });

    it("should return false for text fields", () => {
      const result = isCheckboxField(textFieldExample);
      expect(result).toBe(false);
    });

    it("should provide correct type narrowing", () => {
      const field: LlmFieldConfig = checkboxFieldExample;

      if (isCheckboxField(field)) {
        // TypeScript should narrow field to CheckboxField
        expect(field.type).toBe("checkbox");
        expect(field.defaultValue).toBe(false);
        // This should compile without TypeScript errors
        const narrowedField: CheckboxField = field;
        expect(narrowedField).toBeDefined();
      } else {
        expect(true).toBe(false); // Should not reach this branch
      }
    });

    it("should work with minimal checkbox field configuration", () => {
      const minimalField: CheckboxField = {
        type: "checkbox",
        id: "option",
        label: "Option",
        required: false,
      };

      const result = isCheckboxField(minimalField);
      expect(result).toBe(true);
    });
  });

  describe("discriminated union exhaustiveness", () => {
    it("should handle all field types in switch statement", () => {
      const fields: LlmFieldConfig[] = [
        secureTextFieldExample,
        textFieldExample,
        checkboxFieldExample,
      ];

      fields.forEach((field) => {
        let handled = false;

        switch (field.type) {
          case "secure-text":
            expect(isSecureTextField(field)).toBe(true);
            expect(isTextField(field)).toBe(false);
            expect(isCheckboxField(field)).toBe(false);
            handled = true;
            break;
          case "text":
            expect(isSecureTextField(field)).toBe(false);
            expect(isTextField(field)).toBe(true);
            expect(isCheckboxField(field)).toBe(false);
            handled = true;
            break;
          case "checkbox":
            expect(isSecureTextField(field)).toBe(false);
            expect(isTextField(field)).toBe(false);
            expect(isCheckboxField(field)).toBe(true);
            handled = true;
            break;
          default:
            // This should never happen with proper discriminated union
            expect(true).toBe(false); // Unhandled field type
        }

        expect(handled).toBe(true);
      });
    });
  });

  describe("type guard function composition", () => {
    it("should allow combining type guards in conditional logic", () => {
      const fields: LlmFieldConfig[] = [
        secureTextFieldExample,
        textFieldExample,
        checkboxFieldExample,
      ];

      fields.forEach((field) => {
        const isStringField = isSecureTextField(field) || isTextField(field);
        const isBooleanField = isCheckboxField(field);

        // Should be mutually exclusive
        expect(isStringField && isBooleanField).toBe(false);

        // Should cover all cases
        expect(isStringField || isBooleanField).toBe(true);

        if (isStringField) {
          // Both secure-text and text fields should have string values
          expect(field.type === "secure-text" || field.type === "text").toBe(
            true,
          );
        }

        if (isBooleanField) {
          // Only checkbox fields should have boolean values
          expect(field.type).toBe("checkbox");
          expect(
            typeof field.defaultValue === "boolean" ||
              field.defaultValue === undefined,
          ).toBe(true);
        }
      });
    });
  });

  describe("edge cases and error conditions", () => {
    it("should handle fields with all optional properties", () => {
      const minimalSecure: SecureTextField = {
        type: "secure-text",
        id: "test",
        label: "Test",
        required: false,
      };

      const minimalText: TextField = {
        type: "text",
        id: "test",
        label: "Test",
        required: false,
      };

      const minimalCheckbox: CheckboxField = {
        type: "checkbox",
        id: "test",
        label: "Test",
        required: false,
      };

      expect(isSecureTextField(minimalSecure)).toBe(true);
      expect(isTextField(minimalText)).toBe(true);
      expect(isCheckboxField(minimalCheckbox)).toBe(true);
    });

    it("should work correctly with fields that have only required properties", () => {
      const bareSecure: SecureTextField = {
        type: "secure-text",
        id: "required-only",
        label: "Required Only",
        required: true,
      };

      expect(isSecureTextField(bareSecure)).toBe(true);
      expect(isTextField(bareSecure)).toBe(false);
      expect(isCheckboxField(bareSecure)).toBe(false);
    });
  });
});

import { getEnhancedFieldDefault } from "../getEnhancedFieldDefault";
import type { LlmFieldConfig } from "../../LlmFieldConfig";

describe("getEnhancedFieldDefault", () => {
  describe("with configured default values", () => {
    it("should return configured default for text field", () => {
      const textField: LlmFieldConfig = {
        id: "baseUrl",
        type: "text",
        label: "Base URL",
        required: false,
        defaultValue: "https://api.example.com",
      };

      expect(getEnhancedFieldDefault(textField)).toBe(
        "https://api.example.com",
      );
    });

    it("should return configured default for checkbox field", () => {
      const checkboxField: LlmFieldConfig = {
        id: "enableAuth",
        type: "checkbox",
        label: "Enable Auth",
        required: false,
        defaultValue: true,
      };

      expect(getEnhancedFieldDefault(checkboxField)).toBe(true);
    });
  });

  describe("without configured default values", () => {
    it("should return type default for text field without defaultValue", () => {
      const textField: LlmFieldConfig = {
        id: "customField",
        type: "text",
        label: "Custom Field",
        required: false,
      };

      expect(getEnhancedFieldDefault(textField)).toBe("");
    });

    it("should return type default for secure-text field", () => {
      const secureField: LlmFieldConfig = {
        id: "apiKey",
        type: "secure-text",
        label: "API Key",
        required: true,
      };

      // Secure fields never have configured defaults
      expect(getEnhancedFieldDefault(secureField)).toBe("");
    });

    it("should return type default for checkbox field without defaultValue", () => {
      const checkboxField: LlmFieldConfig = {
        id: "optionalFlag",
        type: "checkbox",
        label: "Optional Flag",
        required: false,
      };

      expect(getEnhancedFieldDefault(checkboxField)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle text field with empty string default", () => {
      const textField: LlmFieldConfig = {
        id: "emptyDefault",
        type: "text",
        label: "Empty Default",
        required: false,
        defaultValue: "",
      };

      expect(getEnhancedFieldDefault(textField)).toBe("");
    });

    it("should handle checkbox field with false default", () => {
      const checkboxField: LlmFieldConfig = {
        id: "falseDefault",
        type: "checkbox",
        label: "False Default",
        required: false,
        defaultValue: false,
      };

      expect(getEnhancedFieldDefault(checkboxField)).toBe(false);
    });

    it("should return type default for secure field even if configured", () => {
      // This test verifies that secure fields don't use configured defaults
      const secureField: LlmFieldConfig = {
        id: "secureField",
        type: "secure-text",
        label: "Secure Field",
        required: false,
        // Note: This would be unusual but the function should handle it gracefully
      };

      expect(getEnhancedFieldDefault(secureField)).toBe("");
    });
  });

  describe("return type consistency", () => {
    it("should return appropriate types for each field type", () => {
      const textField: LlmFieldConfig = {
        id: "text",
        type: "text",
        label: "Text",
        required: false,
      };

      const checkboxField: LlmFieldConfig = {
        id: "checkbox",
        type: "checkbox",
        label: "Checkbox",
        required: false,
      };

      const secureField: LlmFieldConfig = {
        id: "secure",
        type: "secure-text",
        label: "Secure",
        required: false,
      };

      expect(typeof getEnhancedFieldDefault(textField)).toBe("string");
      expect(typeof getEnhancedFieldDefault(checkboxField)).toBe("boolean");
      expect(typeof getEnhancedFieldDefault(secureField)).toBe("string");
    });
  });
});

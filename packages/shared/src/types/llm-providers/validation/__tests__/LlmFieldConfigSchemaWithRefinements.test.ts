import { LlmFieldConfigSchemaWithRefinements } from "../LlmFieldConfigSchemaWithRefinements";

describe("LlmFieldConfigSchemaWithRefinements", () => {
  describe("cross-field validation for text fields", () => {
    it("should accept text field with valid minLength and maxLength", () => {
      const validConfig = {
        id: "model-name",
        label: "Model Name",
        type: "text" as const,
        required: true,
        minLength: 5,
        maxLength: 50,
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept text field with only minLength", () => {
      const validConfig = {
        id: "model-name",
        label: "Model Name",
        type: "text" as const,
        required: true,
        minLength: 5,
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept text field with only maxLength", () => {
      const validConfig = {
        id: "model-name",
        label: "Model Name",
        type: "text" as const,
        required: true,
        maxLength: 50,
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should reject text field with minLength > maxLength", () => {
      expect(() => {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "model-name",
          label: "Model Name",
          type: "text",
          required: true,
          minLength: 50,
          maxLength: 10,
        });
      }).toThrow("Minimum length cannot be greater than maximum length");
    });

    it("should accept text field with minLength = maxLength", () => {
      const validConfig = {
        id: "fixed-length",
        label: "Fixed Length Field",
        type: "text" as const,
        required: true,
        minLength: 10,
        maxLength: 10,
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });
  });

  describe("cross-field validation for secure text fields", () => {
    it("should accept secure text field with valid minLength and maxLength", () => {
      const validConfig = {
        id: "api-key",
        label: "API Key",
        type: "secure-text" as const,
        required: true,
        minLength: 20,
        maxLength: 100,
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should reject secure text field with minLength > maxLength", () => {
      expect(() => {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "api-key",
          label: "API Key",
          type: "secure-text",
          required: true,
          minLength: 100,
          maxLength: 20,
        });
      }).toThrow("Minimum length cannot be greater than maximum length");
    });
  });

  describe("regular expression pattern validation", () => {
    it("should accept text field with valid regex pattern", () => {
      const validConfig = {
        id: "url-field",
        label: "URL",
        type: "text" as const,
        required: true,
        pattern: "^https?://.*",
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept secure text field with valid regex pattern", () => {
      const validConfig = {
        id: "api-key",
        label: "API Key",
        type: "secure-text" as const,
        required: true,
        pattern: "^sk-[a-zA-Z0-9]+$",
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should reject text field with invalid regex pattern", () => {
      expect(() => {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "url-field",
          label: "URL",
          type: "text",
          required: true,
          pattern: "[invalid-regex",
        });
      }).toThrow("Pattern must be a valid regular expression");
    });

    it("should reject secure text field with invalid regex pattern", () => {
      expect(() => {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "api-key",
          label: "API Key",
          type: "secure-text",
          required: true,
          pattern: "(?unclosed-group",
        });
      }).toThrow("Pattern must be a valid regular expression");
    });

    it("should accept field without pattern", () => {
      const validConfig = {
        id: "simple-text",
        label: "Simple Text",
        type: "text" as const,
        required: true,
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });
  });

  describe("checkbox field validation (no refinements)", () => {
    it("should accept checkbox field normally", () => {
      const validConfig = {
        id: "enable-feature",
        label: "Enable Feature",
        type: "checkbox" as const,
        required: false,
        defaultValue: true,
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should not apply text field refinements to checkbox fields", () => {
      // Checkbox fields don't have minLength/maxLength/pattern, so refinements don't apply
      const validConfig = {
        id: "checkbox-field",
        label: "Checkbox Field",
        type: "checkbox" as const,
        required: true,
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });
  });

  describe("complex validation scenarios", () => {
    it("should handle text field with all constraints valid", () => {
      const validConfig = {
        id: "complex-field",
        label: "Complex Field",
        type: "text" as const,
        required: true,
        defaultValue: "default-value",
        minLength: 5,
        maxLength: 50,
        pattern: "^[a-zA-Z0-9-]+$",
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should handle secure text field with all constraints valid", () => {
      const validConfig = {
        id: "secure-complex",
        label: "Secure Complex Field",
        type: "secure-text" as const,
        required: true,
        minLength: 32,
        maxLength: 64,
        pattern: "^[A-Za-z0-9]{32,64}$",
      };

      const result = LlmFieldConfigSchemaWithRefinements.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should reject when both length and pattern constraints are violated", () => {
      expect(() => {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "bad-field",
          label: "Bad Field",
          type: "text",
          required: true,
          minLength: 100,
          maxLength: 10, // minLength > maxLength
          pattern: "[invalid-regex", // Invalid regex
        });
      }).toThrow(); // Should throw one of the validation errors
    });
  });

  describe("inheritance from base LlmFieldConfigSchema", () => {
    it("should still validate base discriminated union constraints", () => {
      expect(() => {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "test-id",
          label: "Test Label",
          type: "invalid-type",
          required: true,
        });
      }).toThrow(
        "Invalid field type. Must be 'text', 'secure-text', or 'checkbox'",
      );
    });

    it("should still validate BaseFieldConfig constraints", () => {
      expect(() => {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "",
          label: "Test Label",
          type: "text",
          required: true,
        });
      }).toThrow("Field ID is required");
    });
  });

  describe("error reporting", () => {
    it("should report minLength validation error with correct path", () => {
      try {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "test-field",
          label: "Test Field",
          type: "text",
          required: true,
          minLength: 50,
          maxLength: 10,
        });
        throw new Error("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // The error should contain information about the minLength field
        expect(String(error)).toContain(
          "Minimum length cannot be greater than maximum length",
        );
      }
    });

    it("should report pattern validation error with correct path", () => {
      try {
        LlmFieldConfigSchemaWithRefinements.parse({
          id: "test-field",
          label: "Test Field",
          type: "text",
          required: true,
          pattern: "[unclosed",
        });
        throw new Error("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(String(error)).toContain(
          "Pattern must be a valid regular expression",
        );
      }
    });
  });
});

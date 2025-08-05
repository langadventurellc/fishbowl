import { LlmFieldConfigSchema } from "../LlmFieldConfigSchema";

describe("LlmFieldConfigSchema", () => {
  describe("text field validation", () => {
    it("should accept valid text field", () => {
      const validTextField = {
        id: "model-name",
        label: "Model Name",
        type: "text" as const,
        required: true,
        defaultValue: "gpt-4",
        minLength: 1,
        maxLength: 50,
      };

      const result = LlmFieldConfigSchema.parse(validTextField);
      expect(result).toEqual(validTextField);
      expect(result.type).toBe("text");
    });

    it("should correctly discriminate text field type", () => {
      const textField = {
        id: "api-url",
        label: "API URL",
        type: "text" as const,
        required: false,
        pattern: "^https?://",
      };

      const result = LlmFieldConfigSchema.parse(textField);
      if (result.type === "text") {
        expect(result.pattern).toBe("^https?://");
        expect(result.defaultValue).toBeUndefined();
      } else {
        throw new Error("Expected text field type");
      }
    });
  });

  describe("secure text field validation", () => {
    it("should accept valid secure text field", () => {
      const validSecureTextField = {
        id: "api-key",
        label: "API Key",
        type: "secure-text" as const,
        required: true,
        minLength: 20,
        maxLength: 100,
        pattern: "^sk-",
      };

      const result = LlmFieldConfigSchema.parse(validSecureTextField);
      expect(result).toEqual(validSecureTextField);
      expect(result.type).toBe("secure-text");
    });

    it("should correctly discriminate secure text field type", () => {
      const secureTextField = {
        id: "password",
        label: "Password",
        type: "secure-text" as const,
        required: true,
        minLength: 8,
      };

      const result = LlmFieldConfigSchema.parse(secureTextField);
      if (result.type === "secure-text") {
        expect(result.minLength).toBe(8);
        // Secure text fields don't have defaultValue
        expect("defaultValue" in result).toBe(false);
      } else {
        throw new Error("Expected secure-text field type");
      }
    });
  });

  describe("checkbox field validation", () => {
    it("should accept valid checkbox field", () => {
      const validCheckboxField = {
        id: "enable-streaming",
        label: "Enable Streaming",
        type: "checkbox" as const,
        required: false,
        defaultValue: true,
      };

      const result = LlmFieldConfigSchema.parse(validCheckboxField);
      expect(result).toEqual(validCheckboxField);
      expect(result.type).toBe("checkbox");
    });

    it("should correctly discriminate checkbox field type", () => {
      const checkboxField = {
        id: "terms",
        label: "Accept Terms",
        type: "checkbox" as const,
        required: true,
      };

      const result = LlmFieldConfigSchema.parse(checkboxField);
      if (result.type === "checkbox") {
        expect(result.required).toBe(true);
        // Checkbox fields don't have minLength/maxLength/pattern
        expect("minLength" in result).toBe(false);
        expect("maxLength" in result).toBe(false);
        expect("pattern" in result).toBe(false);
      } else {
        throw new Error("Expected checkbox field type");
      }
    });
  });

  describe("discriminated union type validation", () => {
    it("should reject invalid field type", () => {
      expect(() => {
        LlmFieldConfigSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "invalid-type",
          required: true,
        });
      }).toThrow(
        "Invalid field type. Must be 'text', 'secure-text', or 'checkbox'",
      );
    });

    it("should reject missing type field", () => {
      expect(() => {
        LlmFieldConfigSchema.parse({
          id: "test-id",
          label: "Test Label",
          required: true,
        });
      }).toThrow();
    });

    it("should reject object with wrong type field", () => {
      expect(() => {
        LlmFieldConfigSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "number",
          required: true,
        });
      }).toThrow(
        "Invalid field type. Must be 'text', 'secure-text', or 'checkbox'",
      );
    });
  });

  describe("field-specific property validation", () => {
    it("should accept valid secure-text field without defaultValue", () => {
      const result = LlmFieldConfigSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "secure-text",
        required: true,
        minLength: 10,
      });
      expect(result.type).toBe("secure-text");
      expect("defaultValue" in result).toBe(false);
    });

    it("should accept valid checkbox field without length constraints", () => {
      const result = LlmFieldConfigSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "checkbox",
        required: true,
        defaultValue: true,
      });
      expect(result.type).toBe("checkbox");
      expect("minLength" in result).toBe(false);
      expect("maxLength" in result).toBe(false);
      expect("pattern" in result).toBe(false);
    });

    it("should reject checkbox-specific properties on text field", () => {
      expect(() => {
        LlmFieldConfigSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
          defaultValue: true, // boolean instead of string
        });
      }).toThrow();
    });
  });

  describe("complete field configurations", () => {
    it("should handle array of mixed field types", () => {
      const mixedFields = [
        {
          id: "model",
          label: "Model",
          type: "text" as const,
          required: true,
          defaultValue: "gpt-4",
        },
        {
          id: "api-key",
          label: "API Key",
          type: "secure-text" as const,
          required: true,
          minLength: 20,
        },
        {
          id: "streaming",
          label: "Enable Streaming",
          type: "checkbox" as const,
          required: false,
          defaultValue: false,
        },
      ];

      mixedFields.forEach((field) => {
        const result = LlmFieldConfigSchema.parse(field);
        expect(result.type).toBe(field.type);
        expect(result.id).toBe(field.id);
      });
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        LlmFieldConfigSchema.parse(null);
      }).toThrow();
    });

    it("should reject array input", () => {
      expect(() => {
        LlmFieldConfigSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        LlmFieldConfigSchema.parse("invalid");
      }).toThrow();
    });

    it("should reject number input", () => {
      expect(() => {
        LlmFieldConfigSchema.parse(42);
      }).toThrow();
    });

    it("should reject undefined input", () => {
      expect(() => {
        LlmFieldConfigSchema.parse(undefined);
      }).toThrow();
    });
  });

  describe("type narrowing and inference", () => {
    it("should properly narrow types after parsing", () => {
      const textFieldData = {
        id: "url",
        label: "API URL",
        type: "text" as const,
        required: true,
        defaultValue: "https://api.example.com",
      };

      const result = LlmFieldConfigSchema.parse(textFieldData);

      // TypeScript should narrow the type properly
      if (result.type === "text") {
        // These properties should be available
        expect(typeof result.defaultValue).toBe("string");
        expect(["number", "undefined"]).toContain(typeof result.minLength);
        expect(["number", "undefined"]).toContain(typeof result.maxLength);
        expect(["string", "undefined"]).toContain(typeof result.pattern);
      }

      if (result.type === "secure-text") {
        // defaultValue should not exist on secure-text
        expect("defaultValue" in result).toBe(false);
      }

      if (result.type === "checkbox") {
        // These properties should not exist on checkbox
        expect("minLength" in result).toBe(false);
        expect("maxLength" in result).toBe(false);
        expect("pattern" in result).toBe(false);
      }
    });
  });
});

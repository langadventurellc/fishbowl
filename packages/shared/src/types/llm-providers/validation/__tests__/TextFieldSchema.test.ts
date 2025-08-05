import { TextFieldSchema } from "../TextFieldSchema";

describe("TextFieldSchema", () => {
  describe("valid text field configurations", () => {
    it("should accept complete valid text field config", () => {
      const validConfig = {
        id: "model-name",
        label: "Model Name",
        type: "text" as const,
        placeholder: "Enter model name",
        required: true,
        helperText: "The name of the AI model to use",
        defaultValue: "gpt-4",
        minLength: 1,
        maxLength: 100,
        pattern: "^[a-zA-Z0-9-]+$",
      };

      const result = TextFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept minimal valid text field config", () => {
      const validConfig = {
        id: "endpoint",
        label: "API Endpoint",
        type: "text" as const,
        required: false,
      };

      const result = TextFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept text field with only some optional fields", () => {
      const validConfig = {
        id: "organization",
        label: "Organization ID",
        type: "text" as const,
        required: true,
        defaultValue: "default-org",
        maxLength: 50,
      };

      const result = TextFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });
  });

  describe("type field validation", () => {
    it("should accept 'text' type", () => {
      const result = TextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "text",
        required: true,
      });
      expect(result.type).toBe("text");
    });

    it("should reject non-'text' type", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "password",
          required: true,
        });
      }).toThrow("Field type must be 'text'");
    });

    it("should reject missing type", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          required: true,
        });
      }).toThrow();
    });
  });

  describe("text-specific field validation", () => {
    it("should accept valid defaultValue string", () => {
      const result = TextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "text",
        required: true,
        defaultValue: "default text",
      });
      expect(result.defaultValue).toBe("default text");
    });

    it("should accept valid minLength", () => {
      const result = TextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "text",
        required: true,
        minLength: 5,
      });
      expect(result.minLength).toBe(5);
    });

    it("should accept valid maxLength", () => {
      const result = TextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "text",
        required: true,
        maxLength: 100,
      });
      expect(result.maxLength).toBe(100);
    });

    it("should accept valid pattern", () => {
      const result = TextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "text",
        required: true,
        pattern: "^[a-z]+$",
      });
      expect(result.pattern).toBe("^[a-z]+$");
    });

    it("should reject non-string defaultValue", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
          defaultValue: 123,
        });
      }).toThrow("Default value must be a string");
    });

    it("should reject non-number minLength", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
          minLength: "5",
        });
      }).toThrow("Minimum length must be a number");
    });

    it("should reject negative minLength", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
          minLength: -1,
        });
      }).toThrow("Minimum length cannot be negative");
    });

    it("should reject non-number maxLength", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
          maxLength: "100",
        });
      }).toThrow("Maximum length must be a number");
    });

    it("should reject negative maxLength", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
          maxLength: -5,
        });
      }).toThrow("Maximum length must be at least 0");
    });

    it("should accept zero maxLength", () => {
      const result = TextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "text",
        required: true,
        maxLength: 0,
      });
      expect(result.maxLength).toBe(0);
    });

    it("should reject non-string pattern", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
          pattern: 123,
        });
      }).toThrow("Pattern must be a string");
    });
  });

  describe("inheritance from BaseFieldConfigSchema", () => {
    it("should validate base field properties", () => {
      expect(() => {
        TextFieldSchema.parse({
          id: "",
          label: "Test Label",
          type: "text",
          required: true,
        });
      }).toThrow("Field ID is required");
    });

    it("should accept base field optional properties", () => {
      const result = TextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "text",
        required: true,
        placeholder: "Enter text here",
        helperText: "This is helper text",
      });
      expect(result.placeholder).toBe("Enter text here");
      expect(result.helperText).toBe("This is helper text");
    });
  });

  describe("complete valid text field object", () => {
    it("should validate a complete valid text field object", () => {
      const validTextField = {
        id: "api-endpoint",
        label: "API Endpoint URL",
        type: "text" as const,
        placeholder: "https://api.example.com",
        required: true,
        helperText: "The base URL for API requests",
        defaultValue: "https://api.openai.com",
        minLength: 10,
        maxLength: 200,
        pattern: "^https?://.*",
      };

      const result = TextFieldSchema.parse(validTextField);
      expect(result).toEqual(validTextField);
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        TextFieldSchema.parse(null);
      }).toThrow();
    });

    it("should reject array input", () => {
      expect(() => {
        TextFieldSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        TextFieldSchema.parse("invalid");
      }).toThrow();
    });
  });
});

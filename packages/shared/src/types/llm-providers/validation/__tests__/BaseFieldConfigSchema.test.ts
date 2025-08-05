import { BaseFieldConfigSchema } from "../BaseFieldConfigSchema";

describe("BaseFieldConfigSchema", () => {
  describe("valid base field configurations", () => {
    it("should accept complete valid base field config", () => {
      const validConfig = {
        id: "api-key",
        label: "API Key",
        placeholder: "Enter your API key",
        required: true,
        helperText: "Your OpenAI API key",
      };

      const result = BaseFieldConfigSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept minimal valid base field config", () => {
      const validConfig = {
        id: "username",
        label: "Username",
        required: false,
      };

      const result = BaseFieldConfigSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept config with optional fields undefined", () => {
      const validConfig = {
        id: "email",
        label: "Email Address",
        required: true,
        placeholder: undefined,
        helperText: undefined,
      };

      const result = BaseFieldConfigSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });
  });

  describe("field ID validation", () => {
    it("should reject empty string ID", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: "",
          label: "Test Label",
          required: true,
        });
      }).toThrow("Field ID is required");
    });

    it("should reject non-string ID", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: 123,
          label: "Test Label",
          required: true,
        });
      }).toThrow("Field ID must be a string");
    });

    it("should reject missing ID", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          label: "Test Label",
          required: true,
        });
      }).toThrow();
    });
  });

  describe("field label validation", () => {
    it("should reject empty string label", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: "test-id",
          label: "",
          required: true,
        });
      }).toThrow("Field label is required");
    });

    it("should reject non-string label", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: "test-id",
          label: 123,
          required: true,
        });
      }).toThrow("Field label must be a string");
    });

    it("should reject missing label", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: "test-id",
          required: true,
        });
      }).toThrow();
    });
  });

  describe("required field validation", () => {
    it("should accept true for required", () => {
      const result = BaseFieldConfigSchema.parse({
        id: "test-id",
        label: "Test Label",
        required: true,
      });
      expect(result.required).toBe(true);
    });

    it("should accept false for required", () => {
      const result = BaseFieldConfigSchema.parse({
        id: "test-id",
        label: "Test Label",
        required: false,
      });
      expect(result.required).toBe(false);
    });

    it("should reject non-boolean required", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: "test-id",
          label: "Test Label",
          required: "true",
        });
      }).toThrow("Required must be a boolean");
    });

    it("should reject missing required field", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: "test-id",
          label: "Test Label",
        });
      }).toThrow();
    });
  });

  describe("optional fields validation", () => {
    it("should accept valid placeholder string", () => {
      const result = BaseFieldConfigSchema.parse({
        id: "test-id",
        label: "Test Label",
        required: true,
        placeholder: "Enter value here",
      });
      expect(result.placeholder).toBe("Enter value here");
    });

    it("should accept valid helperText string", () => {
      const result = BaseFieldConfigSchema.parse({
        id: "test-id",
        label: "Test Label",
        required: true,
        helperText: "This field is required",
      });
      expect(result.helperText).toBe("This field is required");
    });

    it("should reject non-string placeholder", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: "test-id",
          label: "Test Label",
          required: true,
          placeholder: 123,
        });
      }).toThrow("Placeholder must be a string");
    });

    it("should reject non-string helperText", () => {
      expect(() => {
        BaseFieldConfigSchema.parse({
          id: "test-id",
          label: "Test Label",
          required: true,
          helperText: 123,
        });
      }).toThrow("Helper text must be a string");
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        BaseFieldConfigSchema.parse(null);
      }).toThrow();
    });

    it("should reject array input", () => {
      expect(() => {
        BaseFieldConfigSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        BaseFieldConfigSchema.parse("invalid");
      }).toThrow();
    });

    it("should reject undefined input", () => {
      expect(() => {
        BaseFieldConfigSchema.parse(undefined);
      }).toThrow();
    });
  });
});

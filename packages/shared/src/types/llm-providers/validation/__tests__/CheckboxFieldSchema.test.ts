import { CheckboxFieldSchema } from "../CheckboxFieldSchema";

describe("CheckboxFieldSchema", () => {
  describe("valid checkbox field configurations", () => {
    it("should accept complete valid checkbox field config", () => {
      const validConfig = {
        id: "enable-feature",
        label: "Enable Feature",
        type: "checkbox" as const,
        placeholder: "Check to enable",
        required: false,
        helperText: "Toggle this feature on or off",
        defaultValue: true,
      };

      const result = CheckboxFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept minimal valid checkbox field config", () => {
      const validConfig = {
        id: "terms-accepted",
        label: "Accept Terms",
        type: "checkbox" as const,
        required: true,
      };

      const result = CheckboxFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept checkbox field with only some optional fields", () => {
      const validConfig = {
        id: "newsletter",
        label: "Subscribe to Newsletter",
        type: "checkbox" as const,
        required: false,
        helperText: "Receive updates about new features",
        defaultValue: false,
      };

      const result = CheckboxFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });
  });

  describe("type field validation", () => {
    it("should accept 'checkbox' type", () => {
      const result = CheckboxFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "checkbox",
        required: true,
      });
      expect(result.type).toBe("checkbox");
    });

    it("should reject non-'checkbox' type", () => {
      expect(() => {
        CheckboxFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
        });
      }).toThrow("Field type must be 'checkbox'");
    });

    it("should reject missing type", () => {
      expect(() => {
        CheckboxFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          required: true,
        });
      }).toThrow();
    });
  });

  describe("checkbox specific field validation", () => {
    it("should accept true for defaultValue", () => {
      const result = CheckboxFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "checkbox",
        required: true,
        defaultValue: true,
      });
      expect(result.defaultValue).toBe(true);
    });

    it("should accept false for defaultValue", () => {
      const result = CheckboxFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "checkbox",
        required: true,
        defaultValue: false,
      });
      expect(result.defaultValue).toBe(false);
    });

    it("should accept undefined for defaultValue", () => {
      const result = CheckboxFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "checkbox",
        required: true,
        defaultValue: undefined,
      });
      expect(result.defaultValue).toBeUndefined();
    });

    it("should reject non-boolean defaultValue", () => {
      expect(() => {
        CheckboxFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "checkbox",
          required: true,
          defaultValue: "true",
        });
      }).toThrow("Default value must be a boolean");
    });

    it("should reject numeric defaultValue", () => {
      expect(() => {
        CheckboxFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "checkbox",
          required: true,
          defaultValue: 1,
        });
      }).toThrow("Default value must be a boolean");
    });
  });

  describe("inheritance from BaseFieldConfigSchema", () => {
    it("should validate base field properties", () => {
      expect(() => {
        CheckboxFieldSchema.parse({
          id: "",
          label: "Test Label",
          type: "checkbox",
          required: true,
        });
      }).toThrow("Field ID is required");
    });

    it("should accept base field optional properties", () => {
      const result = CheckboxFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "checkbox",
        required: true,
        placeholder: "Check this box",
        helperText: "This is helper text",
      });
      expect(result.placeholder).toBe("Check this box");
      expect(result.helperText).toBe("This is helper text");
    });
  });

  describe("complete valid checkbox field object", () => {
    it("should validate a complete valid checkbox field object", () => {
      const validCheckboxField = {
        id: "gdpr-consent",
        label: "GDPR Consent",
        type: "checkbox" as const,
        placeholder: "I consent to data processing",
        required: true,
        helperText: "Required for GDPR compliance",
        defaultValue: false,
      };

      const result = CheckboxFieldSchema.parse(validCheckboxField);
      expect(result).toEqual(validCheckboxField);
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        CheckboxFieldSchema.parse(null);
      }).toThrow();
    });

    it("should reject array input", () => {
      expect(() => {
        CheckboxFieldSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        CheckboxFieldSchema.parse("invalid");
      }).toThrow();
    });

    it("should reject undefined input", () => {
      expect(() => {
        CheckboxFieldSchema.parse(undefined);
      }).toThrow();
    });
  });
});

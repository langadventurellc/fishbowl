import { SecureTextFieldSchema } from "../SecureTextFieldSchema";

describe("SecureTextFieldSchema", () => {
  describe("valid secure text field configurations", () => {
    it("should accept complete valid secure text field config", () => {
      const validConfig = {
        id: "api-key",
        label: "API Key",
        type: "secure-text" as const,
        placeholder: "Enter your API key",
        required: true,
        helperText: "Your secret API key - will be encrypted",
        minLength: 20,
        maxLength: 100,
        pattern: "^sk-[a-zA-Z0-9]+$",
      };

      const result = SecureTextFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept minimal valid secure text field config", () => {
      const validConfig = {
        id: "password",
        label: "Password",
        type: "secure-text" as const,
        required: true,
      };

      const result = SecureTextFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept secure text field with only some optional fields", () => {
      const validConfig = {
        id: "token",
        label: "Access Token",
        type: "secure-text" as const,
        required: true,
        placeholder: "Enter access token",
        minLength: 32,
      };

      const result = SecureTextFieldSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });
  });

  describe("type field validation", () => {
    it("should accept 'secure-text' type", () => {
      const result = SecureTextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "secure-text",
        required: true,
      });
      expect(result.type).toBe("secure-text");
    });

    it("should reject non-'secure-text' type", () => {
      expect(() => {
        SecureTextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "text",
          required: true,
        });
      }).toThrow("Field type must be 'secure-text'");
    });

    it("should reject missing type", () => {
      expect(() => {
        SecureTextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          required: true,
        });
      }).toThrow();
    });
  });

  describe("secure text specific field validation", () => {
    it("should accept valid minLength", () => {
      const result = SecureTextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "secure-text",
        required: true,
        minLength: 8,
      });
      expect(result.minLength).toBe(8);
    });

    it("should accept valid maxLength", () => {
      const result = SecureTextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "secure-text",
        required: true,
        maxLength: 256,
      });
      expect(result.maxLength).toBe(256);
    });

    it("should accept valid pattern", () => {
      const result = SecureTextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "secure-text",
        required: true,
        pattern: "^[A-Za-z0-9]{32,}$",
      });
      expect(result.pattern).toBe("^[A-Za-z0-9]{32,}$");
    });

    it("should reject non-number minLength", () => {
      expect(() => {
        SecureTextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "secure-text",
          required: true,
          minLength: "8",
        });
      }).toThrow("Minimum length must be a number");
    });

    it("should reject negative minLength", () => {
      expect(() => {
        SecureTextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "secure-text",
          required: true,
          minLength: -1,
        });
      }).toThrow("Minimum length cannot be negative");
    });

    it("should reject non-number maxLength", () => {
      expect(() => {
        SecureTextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "secure-text",
          required: true,
          maxLength: "256",
        });
      }).toThrow("Maximum length must be a number");
    });

    it("should reject zero or negative maxLength", () => {
      expect(() => {
        SecureTextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "secure-text",
          required: true,
          maxLength: 0,
        });
      }).toThrow("Maximum length must be at least 1");
    });

    it("should reject non-string pattern", () => {
      expect(() => {
        SecureTextFieldSchema.parse({
          id: "test-id",
          label: "Test Label",
          type: "secure-text",
          required: true,
          pattern: 123,
        });
      }).toThrow("Pattern must be a string");
    });
  });

  describe("inheritance from BaseFieldConfigSchema", () => {
    it("should validate base field properties", () => {
      expect(() => {
        SecureTextFieldSchema.parse({
          id: "",
          label: "Test Label",
          type: "secure-text",
          required: true,
        });
      }).toThrow("Field ID is required");
    });

    it("should accept base field optional properties", () => {
      const result = SecureTextFieldSchema.parse({
        id: "test-id",
        label: "Test Label",
        type: "secure-text",
        required: true,
        placeholder: "Enter secure value",
        helperText: "This field is encrypted",
      });
      expect(result.placeholder).toBe("Enter secure value");
      expect(result.helperText).toBe("This field is encrypted");
    });
  });

  describe("complete valid secure text field object", () => {
    it("should validate a complete valid secure text field object", () => {
      const validSecureTextField = {
        id: "openai-api-key",
        label: "OpenAI API Key",
        type: "secure-text" as const,
        placeholder: "sk-...",
        required: true,
        helperText: "Your OpenAI API key (securely stored)",
        minLength: 51,
        maxLength: 60,
        pattern: "^sk-[a-zA-Z0-9]{48}$",
      };

      const result = SecureTextFieldSchema.parse(validSecureTextField);
      expect(result).toEqual(validSecureTextField);
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        SecureTextFieldSchema.parse(null);
      }).toThrow();
    });

    it("should reject array input", () => {
      expect(() => {
        SecureTextFieldSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        SecureTextFieldSchema.parse("invalid");
      }).toThrow();
    });
  });
});

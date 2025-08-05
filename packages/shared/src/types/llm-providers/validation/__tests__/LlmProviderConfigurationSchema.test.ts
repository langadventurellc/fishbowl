import { LlmProviderConfigurationSchema } from "../LlmProviderConfigurationSchema";

describe("LlmProviderConfigurationSchema", () => {
  it("should accept valid configuration with multiple field types", () => {
    const validConfig = {
      fields: [
        {
          id: "apiKey",
          type: "secure-text",
          label: "API Key",
          required: true,
        },
        {
          id: "baseUrl",
          type: "text",
          label: "Base URL",
          required: false,
          defaultValue: "https://api.example.com",
        },
        {
          id: "enableStreaming",
          type: "checkbox",
          label: "Enable Streaming",
          required: false,
          defaultValue: true,
        },
      ],
    };

    const result = LlmProviderConfigurationSchema.parse(validConfig);
    expect(result.fields).toHaveLength(3);
  });

  it("should accept empty fields array", () => {
    const emptyConfig = { fields: [] };
    const result = LlmProviderConfigurationSchema.parse(emptyConfig);
    expect(result.fields).toEqual([]);
  });

  it("should reject invalid field types", () => {
    const invalidConfig = {
      fields: [
        {
          id: "invalidField",
          type: "invalid-type",
          label: "Invalid Field",
          required: true,
        },
      ],
    };

    expect(() => {
      LlmProviderConfigurationSchema.parse(invalidConfig);
    }).toThrow(
      "Invalid field type. Must be 'text', 'secure-text', or 'checkbox'",
    );
  });

  it("should accept configuration with only secure-text fields", () => {
    const secureTextConfig = {
      fields: [
        {
          id: "apiKey",
          type: "secure-text",
          label: "API Key",
          required: true,
          minLength: 10,
          maxLength: 100,
        },
        {
          id: "secretKey",
          type: "secure-text",
          label: "Secret Key",
          required: false,
          helperText: "Optional secret key",
        },
      ],
    };

    const result = LlmProviderConfigurationSchema.parse(secureTextConfig);
    expect(result.fields).toHaveLength(2);
    expect(result.fields[0]?.type).toBe("secure-text");
    expect(result.fields[1]?.type).toBe("secure-text");
  });

  it("should accept configuration with only text fields", () => {
    const textConfig = {
      fields: [
        {
          id: "baseUrl",
          type: "text",
          label: "Base URL",
          required: true,
          pattern: "^https?://",
        },
        {
          id: "endpoint",
          type: "text",
          label: "Endpoint",
          required: false,
          defaultValue: "/v1/chat/completions",
        },
      ],
    };

    const result = LlmProviderConfigurationSchema.parse(textConfig);
    expect(result.fields).toHaveLength(2);
    expect(result.fields[0]?.type).toBe("text");
    expect(result.fields[1]?.type).toBe("text");
  });

  it("should accept configuration with only checkbox fields", () => {
    const checkboxConfig = {
      fields: [
        {
          id: "enableStreaming",
          type: "checkbox",
          label: "Enable Streaming",
          required: false,
          defaultValue: true,
        },
        {
          id: "enableLogging",
          type: "checkbox",
          label: "Enable Logging",
          required: false,
          defaultValue: false,
        },
      ],
    };

    const result = LlmProviderConfigurationSchema.parse(checkboxConfig);
    expect(result.fields).toHaveLength(2);
    expect(result.fields[0]?.type).toBe("checkbox");
    expect(result.fields[1]?.type).toBe("checkbox");
  });
});

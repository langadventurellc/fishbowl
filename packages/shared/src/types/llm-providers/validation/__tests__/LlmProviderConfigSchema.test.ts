import { LlmProviderConfigSchema } from "../LlmProviderConfigSchema";

describe("LlmProviderConfigSchema", () => {
  it("should accept complete valid provider configuration", () => {
    const validProvider = {
      id: "anthropic",
      name: "Anthropic",
      models: {
        "claude-3-opus": "Claude 3 Opus",
        "claude-3-sonnet": "Claude 3 Sonnet",
      },
      configuration: {
        fields: [
          {
            id: "apiKey",
            type: "secure-text",
            label: "API Key",
            required: true,
          },
        ],
      },
    };

    const result = LlmProviderConfigSchema.parse(validProvider);
    expect(result).toEqual(validProvider);
  });

  it("should accept provider with metadata", () => {
    const providerWithMetadata = {
      id: "openai",
      name: "OpenAI",
      models: { "gpt-4": "GPT-4" },
      configuration: { fields: [] },
      metadata: {
        id: "openai",
        name: "OpenAI",
        models: { "gpt-4": "GPT-4" },
        displayName: "OpenAI API",
        description: "OpenAI's GPT models",
      },
    };

    const result = LlmProviderConfigSchema.parse(providerWithMetadata);
    expect(result.metadata).toBeDefined();
  });

  it("should reject duplicate field IDs", () => {
    const providerWithDuplicates = {
      id: "test-provider",
      name: "Test Provider",
      models: { model: "Model" },
      configuration: {
        fields: [
          {
            id: "apiKey",
            type: "secure-text",
            label: "API Key",
            required: true,
          },
          {
            id: "apiKey", // duplicate
            type: "text",
            label: "Another API Key",
            required: false,
          },
        ],
      },
    };

    expect(() => {
      LlmProviderConfigSchema.parse(providerWithDuplicates);
    }).toThrow("Field IDs must be unique within a provider");
  });

  it("should reject empty models object", () => {
    const providerWithEmptyModels = {
      id: "test-provider",
      name: "Test Provider",
      models: {},
      configuration: { fields: [] },
    };

    expect(() => {
      LlmProviderConfigSchema.parse(providerWithEmptyModels);
    }).toThrow("At least one model must be defined");
  });

  it("should handle providers with no configuration fields", () => {
    const minimalProvider = {
      id: "simple-provider",
      name: "Simple Provider",
      models: { default: "Default Model" },
      configuration: { fields: [] },
    };

    const result = LlmProviderConfigSchema.parse(minimalProvider);
    expect(result.configuration.fields).toEqual([]);
  });

  it("should reject invalid provider ID in main schema", () => {
    const invalidProvider = {
      id: "Invalid_Provider",
      name: "Invalid Provider",
      models: { model: "Model" },
      configuration: { fields: [] },
    };

    expect(() => {
      LlmProviderConfigSchema.parse(invalidProvider);
    }).toThrow("Provider ID must be lowercase alphanumeric with hyphens");
  });

  it("should require provider name in main schema", () => {
    const providerWithoutName = {
      id: "test-provider",
      name: "",
      models: { model: "Model" },
      configuration: { fields: [] },
    };

    expect(() => {
      LlmProviderConfigSchema.parse(providerWithoutName);
    }).toThrow("Provider name is required");
  });

  it("should accept provider with complex field configuration", () => {
    const complexProvider = {
      id: "complex-provider",
      name: "Complex Provider",
      models: {
        "model-1": "Model 1",
        "model-2": "Model 2",
        "model-3": "Model 3",
      },
      configuration: {
        fields: [
          {
            id: "apiKey",
            type: "secure-text",
            label: "API Key",
            required: true,
            minLength: 20,
            maxLength: 100,
          },
          {
            id: "baseUrl",
            type: "text",
            label: "Base URL",
            required: false,
            defaultValue: "https://api.example.com",
            pattern: "^https?://",
          },
          {
            id: "enableStreaming",
            type: "checkbox",
            label: "Enable Streaming",
            required: false,
            defaultValue: true,
          },
        ],
      },
    };

    const result = LlmProviderConfigSchema.parse(complexProvider);
    expect(result.configuration.fields).toHaveLength(3);
    expect(result.models).toHaveProperty("model-1");
    expect(result.models).toHaveProperty("model-2");
    expect(result.models).toHaveProperty("model-3");
  });

  it("should accept provider with metadata including capabilities", () => {
    const providerWithCapabilities = {
      id: "advanced-provider",
      name: "Advanced Provider",
      models: { "advanced-model": "Advanced Model" },
      configuration: { fields: [] },
      metadata: {
        id: "advanced-provider",
        name: "Advanced Provider",
        models: { "advanced-model": "Advanced Model" },
        displayName: "Advanced AI Provider",
        description: "An advanced provider with full capabilities",
        icon: "advanced-icon.svg",
        capabilities: {
          supportsChatCompletion: true,
          supportsStreaming: true,
          supportsCustomInstructions: true,
          supportsFunctionCalling: false,
        },
      },
    };

    const result = LlmProviderConfigSchema.parse(providerWithCapabilities);
    expect(result.metadata?.capabilities?.supportsChatCompletion).toBe(true);
    expect(result.metadata?.capabilities?.supportsStreaming).toBe(true);
    expect(result.metadata?.capabilities?.supportsFunctionCalling).toBe(false);
  });

  it("should reject provider with missing required fields", () => {
    const incompleteProvider = {
      id: "incomplete-provider",
      // name is missing
      models: { model: "Model" },
      configuration: { fields: [] },
    };

    expect(() => {
      LlmProviderConfigSchema.parse(incompleteProvider);
    }).toThrow();
  });

  it("should handle unique field IDs validation correctly", () => {
    const providerWithUniqueFields = {
      id: "unique-fields-provider",
      name: "Unique Fields Provider",
      models: { model: "Model" },
      configuration: {
        fields: [
          {
            id: "field1",
            type: "text",
            label: "Field 1",
            required: true,
          },
          {
            id: "field2",
            type: "secure-text",
            label: "Field 2",
            required: false,
          },
          {
            id: "field3",
            type: "checkbox",
            label: "Field 3",
            required: false,
          },
        ],
      },
    };

    // Should not throw for unique field IDs
    expect(() => {
      LlmProviderConfigSchema.parse(providerWithUniqueFields);
    }).not.toThrow();
  });

  describe("Performance", () => {
    it("should validate typical configuration in under 5ms", () => {
      const typicalProvider = {
        id: "performance-test",
        name: "Performance Test Provider",
        models: {
          "model-1": "Model 1",
          "model-2": "Model 2",
          "model-3": "Model 3",
        },
        configuration: {
          fields: [
            {
              id: "apiKey",
              type: "secure-text",
              label: "API Key",
              required: true,
              minLength: 20,
              maxLength: 100,
            },
            {
              id: "baseUrl",
              type: "text",
              label: "Base URL",
              required: false,
              defaultValue: "https://api.example.com",
              pattern: "^https?://",
            },
            {
              id: "enableFeature1",
              type: "checkbox",
              label: "Enable Feature 1",
              required: false,
              defaultValue: true,
            },
            {
              id: "enableFeature2",
              type: "checkbox",
              label: "Enable Feature 2",
              required: false,
              defaultValue: false,
            },
          ],
        },
      };

      const startTime = Date.now();
      LlmProviderConfigSchema.parse(typicalProvider);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5);
    });

    it("should validate large provider configuration efficiently", () => {
      // Create a provider with many fields to test performance
      const largeProvider = {
        id: "large-provider",
        name: "Large Provider",
        models: Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [`model-${i}`, `Model ${i}`]),
        ),
        configuration: {
          fields: Array.from({ length: 20 }, (_, i) => ({
            id: `field-${i}`,
            type:
              i % 3 === 0 ? "secure-text" : i % 3 === 1 ? "text" : "checkbox",
            label: `Field ${i}`,
            required: i % 2 === 0,
            ...(i % 3 === 1 && { defaultValue: `default-${i}` }),
            ...(i % 3 === 2 && { defaultValue: i % 2 === 0 }),
          })),
        },
      };

      const startTime = Date.now();
      LlmProviderConfigSchema.parse(largeProvider);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Allow slightly more time for large configs
    });
  });
});

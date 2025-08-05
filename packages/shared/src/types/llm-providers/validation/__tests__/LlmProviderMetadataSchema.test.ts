import { LlmProviderMetadataSchema } from "../LlmProviderMetadataSchema";

describe("LlmProviderMetadataSchema", () => {
  it("should accept valid provider metadata", () => {
    const validMetadata = {
      id: "openai",
      name: "OpenAI",
      models: {
        "gpt-4": "GPT-4",
        "gpt-3.5-turbo": "GPT-3.5 Turbo",
      },
    };

    const result = LlmProviderMetadataSchema.parse(validMetadata);
    expect(result).toEqual(validMetadata);
  });

  it("should accept metadata with optional fields", () => {
    const metadataWithOptionals = {
      id: "custom-provider",
      name: "Custom Provider",
      models: { "model-1": "Model 1" },
      displayName: "Custom AI Provider",
      description: "A custom AI provider for testing",
      icon: "custom-icon.svg",
      capabilities: {
        supportsChatCompletion: true,
        supportsStreaming: false,
      },
    };

    const result = LlmProviderMetadataSchema.parse(metadataWithOptionals);
    expect(result).toEqual(metadataWithOptionals);
  });

  it("should reject invalid provider ID formats", () => {
    const invalidIds = [
      {
        id: "OpenAI",
        error: "Provider ID must be lowercase alphanumeric with hyphens",
      },
      {
        id: "open ai",
        error: "Provider ID must be lowercase alphanumeric with hyphens",
      },
      {
        id: "open_ai",
        error: "Provider ID must be lowercase alphanumeric with hyphens",
      },
      {
        id: "open@ai",
        error: "Provider ID must be lowercase alphanumeric with hyphens",
      },
      { id: "", error: "Provider ID is required" },
    ];

    invalidIds.forEach(({ id, error }) => {
      expect(() => {
        LlmProviderMetadataSchema.parse({
          id,
          name: "Test Provider",
          models: { model: "Model" },
        });
      }).toThrow(error);
    });
  });

  it("should accept valid provider ID formats", () => {
    const validIds = [
      "openai",
      "anthropic",
      "ollama",
      "123-provider",
      "provider-123",
      "a",
    ];

    validIds.forEach((id) => {
      expect(() => {
        LlmProviderMetadataSchema.parse({
          id,
          name: "Test Provider",
          models: { model: "Model" },
        });
      }).not.toThrow();
    });
  });

  it("should reject empty models object", () => {
    expect(() => {
      LlmProviderMetadataSchema.parse({
        id: "test-provider",
        name: "Test Provider",
        models: {},
      });
    }).toThrow("At least one model must be defined");
  });

  it("should require provider name", () => {
    expect(() => {
      LlmProviderMetadataSchema.parse({
        id: "test-provider",
        name: "",
        models: { model: "Model" },
      });
    }).toThrow("Provider name is required");
  });

  it("should accept partial capabilities object", () => {
    const metadataWithPartialCapabilities = {
      id: "test-provider",
      name: "Test Provider",
      models: { model: "Model" },
      capabilities: {
        supportsChatCompletion: true,
        // other capabilities omitted
      },
    };

    const result = LlmProviderMetadataSchema.parse(
      metadataWithPartialCapabilities,
    );
    expect(result.capabilities?.supportsChatCompletion).toBe(true);
    expect(result.capabilities?.supportsStreaming).toBeUndefined();
  });
});

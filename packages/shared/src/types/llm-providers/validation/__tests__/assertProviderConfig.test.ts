import { assertProviderConfig } from "../assertProviderConfig";
import { z } from "zod";

describe("assertProviderConfig", () => {
  it("should pass for valid provider configuration", () => {
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

    expect(() => assertProviderConfig(validProvider)).not.toThrow();
  });

  it("should throw ZodError for invalid provider configuration", () => {
    const invalidProvider = {
      id: "", // Invalid: empty string
      name: "Test Provider",
      models: {},
      configuration: {
        fields: [],
      },
    };

    expect(() => assertProviderConfig(invalidProvider)).toThrow(z.ZodError);
  });

  it("should throw ZodError for missing required fields", () => {
    const incompleteProvider = {
      id: "test-provider",
      // Missing 'name' field
      models: { "model-1": "Model 1" },
      configuration: {
        fields: [],
      },
    };

    expect(() => assertProviderConfig(incompleteProvider)).toThrow(z.ZodError);
  });

  it("should throw ZodError for invalid provider ID format", () => {
    const invalidIdProvider = {
      id: "Test Provider", // Invalid: contains spaces and uppercase
      name: "Test Provider",
      models: { "model-1": "Model 1" },
      configuration: {
        fields: [],
      },
    };

    expect(() => assertProviderConfig(invalidIdProvider)).toThrow(z.ZodError);
  });

  it("should throw ZodError for empty models object", () => {
    const noModelsProvider = {
      id: "test-provider",
      name: "Test Provider",
      models: {}, // Invalid: no models defined
      configuration: {
        fields: [],
      },
    };

    expect(() => assertProviderConfig(noModelsProvider)).toThrow(z.ZodError);
  });

  it("should throw ZodError for duplicate field IDs", () => {
    const duplicateFieldsProvider = {
      id: "test-provider",
      name: "Test Provider",
      models: { "model-1": "Model 1" },
      configuration: {
        fields: [
          {
            id: "apiKey",
            type: "secure-text",
            label: "API Key 1",
            required: true,
          },
          {
            id: "apiKey", // Duplicate ID
            type: "text",
            label: "API Key 2",
            required: false,
          },
        ],
      },
    };

    expect(() => assertProviderConfig(duplicateFieldsProvider)).toThrow(
      z.ZodError,
    );
  });

  it("should pass for provider with optional metadata", () => {
    const providerWithMetadata = {
      id: "test-provider",
      name: "Test Provider",
      models: { "model-1": "Model 1" },
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
      metadata: {
        id: "test-provider",
        name: "Test Provider",
        models: { "model-1": "Model 1" },
        displayName: "Test Provider Display",
        description: "A test provider for validation",
      },
    };

    expect(() => assertProviderConfig(providerWithMetadata)).not.toThrow();
  });
});

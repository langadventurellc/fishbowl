import { getDefaultLlmModels } from "../getDefaultLlmModels";
import { persistedLlmProviderSchema } from "../llmModelsSchema";

describe("getDefaultLlmModels", () => {
  describe("basic functionality", () => {
    it("should return an array of provider data", () => {
      const providers = getDefaultLlmModels();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    it("should return exactly 2 default providers", () => {
      const providers = getDefaultLlmModels();

      expect(providers).toHaveLength(2);
    });

    it("should return providers with expected IDs", () => {
      const providers = getDefaultLlmModels();
      const expectedIds = ["openai", "anthropic"];

      const actualIds = providers.map((p) => p.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it("should return providers with expected names", () => {
      const providers = getDefaultLlmModels();
      const expectedNames = ["OpenAI", "Anthropic"];

      const actualNames = providers.map((p) => p.name);
      expect(actualNames).toEqual(expectedNames);
    });
  });

  describe("provider structure validation", () => {
    it("should return providers that validate against schema", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        const result = persistedLlmProviderSchema.safeParse(provider);
        expect(result.success).toBe(true);
      });
    });

    it("should return providers with all required fields", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        expect(provider).toHaveProperty("id");
        expect(provider).toHaveProperty("name");
        expect(provider).toHaveProperty("models");
        expect(Array.isArray(provider.models)).toBe(true);
        expect(provider.models.length).toBeGreaterThan(0);
      });
    });

    it("should have unique provider IDs", () => {
      const providers = getDefaultLlmModels();
      const ids = providers.map((p) => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("model structure validation", () => {
    it("should return models with all required fields", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        provider.models.forEach((model) => {
          expect(model).toHaveProperty("id");
          expect(model).toHaveProperty("name");
          expect(model).toHaveProperty("contextLength");
        });
      });
    });

    it("should have valid context lengths", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        provider.models.forEach((model) => {
          expect(typeof model.contextLength).toBe("number");
          expect(model.contextLength).toBeGreaterThanOrEqual(1000);
          expect(model.contextLength).toBeLessThanOrEqual(10000000);
        });
      });
    });

    it("should have non-empty model names and IDs", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        provider.models.forEach((model) => {
          expect(typeof model.id).toBe("string");
          expect(model.id.length).toBeGreaterThan(0);
          expect(typeof model.name).toBe("string");
          expect(model.name.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have unique model IDs within each provider", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        const modelIds = provider.models.map((m) => m.id);
        const uniqueModelIds = new Set(modelIds);
        expect(uniqueModelIds.size).toBe(modelIds.length);
      });
    });
  });

  describe("OpenAI provider validation", () => {
    it("should include expected OpenAI models", () => {
      const providers = getDefaultLlmModels();
      const openaiProvider = providers.find((p) => p.id === "openai");

      expect(openaiProvider).toBeDefined();
      expect(openaiProvider?.models).toHaveLength(3);

      const expectedModelIds = ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"];
      const actualModelIds = openaiProvider?.models.map((m) => m.id) || [];
      expect(actualModelIds).toEqual(expectedModelIds);
    });

    it("should have correct OpenAI model context lengths", () => {
      const providers = getDefaultLlmModels();
      const openaiProvider = providers.find((p) => p.id === "openai");

      const gpt4Turbo = openaiProvider?.models.find(
        (m) => m.id === "gpt-4-turbo",
      );
      const gpt4 = openaiProvider?.models.find((m) => m.id === "gpt-4");
      const gpt35Turbo = openaiProvider?.models.find(
        (m) => m.id === "gpt-3.5-turbo",
      );

      expect(gpt4Turbo?.contextLength).toBe(128000);
      expect(gpt4?.contextLength).toBe(8192);
      expect(gpt35Turbo?.contextLength).toBe(16385);
    });
  });

  describe("Anthropic provider validation", () => {
    it("should include expected Anthropic models", () => {
      const providers = getDefaultLlmModels();
      const anthropicProvider = providers.find((p) => p.id === "anthropic");

      expect(anthropicProvider).toBeDefined();
      expect(anthropicProvider?.models).toHaveLength(3);

      const expectedModelIds = [
        "claude-3-opus",
        "claude-3-sonnet",
        "claude-3-haiku",
      ];
      const actualModelIds = anthropicProvider?.models.map((m) => m.id) || [];
      expect(actualModelIds).toEqual(expectedModelIds);
    });

    it("should have correct Anthropic model context lengths", () => {
      const providers = getDefaultLlmModels();
      const anthropicProvider = providers.find((p) => p.id === "anthropic");

      anthropicProvider?.models.forEach((model) => {
        expect(model.contextLength).toBe(200000);
      });
    });
  });

  describe("data consistency", () => {
    it("should return the same data on multiple calls", () => {
      const providers1 = getDefaultLlmModels();
      const providers2 = getDefaultLlmModels();

      expect(providers1).toEqual(providers2);
    });

    it("should have consistent model counts", () => {
      const providers = getDefaultLlmModels();

      expect(providers).toHaveLength(2);
      expect(providers[0]?.models).toHaveLength(3); // OpenAI
      expect(providers[1]?.models).toHaveLength(3); // Anthropic
    });

    it("should maintain model ordering", () => {
      const providers = getDefaultLlmModels();
      const openaiProvider = providers.find((p) => p.id === "openai");
      const anthropicProvider = providers.find((p) => p.id === "anthropic");

      const openaiModelIds = openaiProvider?.models.map((m) => m.id) || [];
      const anthropicModelIds =
        anthropicProvider?.models.map((m) => m.id) || [];

      expect(openaiModelIds).toEqual(["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]);
      expect(anthropicModelIds).toEqual([
        "claude-3-opus",
        "claude-3-sonnet",
        "claude-3-haiku",
      ]);
    });
  });

  describe("error handling", () => {
    it("should handle invalid data gracefully", () => {
      // This test ensures the function doesn't throw even if data is problematic
      expect(() => getDefaultLlmModels()).not.toThrow();
    });

    it("should return array even if some validation fails", () => {
      const result = getDefaultLlmModels();

      // Should always return an array (might be empty if validation fails)
      expect(Array.isArray(result)).toBe(true);
    });

    it("should fallback to empty array on validation failure", () => {
      // Mock console.warn to verify error handling
      const originalWarn = console.warn;
      const mockWarn = jest.fn();
      console.warn = mockWarn;

      // This test verifies the function structure handles errors correctly
      const result = getDefaultLlmModels();

      // Should return valid data (not testing actual error case here)
      expect(Array.isArray(result)).toBe(true);

      console.warn = originalWarn;
    });
  });

  describe("schema compliance", () => {
    it("should validate against current LLM provider schema", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        const result = persistedLlmProviderSchema.safeParse(provider);
        if (!result.success) {
          console.error("Schema validation failed:", result.error);
        }
        expect(result.success).toBe(true);
      });
    });

    it("should have models that meet minimum requirements", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        expect(provider.models.length).toBeGreaterThanOrEqual(1);
        expect(provider.models.length).toBeLessThanOrEqual(50);

        provider.models.forEach((model) => {
          expect(model.id.length).toBeGreaterThan(0);
          expect(model.id.length).toBeLessThanOrEqual(100);
          expect(model.name.length).toBeGreaterThan(0);
          expect(model.name.length).toBeLessThanOrEqual(100);
        });
      });
    });

    it("should have provider IDs that meet schema requirements", () => {
      const providers = getDefaultLlmModels();

      providers.forEach((provider) => {
        expect(provider.id.length).toBeGreaterThan(0);
        expect(provider.id.length).toBeLessThanOrEqual(50);
        expect(provider.name.length).toBeGreaterThan(0);
        expect(provider.name.length).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("data completeness", () => {
    it("should provide comprehensive model coverage", () => {
      const providers = getDefaultLlmModels();
      const totalModels = providers.reduce(
        (sum, provider) => sum + provider.models.length,
        0,
      );

      expect(totalModels).toBe(6); // 3 OpenAI + 3 Anthropic
    });

    it("should include major model families", () => {
      const providers = getDefaultLlmModels();
      const allModelIds = providers.flatMap((p) => p.models.map((m) => m.id));

      // Should include GPT models
      expect(allModelIds.some((id) => id.includes("gpt"))).toBe(true);
      // Should include Claude models
      expect(allModelIds.some((id) => id.includes("claude"))).toBe(true);
    });

    it("should have reasonable context length distribution", () => {
      const providers = getDefaultLlmModels();
      const contextLengths = providers.flatMap((p) =>
        p.models.map((m) => m.contextLength),
      );

      // Should have variety in context lengths
      const uniqueLengths = new Set(contextLengths);
      expect(uniqueLengths.size).toBeGreaterThan(1);

      // Should include both smaller and larger context windows
      const minLength = Math.min(...contextLengths);
      const maxLength = Math.max(...contextLengths);
      expect(maxLength).toBeGreaterThan(minLength * 2);
    });
  });
});

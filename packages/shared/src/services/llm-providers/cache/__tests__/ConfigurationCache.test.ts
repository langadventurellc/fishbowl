import { ConfigurationCache } from "../ConfigurationCache";
import type { LlmProviderDefinition } from "../../../../types/llm-providers/LlmProviderDefinition";

describe("ConfigurationCache", () => {
  let cache: ConfigurationCache;

  const mockProviders: LlmProviderDefinition[] = [
    {
      id: "openai",
      name: "OpenAI",
      models: {
        "gpt-4": "GPT-4",
        "gpt-3.5-turbo": "GPT-3.5 Turbo",
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
    },
    {
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
    },
  ];

  beforeEach(() => {
    cache = new ConfigurationCache();
  });

  describe("cache lifecycle", () => {
    it("should start with empty cache", () => {
      expect(cache.isEmpty()).toBe(true);
      expect(cache.isValid()).toBe(false);
      expect(cache.get()).toBeNull();
    });

    it("should set providers atomically", () => {
      cache.set(mockProviders);

      expect(cache.isEmpty()).toBe(false);
      expect(cache.isValid()).toBe(true);
      expect(cache.get()).toEqual(mockProviders);
    });

    it("should invalidate cache properly", () => {
      cache.set(mockProviders);
      cache.invalidate();

      expect(cache.isEmpty()).toBe(true);
      expect(cache.isValid()).toBe(false);
      expect(cache.get()).toBeNull();
    });

    it("should track last updated time", () => {
      const beforeSet = new Date();
      cache.set(mockProviders);
      const afterSet = new Date();

      const lastUpdated = cache.getLastUpdated();
      expect(lastUpdated).not.toBeNull();
      expect(lastUpdated!.getTime()).toBeGreaterThanOrEqual(
        beforeSet.getTime(),
      );
      expect(lastUpdated!.getTime()).toBeLessThanOrEqual(afterSet.getTime());
    });
  });

  describe("provider lookup", () => {
    beforeEach(() => {
      cache.set(mockProviders);
    });

    it("should provide O(1) provider lookup by ID", () => {
      const provider = cache.getProvider("openai");
      expect(provider).toBeDefined();
      expect(provider?.id).toBe("openai");
      expect(provider?.name).toBe("OpenAI");
    });

    it("should return undefined for non-existent provider", () => {
      const provider = cache.getProvider("non-existent");
      expect(provider).toBeUndefined();
    });

    it("should check provider existence", () => {
      expect(cache.hasProvider("openai")).toBe(true);
      expect(cache.hasProvider("anthropic")).toBe(true);
      expect(cache.hasProvider("non-existent")).toBe(false);
    });

    it("should get all provider IDs", () => {
      const ids = cache.getProviderIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain("openai");
      expect(ids).toContain("anthropic");
    });
  });

  describe("model extraction", () => {
    beforeEach(() => {
      cache.set(mockProviders);
    });

    it("should extract models for existing provider", () => {
      const models = cache.getModelsForProvider("openai");
      expect(models).toEqual({
        "gpt-4": "GPT-4",
        "gpt-3.5-turbo": "GPT-3.5 Turbo",
      });
    });

    it("should return empty object for non-existent provider", () => {
      const models = cache.getModelsForProvider("non-existent");
      expect(models).toEqual({});
    });
  });

  describe("staleness detection", () => {
    it("should be stale when empty", () => {
      expect(cache.isValid()).toBe(false);
    });

    it("should be fresh after setting data", () => {
      cache.set(mockProviders);
      expect(cache.isValid()).toBe(true);
    });

    it("should be stale after invalidation", () => {
      cache.set(mockProviders);
      cache.invalidate();
      expect(cache.isValid()).toBe(false);
    });
  });

  describe("memory efficiency", () => {
    it("should handle large provider sets efficiently", () => {
      const largeProviderSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `provider-${i}`,
        name: `Provider ${i}`,
        models: { [`model-${i}`]: `Model ${i}` },
        configuration: { fields: [] },
      })) as LlmProviderDefinition[];

      cache.set(largeProviderSet);

      expect(cache.getProviderIds()).toHaveLength(1000);
      expect(cache.getProvider("provider-500")).toBeDefined();
    });

    it("should clear memory on invalidation", () => {
      cache.set(mockProviders);
      cache.invalidate();

      expect(cache.getProviderIds()).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty provider array", () => {
      cache.set([]);
      expect(cache.isEmpty()).toBe(true);
      expect(cache.isValid()).toBe(false);
    });

    it("should replace entire cache on subsequent sets", () => {
      cache.set(mockProviders);
      expect(cache.getProviderIds()).toHaveLength(2);

      cache.set([mockProviders[0]!]);
      expect(cache.getProviderIds()).toHaveLength(1);
      expect(cache.hasProvider("openai")).toBe(true);
      expect(cache.hasProvider("anthropic")).toBe(false);
    });

    it("should handle duplicate provider IDs by keeping last", () => {
      const duplicates = [
        { ...mockProviders[0]!, name: "OpenAI Original" },
        { ...mockProviders[0]!, name: "OpenAI Duplicate" },
      ] as LlmProviderDefinition[];

      cache.set(duplicates);

      const provider = cache.getProvider("openai");
      expect(provider?.name).toBe("OpenAI Duplicate");
    });
  });

  describe("concurrent access", () => {
    it("should handle multiple rapid operations", () => {
      // Set initial data
      cache.set(mockProviders);

      // Perform rapid operations
      const provider = cache.getProvider("openai");
      const models = cache.getModelsForProvider("anthropic");
      const ids = cache.getProviderIds();

      expect(provider).toBeDefined();
      expect(models).toBeDefined();
      expect(ids).toHaveLength(2);
    });

    it("should maintain consistency during rapid set operations", () => {
      cache.set(mockProviders);
      cache.set([mockProviders[0]!]);
      cache.set(mockProviders);

      expect(cache.getProviderIds()).toHaveLength(2);
      expect(cache.isValid()).toBe(true);
    });
  });
});

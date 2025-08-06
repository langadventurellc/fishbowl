import { FallbackManager } from "../FallbackManager";
import type { LlmProviderDefinition } from "../../../../types/llm-providers/LlmProviderDefinition";
import { setTimeout } from "node:timers/promises";

describe("FallbackManager", () => {
  let fallbackManager: FallbackManager;

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
  ];

  beforeEach(() => {
    fallbackManager = new FallbackManager({
      maxAge: 1000, // 1 second for testing
      maxEntries: 3,
      enablePersistence: false,
    });
  });

  describe("storage and retrieval", () => {
    it("should store and retrieve fallback data", () => {
      const key = "/path/to/config.json";

      fallbackManager.storeFallback(key, mockProviders);

      const retrieved = fallbackManager.getFallback(key);
      expect(retrieved).toEqual(mockProviders);
      expect(fallbackManager.hasFallback(key)).toBe(true);
    });

    it("should return null for non-existent keys", () => {
      const retrieved = fallbackManager.getFallback("non-existent");

      expect(retrieved).toBeNull();
      expect(fallbackManager.hasFallback("non-existent")).toBe(false);
    });

    it("should return deep copies of stored data", () => {
      const key = "/path/to/config.json";

      fallbackManager.storeFallback(key, mockProviders);
      const retrieved1 = fallbackManager.getFallback(key);
      const retrieved2 = fallbackManager.getFallback(key);

      expect(retrieved1).not.toBe(mockProviders); // Different reference
      expect(retrieved1).toEqual(mockProviders); // Same content
      expect(retrieved1).not.toBe(retrieved2); // Each call returns new copy
    });
  });

  describe("staleness detection", () => {
    it("should detect stale entries", async () => {
      const key = "/path/to/config.json";

      fallbackManager.storeFallback(key, mockProviders);
      expect(fallbackManager.isStale(key)).toBe(false);

      // Wait for entry to become stale
      await setTimeout(1100);

      expect(fallbackManager.isStale(key)).toBe(true);
      expect(fallbackManager.getFallback(key)).toBeNull();
      expect(fallbackManager.hasFallback(key)).toBe(false);
    });

    it("should return fallback age correctly", () => {
      const key = "/path/to/config.json";

      const beforeStore = Date.now();
      fallbackManager.storeFallback(key, mockProviders);
      const afterStore = Date.now();

      const age = fallbackManager.getFallbackAge(key);

      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThanOrEqual(afterStore - beforeStore + 10); // Small tolerance
    });

    it("should return null age for non-existent entries", () => {
      const age = fallbackManager.getFallbackAge("non-existent");
      expect(age).toBeNull();
    });
  });

  describe("cache management", () => {
    it("should respect max entries limit", () => {
      // Store entries up to limit
      for (let i = 0; i < 3; i++) {
        fallbackManager.storeFallback(`key${i}`, mockProviders);
      }

      // All entries should be present
      for (let i = 0; i < 3; i++) {
        expect(fallbackManager.hasFallback(`key${i}`)).toBe(true);
      }

      // Store one more entry (should evict oldest)
      fallbackManager.storeFallback("key3", mockProviders);

      expect(fallbackManager.hasFallback("key0")).toBe(false); // Oldest evicted
      expect(fallbackManager.hasFallback("key1")).toBe(true);
      expect(fallbackManager.hasFallback("key2")).toBe(true);
      expect(fallbackManager.hasFallback("key3")).toBe(true);
    });

    it("should clean up expired entries during storage", async () => {
      const shortAgeManager = new FallbackManager({
        maxAge: 50,
        maxEntries: 10,
      });

      // Store an entry
      shortAgeManager.storeFallback("key1", mockProviders);
      expect(shortAgeManager.hasFallback("key1")).toBe(true);

      // Wait for it to expire
      await setTimeout(60);

      // Store another entry (should trigger cleanup)
      shortAgeManager.storeFallback("key2", mockProviders);

      expect(shortAgeManager.hasFallback("key1")).toBe(false); // Cleaned up
      expect(shortAgeManager.hasFallback("key2")).toBe(true);
    });

    it("should clear specific fallback entries", () => {
      const key = "/path/to/config.json";

      fallbackManager.storeFallback(key, mockProviders);
      expect(fallbackManager.hasFallback(key)).toBe(true);

      fallbackManager.clearFallback(key);
      expect(fallbackManager.hasFallback(key)).toBe(false);
    });
  });

  describe("configuration options", () => {
    it("should use custom max age", async () => {
      const customManager = new FallbackManager({ maxAge: 100 });
      const key = "/path/to/config.json";

      customManager.storeFallback(key, mockProviders);
      expect(customManager.hasFallback(key)).toBe(true);

      await setTimeout(120);

      expect(customManager.isStale(key)).toBe(true);
      expect(customManager.hasFallback(key)).toBe(false);
    });

    it("should use custom max entries", () => {
      const customManager = new FallbackManager({ maxEntries: 2 });

      // Store entries up to custom limit
      customManager.storeFallback("key0", mockProviders);
      customManager.storeFallback("key1", mockProviders);

      expect(customManager.hasFallback("key0")).toBe(true);
      expect(customManager.hasFallback("key1")).toBe(true);

      // Store one more (should evict oldest)
      customManager.storeFallback("key2", mockProviders);

      expect(customManager.hasFallback("key0")).toBe(false);
      expect(customManager.hasFallback("key1")).toBe(true);
      expect(customManager.hasFallback("key2")).toBe(true);
    });
  });
});

import { CacheInvalidation } from "../CacheInvalidation";
import { ConfigurationCache } from "../ConfigurationCache";
import type { InvalidationOptions } from "../InvalidationOptions";
import type { LlmProviderDefinition } from "../../../../types/llm-providers/LlmProviderDefinition";

describe("CacheInvalidation", () => {
  let cache: ConfigurationCache;

  beforeEach(() => {
    cache = new ConfigurationCache();
    cache.set([
      {
        id: "test",
        name: "Test Provider",
        models: {},
        configuration: { fields: [] },
      },
    ] as LlmProviderDefinition[]);
  });

  describe("createInvalidationStrategy", () => {
    it("should create time-based strategy", () => {
      const options: InvalidationOptions = {
        maxAge: 5000,
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);
      expect(strategy.name).toBe("TimeBased");
    });

    it("should create trigger-based strategy", () => {
      const options: InvalidationOptions = {
        triggerEvents: ["file_change", "manual"],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);
      expect(strategy.name).toBe("TriggerBased");
    });

    it("should create composite strategy for multiple options", () => {
      const options: InvalidationOptions = {
        maxAge: 5000,
        triggerEvents: ["file_change"],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);
      expect(strategy.name).toBe("Composite");
    });

    it("should create default strategy for empty options", () => {
      const strategy = CacheInvalidation.createInvalidationStrategy({});
      expect(strategy.name).toBe("TriggerBased");
    });
  });

  describe("shouldInvalidate", () => {
    it("should always invalidate on error trigger", () => {
      const result = CacheInvalidation.shouldInvalidate(cache, "error");
      expect(result).toBe(true);
    });

    it("should not invalidate already invalid cache", () => {
      cache.invalidate();
      const result = CacheInvalidation.shouldInvalidate(cache, "manual");
      expect(result).toBe(false);
    });

    it("should invalidate valid cache for non-error triggers", () => {
      const result = CacheInvalidation.shouldInvalidate(cache, "file_change");
      expect(result).toBe(true);
    });
  });

  describe("performInvalidation", () => {
    it("should invalidate cache using strategy", () => {
      const strategy = CacheInvalidation.createInvalidationStrategy({
        triggerEvents: ["manual"],
      });

      expect(cache.isValid()).toBe(true);

      CacheInvalidation.performInvalidation(cache, strategy);

      expect(cache.isValid()).toBe(false);
    });
  });

  describe("time-based invalidation", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should invalidate cache after maxAge", () => {
      const options: InvalidationOptions = {
        maxAge: 5000,
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);

      // Cache is fresh
      expect(strategy.shouldInvalidate(cache, "time_based")).toBe(false);

      // Advance time past maxAge
      jest.advanceTimersByTime(6000);

      // Cache should now be stale
      expect(strategy.shouldInvalidate(cache, "time_based")).toBe(true);
    });

    it("should handle cache with no lastUpdated", () => {
      // Create fresh cache with no data
      const emptyCache = new ConfigurationCache();

      const options: InvalidationOptions = {
        maxAge: 5000,
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);

      // Should invalidate because no lastUpdated
      expect(strategy.shouldInvalidate(emptyCache, "time_based")).toBe(true);
    });
  });

  describe("trigger-based invalidation", () => {
    it("should invalidate on allowed triggers", () => {
      const options: InvalidationOptions = {
        triggerEvents: ["file_change", "manual"],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);

      expect(strategy.shouldInvalidate(cache, "file_change")).toBe(true);
      expect(strategy.shouldInvalidate(cache, "manual")).toBe(true);
      expect(strategy.shouldInvalidate(cache, "error")).toBe(false);
    });

    it("should not invalidate on disallowed triggers", () => {
      const options: InvalidationOptions = {
        triggerEvents: ["manual"],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);

      expect(strategy.shouldInvalidate(cache, "file_change")).toBe(false);
      expect(strategy.shouldInvalidate(cache, "time_based")).toBe(false);
      expect(strategy.shouldInvalidate(cache, "manual")).toBe(true);
    });
  });

  describe("composite invalidation", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should invalidate when any strategy matches", () => {
      const options: InvalidationOptions = {
        maxAge: 5000,
        triggerEvents: ["manual"],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);

      // Should invalidate on manual trigger even if time hasn't passed
      expect(strategy.shouldInvalidate(cache, "manual")).toBe(true);

      // Should invalidate on time trigger after maxAge
      jest.advanceTimersByTime(6000);
      expect(strategy.shouldInvalidate(cache, "time_based")).toBe(true);

      // Should not invalidate on unallowed trigger
      expect(strategy.shouldInvalidate(cache, "error")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty trigger events array", () => {
      const options: InvalidationOptions = {
        triggerEvents: [],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);
      expect(strategy.name).toBe("TriggerBased");

      // Should default to manual only
      expect(strategy.shouldInvalidate(cache, "manual")).toBe(true);
      expect(strategy.shouldInvalidate(cache, "file_change")).toBe(false);
    });

    it("should handle undefined maxAge", () => {
      const options: InvalidationOptions = {
        maxAge: undefined,
        triggerEvents: ["manual"],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);
      expect(strategy.name).toBe("TriggerBased");
    });

    it("should handle zero maxAge", () => {
      const options: InvalidationOptions = {
        maxAge: 0,
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);
      expect(strategy.name).toBe("TimeBased");

      // Should immediately be stale with 0 maxAge
      expect(strategy.shouldInvalidate(cache, "time_based")).toBe(true);
    });

    it("should handle negative maxAge", () => {
      const options: InvalidationOptions = {
        maxAge: -1000,
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);
      expect(strategy.name).toBe("TimeBased");

      // Should immediately be stale with negative maxAge
      expect(strategy.shouldInvalidate(cache, "time_based")).toBe(true);
    });
  });

  describe("strategy execution", () => {
    it("should perform actual invalidation when called", () => {
      const options: InvalidationOptions = {
        triggerEvents: ["manual"],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);

      // Cache starts valid
      expect(cache.isValid()).toBe(true);

      // Strategy execution should invalidate
      strategy.invalidate(cache);

      expect(cache.isValid()).toBe(false);
    });

    it("should work with composite strategies", () => {
      const options: InvalidationOptions = {
        maxAge: 5000,
        triggerEvents: ["manual"],
      };

      const strategy = CacheInvalidation.createInvalidationStrategy(options);

      // Cache starts valid
      expect(cache.isValid()).toBe(true);

      // Composite strategy execution should invalidate
      strategy.invalidate(cache);

      expect(cache.isValid()).toBe(false);
    });
  });
});

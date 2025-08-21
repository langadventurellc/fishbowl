import { createDefaultLlmModelsSettings } from "../createDefaultLlmModelsSettings";
import {
  persistedLlmModelsSettingsSchema,
  CURRENT_LLM_MODELS_SCHEMA_VERSION,
} from "../llmModelsSchema";

describe("createDefaultLlmModelsSettings", () => {
  describe("basic functionality", () => {
    it("should return a valid configuration object", () => {
      const config = createDefaultLlmModelsSettings();

      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
      expect(config).not.toBeNull();
    });

    it("should have all required fields", () => {
      const config = createDefaultLlmModelsSettings();

      expect(config).toHaveProperty("schemaVersion");
      expect(config).toHaveProperty("providers");
      expect(config).toHaveProperty("lastUpdated");
    });

    it("should return correct types for all fields", () => {
      const config = createDefaultLlmModelsSettings();

      expect(typeof config.schemaVersion).toBe("string");
      expect(Array.isArray(config.providers)).toBe(true);
      expect(typeof config.lastUpdated).toBe("string");
    });
  });

  describe("schema version", () => {
    it("should use the current schema version constant", () => {
      const config = createDefaultLlmModelsSettings();

      expect(config.schemaVersion).toBe(CURRENT_LLM_MODELS_SCHEMA_VERSION);
      expect(config.schemaVersion).toBe("1.0.0");
    });

    it("should have non-empty schema version", () => {
      const config = createDefaultLlmModelsSettings();

      expect(config.schemaVersion).not.toBe("");
      expect(config.schemaVersion.length).toBeGreaterThan(0);
    });
  });

  describe("providers array", () => {
    it("should return empty providers array for clean start when includeDefaults=false", () => {
      const config = createDefaultLlmModelsSettings(false);

      expect(config.providers).toHaveLength(0);
      expect(config.providers).toEqual([]);
    });

    it("should return a mutable array", () => {
      const config = createDefaultLlmModelsSettings(false);

      // Should be able to push items without errors
      config.providers.push({
        id: "test-provider",
        name: "Test Provider",
        models: [
          {
            id: "test-model",
            name: "Test Model",
            contextLength: 4096,
          },
        ],
      });

      expect(config.providers).toHaveLength(1);
    });

    it("should return a new array instance each time", () => {
      const config1 = createDefaultLlmModelsSettings();
      const config2 = createDefaultLlmModelsSettings();

      expect(config1.providers).not.toBe(config2.providers);
      expect(config1).not.toBe(config2);
    });
  });

  describe("timestamp generation", () => {
    it("should generate a valid ISO timestamp", () => {
      const config = createDefaultLlmModelsSettings();

      // Should be a valid date string
      const date = new Date(config.lastUpdated);
      expect(date.toString()).not.toBe("Invalid Date");
      expect(date.toISOString()).toBe(config.lastUpdated);
    });

    it("should generate current timestamp", () => {
      const before = new Date().toISOString();
      const config = createDefaultLlmModelsSettings();
      const after = new Date().toISOString();

      expect(config.lastUpdated >= before).toBe(true);
      expect(config.lastUpdated <= after).toBe(true);
    });

    it("should generate different timestamps for multiple calls", () => {
      const config1 = createDefaultLlmModelsSettings();

      // Brief delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Small busy wait to ensure time passes
      }

      const config2 = createDefaultLlmModelsSettings();
      expect(config1.lastUpdated).not.toBe(config2.lastUpdated);
    });
  });

  describe("schema validation", () => {
    it("should generate config that validates against schema", () => {
      const config = createDefaultLlmModelsSettings();

      const result = persistedLlmModelsSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should have correct TypeScript type", () => {
      const config = createDefaultLlmModelsSettings();

      // TypeScript compile-time check (this test passes if it compiles)
      const typedConfig: ReturnType<typeof createDefaultLlmModelsSettings> =
        config;
      expect(typedConfig).toBe(config);
    });

    it("should generate schema-compliant structure", () => {
      const config = createDefaultLlmModelsSettings();

      // Parse and validate
      const validated = persistedLlmModelsSettingsSchema.parse(config);

      expect(validated.schemaVersion).toBe(config.schemaVersion);
      expect(validated.providers).toEqual(config.providers);
      expect(validated.lastUpdated).toBe(config.lastUpdated);
    });
  });

  describe("immutability and independence", () => {
    it("should return independent configurations", () => {
      const config1 = createDefaultLlmModelsSettings();
      const config2 = createDefaultLlmModelsSettings();

      // Modify first config
      config1.providers.push({
        id: "test-provider",
        name: "Test Provider",
        models: [
          {
            id: "test-model",
            name: "Test Model",
            contextLength: 4096,
          },
        ],
      });

      // Second config should be unaffected
      expect(config2.providers).toHaveLength(2); // Still has defaults
    });

    it("should not share references between calls", () => {
      const configs = Array.from({ length: 3 }, () =>
        createDefaultLlmModelsSettings(),
      );

      // All should be different instances
      expect(configs[0]).not.toBe(configs[1]);
      expect(configs[1]).not.toBe(configs[2]);
      expect(configs[0]).not.toBe(configs[2]);

      // Arrays should also be different instances
      expect(configs[0]!.providers).not.toBe(configs[1]!.providers);
      expect(configs[1]!.providers).not.toBe(configs[2]!.providers);
    });
  });

  describe("function purity", () => {
    it("should return equivalent structures on multiple calls", () => {
      const config1 = createDefaultLlmModelsSettings();
      const config2 = createDefaultLlmModelsSettings();

      // Should have same structure (different instances, but equivalent content)
      expect(config1.schemaVersion).toBe(config2.schemaVersion);
      expect(config1.providers).toEqual(config2.providers);
      // Note: timestamps will be different but both should be valid
    });

    it("should have no side effects", () => {
      const originalDate = Date;

      // Verify function doesn't mutate global state
      createDefaultLlmModelsSettings();
      createDefaultLlmModelsSettings();
      createDefaultLlmModelsSettings();

      expect(Date).toBe(originalDate);
      expect(typeof createDefaultLlmModelsSettings).toBe("function");
    });
  });

  describe("error handling and validation", () => {
    it("should have validation that would catch invalid data", () => {
      const config = createDefaultLlmModelsSettings();

      // Verify the returned config would pass validation
      const result = persistedLlmModelsSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should validate against current schema version", () => {
      const config = createDefaultLlmModelsSettings();

      // Should always use the current schema version
      expect(config.schemaVersion).toBe(CURRENT_LLM_MODELS_SCHEMA_VERSION);

      // Should validate successfully
      const result = persistedLlmModelsSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should validate that providers array is required", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        providers: "not-an-array", // Invalid - should be array
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedLlmModelsSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should handle empty providers array but fail schema validation", () => {
      // Test that empty providers array fails validation (as per schema requirement of min 1)
      const config = createDefaultLlmModelsSettings(false);

      const result = persistedLlmModelsSettingsSchema.safeParse(config);
      expect(result.success).toBe(false); // Schema requires at least 1 provider
      expect(config.providers).toHaveLength(0);
    });
  });

  describe("timestamp generation edge cases", () => {
    it("should handle Date mock correctly", () => {
      const mockDate = new Date("2025-01-01T00:00:00.000Z");

      // Mock Date constructor
      jest.spyOn(globalThis, "Date").mockImplementation(() => mockDate);

      const config = createDefaultLlmModelsSettings();
      expect(config.lastUpdated).toBe("2025-01-01T00:00:00.000Z");

      jest.restoreAllMocks();
    });

    it("should generate valid ISO string format", () => {
      const config = createDefaultLlmModelsSettings();
      const parsedDate = new Date(config.lastUpdated);

      expect(parsedDate.toISOString()).toBe(config.lastUpdated);
      expect(config.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should handle millisecond precision", () => {
      const config = createDefaultLlmModelsSettings();

      // Should have millisecond precision
      expect(config.lastUpdated).toMatch(/\.\d{3}Z$/);

      const date = new Date(config.lastUpdated);
      expect(date.getMilliseconds()).toBeGreaterThanOrEqual(0);
      expect(date.getMilliseconds()).toBeLessThan(1000);
    });
  });

  describe("data integrity and consistency", () => {
    it("should maintain consistent structure across calls", () => {
      const configs = Array.from({ length: 5 }, () =>
        createDefaultLlmModelsSettings(false),
      );

      configs.forEach((config) => {
        expect(config).toHaveProperty("schemaVersion");
        expect(config).toHaveProperty("providers");
        expect(config).toHaveProperty("lastUpdated");
        expect(config.schemaVersion).toBe("1.0.0");
        expect(config.providers).toEqual([]);
      });
    });

    it("should maintain consistent timestamp format", () => {
      const configs = Array.from({ length: 5 }, () =>
        createDefaultLlmModelsSettings(),
      );

      configs.forEach((config) => {
        expect(config.lastUpdated).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        );
        expect(new Date(config.lastUpdated).toISOString()).toBe(
          config.lastUpdated,
        );
      });
    });

    it("should always return empty providers array when includeDefaults=false", () => {
      const configs = Array.from({ length: 10 }, () =>
        createDefaultLlmModelsSettings(false),
      );

      configs.forEach((config) => {
        expect(config.providers).toEqual([]);
        expect(config.providers).toHaveLength(0);
      });
    });
  });

  describe("schema validation against provider structure", () => {
    it("should validate that provider fields would be required when present", () => {
      // Test that invalid provider structure would fail validation
      const invalidProviderData = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "valid-provider",
            name: "Valid Provider",
            models: [
              {
                id: "valid-model",
                name: "Valid Model",
                contextLength: 4096,
              },
            ],
          },
          {
            // Missing required fields - should fail validation
            id: "invalid-provider",
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result =
        persistedLlmModelsSettingsSchema.safeParse(invalidProviderData);
      expect(result.success).toBe(false);
    });

    it("should validate context length constraints", () => {
      const invalidContextLengthData = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: [
              {
                id: "test-model",
                name: "Test Model",
                contextLength: 500, // Invalid - below 1000 minimum
              },
            ],
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedLlmModelsSettingsSchema.safeParse(
        invalidContextLengthData,
      );
      expect(result.success).toBe(false);
    });

    it("should validate model ID length constraints", () => {
      const invalidModelIdData = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: [
              {
                id: "A".repeat(101), // Exceeds 100 char limit
                name: "Test Model",
                contextLength: 4096,
              },
            ],
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result =
        persistedLlmModelsSettingsSchema.safeParse(invalidModelIdData);
      expect(result.success).toBe(false);
    });

    it("should validate provider must have at least one model", () => {
      const invalidProviderData = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "test-provider",
            name: "Test Provider",
            models: [], // Invalid - must have at least one model
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result =
        persistedLlmModelsSettingsSchema.safeParse(invalidProviderData);
      expect(result.success).toBe(false);
    });
  });

  describe("includeDefaults parameter", () => {
    it("should return default providers when includeDefaults=true (default)", () => {
      const config = createDefaultLlmModelsSettings();

      expect(config.providers).toHaveLength(2);
      expect(config.providers[0]).toHaveProperty("id", "openai");
      expect(config.providers[1]).toHaveProperty("id", "anthropic");
    });

    it("should return default providers when includeDefaults=true explicitly", () => {
      const config = createDefaultLlmModelsSettings(true);

      expect(config.providers).toHaveLength(2);
      expect(config.providers[0]).toHaveProperty("name", "OpenAI");
      expect(config.providers[1]).toHaveProperty("name", "Anthropic");
    });

    it("should return empty array when includeDefaults=false", () => {
      const config = createDefaultLlmModelsSettings(false);

      expect(config.providers).toHaveLength(0);
      expect(config.providers).toEqual([]);
    });

    it("should validate all default providers against schema", () => {
      const config = createDefaultLlmModelsSettings(true);

      const result = persistedLlmModelsSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);

      // Each provider should have all required fields
      config.providers.forEach((provider) => {
        expect(provider).toHaveProperty("id");
        expect(provider).toHaveProperty("name");
        expect(provider).toHaveProperty("models");
        expect(Array.isArray(provider.models)).toBe(true);
        expect(provider.models.length).toBeGreaterThan(0);
      });
    });

    it("should have diverse model offerings in defaults", () => {
      const config = createDefaultLlmModelsSettings(true);

      // Check that we have variety in context lengths
      const allModels = config.providers.flatMap((p) => p.models);
      const contextLengths = allModels.map((m) => m.contextLength);
      const uniqueContextLengths = new Set(contextLengths);

      expect(uniqueContextLengths.size).toBeGreaterThan(1);
      expect(Math.max(...contextLengths)).toBeGreaterThan(
        Math.min(...contextLengths) * 2,
      );
    });

    it("should include comprehensive model coverage", () => {
      const config = createDefaultLlmModelsSettings(true);

      const allModelIds = config.providers.flatMap((p) =>
        p.models.map((m) => m.id),
      );

      // Should include major model families
      expect(allModelIds.some((id) => id.includes("gpt"))).toBe(true);
      expect(allModelIds.some((id) => id.includes("claude"))).toBe(true);

      // Should have reasonable total count
      expect(allModelIds).toHaveLength(6); // 3 OpenAI + 3 Anthropic
    });

    it("should have meaningful model names and IDs", () => {
      const config = createDefaultLlmModelsSettings(true);

      config.providers.forEach((provider) => {
        provider.models.forEach((model) => {
          expect(model.id).toBeTruthy();
          expect(model.name).toBeTruthy();
          expect(model.id.length).toBeGreaterThan(3);
          expect(model.name.length).toBeGreaterThan(3);
          expect(model.contextLength).toBeGreaterThan(1000);
        });
      });
    });

    it("should maintain provider ordering consistency", () => {
      const config1 = createDefaultLlmModelsSettings(true);
      const config2 = createDefaultLlmModelsSettings(true);

      const providerIds1 = config1.providers.map((p) => p.id);
      const providerIds2 = config2.providers.map((p) => p.id);

      expect(providerIds1).toEqual(providerIds2);
      expect(providerIds1).toEqual(["openai", "anthropic"]);
    });

    it("should maintain model ordering within providers", () => {
      const config = createDefaultLlmModelsSettings(true);

      const openaiProvider = config.providers.find((p) => p.id === "openai");
      const anthropicProvider = config.providers.find(
        (p) => p.id === "anthropic",
      );

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
});

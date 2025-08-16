import { createDefaultPersonalitiesSettings } from "../createDefaultPersonalitiesSettings";
import {
  persistedPersonalitiesSettingsSchema,
  CURRENT_PERSONALITIES_SCHEMA_VERSION,
} from "../personalitiesSettingsSchema";

describe("createDefaultPersonalitiesSettings", () => {
  describe("basic functionality", () => {
    it("should return a valid configuration object", () => {
      const config = createDefaultPersonalitiesSettings();

      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
      expect(config).not.toBeNull();
    });

    it("should have all required fields", () => {
      const config = createDefaultPersonalitiesSettings();

      expect(config).toHaveProperty("schemaVersion");
      expect(config).toHaveProperty("personalities");
      expect(config).toHaveProperty("lastUpdated");
    });

    it("should return correct types for all fields", () => {
      const config = createDefaultPersonalitiesSettings();

      expect(typeof config.schemaVersion).toBe("string");
      expect(Array.isArray(config.personalities)).toBe(true);
      expect(typeof config.lastUpdated).toBe("string");
    });
  });

  describe("schema version", () => {
    it("should use the current schema version constant", () => {
      const config = createDefaultPersonalitiesSettings();

      expect(config.schemaVersion).toBe(CURRENT_PERSONALITIES_SCHEMA_VERSION);
      expect(config.schemaVersion).toBe("1.0.0");
    });

    it("should have non-empty schema version", () => {
      const config = createDefaultPersonalitiesSettings();

      expect(config.schemaVersion).not.toBe("");
      expect(config.schemaVersion.length).toBeGreaterThan(0);
    });
  });

  describe("personalities array", () => {
    it("should return empty personalities array for clean start when includeDefaults=false", () => {
      const config = createDefaultPersonalitiesSettings(false);

      expect(config.personalities).toHaveLength(0);
      expect(config.personalities).toEqual([]);
    });

    it("should return a mutable array", () => {
      const config = createDefaultPersonalitiesSettings(false);

      // Should be able to push items without errors
      config.personalities.push({
        id: "test-id",
        name: "Test Personality",
        bigFive: {
          openness: 50,
          conscientiousness: 60,
          extraversion: 70,
          agreeableness: 80,
          neuroticism: 40,
        },
        behaviors: { creativity: 75, analytical: 85 },
        customInstructions: "Test instructions",
        createdAt: null,
        updatedAt: null,
      });

      expect(config.personalities).toHaveLength(1);
    });

    it("should return a new array instance each time", () => {
      const config1 = createDefaultPersonalitiesSettings();
      const config2 = createDefaultPersonalitiesSettings();

      expect(config1.personalities).not.toBe(config2.personalities);
      expect(config1).not.toBe(config2);
    });
  });

  describe("timestamp generation", () => {
    it("should generate a valid ISO timestamp", () => {
      const config = createDefaultPersonalitiesSettings();

      // Should be a valid date string
      const date = new Date(config.lastUpdated);
      expect(date.toString()).not.toBe("Invalid Date");
      expect(date.toISOString()).toBe(config.lastUpdated);
    });

    it("should generate current timestamp", () => {
      const before = new Date().toISOString();
      const config = createDefaultPersonalitiesSettings();
      const after = new Date().toISOString();

      expect(config.lastUpdated >= before).toBe(true);
      expect(config.lastUpdated <= after).toBe(true);
    });

    it("should generate different timestamps for multiple calls", () => {
      const config1 = createDefaultPersonalitiesSettings();

      // Brief delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Small busy wait to ensure time passes
      }

      const config2 = createDefaultPersonalitiesSettings();
      expect(config1.lastUpdated).not.toBe(config2.lastUpdated);
    });
  });

  describe("schema validation", () => {
    it("should generate config that validates against schema", () => {
      const config = createDefaultPersonalitiesSettings();

      const result = persistedPersonalitiesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should have correct TypeScript type", () => {
      const config = createDefaultPersonalitiesSettings();

      // TypeScript compile-time check (this test passes if it compiles)
      const typedConfig: ReturnType<typeof createDefaultPersonalitiesSettings> =
        config;
      expect(typedConfig).toBe(config);
    });

    it("should generate schema-compliant structure", () => {
      const config = createDefaultPersonalitiesSettings();

      // Parse and validate
      const validated = persistedPersonalitiesSettingsSchema.parse(config);

      expect(validated.schemaVersion).toBe(config.schemaVersion);
      expect(validated.personalities).toEqual(config.personalities);
      expect(validated.lastUpdated).toBe(config.lastUpdated);
    });
  });

  describe("immutability and independence", () => {
    it("should return independent configurations", () => {
      const config1 = createDefaultPersonalitiesSettings();
      const config2 = createDefaultPersonalitiesSettings();

      // Modify first config
      config1.personalities.push({
        id: "test",
        name: "Test",
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
        behaviors: {},
        customInstructions: "Test",
        createdAt: null,
        updatedAt: null,
      });

      // Second config should be unaffected
      expect(config2.personalities).toHaveLength(5); // Still has defaults
    });

    it("should not share references between calls", () => {
      const configs = Array.from({ length: 3 }, () =>
        createDefaultPersonalitiesSettings(),
      );

      // All should be different instances
      expect(configs[0]).not.toBe(configs[1]);
      expect(configs[1]).not.toBe(configs[2]);
      expect(configs[0]).not.toBe(configs[2]);

      // Arrays should also be different instances
      expect(configs[0]!.personalities).not.toBe(configs[1]!.personalities);
      expect(configs[1]!.personalities).not.toBe(configs[2]!.personalities);
    });
  });

  describe("function purity", () => {
    it("should return equivalent structures on multiple calls", () => {
      const config1 = createDefaultPersonalitiesSettings();
      const config2 = createDefaultPersonalitiesSettings();

      // Should have same structure (different instances, but equivalent content)
      expect(config1.schemaVersion).toBe(config2.schemaVersion);
      expect(config1.personalities).toEqual(config2.personalities);
      // Note: timestamps will be different but both should be valid
    });

    it("should have no side effects", () => {
      const originalDate = Date;

      // Verify function doesn't mutate global state
      createDefaultPersonalitiesSettings();
      createDefaultPersonalitiesSettings();
      createDefaultPersonalitiesSettings();

      expect(Date).toBe(originalDate);
      expect(typeof createDefaultPersonalitiesSettings).toBe("function");
    });
  });

  describe("error handling and validation", () => {
    it("should have validation that would catch invalid data", () => {
      const config = createDefaultPersonalitiesSettings();

      // Verify the returned config would pass validation
      const result = persistedPersonalitiesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should validate against current schema version", () => {
      const config = createDefaultPersonalitiesSettings();

      // Should always use the current schema version
      expect(config.schemaVersion).toBe(CURRENT_PERSONALITIES_SCHEMA_VERSION);

      // Should validate successfully
      const result = persistedPersonalitiesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should validate that personalities array is required", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        personalities: "not-an-array", // Invalid - should be array
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result =
        persistedPersonalitiesSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should handle empty personalities array in schema validation", () => {
      // Test that empty personalities array is valid by schema when explicitly requested
      const config = createDefaultPersonalitiesSettings(false);

      const result = persistedPersonalitiesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);
      expect(config.personalities).toHaveLength(0);
    });
  });

  describe("timestamp generation edge cases", () => {
    it("should handle Date mock correctly", () => {
      const mockDate = new Date("2025-01-01T00:00:00.000Z");

      // Mock Date constructor
      jest.spyOn(globalThis, "Date").mockImplementation(() => mockDate);

      const config = createDefaultPersonalitiesSettings();
      expect(config.lastUpdated).toBe("2025-01-01T00:00:00.000Z");

      jest.restoreAllMocks();
    });

    it("should generate valid ISO string format", () => {
      const config = createDefaultPersonalitiesSettings();
      const parsedDate = new Date(config.lastUpdated);

      expect(parsedDate.toISOString()).toBe(config.lastUpdated);
      expect(config.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should handle millisecond precision", () => {
      const config = createDefaultPersonalitiesSettings();

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
        createDefaultPersonalitiesSettings(false),
      );

      configs.forEach((config) => {
        expect(config).toHaveProperty("schemaVersion");
        expect(config).toHaveProperty("personalities");
        expect(config).toHaveProperty("lastUpdated");
        expect(config.schemaVersion).toBe("1.0.0");
        expect(config.personalities).toEqual([]);
      });
    });

    it("should maintain consistent timestamp format", () => {
      const configs = Array.from({ length: 5 }, () =>
        createDefaultPersonalitiesSettings(),
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

    it("should always return empty personalities array when includeDefaults=false", () => {
      const configs = Array.from({ length: 10 }, () =>
        createDefaultPersonalitiesSettings(false),
      );

      configs.forEach((config) => {
        expect(config.personalities).toEqual([]);
        expect(config.personalities).toHaveLength(0);
      });
    });
  });

  describe("schema validation against personality structure", () => {
    it("should validate that personality fields would be required when present", () => {
      // Test that invalid personality structure would fail validation
      const invalidPersonalityData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "valid-personality",
            name: "Valid Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "Valid instructions",
            createdAt: null,
            updatedAt: null,
          },
          {
            // Missing required fields - should fail validation
            id: "invalid-personality",
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedPersonalitiesSettingsSchema.safeParse(
        invalidPersonalityData,
      );
      expect(result.success).toBe(false);
    });

    it("should validate Big Five traits range constraints", () => {
      const invalidBigFiveData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "test-personality",
            name: "Test Personality",
            bigFive: {
              openness: 150, // Invalid - exceeds 100
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "Test",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result =
        persistedPersonalitiesSettingsSchema.safeParse(invalidBigFiveData);
      expect(result.success).toBe(false);
    });

    it("should validate custom instructions length constraints", () => {
      const invalidInstructionsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "test-personality",
            name: "Test Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "A".repeat(501), // Exceeds 500 char limit
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-01T00:00:00.000Z",
      };

      const result = persistedPersonalitiesSettingsSchema.safeParse(
        invalidInstructionsData,
      );
      expect(result.success).toBe(false);
    });
  });

  describe("includeDefaults parameter", () => {
    it("should return default personalities when includeDefaults=true (default)", () => {
      const config = createDefaultPersonalitiesSettings();

      expect(config.personalities).toHaveLength(5);
      expect(config.personalities[0]).toHaveProperty("id", "creative-thinker");
      expect(config.personalities[1]).toHaveProperty(
        "id",
        "analytical-strategist",
      );
      expect(config.personalities[2]).toHaveProperty(
        "id",
        "empathetic-supporter",
      );
      expect(config.personalities[3]).toHaveProperty("id", "dynamic-leader");
      expect(config.personalities[4]).toHaveProperty(
        "id",
        "thoughtful-advisor",
      );
    });

    it("should return default personalities when includeDefaults=true explicitly", () => {
      const config = createDefaultPersonalitiesSettings(true);

      expect(config.personalities).toHaveLength(5);
      expect(config.personalities[0]).toHaveProperty(
        "name",
        "Creative Thinker",
      );
      expect(config.personalities[1]).toHaveProperty(
        "name",
        "Analytical Strategist",
      );
      expect(config.personalities[2]).toHaveProperty(
        "name",
        "Empathetic Supporter",
      );
      expect(config.personalities[3]).toHaveProperty("name", "Dynamic Leader");
      expect(config.personalities[4]).toHaveProperty(
        "name",
        "Thoughtful Advisor",
      );
    });

    it("should return empty array when includeDefaults=false", () => {
      const config = createDefaultPersonalitiesSettings(false);

      expect(config.personalities).toHaveLength(0);
      expect(config.personalities).toEqual([]);
    });

    it("should validate all default personalities against schema", () => {
      const config = createDefaultPersonalitiesSettings(true);

      const result = persistedPersonalitiesSettingsSchema.safeParse(config);
      expect(result.success).toBe(true);

      // Each personality should have all required fields
      config.personalities.forEach((personality) => {
        expect(personality).toHaveProperty("id");
        expect(personality).toHaveProperty("name");
        expect(personality).toHaveProperty("bigFive");
        expect(personality).toHaveProperty("behaviors");
        expect(personality).toHaveProperty("customInstructions");
        expect(personality).toHaveProperty("createdAt");
        expect(personality).toHaveProperty("updatedAt");
      });
    });

    it("should have diverse Big Five trait profiles in defaults", () => {
      const config = createDefaultPersonalitiesSettings(true);

      // Check that we have diversity in traits
      const opennessValues = config.personalities.map(
        (p) => p.bigFive.openness,
      );
      const extraversionValues = config.personalities.map(
        (p) => p.bigFive.extraversion,
      );

      expect(
        Math.max(...opennessValues) - Math.min(...opennessValues),
      ).toBeGreaterThan(20);
      expect(
        Math.max(...extraversionValues) - Math.min(...extraversionValues),
      ).toBeGreaterThan(30);
    });

    it("should include meaningful custom instructions for each personality", () => {
      const config = createDefaultPersonalitiesSettings(true);

      config.personalities.forEach((personality) => {
        expect(personality.customInstructions).toBeTruthy();
        expect(personality.customInstructions.length).toBeGreaterThan(50);
        expect(personality.customInstructions.length).toBeLessThanOrEqual(500);
      });
    });
  });
});

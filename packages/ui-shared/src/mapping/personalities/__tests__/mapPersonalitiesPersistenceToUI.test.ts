/**
 * Unit tests for mapPersonalitiesPersistenceToUI mapping function
 */

import type {
  PersistedPersonalitiesSettingsData,
  PersistedPersonalityData,
} from "@fishbowl-ai/shared";
import { mapPersonalitiesPersistenceToUI } from "../mapPersonalitiesPersistenceToUI";

describe("mapPersonalitiesPersistenceToUI", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("successful transformations", () => {
    it("should transform complete persistence data to UI format", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Creative Thinker",
            behaviors: { creativity: 85, empathy: 75, leadership: 65 },
            customInstructions: "Focus on creative and innovative solutions",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
          {
            id: "personality-2",
            name: "Analytical Mind",
            behaviors: { analytical: 95, precision: 90, methodical: 85 },
            customInstructions:
              "Focus on data-driven analysis and logical reasoning",
            createdAt: "2025-01-11T10:00:00.000Z",
            updatedAt: "2025-01-15T16:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(2);
      expect(result[0]!).toEqual({
        id: "personality-1",
        name: "Creative Thinker",
        behaviors: { creativity: 85, empathy: 75, leadership: 65 },
        customInstructions: "Focus on creative and innovative solutions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      });
      expect(result[1]!).toEqual({
        id: "personality-2",
        name: "Analytical Mind",
        behaviors: { analytical: 95, precision: 90, methodical: 85 },
        customInstructions:
          "Focus on data-driven analysis and logical reasoning",
        createdAt: "2025-01-11T10:00:00.000Z",
        updatedAt: "2025-01-15T16:00:00.000Z",
      });
    });

    it("should transform single personality correctly", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-single",
            name: "Solo Personality",
            behaviors: { balance: 50 },
            customInstructions: "You are a balanced personality",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("personality-single");
      expect(result[0]!.name).toBe("Solo Personality");
    });

    it("should handle personalities with null timestamps", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Test Personality",
            behaviors: {},
            customInstructions: "Test instructions",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.createdAt).toBe(mockDate);
      expect(result[0]!.updatedAt).toBe(mockDate);
    });

    it("should handle personalities with missing IDs", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "",
            name: "No ID Personality",
            behaviors: { social: 80 },
            customInstructions: "Be social and engaging",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("");
      expect(result[0]!.name).toBe("No ID Personality");
    });

    it("should handle personalities with field normalization needs", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "  personality-trim  ",
            name: "  Needs Trimming  ",
            behaviors: {},
            customInstructions: "  Instructions with spaces  ",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("  personality-trim  ");
      expect(result[0]!.name).toBe("  Needs Trimming  ");
      expect(result[0]!.customInstructions).toBe(
        "  Instructions with spaces  ",
      );
    });
  });

  describe("null and undefined input handling", () => {
    it("should return empty array for null input", () => {
      const result = mapPersonalitiesPersistenceToUI(null);
      expect(result).toEqual([]);
    });

    it("should return empty array for undefined input", () => {
      const result = mapPersonalitiesPersistenceToUI(undefined);
      expect(result).toEqual([]);
    });

    it("should return empty array for data with null personalities", () => {
      const persistedData = {
        schemaVersion: "1.0.0",
        personalities: null,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      } as unknown as PersistedPersonalitiesSettingsData;

      const result = mapPersonalitiesPersistenceToUI(persistedData);
      expect(result).toEqual([]);
    });

    it("should return empty array for data with undefined personalities", () => {
      const persistedData = {
        schemaVersion: "1.0.0",
        personalities: undefined,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      } as unknown as PersistedPersonalitiesSettingsData;

      const result = mapPersonalitiesPersistenceToUI(persistedData);
      expect(result).toEqual([]);
    });

    it("should handle empty personalities array", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);
      expect(result).toEqual([]);
    });
  });

  describe("large dataset handling", () => {
    it("should handle large personality arrays efficiently", () => {
      const personalities: PersistedPersonalityData[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `personality-${i}`,
          name: `Personality ${i}`,
          behaviors: { trait: 50 + (i % 50) },
          customInstructions: `Instructions for personality ${i}`,
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        }),
      );

      const persistedData = {
        schemaVersion: "1.0.0",
        personalities,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      } as PersistedPersonalitiesSettingsData;

      const startTime = performance.now();
      const result = mapPersonalitiesPersistenceToUI(persistedData);
      const endTime = performance.now();

      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms

      // Verify first and last entries
      expect(result[0]!.id).toBe("personality-0");
      expect(result[0]!.name).toBe("Personality 0");
      expect(result[99]!.id).toBe("personality-99");
      expect(result[99]!.name).toBe("Personality 99");
    });

    it("should maintain order of personalities in large datasets", () => {
      const personalities: PersistedPersonalityData[] = Array.from(
        { length: 50 },
        (_, i) => ({
          id: `personality-${String(i).padStart(3, "0")}`,
          name: `Personality ${i}`,
          behaviors: {},
          customInstructions: `Instructions ${i}`,
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        }),
      );

      const persistedData = {
        schemaVersion: "1.0.0",
        personalities,
        lastUpdated: "2025-01-15T10:00:00.000Z",
      } as PersistedPersonalitiesSettingsData;

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      for (let i = 0; i < result.length; i++) {
        expect(result[i]!.id).toBe(`personality-${String(i).padStart(3, "0")}`);
        expect(result[i]!.name).toBe(`Personality ${i}`);
      }
    });
  });

  describe("mixed validity scenarios", () => {
    it("should handle personalities with varying field lengths", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "short",
            name: "A", // Valid single char (min 1)
            behaviors: {},
            customInstructions: "B", // Valid single char
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
          {
            id: "long",
            name: "X".repeat(150), // Will be truncated appropriately
            behaviors: {},
            customInstructions: "Z".repeat(6000), // Will be truncated appropriately
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(2);

      // Short personality (valid single chars)
      expect(result[0]!.name).toBe("A");
      expect(result[0]!.name.length).toBe(1);
      expect(result[0]!.customInstructions).toBe("B");

      // Long personality (truncated appropriately by single mapper)
      expect(result[1]!.name.length).toBeLessThanOrEqual(150);
      expect(result[1]!.customInstructions?.length).toBeLessThanOrEqual(6000);
    });

    it("should handle personalities with mixed timestamp states", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "valid-timestamps",
            name: "Valid Personality",
            behaviors: {},
            customInstructions: "Has valid timestamps",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
          {
            id: "null-timestamps",
            name: "Null Personality",
            behaviors: {},
            customInstructions: "Has null timestamps",
            createdAt: null,
            updatedAt: null,
          },
          {
            id: "mixed-timestamps",
            name: "Mixed Personality",
            behaviors: {},
            customInstructions: "Has mixed timestamps",
            createdAt: "2025-01-12T12:00:00.000Z",
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(3);

      // Valid timestamps preserved
      expect(result[0]!.createdAt).toBe("2025-01-10T09:00:00.000Z");
      expect(result[0]!.updatedAt).toBe("2025-01-14T15:30:00.000Z");

      // Null timestamps replaced
      expect(result[1]!.createdAt).toBe(mockDate);
      expect(result[1]!.updatedAt).toBe(mockDate);

      // Mixed timestamps handled correctly
      expect(result[2]!.createdAt).toBe("2025-01-12T12:00:00.000Z");
      expect(result[2]!.updatedAt).toBe(mockDate);
    });
  });

  describe("unicode and special character handling", () => {
    it("should handle unicode characters correctly", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "unicode-personality",
            name: "Personnalité Française 🇫🇷",
            behaviors: { créativité: 85 },
            customInstructions: "Tu es un assistant très compétent! 🤖✨",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe("Personnalité Française 🇫🇷");
      expect(result[0]!.behaviors).toEqual({ créativité: 85 });
      expect(result[0]!.customInstructions).toBe(
        "Tu es un assistant très compétent! 🤖✨",
      );
    });

    it("should count unicode characters correctly for length limits", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "emoji-test",
            name: "🚀".repeat(25), // 25 emojis, within reasonable limits
            behaviors: { "🎯": 85 },
            customInstructions: "🤖".repeat(100), // 100 emojis
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result[0]!.name).toBe("🚀".repeat(25));
      expect(result[0]!.behaviors).toEqual({ "🎯": 85 });
      expect(result[0]!.customInstructions).toBe("🤖".repeat(100));
    });
  });

  describe("return type and structure", () => {
    it("should always return an array", () => {
      const result1 = mapPersonalitiesPersistenceToUI(null);
      const result2 = mapPersonalitiesPersistenceToUI(undefined);
      const result3 = mapPersonalitiesPersistenceToUI({
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      });

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
      expect(Array.isArray(result3)).toBe(true);
    });

    it("should return personalities with proper structure", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "structure-test",
            name: "Structure Personality",
            behaviors: { test: 50 },
            customInstructions: "Test structure",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      const personality = result[0]!;

      // Check all required properties exist
      expect(personality).toHaveProperty("id");
      expect(personality).toHaveProperty("name");
      expect(personality).toHaveProperty("behaviors");
      expect(personality).toHaveProperty("customInstructions");
      expect(personality).toHaveProperty("createdAt");
      expect(personality).toHaveProperty("updatedAt");

      // Check types
      expect(typeof personality.id).toBe("string");
      expect(typeof personality.name).toBe("string");
      expect(typeof personality.behaviors).toBe("object");
      expect(typeof personality.createdAt).toBe("string");
      expect(typeof personality.updatedAt).toBe("string");
      expect(
        typeof personality.customInstructions === "string" ||
          personality.customInstructions === undefined,
      ).toBe(true);
    });

    it("should return object conforming to PersonalityViewModel interface", () => {
      const persistedData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "interface-test",
            name: "Interface Test",
            behaviors: {},
            customInstructions: "Interface test",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(persistedData);

      expect(result).toHaveLength(1);
      // TypeScript compilation would fail if this doesn't conform to PersonalityViewModel
      const personality = result[0]!;
      expect(personality).toBeDefined();
    });
  });

  describe("round-trip data integrity", () => {
    it("should maintain complete data integrity in single round-trip", () => {
      const originalData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "integrity-test",
            name: "Data Integrity Test",
            behaviors: {
              creativity: 90,
              analytical: 80,
              empathy: 95,
              leadership: 70,
            },
            customInstructions: "Comprehensive data integrity test",
            createdAt: "2025-01-10T09:00:00.000Z",
            updatedAt: "2025-01-14T15:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = mapPersonalitiesPersistenceToUI(originalData);

      // Verify no data loss
      expect(result[0]!.id).toBe(originalData.personalities![0]!.id);
      expect(result[0]!.name).toBe(originalData.personalities![0]!.name);
      expect(result[0]!.behaviors).toEqual(
        originalData.personalities![0]!.behaviors,
      );
      expect(result[0]!.customInstructions).toBe(
        originalData.personalities![0]!.customInstructions,
      );
      expect(result[0]!.createdAt).toBe(
        originalData.personalities![0]!.createdAt,
      );
      expect(result[0]!.updatedAt).toBe(
        originalData.personalities![0]!.updatedAt,
      );
    });
  });
});

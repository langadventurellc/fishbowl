/**
 * Unit tests for mapPersonalitiesUIToPersistence mapping function
 */

import type { PersonalityViewModel } from "../../../types/settings/PersonalityViewModel";
import { mapPersonalitiesUIToPersistence } from "../mapPersonalitiesUIToPersistence";

describe("mapPersonalitiesUIToPersistence", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("successful transformations", () => {
    it("should transform complete personality array to persistence format", () => {
      const uiPersonalities: PersonalityViewModel[] = [
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
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.schemaVersion).toBe("1.0.0");
      expect(result.lastUpdated).toBe(mockDate);
      expect(result.personalities).toHaveLength(2);
      expect(result.personalities[0]).toEqual({
        id: "personality-1",
        name: "Creative Thinker",
        behaviors: { creativity: 85, empathy: 75, leadership: 65 },
        customInstructions: "Focus on creative and innovative solutions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: mockDate,
      });
      expect(result.personalities[1]).toEqual({
        id: "personality-2",
        name: "Analytical Mind",
        behaviors: { analytical: 95, precision: 90, methodical: 85 },
        customInstructions:
          "Focus on data-driven analysis and logical reasoning",
        createdAt: "2025-01-11T10:00:00.000Z",
        updatedAt: mockDate,
      });
    });

    it("should handle empty personalities array", () => {
      const result = mapPersonalitiesUIToPersistence([]);

      expect(result).toEqual({
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: mockDate,
      });
    });

    it("should transform single personality correctly", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "single-personality",
          name: "Solo Test",
          behaviors: { balance: 50 },
          customInstructions: "Balanced personality for testing",
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.schemaVersion).toBe("1.0.0");
      expect(result.lastUpdated).toBe(mockDate);
      expect(result.personalities).toHaveLength(1);
      expect(result.personalities[0]!.id).toBe("single-personality");
      expect(result.personalities[0]!.name).toBe("Solo Test");
    });

    it("should generate schema version and timestamp", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "test-personality",
          name: "Test Personality",
          behaviors: {},
          customInstructions: "Test personality for schema validation",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.schemaVersion).toBe("1.0.0");
      expect(result.lastUpdated).toBe(mockDate);
      expect(typeof result.lastUpdated).toBe("string");
      expect(new Date(result.lastUpdated).toISOString()).toBe(mockDate);
    });

    it("should preserve complex behaviors structure", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "behaviors-test",
          name: "Behaviors Test",
          behaviors: {
            creativity: 90,
            analytical: 85,
            empathy: 80,
            leadership: 75,
            humor: 70,
            patience: 65,
          },
          customInstructions: "Test complex behaviors preservation",
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.personalities[0]!.behaviors).toEqual({
        creativity: 90,
        analytical: 85,
        empathy: 80,
        leadership: 75,
        humor: 70,
        patience: 65,
      });
    });
  });

  describe("validation and error handling", () => {
    it("should validate output against schema", () => {
      const validPersonalities: PersonalityViewModel[] = [
        {
          id: "valid-personality",
          name: "Valid Personality",
          behaviors: {},
          customInstructions: "Valid personality for testing",
        },
      ];

      expect(() =>
        mapPersonalitiesUIToPersistence(validPersonalities),
      ).not.toThrow();
    });

    it("should handle spaces in ID and name without trimming", () => {
      const personalityWithSpaces = {
        id: "   spaced-id   ",
        name: "   Spaced Name   ",
        behaviors: {},
        customInstructions: "Valid instructions",
      } as PersonalityViewModel;

      expect(() =>
        mapPersonalitiesUIToPersistence([personalityWithSpaces]),
      ).not.toThrow();

      const result = mapPersonalitiesUIToPersistence([personalityWithSpaces]);
      expect(result.personalities[0]!.id).toBe("   spaced-id   ");
      expect(result.personalities[0]!.name).toBe("   Spaced Name   ");
    });
  });

  describe("field normalization and processing", () => {
    it("should preserve personality field data correctly", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "field-test",
          name: "Field Test Personality",
          behaviors: { creativity: 85, analytical: 75 },
          customInstructions: "Comprehensive field testing",
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.personalities[0]!.id).toBe("field-test");
      expect(result.personalities[0]!.name).toBe("Field Test Personality");
      expect(result.personalities[0]!.behaviors).toEqual({
        creativity: 85,
        analytical: 75,
      });
      expect(result.personalities[0]!.customInstructions).toBe(
        "Comprehensive field testing",
      );
      expect(result.personalities[0]!.createdAt).toBe(
        "2025-01-10T09:00:00.000Z",
      );
      expect(result.personalities[0]!.updatedAt).toBe(mockDate);
    });

    it("should preserve personalities with spaces without trimming", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "  preserve-test  ",
          name: "  Preserve Spaces  ",
          behaviors: {},
          customInstructions: "  Instructions with spaces  ",
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.personalities[0]!.id).toBe("  preserve-test  ");
      expect(result.personalities[0]!.name).toBe("  Preserve Spaces  ");
      expect(result.personalities[0]!.customInstructions).toBe(
        "  Instructions with spaces  ",
      );
    });

    it("should handle personalities with missing optional timestamps", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "timestamp-test",
          name: "Timestamp Test",
          behaviors: {},
          customInstructions: "Test timestamp handling",
          // Missing createdAt and updatedAt
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.personalities[0]!.createdAt).toBe(mockDate);
      expect(result.personalities[0]!.updatedAt).toBe(mockDate);
    });

    it("should handle personalities with partial timestamps", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "partial-timestamp",
          name: "Partial Timestamp Test",
          behaviors: {},
          customInstructions: "Test partial timestamp handling",
          createdAt: "2025-01-10T09:00:00.000Z",
          // Missing updatedAt
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.personalities[0]!.createdAt).toBe(
        "2025-01-10T09:00:00.000Z",
      );
      expect(result.personalities[0]!.updatedAt).toBe(mockDate);
    });
  });

  describe("large dataset handling", () => {
    it("should handle large personality arrays efficiently", () => {
      const personalities: PersonalityViewModel[] = Array.from(
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

      const startTime = performance.now();
      const result = mapPersonalitiesUIToPersistence(personalities);
      const endTime = performance.now();

      expect(result.personalities).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms

      // Verify structure
      expect(result.schemaVersion).toBe("1.0.0");
      expect(result.lastUpdated).toBe(mockDate);

      // Verify first and last entries
      expect(result.personalities[0]!.id).toBe("personality-0");
      expect(result.personalities[0]!.name).toBe("Personality 0");
      expect(result.personalities[99]!.id).toBe("personality-99");
      expect(result.personalities[99]!.name).toBe("Personality 99");
    });

    it("should maintain order of personalities in large datasets", () => {
      const personalities: PersonalityViewModel[] = Array.from(
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

      const result = mapPersonalitiesUIToPersistence(personalities);

      for (let i = 0; i < result.personalities.length; i++) {
        expect(result.personalities[i]!.id).toBe(
          `personality-${String(i).padStart(3, "0")}`,
        );
        expect(result.personalities[i]!.name).toBe(`Personality ${i}`);
      }
    });
  });

  describe("unicode and special character handling", () => {
    it("should handle unicode characters correctly", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "unicode-personality",
          name: "Personnalité Française 🇫🇷",
          behaviors: { créativité: 85 },
          customInstructions: "Tu es un assistant très compétent! 🤖✨",
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      expect(result.personalities[0]!.name).toBe("Personnalité Française 🇫🇷");
      expect(result.personalities[0]!.behaviors).toEqual({ créativité: 85 });
      expect(result.personalities[0]!.customInstructions).toBe(
        "Tu es un assistant très compétent! 🤖✨",
      );
    });
  });

  describe("return type and structure", () => {
    it("should return correct persistence data structure", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "structure-test",
          name: "Structure Test",
          behaviors: {},
          customInstructions: "Test structure",
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      // Check top-level structure
      expect(result).toHaveProperty("schemaVersion");
      expect(result).toHaveProperty("personalities");
      expect(result).toHaveProperty("lastUpdated");

      // Check types
      expect(typeof result.schemaVersion).toBe("string");
      expect(Array.isArray(result.personalities)).toBe(true);
      expect(typeof result.lastUpdated).toBe("string");

      // Check personality structure
      const personality = result.personalities[0]!;
      expect(personality).toHaveProperty("id");
      expect(personality).toHaveProperty("name");
      expect(personality).toHaveProperty("behaviors");
      expect(personality).toHaveProperty("customInstructions");
      expect(personality).toHaveProperty("createdAt");
      expect(personality).toHaveProperty("updatedAt");
    });

    it("should return valid PersistedPersonalitiesSettingsData", () => {
      const uiPersonalities: PersonalityViewModel[] = [
        {
          id: "type-test",
          name: "Type Test",
          behaviors: {},
          customInstructions: "Type testing",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(uiPersonalities);

      // TypeScript compilation would fail if this doesn't return PersistedPersonalitiesSettingsData
      expect(result).toBeDefined();
      expect(result.schemaVersion).toBeDefined();
      expect(result.personalities).toBeDefined();
      expect(result.lastUpdated).toBeDefined();
    });
  });

  describe("round-trip data integrity", () => {
    it("should maintain complete data integrity when mapping UI to persistence", () => {
      const originalPersonalities: PersonalityViewModel[] = [
        {
          id: "integrity-test-1",
          name: "Data Integrity Test 1",
          behaviors: {
            creativity: 90,
            analytical: 80,
            empathy: 95,
            leadership: 70,
          },
          customInstructions:
            "Comprehensive data integrity test for first personality",
          createdAt: "2025-01-10T09:00:00.000Z",
          updatedAt: "2025-01-14T15:30:00.000Z",
        },
        {
          id: "integrity-test-2",
          name: "Data Integrity Test 2",
          behaviors: {
            methodical: 95,
            precision: 90,
            patience: 85,
          },
          customInstructions:
            "Comprehensive data integrity test for second personality",
          createdAt: "2025-01-11T10:00:00.000Z",
          updatedAt: "2025-01-15T16:00:00.000Z",
        },
      ];

      const result = mapPersonalitiesUIToPersistence(originalPersonalities);

      // Verify no data loss for first personality
      expect(result.personalities[0]!.id).toBe(originalPersonalities[0]!.id);
      expect(result.personalities[0]!.name).toBe(
        originalPersonalities[0]!.name,
      );
      expect(result.personalities[0]!.behaviors).toEqual(
        originalPersonalities[0]!.behaviors,
      );
      expect(result.personalities[0]!.customInstructions).toBe(
        originalPersonalities[0]!.customInstructions,
      );
      expect(result.personalities[0]!.createdAt).toBe(
        originalPersonalities[0]!.createdAt,
      );

      // Verify no data loss for second personality
      expect(result.personalities[1]!.id).toBe(originalPersonalities[1]!.id);
      expect(result.personalities[1]!.name).toBe(
        originalPersonalities[1]!.name,
      );
      expect(result.personalities[1]!.behaviors).toEqual(
        originalPersonalities[1]!.behaviors,
      );
      expect(result.personalities[1]!.customInstructions).toBe(
        originalPersonalities[1]!.customInstructions,
      );
      expect(result.personalities[1]!.createdAt).toBe(
        originalPersonalities[1]!.createdAt,
      );
    });
  });
});

import { z } from "zod";
import { PersistedPersonalitiesSettingsData } from "../PersistedPersonalitiesSettingsData";
import { PersistedPersonalityData } from "../PersistedPersonalityData";
import {
  persistedPersonalitiesSettingsSchema,
  persistedPersonalitySchema,
} from "../personalitiesSettingsSchema";

describe("Personality Type Definitions", () => {
  describe("PersistedPersonalityData", () => {
    it("should match the schema inference exactly", () => {
      // Create a valid personality object that matches the schema
      const validPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Creative Thinker",
        behaviors: {
          creativity: 90,
          analytical: 70,
          collaborative: 85,
        },
        customInstructions: "Focus on creative problem-solving approaches",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      // Verify the type works with schema validation
      const schemaResult = persistedPersonalitySchema.parse(validPersonality);
      expect(schemaResult).toEqual(validPersonality);

      // Verify type inference matches
      type SchemaInferred = z.infer<typeof persistedPersonalitySchema>;
      const typeTest: SchemaInferred = validPersonality;
      expect(typeTest).toBeDefined();
    });

    it("should accept personality with null timestamps", () => {
      const personalityWithNullTimestamps: PersistedPersonalityData = {
        id: "personality-456",
        name: "Analytical Mind",
        behaviors: {
          analytical: 95,
          methodical: 90,
        },
        customInstructions: "Use data-driven approaches",
        createdAt: null,
        updatedAt: null,
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithNullTimestamps,
      );
      expect(result).toEqual(personalityWithNullTimestamps);
    });

    it("should accept personality with optional timestamps", () => {
      const personalityWithoutTimestamps: PersistedPersonalityData = {
        id: "personality-789",
        name: "Social Connector",
        behaviors: {
          social: 95,
          empathetic: 90,
          energetic: 85,
        },
        customInstructions: "Focus on building relationships and team harmony",
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithoutTimestamps,
      );
      expect(result).toMatchObject(personalityWithoutTimestamps);
    });

    it("should work with empty behaviors object", () => {
      const personalityWithEmptyBehaviors: PersistedPersonalityData = {
        id: "personality-empty",
        name: "Minimal Personality",
        behaviors: {},
        customInstructions: "",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithEmptyBehaviors,
      );
      expect(result).toEqual(personalityWithEmptyBehaviors);
    });
  });

  describe("PersistedPersonalitiesSettingsData", () => {
    it("should match the schema inference exactly", () => {
      const validSettings: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Creative",
            behaviors: {
              creative: 95,
              innovative: 90,
            },
            customInstructions: "Think outside the box",
            createdAt: "2025-01-15T10:30:00.000Z",
            updatedAt: "2025-01-15T10:30:00.000Z",
          },
          {
            id: "personality-2",
            name: "Analytical",
            behaviors: {
              analytical: 95,
              systematic: 90,
            },
            customInstructions: "Focus on data and logic",
            createdAt: "2025-01-15T11:00:00.000Z",
            updatedAt: "2025-01-15T11:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T11:30:00.000Z",
      };

      // Verify the type works with schema validation
      const schemaResult =
        persistedPersonalitiesSettingsSchema.parse(validSettings);
      expect(schemaResult).toEqual(validSettings);

      // Verify type inference matches
      type SchemaInferred = z.infer<
        typeof persistedPersonalitiesSettingsSchema
      >;
      const typeTest: SchemaInferred = validSettings;
      expect(typeTest).toBeDefined();
    });

    it("should accept empty personalities array", () => {
      const emptySettings: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: "2025-01-15T12:00:00.000Z",
      };

      const result = persistedPersonalitiesSettingsSchema.parse(emptySettings);
      expect(result).toEqual(emptySettings);
    });

    it("should work with default values", () => {
      // Test that the type accepts partial data that will be filled by defaults
      const partialSettings = {
        personalities: [
          {
            id: "test-personality",
            name: "Test",
            behaviors: {},
            customInstructions: "",
          },
        ],
      };

      const result =
        persistedPersonalitiesSettingsSchema.parse(partialSettings);

      // Verify defaults are applied
      expect(result.schemaVersion).toBe("1.0.0");
      expect(result.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(result.personalities).toHaveLength(1);
    });
  });

  describe("Type compatibility", () => {
    it("should allow PersistedPersonalityData to be used in array for PersistedPersonalitiesSettingsData", () => {
      const personality: PersistedPersonalityData = {
        id: "test-personality",
        name: "Test Personality",
        behaviors: {
          helpful: 90,
          patient: 85,
        },
        customInstructions: "Be helpful and patient",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      const settings: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [personality], // This should work without type errors
        lastUpdated: "2025-01-15T11:00:00.000Z",
      };

      expect(settings.personalities).toHaveLength(1);
      expect(settings.personalities[0]).toEqual(personality);
    });

    it("should maintain type safety for required fields", () => {
      // This test verifies that TypeScript would catch missing required fields
      // We can't actually test compile-time errors in Jest, but we can verify
      // that the type structure matches our expectations

      const personality: PersistedPersonalityData = {
        id: "test",
        name: "Test",
        behaviors: {},
        customInstructions: "",
      };

      // Verify all required fields are present
      expect(personality.id).toBeDefined();
      expect(personality.name).toBeDefined();
      expect(personality.behaviors).toBeDefined();
      expect(personality.customInstructions).toBeDefined();
    });
  });

  describe("Type exports", () => {
    it("should export PersistedPersonalityData type correctly", () => {
      // Verify the type exists and can be used
      const testFunction = (data: PersistedPersonalityData): string => {
        return data.name;
      };

      const personalityData: PersistedPersonalityData = {
        id: "export-test",
        name: "Export Test",
        behaviors: {},
        customInstructions: "",
      };

      expect(testFunction(personalityData)).toBe("Export Test");
    });

    it("should export PersistedPersonalitiesSettingsData type correctly", () => {
      // Verify the type exists and can be used
      const testFunction = (
        data: PersistedPersonalitiesSettingsData,
      ): number => {
        return data.personalities.length;
      };

      const settingsData: PersistedPersonalitiesSettingsData = {
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: "2025-01-15T12:00:00.000Z",
      };

      expect(testFunction(settingsData)).toBe(0);
    });
  });
});

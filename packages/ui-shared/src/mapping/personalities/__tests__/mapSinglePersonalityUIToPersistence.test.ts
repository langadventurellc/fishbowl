/**
 * Unit tests for mapSinglePersonalityUIToPersistence mapping function
 */

import type { PersonalityViewModel } from "../../../types/settings/PersonalityViewModel";
import { mapSinglePersonalityUIToPersistence } from "../mapSinglePersonalityUIToPersistence";

describe("mapSinglePersonalityUIToPersistence", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("complete personality transformation", () => {
    it("should transform complete UI personality to persistence format", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Creative Thinker",
        behaviors: { creativity: 85, empathy: 75, leadership: 65 },
        customInstructions: "Focus on creative and innovative solutions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result).toEqual({
        id: "personality-123",
        name: "Creative Thinker",
        behaviors: { creativity: 85, empathy: 75, leadership: 65 },
        customInstructions: "Focus on creative and innovative solutions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: mockDate,
      });
    });
  });

  describe("timestamp handling", () => {
    it("should generate current timestamp for updatedAt", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.updatedAt).toBe(mockDate);
    });

    it("should generate createdAt when missing", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should preserve existing createdAt", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.createdAt).toBe("2025-01-10T09:00:00.000Z");
      expect(result.updatedAt).toBe(mockDate);
    });
  });

  describe("ID generation", () => {
    it("should generate ID when missing", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.id).toBe("");
    });

    it("should preserve existing ID", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "existing-id",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.id).toBe("existing-id");
    });
  });

  describe("behaviors preservation", () => {
    it("should preserve behaviors exactly", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: { creativity: 80, empathy: 90, leadership: 60 },
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.behaviors).toEqual({
        creativity: 80,
        empathy: 90,
        leadership: 60,
      });
    });

    it("should preserve empty behaviors object", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.behaviors).toEqual({});
    });
  });

  describe("field preservation", () => {
    it("should preserve name exactly", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Creative Thinker",
        behaviors: {},
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.name).toBe("Creative Thinker");
    });

    it("should preserve customInstructions exactly", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Focus on creativity and innovation",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.customInstructions).toBe(
        "Focus on creativity and innovation",
      );
    });
  });

  describe("return type validation", () => {
    it("should return object conforming to PersistedPersonalityData interface", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: { test: 75 },
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      // Verify all required properties exist
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("behaviors");
      expect(result).toHaveProperty("customInstructions");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");

      // Verify types
      expect(typeof result.id).toBe("string");
      expect(typeof result.name).toBe("string");
      expect(typeof result.behaviors).toBe("object");
      expect(typeof result.customInstructions).toBe("string");
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
    });

    it("should ensure timestamps are valid ISO strings", () => {
      const uiPersonality: PersonalityViewModel = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityUIToPersistence(uiPersonality);

      expect(result.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(result.updatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(new Date(result.createdAt!).getTime()).not.toBeNaN();
      expect(new Date(result.updatedAt!).getTime()).not.toBeNaN();
    });
  });
});

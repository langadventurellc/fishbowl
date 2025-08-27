/**
 * Unit tests for mapSinglePersonalityPersistenceToUI mapping function
 */

import type { PersistedPersonalityData } from "@fishbowl-ai/shared";
import { mapSinglePersonalityPersistenceToUI } from "../mapSinglePersonalityPersistenceToUI";

describe("mapSinglePersonalityPersistenceToUI", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("complete personality transformation", () => {
    it("should transform complete persisted personality to UI format", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Creative Thinker",
        behaviors: { creativity: 85, empathy: 75, leadership: 65 },
        customInstructions: "Focus on creative and innovative solutions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result).toEqual({
        id: "personality-123",
        name: "Creative Thinker",
        behaviors: { creativity: 85, empathy: 75, leadership: 65 },
        customInstructions: "Focus on creative and innovative solutions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      });
    });
  });

  describe("timestamp handling", () => {
    it("should generate timestamps for null values", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: null,
        updatedAt: null,
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should generate timestamps for undefined values", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: undefined,
        updatedAt: undefined,
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should preserve existing valid timestamps", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.createdAt).toBe("2025-01-10T09:00:00.000Z");
      expect(result.updatedAt).toBe("2025-01-14T15:30:00.000Z");
    });
  });

  describe("ID generation", () => {
    it("should generate ID when missing", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.id).toBe("");
    });

    it("should preserve existing ID", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "existing-id",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.id).toBe("existing-id");
    });
  });

  describe("behaviors handling", () => {
    it("should preserve existing behaviors", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: { creativity: 80, empathy: 90, leadership: 60 },
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.behaviors).toEqual({
        creativity: 80,
        empathy: 90,
        leadership: 60,
      });
    });

    it("should provide empty behaviors object when missing", () => {
      const persistedPersonality = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: null,
        customInstructions: "Test instructions",
      } as unknown as PersistedPersonalityData;

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.behaviors).toEqual({});
    });
  });

  describe("field defaults", () => {
    it("should provide empty string for missing name", () => {
      const persistedPersonality = {
        id: "personality-123",
        name: null,
        behaviors: {},
        customInstructions: "Test instructions",
      } as unknown as PersistedPersonalityData;

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.name).toBe("");
    });

    it("should provide empty string for missing customInstructions", () => {
      const persistedPersonality = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: {},
        customInstructions: null,
      } as unknown as PersistedPersonalityData;

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.customInstructions).toBe("");
    });
  });

  describe("return type validation", () => {
    it("should return object conforming to PersonalityViewModel interface", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Test Personality",
        behaviors: { test: 75 },
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

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
  });
});

/**
 * Unit tests for mapSinglePersonalityPersistenceToUI mapping function
 */

import { mapSinglePersonalityPersistenceToUI } from "../mapSinglePersonalityPersistenceToUI";
import type { PersistedPersonalityData } from "@fishbowl-ai/shared";

// Mock nanoid to return predictable IDs for testing
jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "generated-id-123"),
}));

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
        bigFive: {
          openness: 90,
          conscientiousness: 70,
          extraversion: 60,
          agreeableness: 80,
          neuroticism: 30,
        },
        behaviors: { creativity: 85, empathy: 75, leadership: 65 },
        customInstructions: "Focus on creative and innovative solutions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result).toEqual({
        id: "personality-123",
        name: "Creative Thinker",
        bigFive: {
          openness: 90,
          conscientiousness: 70,
          extraversion: 60,
          agreeableness: 80,
          neuroticism: 30,
        },
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
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
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
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
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
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
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
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.id).toBe("generated-id-123");
    });

    it("should preserve existing ID", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "existing-id",
        name: "Test Personality",
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
        behaviors: {},
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.id).toBe("existing-id");
    });
  });

  describe("Big Five traits handling", () => {
    it("should preserve valid Big Five traits", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Test Personality",
        bigFive: {
          openness: 90,
          conscientiousness: 75,
          extraversion: 60,
          agreeableness: 85,
          neuroticism: 25,
        },
        behaviors: {},
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.bigFive).toEqual({
        openness: 90,
        conscientiousness: 75,
        extraversion: 60,
        agreeableness: 85,
        neuroticism: 25,
      });
    });

    it("should provide default Big Five traits when missing", () => {
      const persistedPersonality = {
        id: "personality-123",
        name: "Test Personality",
        bigFive: null,
        behaviors: {},
        customInstructions: "Test instructions",
      } as unknown as PersistedPersonalityData;

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.bigFive).toEqual({
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
      });
    });
  });

  describe("behaviors handling", () => {
    it("should preserve existing behaviors", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Test Personality",
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
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
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
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
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
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
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
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
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
        behaviors: { test: 75 },
        customInstructions: "Test instructions",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      // Verify all required properties exist
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("bigFive");
      expect(result).toHaveProperty("behaviors");
      expect(result).toHaveProperty("customInstructions");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");

      // Verify types
      expect(typeof result.id).toBe("string");
      expect(typeof result.name).toBe("string");
      expect(typeof result.bigFive).toBe("object");
      expect(typeof result.behaviors).toBe("object");
      expect(typeof result.customInstructions).toBe("string");
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
    });

    it("should ensure Big Five traits have correct structure", () => {
      const persistedPersonality: PersistedPersonalityData = {
        id: "personality-123",
        name: "Test Personality",
        bigFive: {
          openness: 50,
          conscientiousness: 60,
          extraversion: 70,
          agreeableness: 80,
          neuroticism: 40,
        },
        behaviors: {},
        customInstructions: "Test instructions",
      };

      const result = mapSinglePersonalityPersistenceToUI(persistedPersonality);

      expect(result.bigFive).toHaveProperty("openness");
      expect(result.bigFive).toHaveProperty("conscientiousness");
      expect(result.bigFive).toHaveProperty("extraversion");
      expect(result.bigFive).toHaveProperty("agreeableness");
      expect(result.bigFive).toHaveProperty("neuroticism");

      expect(typeof result.bigFive.openness).toBe("number");
      expect(typeof result.bigFive.conscientiousness).toBe("number");
      expect(typeof result.bigFive.extraversion).toBe("number");
      expect(typeof result.bigFive.agreeableness).toBe("number");
      expect(typeof result.bigFive.neuroticism).toBe("number");
    });
  });
});

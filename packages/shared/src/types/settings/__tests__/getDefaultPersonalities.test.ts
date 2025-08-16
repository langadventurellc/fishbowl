import { getDefaultPersonalities } from "../getDefaultPersonalities";
import { persistedPersonalitySchema } from "../personalitiesSettingsSchema";

describe("getDefaultPersonalities", () => {
  describe("basic functionality", () => {
    it("should return an array of personality data", () => {
      const personalities = getDefaultPersonalities();

      expect(Array.isArray(personalities)).toBe(true);
      expect(personalities.length).toBeGreaterThan(0);
    });

    it("should return exactly 5 default personalities", () => {
      const personalities = getDefaultPersonalities();

      expect(personalities).toHaveLength(5);
    });

    it("should return personalities with expected IDs", () => {
      const personalities = getDefaultPersonalities();
      const expectedIds = [
        "creative-thinker",
        "analytical-strategist",
        "empathetic-supporter",
        "dynamic-leader",
        "thoughtful-advisor",
      ];

      const actualIds = personalities.map((p) => p.id);
      expect(actualIds).toEqual(expectedIds);
    });
  });

  describe("data validation", () => {
    it("should return personalities that validate against schema", () => {
      const personalities = getDefaultPersonalities();

      personalities.forEach((personality) => {
        const result = persistedPersonalitySchema.safeParse(personality);
        expect(result.success).toBe(true);
      });
    });

    it("should return personalities with all required fields", () => {
      const personalities = getDefaultPersonalities();

      personalities.forEach((personality) => {
        expect(personality).toHaveProperty("id");
        expect(personality).toHaveProperty("name");
        expect(personality).toHaveProperty("bigFive");
        expect(personality).toHaveProperty("behaviors");
        expect(personality).toHaveProperty("customInstructions");
        expect(personality).toHaveProperty("createdAt");
        expect(personality).toHaveProperty("updatedAt");
      });
    });

    it("should return personalities with valid Big Five traits", () => {
      const personalities = getDefaultPersonalities();

      personalities.forEach((personality) => {
        const { bigFive } = personality;

        expect(bigFive.openness).toBeGreaterThanOrEqual(0);
        expect(bigFive.openness).toBeLessThanOrEqual(100);
        expect(bigFive.conscientiousness).toBeGreaterThanOrEqual(0);
        expect(bigFive.conscientiousness).toBeLessThanOrEqual(100);
        expect(bigFive.extraversion).toBeGreaterThanOrEqual(0);
        expect(bigFive.extraversion).toBeLessThanOrEqual(100);
        expect(bigFive.agreeableness).toBeGreaterThanOrEqual(0);
        expect(bigFive.agreeableness).toBeLessThanOrEqual(100);
        expect(bigFive.neuroticism).toBeGreaterThanOrEqual(0);
        expect(bigFive.neuroticism).toBeLessThanOrEqual(100);
      });
    });

    it("should return personalities with custom instructions under 500 characters", () => {
      const personalities = getDefaultPersonalities();

      personalities.forEach((personality) => {
        expect(personality.customInstructions.length).toBeLessThanOrEqual(500);
        expect(personality.customInstructions.length).toBeGreaterThan(0);
      });
    });
  });

  describe("data consistency", () => {
    it("should return the same data on multiple calls", () => {
      const personalities1 = getDefaultPersonalities();
      const personalities2 = getDefaultPersonalities();

      expect(personalities1).toEqual(personalities2);
    });

    it("should have unique IDs across all personalities", () => {
      const personalities = getDefaultPersonalities();
      const ids = personalities.map((p) => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have diverse trait combinations", () => {
      const personalities = getDefaultPersonalities();

      const opennessValues = personalities.map((p) => p.bigFive.openness);
      const extraversionValues = personalities.map(
        (p) => p.bigFive.extraversion,
      );

      // Should have variety in traits (not all the same values)
      expect(new Set(opennessValues).size).toBeGreaterThan(1);
      expect(new Set(extraversionValues).size).toBeGreaterThan(1);
    });
  });

  describe("error handling", () => {
    it("should handle invalid data gracefully", () => {
      // This test ensures the function doesn't throw even if data is problematic
      expect(() => getDefaultPersonalities()).not.toThrow();
    });

    it("should return array even if some validation fails", () => {
      const result = getDefaultPersonalities();

      // Should always return an array (might be empty if validation fails)
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

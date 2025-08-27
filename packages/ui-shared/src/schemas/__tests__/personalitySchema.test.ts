/**
 * Tests for the personality schema validation
 *
 * @module schemas/__tests__/personalitySchema
 */

import { personalitySchema } from "../personalitySchema";

describe("personalitySchema", () => {
  const validPersonalityData = {
    name: "Test Personality",
    behaviors: {
      openness: 60,
      conscientiousness: 80,
      extraversion: 40,
      agreeableness: 100,
      neuroticism: 0,
      creativity: 20,
      assertiveness: 80,
    },
    customInstructions: "Test instructions",
  };

  describe("name field validation", () => {
    it("should accept valid names", () => {
      const result = personalitySchema.safeParse(validPersonalityData);
      expect(result.success).toBe(true);
    });

    it("should reject empty names", () => {
      const data = { ...validPersonalityData, name: "" };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("required");
      }
    });

    it("should reject names with only whitespace", () => {
      const data = { ...validPersonalityData, name: "   " };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("whitespace");
      }
    });

    it("should reject names longer than 50 characters", () => {
      const data = { ...validPersonalityData, name: "a".repeat(51) };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("50 characters");
      }
    });

    it("should reject names shorter than 2 characters", () => {
      const data = { ...validPersonalityData, name: "a" };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("2 characters");
      }
    });

    it("should reject names with invalid characters", () => {
      const data = { ...validPersonalityData, name: "Test@Name!" };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("letters, numbers");
      }
    });
  });

  describe("behaviors field validation", () => {
    it("should accept valid discrete values", () => {
      const data = {
        ...validPersonalityData,
        behaviors: {
          trait1: 0,
          trait2: 20,
          trait3: 40,
          trait4: 60,
          trait5: 80,
          trait6: 100,
        },
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject non-discrete values in valid range", () => {
      const invalidValues = [1, 15, 25, 37, 55, 99];

      for (const value of invalidValues) {
        const data = {
          ...validPersonalityData,
          behaviors: { invalidTrait: value },
        };
        const result = personalitySchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain(
            "0, 20, 40, 60, 80, 100",
          );
        }
      }
    });

    it("should reject negative values", () => {
      const data = {
        ...validPersonalityData,
        behaviors: { trait: -10 },
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(">=0");
      }
    });

    it("should reject values over 100", () => {
      const data = {
        ...validPersonalityData,
        behaviors: { trait: 150 },
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("<=100");
      }
    });

    it("should accept dynamic trait keys", () => {
      const data = {
        ...validPersonalityData,
        behaviors: {
          customTrait1: 40,
          customTrait2: 80,
          "trait-with-dash": 60,
          trait_with_underscore: 20,
        },
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject non-number values", () => {
      const data = {
        ...validPersonalityData,
        behaviors: { trait: "high" as unknown as number },
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept empty behaviors object", () => {
      const data = {
        ...validPersonalityData,
        behaviors: {},
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("customInstructions field validation", () => {
    it("should accept valid custom instructions", () => {
      const data = {
        ...validPersonalityData,
        customInstructions: "These are valid instructions.",
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept empty custom instructions", () => {
      const data = {
        ...validPersonalityData,
        customInstructions: "",
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject custom instructions longer than 500 characters", () => {
      const data = {
        ...validPersonalityData,
        customInstructions: "a".repeat(501),
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("too long");
      }
    });
  });

  describe("schema completeness", () => {
    it("should require all required fields", () => {
      const incompleteData = { name: "Test" };
      const result = personalitySchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const dataWithUnknownField = {
        ...validPersonalityData,
        unknownField: "should be rejected",
      };
      const result = personalitySchema.safeParse(dataWithUnknownField);
      expect(result.success).toBe(false);
    });

    it("should have correct TypeScript types", () => {
      // This is a compile-time test
      const validData = personalitySchema.parse(validPersonalityData);

      // These should compile without errors
      const name: string = validData.name;
      const behaviors: Record<string, number> = validData.behaviors;
      const instructions: string = validData.customInstructions;

      // Verify the types are as expected
      expect(typeof name).toBe("string");
      expect(typeof behaviors).toBe("object");
      expect(typeof instructions).toBe("string");
    });
  });

  describe("discrete value edge cases", () => {
    it("should handle floating point discrete values", () => {
      const data = {
        ...validPersonalityData,
        behaviors: {
          trait1: 20.0,
          trait2: 60.0,
        },
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject floating point non-discrete values", () => {
      const data = {
        ...validPersonalityData,
        behaviors: { trait: 20.5 },
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "0, 20, 40, 60, 80, 100",
        );
      }
    });

    it("should provide helpful error messages for invalid discrete values", () => {
      const data = {
        ...validPersonalityData,
        behaviors: { invalidTrait: 25 },
      };
      const result = personalitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const message = result.error.issues[0]?.message;
        expect(message).toContain("Must be one of");
        expect(message).toContain("0, 20, 40, 60, 80, 100");
      }
    });
  });

  describe("real-world usage scenarios", () => {
    it("should validate Big Five traits as behaviors", () => {
      const bigFiveData = {
        name: "Big Five Test",
        behaviors: {
          openness: 80,
          conscientiousness: 60,
          extraversion: 40,
          agreeableness: 100,
          neuroticism: 20,
        },
        customInstructions: "",
      };
      const result = personalitySchema.safeParse(bigFiveData);
      expect(result.success).toBe(true);
    });

    it("should validate mixed trait types", () => {
      const mixedData = {
        name: "Mixed Traits",
        behaviors: {
          // Big Five
          openness: 60,
          conscientiousness: 80,
          extraversion: 40,
          agreeableness: 100,
          neuroticism: 0,
          // Custom behaviors
          creativity: 80,
          assertiveness: 60,
          empathy: 100,
          analytical: 80,
        },
        customInstructions: "Custom personality with mixed traits",
      };
      const result = personalitySchema.safeParse(mixedData);
      expect(result.success).toBe(true);
    });

    it("should support personality migration scenarios", () => {
      // Simulating data that might come from old bigFive structure
      const migratedData = {
        name: "Migrated Personality",
        behaviors: {
          // These would be migrated from the old bigFive object
          openness: 60,
          conscientiousness: 80,
          extraversion: 40,
          agreeableness: 60,
          neuroticism: 20,
          // Plus additional behaviors that were separate before
          creativity: 80,
          assertiveness: 40,
        },
        customInstructions: "Migrated from old format",
      };
      const result = personalitySchema.safeParse(migratedData);
      expect(result.success).toBe(true);
    });
  });
});

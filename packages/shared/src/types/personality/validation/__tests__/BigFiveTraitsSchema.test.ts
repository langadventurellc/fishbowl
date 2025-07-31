/**
 * @fileoverview Unit tests for BigFiveTraitsSchema
 */

import {
  BigFiveTraitsSchema,
  BigFiveTraitsValidated,
} from "../BigFiveTraitsSchema";
import { BIG_FIVE_TRAITS } from "../../PersonalityTraitConstants";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

describe("BigFiveTraitsSchema", () => {
  describe("Valid trait validation", () => {
    it("should validate all traits with valid 0-100 integer values", () => {
      const validTraits = {
        openness: 75,
        conscientiousness: 60,
        extraversion: 80,
        agreeableness: 70,
        neuroticism: 45,
      };

      const result = BigFiveTraitsSchema.parse(validTraits);
      expect(result).toEqual(validTraits);
    });

    it("should validate boundary values 0 and 100 for all traits", () => {
      const boundaryTraits = BIG_FIVE_TRAITS.reduce(
        (acc, trait) => {
          acc[trait] = Math.random() > 0.5 ? 0 : 100;
          return acc;
        },
        {} as Record<string, number>,
      );

      const result = BigFiveTraitsSchema.parse(boundaryTraits);
      expect(result).toEqual(boundaryTraits);
    });
  });

  describe("Individual trait validation", () => {
    BIG_FIVE_TRAITS.forEach((trait) => {
      describe(`${trait} validation`, () => {
        it(`should accept valid values for ${trait}`, () => {
          const validTraits = createValidTraits({ [trait]: 50 });
          expect(() => BigFiveTraitsSchema.parse(validTraits)).not.toThrow();
        });

        it(`should reject values below 0 for ${trait}`, () => {
          const invalidTraits = createValidTraits({ [trait]: -1 });
          expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();
        });

        it(`should reject values above 100 for ${trait}`, () => {
          const invalidTraits = createValidTraits({ [trait]: 101 });
          expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();
        });

        it(`should reject non-integer values for ${trait}`, () => {
          const invalidTraits = createValidTraits({ [trait]: 50.5 });
          expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();
        });
      });
    });
  });

  describe("Error message validation", () => {
    it("should provide specific error messages for each trait", () => {
      const invalidTraits = {
        openness: -1,
        conscientiousness: 101,
        extraversion: -5, // Use another range error instead of decimal
        agreeableness: 70,
        neuroticism: 45,
      };

      expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BigFiveTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues.length).toBeGreaterThan(0);

        // Check that we have error messages for the invalid traits
        const errorMessages = zodError.issues.map((issue) => issue.message);
        expect(errorMessages).toContain(
          PERSONALITY_VALIDATION_ERRORS.OPENNESS_INVALID,
        );
        expect(errorMessages).toContain(
          PERSONALITY_VALIDATION_ERRORS.CONSCIENTIOUSNESS_INVALID,
        );
        expect(errorMessages).toContain(
          PERSONALITY_VALIDATION_ERRORS.EXTRAVERSION_INVALID,
        );
      }
    });

    it("should provide correct error message for openness trait", () => {
      const invalidTraits = createValidTraits({ openness: -1 });

      expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BigFiveTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues).toHaveLength(1);
        expect(zodError.issues[0]?.message).toBe(
          PERSONALITY_VALIDATION_ERRORS.OPENNESS_INVALID,
        );
      }
    });

    it("should provide correct error message for conscientiousness trait", () => {
      const invalidTraits = createValidTraits({ conscientiousness: 101 });

      expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BigFiveTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues).toHaveLength(1);
        expect(zodError.issues[0]?.message).toBe(
          PERSONALITY_VALIDATION_ERRORS.CONSCIENTIOUSNESS_INVALID,
        );
      }
    });

    it("should provide correct error message for extraversion trait", () => {
      const invalidTraits = createValidTraits({ extraversion: 101 });

      expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BigFiveTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues).toHaveLength(1);
        expect(zodError.issues[0]?.message).toBe(
          PERSONALITY_VALIDATION_ERRORS.EXTRAVERSION_INVALID,
        );
      }
    });

    it("should provide correct error message for agreeableness trait", () => {
      const invalidTraits = createValidTraits({ agreeableness: -1 });

      expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BigFiveTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues).toHaveLength(1);
        expect(zodError.issues[0]?.message).toBe(
          PERSONALITY_VALIDATION_ERRORS.AGREEABLENESS_INVALID,
        );
      }
    });

    it("should provide correct error message for neuroticism trait", () => {
      const invalidTraits = createValidTraits({ neuroticism: 101 });

      expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BigFiveTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues).toHaveLength(1);
        expect(zodError.issues[0]?.message).toBe(
          PERSONALITY_VALIDATION_ERRORS.NEUROTICISM_INVALID,
        );
      }
    });
  });

  describe("Schema strictness", () => {
    it("should reject extra properties", () => {
      const invalidTraits = {
        ...createValidTraits(),
        extraProperty: "should not be allowed",
      };

      expect(() => BigFiveTraitsSchema.parse(invalidTraits)).toThrow();
    });

    it("should require all Big Five traits", () => {
      const incompleteTraits = {
        openness: 50,
        conscientiousness: 50,
        // Missing: extraversion, agreeableness, neuroticism
      };

      expect(() => BigFiveTraitsSchema.parse(incompleteTraits)).toThrow();
    });
  });

  describe("Type inference", () => {
    it("should infer correct TypeScript type", () => {
      const validTraits = createValidTraits();
      const result: BigFiveTraitsValidated =
        BigFiveTraitsSchema.parse(validTraits);

      // TypeScript compilation will fail if types don't match
      expect(typeof result.openness).toBe("number");
      expect(typeof result.conscientiousness).toBe("number");
      expect(typeof result.extraversion).toBe("number");
      expect(typeof result.agreeableness).toBe("number");
      expect(typeof result.neuroticism).toBe("number");
    });
  });

  describe("Multiple errors handling", () => {
    it("should collect multiple validation errors", () => {
      const multipleInvalidTraits = {
        openness: -1, // Invalid: below 0
        conscientiousness: 101, // Invalid: above 100
        extraversion: 50.5, // Invalid: not integer
        agreeableness: -10, // Invalid: below 0
        neuroticism: 150, // Invalid: above 100
      };

      expect(() => BigFiveTraitsSchema.parse(multipleInvalidTraits)).toThrow();

      try {
        BigFiveTraitsSchema.parse(multipleInvalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues.length).toBeGreaterThan(1);
        expect(zodError.issues.length).toBe(5); // All 5 traits have errors
      }
    });
  });
});

// Helper function to create valid traits with optional overrides
function createValidTraits(overrides: Partial<Record<string, number>> = {}) {
  const defaultTraits = BIG_FIVE_TRAITS.reduce(
    (acc, trait) => {
      acc[trait] = 50; // Default middle value
      return acc;
    },
    {} as Record<string, number>,
  );

  return { ...defaultTraits, ...overrides };
}

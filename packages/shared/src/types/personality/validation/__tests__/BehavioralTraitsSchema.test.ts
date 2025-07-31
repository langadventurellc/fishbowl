/**
 * @fileoverview Unit tests for BehavioralTraitsSchema
 */

import {
  BehavioralTraitsSchema,
  BehavioralTraitsValidated,
} from "../BehavioralTraitsSchema";
import { BEHAVIORAL_TRAITS } from "../../PersonalityTraitConstants";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

describe("BehavioralTraitsSchema", () => {
  describe("Valid trait validation", () => {
    it("should validate all traits with valid 0-100 integer values", () => {
      const validTraits = {
        formality: 70,
        humor: 85,
        assertiveness: 60,
        empathy: 90,
        storytelling: 75,
        brevity: 40,
        imagination: 80,
        playfulness: 65,
        dramaticism: 55,
        analyticalDepth: 85,
        contrarianism: 30,
        encouragement: 90,
        curiosity: 85,
        patience: 70,
      };

      const result = BehavioralTraitsSchema.parse(validTraits);
      expect(result).toEqual(validTraits);
    });

    it("should validate boundary values 0 and 100 for all traits", () => {
      const boundaryTraits = BEHAVIORAL_TRAITS.reduce(
        (acc, trait) => {
          acc[trait] = Math.random() > 0.5 ? 0 : 100;
          return acc;
        },
        {} as Record<string, number>,
      );

      const result = BehavioralTraitsSchema.parse(boundaryTraits);
      expect(result).toEqual(boundaryTraits);
    });
  });

  describe("Individual trait validation", () => {
    BEHAVIORAL_TRAITS.forEach((trait) => {
      describe(`${trait} validation`, () => {
        it(`should accept valid values for ${trait}`, () => {
          const validTraits = createValidTraits({ [trait]: 50 });
          expect(() => BehavioralTraitsSchema.parse(validTraits)).not.toThrow();
        });

        it(`should reject values below 0 for ${trait}`, () => {
          const invalidTraits = createValidTraits({ [trait]: -1 });
          expect(() => BehavioralTraitsSchema.parse(invalidTraits)).toThrow();
        });

        it(`should reject values above 100 for ${trait}`, () => {
          const invalidTraits = createValidTraits({ [trait]: 101 });
          expect(() => BehavioralTraitsSchema.parse(invalidTraits)).toThrow();
        });

        it(`should reject non-integer values for ${trait}`, () => {
          const invalidTraits = createValidTraits({ [trait]: 50.5 });
          expect(() => BehavioralTraitsSchema.parse(invalidTraits)).toThrow();
        });
      });
    });
  });

  describe("Error message validation", () => {
    it("should provide specific error messages for each trait", () => {
      const invalidTraits = {
        formality: -1,
        humor: 101,
        assertiveness: -5, // Use another range error instead of decimal
        empathy: 90,
        storytelling: 75,
        brevity: 40,
        imagination: 80,
        playfulness: 65,
        dramaticism: 55,
        analyticalDepth: 85,
        contrarianism: 30,
        encouragement: 90,
        curiosity: 85,
        patience: 70,
      };

      expect(() => BehavioralTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BehavioralTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues.length).toBeGreaterThan(0);

        // Check that we have error messages for the invalid traits
        const errorMessages = zodError.issues.map((issue) => issue.message);
        expect(errorMessages).toContain(
          PERSONALITY_VALIDATION_ERRORS.FORMALITY_INVALID,
        );
        expect(errorMessages).toContain(
          PERSONALITY_VALIDATION_ERRORS.HUMOR_INVALID,
        );
        expect(errorMessages).toContain(
          PERSONALITY_VALIDATION_ERRORS.ASSERTIVENESS_INVALID,
        );
      }
    });

    it("should provide correct error message for formality trait", () => {
      const invalidTraits = createValidTraits({ formality: -1 });

      expect(() => BehavioralTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BehavioralTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues).toHaveLength(1);
        expect(zodError.issues[0]?.message).toBe(
          PERSONALITY_VALIDATION_ERRORS.FORMALITY_INVALID,
        );
      }
    });

    it("should provide correct error message for analyticalDepth trait", () => {
      const invalidTraits = createValidTraits({ analyticalDepth: 101 });

      expect(() => BehavioralTraitsSchema.parse(invalidTraits)).toThrow();

      try {
        BehavioralTraitsSchema.parse(invalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues).toHaveLength(1);
        expect(zodError.issues[0]?.message).toBe(
          PERSONALITY_VALIDATION_ERRORS.ANALYTICAL_DEPTH_INVALID,
        );
      }
    });
  });

  describe("Schema strictness", () => {
    it("should reject objects with extra properties", () => {
      const traitsWithExtra = {
        ...createValidTraits(),
        extraProperty: "should not be allowed",
      };

      expect(() => BehavioralTraitsSchema.parse(traitsWithExtra)).toThrow();
    });

    it("should reject objects with missing required traits", () => {
      const incompleteTraits = {
        formality: 50,
        humor: 60,
        // Missing other traits
      };

      expect(() => BehavioralTraitsSchema.parse(incompleteTraits)).toThrow();
    });

    it("should require all 14 traits", () => {
      const incompleteTraits = createValidTraits();
      delete incompleteTraits.patience;

      expect(() => BehavioralTraitsSchema.parse(incompleteTraits)).toThrow();
    });
  });

  describe("Type inference", () => {
    it("should infer correct TypeScript type", () => {
      const validTraits = createValidTraits();
      const result: BehavioralTraitsValidated =
        BehavioralTraitsSchema.parse(validTraits);

      // Type assertion to verify all properties exist
      expect(typeof result.formality).toBe("number");
      expect(typeof result.humor).toBe("number");
      expect(typeof result.assertiveness).toBe("number");
      expect(typeof result.empathy).toBe("number");
      expect(typeof result.storytelling).toBe("number");
      expect(typeof result.brevity).toBe("number");
      expect(typeof result.imagination).toBe("number");
      expect(typeof result.playfulness).toBe("number");
      expect(typeof result.dramaticism).toBe("number");
      expect(typeof result.analyticalDepth).toBe("number");
      expect(typeof result.contrarianism).toBe("number");
      expect(typeof result.encouragement).toBe("number");
      expect(typeof result.curiosity).toBe("number");
      expect(typeof result.patience).toBe("number");
    });

    it("should have exactly 14 properties in validated result", () => {
      const validTraits = createValidTraits();
      const result = BehavioralTraitsSchema.parse(validTraits);

      expect(Object.keys(result)).toHaveLength(14);
      expect(Object.keys(result).sort()).toEqual(
        BEHAVIORAL_TRAITS.slice().sort(),
      );
    });
  });

  describe("Performance benchmarks", () => {
    it("should compile schema efficiently", () => {
      const start = Date.now();

      // Access the schema to trigger any lazy compilation
      const schema = BehavioralTraitsSchema;
      expect(schema).toBeDefined();

      const end = Date.now();

      // Should be very fast, but allow reasonable time for CI environments
      expect(end - start).toBeLessThan(50);
    });

    it("should validate typical objects quickly", () => {
      const validTraits = createValidTraits();

      const start = Date.now();
      BehavioralTraitsSchema.parse(validTraits);
      const end = Date.now();

      // Should be very fast validation
      expect(end - start).toBeLessThan(10);
    });

    it("should handle multiple validations efficiently", () => {
      const validTraits = createValidTraits();

      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        BehavioralTraitsSchema.parse(validTraits);
      }
      const end = Date.now();

      // Should handle 100 validations in reasonable time
      expect(end - start).toBeLessThan(100);
    });
  });

  describe("Boundary value testing", () => {
    it("should accept minimum values (0) for all traits", () => {
      const minTraits = BEHAVIORAL_TRAITS.reduce(
        (acc, trait) => {
          acc[trait] = 0;
          return acc;
        },
        {} as Record<string, number>,
      );

      expect(() => BehavioralTraitsSchema.parse(minTraits)).not.toThrow();
    });

    it("should accept maximum values (100) for all traits", () => {
      const maxTraits = BEHAVIORAL_TRAITS.reduce(
        (acc, trait) => {
          acc[trait] = 100;
          return acc;
        },
        {} as Record<string, number>,
      );

      expect(() => BehavioralTraitsSchema.parse(maxTraits)).not.toThrow();
    });

    it("should reject values just below minimum (-1) for all traits", () => {
      BEHAVIORAL_TRAITS.forEach((trait) => {
        const invalidTraits = createValidTraits({ [trait]: -1 });
        expect(() => BehavioralTraitsSchema.parse(invalidTraits)).toThrow();
      });
    });

    it("should reject values just above maximum (101) for all traits", () => {
      BEHAVIORAL_TRAITS.forEach((trait) => {
        const invalidTraits = createValidTraits({ [trait]: 101 });
        expect(() => BehavioralTraitsSchema.parse(invalidTraits)).toThrow();
      });
    });
  });

  describe("Multiple error collection", () => {
    it("should collect multiple validation errors", () => {
      const multipleInvalidTraits = {
        formality: -1,
        humor: 101,
        assertiveness: 50.5,
        empathy: -5,
        storytelling: 105,
        brevity: 40,
        imagination: 80,
        playfulness: 65,
        dramaticism: 55,
        analyticalDepth: 85,
        contrarianism: 30,
        encouragement: 90,
        curiosity: 85,
        patience: 70,
      };

      expect(() =>
        BehavioralTraitsSchema.parse(multipleInvalidTraits),
      ).toThrow();

      try {
        BehavioralTraitsSchema.parse(multipleInvalidTraits);
      } catch (error: unknown) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues.length).toBeGreaterThan(1);
        expect(zodError.issues.length).toBe(5); // formality, humor, assertiveness, empathy, storytelling
      }
    });
  });
});

// Helper function to create valid traits with optional overrides
function createValidTraits(overrides: Partial<Record<string, number>> = {}) {
  const defaultTraits = BEHAVIORAL_TRAITS.reduce(
    (acc, trait) => {
      acc[trait] = 50; // Default middle value
      return acc;
    },
    {} as Record<string, number>,
  );

  return { ...defaultTraits, ...overrides };
}

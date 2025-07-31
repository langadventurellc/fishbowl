/**
 * @fileoverview PersonalityConfigurationSchema Tests
 *
 * Comprehensive test suite for PersonalityConfigurationSchema validation including:
 * - Complete personality configuration validation
 * - All 19 personality traits validation (Big Five + behavioral)
 * - Metadata field validation
 * - Business rule enforcement
 * - Performance benchmarks
 */

import { PersonalityConfigurationSchema } from "../PersonalityConfigurationSchema";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

describe("PersonalityConfigurationSchema", () => {
  /**
   * Creates a valid personality configuration for testing
   */
  const createValidPersonality = () => ({
    // Big Five traits
    openness: 75,
    conscientiousness: 60,
    extraversion: 80,
    agreeableness: 70,
    neuroticism: 45,
    // Behavioral traits
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
    // Metadata
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Creative Assistant",
    description: "A creative and imaginative personality",
    customInstructions: "Focus on creative solutions and innovative approaches",
    isTemplate: false,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  });

  describe("valid personality configurations", () => {
    it("should validate complete personality configuration", () => {
      const personality = createValidPersonality();
      expect(() =>
        PersonalityConfigurationSchema.parse(personality),
      ).not.toThrow();
    });

    it("should validate personality with optional fields omitted", () => {
      const personality: Partial<ReturnType<typeof createValidPersonality>> =
        createValidPersonality();
      delete personality.description;
      delete personality.customInstructions;
      expect(() =>
        PersonalityConfigurationSchema.parse(personality),
      ).not.toThrow();
    });

    it("should return validated object matching input", () => {
      const personality = createValidPersonality();
      const result = PersonalityConfigurationSchema.parse(personality);
      expect(result).toEqual(personality);
    });

    it("should validate personality with minimum trait values", () => {
      const personality = createValidPersonality();
      // Set all traits to minimum value (0)
      personality.openness = 0;
      personality.conscientiousness = 0;
      personality.extraversion = 0;
      personality.agreeableness = 0;
      personality.neuroticism = 0;
      personality.formality = 0;
      personality.humor = 0;
      personality.assertiveness = 0;
      personality.empathy = 0;
      personality.storytelling = 0;
      personality.brevity = 0;
      personality.imagination = 0;
      personality.playfulness = 0;
      personality.dramaticism = 0;
      personality.analyticalDepth = 0;
      personality.contrarianism = 0;
      personality.encouragement = 0;
      personality.curiosity = 0;
      personality.patience = 0;

      expect(() =>
        PersonalityConfigurationSchema.parse(personality),
      ).not.toThrow();
    });

    it("should validate personality with maximum trait values", () => {
      const personality = createValidPersonality();
      // Set all traits to maximum value (100)
      personality.openness = 100;
      personality.conscientiousness = 100;
      personality.extraversion = 100;
      personality.agreeableness = 100;
      personality.neuroticism = 100;
      personality.formality = 100;
      personality.humor = 100;
      personality.assertiveness = 100;
      personality.empathy = 100;
      personality.storytelling = 100;
      personality.brevity = 100;
      personality.imagination = 100;
      personality.playfulness = 100;
      personality.dramaticism = 100;
      personality.analyticalDepth = 100;
      personality.contrarianism = 100;
      personality.encouragement = 100;
      personality.curiosity = 100;
      personality.patience = 100;

      expect(() =>
        PersonalityConfigurationSchema.parse(personality),
      ).not.toThrow();
    });
  });

  describe("Big Five trait validation", () => {
    it("should reject openness values outside 0-100 range", () => {
      const personality = createValidPersonality();
      personality.openness = 101;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.OPENNESS_INVALID,
      );

      personality.openness = -1;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.OPENNESS_INVALID,
      );
    });

    it("should reject conscientiousness values outside 0-100 range", () => {
      const personality = createValidPersonality();
      personality.conscientiousness = 101;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.CONSCIENTIOUSNESS_INVALID,
      );
    });

    it("should reject extraversion values outside 0-100 range", () => {
      const personality = createValidPersonality();
      personality.extraversion = 150;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.EXTRAVERSION_INVALID,
      );
    });

    it("should reject agreeableness values outside 0-100 range", () => {
      const personality = createValidPersonality();
      personality.agreeableness = -10;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.AGREEABLENESS_INVALID,
      );
    });

    it("should reject neuroticism values outside 0-100 range", () => {
      const personality = createValidPersonality();
      personality.neuroticism = 200;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.NEUROTICISM_INVALID,
      );
    });

    it("should reject non-integer trait values", () => {
      const personality = createValidPersonality();
      personality.openness = 75.5;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow();
    });
  });

  describe("behavioral trait validation", () => {
    const behavioralTraits = [
      "formality",
      "humor",
      "assertiveness",
      "empathy",
      "storytelling",
      "brevity",
      "imagination",
      "playfulness",
      "dramaticism",
      "analyticalDepth",
      "contrarianism",
      "encouragement",
      "curiosity",
      "patience",
    ] as const;

    behavioralTraits.forEach((trait) => {
      it(`should reject ${trait} values outside 0-100 range`, () => {
        const personality = createValidPersonality();
        (personality as Record<string, unknown>)[trait] = 101;
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).toThrow();

        (personality as Record<string, unknown>)[trait] = -1;
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).toThrow();
      });

      it(`should reject non-integer ${trait} values`, () => {
        const personality = createValidPersonality();
        (personality as Record<string, unknown>)[trait] = 50.7;
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).toThrow();
      });
    });

    it("should validate all 14 behavioral traits within 0-100 range", () => {
      const personality = createValidPersonality();
      expect(() =>
        PersonalityConfigurationSchema.parse(personality),
      ).not.toThrow();
    });
  });

  describe("metadata field validation", () => {
    describe("id field validation", () => {
      it("should validate valid UUID formats", () => {
        const personality = createValidPersonality();
        const validUUIDs = [
          "550e8400-e29b-41d4-a716-446655440000",
          "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        ];

        validUUIDs.forEach((uuid) => {
          personality.id = uuid;
          expect(() =>
            PersonalityConfigurationSchema.parse(personality),
          ).not.toThrow();
        });
      });

      it("should reject invalid UUID formats", () => {
        const personality = createValidPersonality();
        const invalidUUIDs = [
          "invalid-uuid",
          "123",
          "550e8400-e29b-41d4-a716",
          "550e8400-e29b-41d4-a716-446655440000-extra",
          "",
        ];

        invalidUUIDs.forEach((uuid) => {
          personality.id = uuid;
          expect(() =>
            PersonalityConfigurationSchema.parse(personality),
          ).toThrow("Personality ID must be a valid UUID");
        });
      });
    });

    describe("name field validation", () => {
      it("should validate names within length limits", () => {
        const personality = createValidPersonality();
        personality.name = "Valid Name";
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();

        personality.name = "A".repeat(100); // Maximum length
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();

        personality.name = "AB"; // Minimum length
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();
      });

      it("should reject names that are too short", () => {
        const personality = createValidPersonality();
        personality.name = "A"; // Too short (less than 2 characters)
        expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
          PERSONALITY_VALIDATION_ERRORS.NAME_TOO_SHORT,
        );

        personality.name = ""; // Empty string
        expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
          PERSONALITY_VALIDATION_ERRORS.NAME_TOO_SHORT,
        );
      });

      it("should reject names that are too long", () => {
        const personality = createValidPersonality();
        personality.name = "A".repeat(101); // Too long (more than 100 characters)
        expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
          PERSONALITY_VALIDATION_ERRORS.NAME_TOO_LONG,
        );
      });
    });

    describe("description field validation", () => {
      it("should validate optional description field", () => {
        const personality: Partial<ReturnType<typeof createValidPersonality>> =
          createValidPersonality();
        delete personality.description;
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();

        personality.description = "A valid description";
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();

        personality.description = "A".repeat(500); // Maximum length
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();
      });

      it("should reject descriptions that are too long", () => {
        const personality = createValidPersonality();
        personality.description = "A".repeat(501); // Too long (more than 500 characters)
        expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
          PERSONALITY_VALIDATION_ERRORS.DESCRIPTION_TOO_LONG,
        );
      });
    });

    describe("customInstructions field validation", () => {
      it("should validate optional customInstructions field", () => {
        const personality: Partial<ReturnType<typeof createValidPersonality>> =
          createValidPersonality();
        delete personality.customInstructions;
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();

        personality.customInstructions = "Valid custom instructions";
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();

        personality.customInstructions = "A".repeat(2000); // Maximum length
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();
      });

      it("should reject customInstructions that are too long", () => {
        const personality = createValidPersonality();
        personality.customInstructions = "A".repeat(2001); // Too long (more than 2000 characters)
        expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow(
          PERSONALITY_VALIDATION_ERRORS.CUSTOM_INSTRUCTIONS_TOO_LONG,
        );
      });
    });

    describe("isTemplate field validation", () => {
      it("should validate boolean isTemplate values", () => {
        const personality = createValidPersonality();
        personality.isTemplate = true;
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();

        personality.isTemplate = false;
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).not.toThrow();
      });

      it("should reject non-boolean isTemplate values", () => {
        const personality = createValidPersonality();
        (personality as Record<string, unknown>).isTemplate = "true";
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).toThrow();

        (personality as Record<string, unknown>).isTemplate = 1;
        expect(() =>
          PersonalityConfigurationSchema.parse(personality),
        ).toThrow();
      });
    });

    describe("timestamp field validation", () => {
      it("should validate ISO datetime strings", () => {
        const personality = createValidPersonality();
        const validTimestamps = [
          "2023-01-01T00:00:00.000Z",
          "2023-12-31T23:59:59.999Z",
          "2024-02-29T12:30:45.123Z", // Leap year
        ];

        validTimestamps.forEach((timestamp) => {
          personality.createdAt = timestamp;
          personality.updatedAt = timestamp;
          expect(() =>
            PersonalityConfigurationSchema.parse(personality),
          ).not.toThrow();
        });
      });

      it("should reject invalid datetime strings", () => {
        const personality = createValidPersonality();
        const invalidTimestamps = [
          "invalid-date",
          "2023-01-01",
          "2023-01-01T00:00:00",
          "2023-13-01T00:00:00.000Z", // Invalid month
          "2023-01-32T00:00:00.000Z", // Invalid day
          "",
        ];

        invalidTimestamps.forEach((timestamp) => {
          personality.createdAt = timestamp;
          expect(() =>
            PersonalityConfigurationSchema.parse(personality),
          ).toThrow("Created timestamp must be a valid ISO datetime string");

          personality.createdAt = "2023-01-01T00:00:00.000Z"; // Reset to valid
          personality.updatedAt = timestamp;
          expect(() =>
            PersonalityConfigurationSchema.parse(personality),
          ).toThrow("Updated timestamp must be a valid ISO datetime string");
        });
      });
    });
  });

  describe("missing required fields", () => {
    it("should reject personality missing required Big Five traits", () => {
      const personality = createValidPersonality();
      delete (personality as Record<string, unknown>).openness;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow();
    });

    it("should reject personality missing required behavioral traits", () => {
      const personality = createValidPersonality();
      delete (personality as Record<string, unknown>).formality;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow();
    });

    it("should reject personality missing required metadata fields", () => {
      const personality = createValidPersonality();
      delete (personality as Record<string, unknown>).id;
      expect(() => PersonalityConfigurationSchema.parse(personality)).toThrow();

      const personality2 = createValidPersonality();
      delete (personality2 as Record<string, unknown>).name;
      expect(() =>
        PersonalityConfigurationSchema.parse(personality2),
      ).toThrow();
    });
  });

  describe("performance requirements", () => {
    it("should complete validation in under 10ms", () => {
      const personality = createValidPersonality();
      const iterations = 100;

      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        PersonalityConfigurationSchema.parse(personality);
      }
      const end = Date.now();

      const averageTime = (end - start) / iterations;
      expect(averageTime).toBeLessThan(10);
    });

    it("should handle multiple concurrent validations efficiently", () => {
      const personality = createValidPersonality();
      const promises = Array.from({ length: 50 }, () =>
        Promise.resolve().then(() =>
          PersonalityConfigurationSchema.parse(personality),
        ),
      );

      const start = Date.now();
      return Promise.all(promises).then(() => {
        const end = Date.now();
        const totalTime = end - start;
        expect(totalTime).toBeLessThan(100); // All 50 validations should complete in under 100ms
      });
    });
  });

  describe("comprehensive validation scenarios", () => {
    it("should validate a complete realistic personality configuration", () => {
      const realisticPersonality = {
        // Big Five traits - representing a creative, organized, moderately social personality
        openness: 85,
        conscientiousness: 75,
        extraversion: 60,
        agreeableness: 80,
        neuroticism: 25,
        // Behavioral traits - creative, helpful, detailed personality
        formality: 60,
        humor: 70,
        assertiveness: 55,
        empathy: 90,
        storytelling: 80,
        brevity: 30, // More detailed responses
        imagination: 95,
        playfulness: 65,
        dramaticism: 40,
        analyticalDepth: 85,
        contrarianism: 25, // Generally agreeable
        encouragement: 95,
        curiosity: 90,
        patience: 85,
        // Metadata
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Creative Helper",
        description:
          "A creative and empathetic assistant focused on detailed, helpful responses",
        customInstructions:
          "Always encourage creativity while providing thorough, well-researched answers. Use examples and analogies to explain complex concepts.",
        isTemplate: false,
        createdAt: "2024-01-15T08:30:00.000Z",
        updatedAt: "2024-01-15T08:30:00.000Z",
      };

      expect(() =>
        PersonalityConfigurationSchema.parse(realisticPersonality),
      ).not.toThrow();
      const result = PersonalityConfigurationSchema.parse(realisticPersonality);
      expect(result).toEqual(realisticPersonality);
    });

    it("should handle template personality configuration", () => {
      const templatePersonality = createValidPersonality();
      templatePersonality.isTemplate = true;
      templatePersonality.name = "Professional Assistant Template";
      templatePersonality.description =
        "A balanced professional assistant template";

      expect(() =>
        PersonalityConfigurationSchema.parse(templatePersonality),
      ).not.toThrow();
    });
  });
});

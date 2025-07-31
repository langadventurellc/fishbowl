/**
 * @fileoverview PersonalityCreationDataSchema Tests
 *
 * Comprehensive test suite for PersonalityCreationDataSchema validation including:
 * - Creation data validation (without generated fields)
 * - All 19 personality traits validation (Big Five + behavioral)
 * - Required and optional field validation
 * - Input sanitization (XSS prevention, whitespace normalization)
 * - Error handling and custom error messages
 * - Type inference validation
 */

import { PersonalityCreationDataSchema } from "../PersonalityCreationDataSchema";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

describe("PersonalityCreationDataSchema", () => {
  /**
   * Creates valid personality creation data for testing
   */
  const createValidCreationData = () => ({
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
    // Required metadata (no generated fields)
    name: "Creative Assistant",
    isTemplate: false,
    // Optional metadata
    description: "A creative and imaginative personality",
    customInstructions: "Focus on creative solutions and innovative approaches",
  });

  describe("valid creation data", () => {
    it("should validate complete creation data", () => {
      const creationData = createValidCreationData();
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });

    it("should validate creation data with optional fields omitted", () => {
      const creationData: Partial<ReturnType<typeof createValidCreationData>> =
        createValidCreationData();
      delete creationData.description;
      delete creationData.customInstructions;
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });

    it("should validate creation data with minimum trait values", () => {
      const creationData = createValidCreationData();
      // Set all traits to minimum value (0)
      creationData.openness = 0;
      creationData.conscientiousness = 0;
      creationData.extraversion = 0;
      creationData.agreeableness = 0;
      creationData.neuroticism = 0;
      creationData.formality = 0;
      creationData.humor = 0;
      creationData.assertiveness = 0;
      creationData.empathy = 0;
      creationData.storytelling = 0;
      creationData.brevity = 0;
      creationData.imagination = 0;
      creationData.playfulness = 0;
      creationData.dramaticism = 0;
      creationData.analyticalDepth = 0;
      creationData.contrarianism = 0;
      creationData.encouragement = 0;
      creationData.curiosity = 0;
      creationData.patience = 0;

      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });

    it("should validate creation data with maximum trait values", () => {
      const creationData = createValidCreationData();
      // Set all traits to maximum value (100)
      creationData.openness = 100;
      creationData.conscientiousness = 100;
      creationData.extraversion = 100;
      creationData.agreeableness = 100;
      creationData.neuroticism = 100;
      creationData.formality = 100;
      creationData.humor = 100;
      creationData.assertiveness = 100;
      creationData.empathy = 100;
      creationData.storytelling = 100;
      creationData.brevity = 100;
      creationData.imagination = 100;
      creationData.playfulness = 100;
      creationData.dramaticism = 100;
      creationData.analyticalDepth = 100;
      creationData.contrarianism = 100;
      creationData.encouragement = 100;
      creationData.curiosity = 100;
      creationData.patience = 100;

      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });

    it("should validate template personality creation", () => {
      const creationData = createValidCreationData();
      creationData.isTemplate = true;
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });
  });

  describe("missing required fields", () => {
    it("should reject creation data without name", () => {
      const creationData: Partial<ReturnType<typeof createValidCreationData>> =
        createValidCreationData();
      delete creationData.name;
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow();
    });

    it("should reject creation data without isTemplate", () => {
      const creationData: Partial<ReturnType<typeof createValidCreationData>> =
        createValidCreationData();
      delete creationData.isTemplate;
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow();
    });

    // Test each Big Five trait
    const bigFiveTraits = [
      "openness",
      "conscientiousness",
      "extraversion",
      "agreeableness",
      "neuroticism",
    ] as const;

    bigFiveTraits.forEach((trait) => {
      it(`should reject creation data without ${trait}`, () => {
        const creationData: Partial<
          ReturnType<typeof createValidCreationData>
        > = createValidCreationData();
        delete creationData[trait];
        expect(() =>
          PersonalityCreationDataSchema.parse(creationData),
        ).toThrow();
      });
    });

    // Test each behavioral trait
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
      it(`should reject creation data without ${trait}`, () => {
        const creationData: Partial<
          ReturnType<typeof createValidCreationData>
        > = createValidCreationData();
        delete creationData[trait];
        expect(() =>
          PersonalityCreationDataSchema.parse(creationData),
        ).toThrow();
      });
    });
  });

  describe("invalid trait values", () => {
    it("should reject negative trait values", () => {
      const creationData = createValidCreationData();
      creationData.openness = -1;
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.OPENNESS_INVALID,
      );
    });

    it("should reject trait values over 100", () => {
      const creationData = createValidCreationData();
      creationData.conscientiousness = 101;
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.CONSCIENTIOUSNESS_INVALID,
      );
    });

    it("should reject non-integer trait values", () => {
      const creationData = createValidCreationData();
      creationData.extraversion = 50.5;
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow();
    });

    it("should reject non-numeric trait values", () => {
      const creationData = createValidCreationData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (creationData as any).agreeableness = "high";
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow();
    });
  });

  describe("name validation", () => {
    it("should reject empty name", () => {
      const creationData = createValidCreationData();
      creationData.name = "";
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.NAME_TOO_SHORT,
      );
    });

    it("should reject name that is too short", () => {
      const creationData = createValidCreationData();
      creationData.name = "A";
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.NAME_TOO_SHORT,
      );
    });

    it("should reject name that is too long", () => {
      const creationData = createValidCreationData();
      creationData.name = "A".repeat(101);
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.NAME_TOO_LONG,
      );
    });

    it("should accept name at minimum length", () => {
      const creationData = createValidCreationData();
      creationData.name = "AI";
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });

    it("should accept name at maximum length", () => {
      const creationData = createValidCreationData();
      creationData.name = "A".repeat(100);
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });
  });

  describe("description validation", () => {
    it("should accept undefined description", () => {
      const creationData: Partial<ReturnType<typeof createValidCreationData>> =
        createValidCreationData();
      delete creationData.description;
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });

    it("should reject description that is too long", () => {
      const creationData = createValidCreationData();
      creationData.description = "A".repeat(501);
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.DESCRIPTION_TOO_LONG,
      );
    });

    it("should accept description at maximum length", () => {
      const creationData = createValidCreationData();
      creationData.description = "A".repeat(500);
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });
  });

  describe("custom instructions validation", () => {
    it("should accept undefined custom instructions", () => {
      const creationData: Partial<ReturnType<typeof createValidCreationData>> =
        createValidCreationData();
      delete creationData.customInstructions;
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });

    it("should reject custom instructions that are too long", () => {
      const creationData = createValidCreationData();
      creationData.customInstructions = "A".repeat(2001);
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.CUSTOM_INSTRUCTIONS_TOO_LONG,
      );
    });

    it("should accept custom instructions at maximum length", () => {
      const creationData = createValidCreationData();
      creationData.customInstructions = "A".repeat(2000);
      expect(() =>
        PersonalityCreationDataSchema.parse(creationData),
      ).not.toThrow();
    });
  });

  describe("input sanitization", () => {
    it("should trim whitespace from name", () => {
      const creationData = createValidCreationData();
      creationData.name = "  Creative Assistant  ";
      const result = PersonalityCreationDataSchema.parse(creationData);
      expect(result.name).toBe("Creative Assistant");
    });

    it("should trim whitespace from description", () => {
      const creationData = createValidCreationData();
      creationData.description = "  A creative personality  ";
      const result = PersonalityCreationDataSchema.parse(creationData);
      expect(result.description).toBe("A creative personality");
    });

    it("should trim whitespace from custom instructions", () => {
      const creationData = createValidCreationData();
      creationData.customInstructions = "  Focus on creativity  ";
      const result = PersonalityCreationDataSchema.parse(creationData);
      expect(result.customInstructions).toBe("Focus on creativity");
    });

    it("should remove HTML-like tags from name for XSS prevention", () => {
      const creationData = createValidCreationData();
      creationData.name = "Creative<script>alert('xss')</script>Assistant";
      const result = PersonalityCreationDataSchema.parse(creationData);
      expect(result.name).toBe("Creativescriptalert('xss')/scriptAssistant");
    });

    it("should normalize multiple whitespace in name", () => {
      const creationData = createValidCreationData();
      creationData.name = "Creative   Assistant";
      const result = PersonalityCreationDataSchema.parse(creationData);
      expect(result.name).toBe("Creative Assistant");
    });

    it("should handle empty description after sanitization", () => {
      const creationData = createValidCreationData();
      creationData.description = "   ";
      const result = PersonalityCreationDataSchema.parse(creationData);
      expect(result.description).toBe("");
    });

    it("should handle undefined optional fields during sanitization", () => {
      const creationData: Partial<ReturnType<typeof createValidCreationData>> =
        createValidCreationData();
      delete creationData.description;
      delete creationData.customInstructions;
      const result = PersonalityCreationDataSchema.parse(creationData);
      expect(result.description).toBeUndefined();
      expect(result.customInstructions).toBeUndefined();
    });
  });

  describe("strict mode validation", () => {
    it("should reject creation data with excess properties", () => {
      const creationData = createValidCreationData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (creationData as any).extraProperty = "not allowed";
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow();
    });

    it("should reject creation data with generated fields", () => {
      const creationData = createValidCreationData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (creationData as any).id = "550e8400-e29b-41d4-a716-446655440000";
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow();
    });

    it("should reject creation data with timestamp fields", () => {
      const creationData = createValidCreationData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (creationData as any).createdAt = "2023-01-01T00:00:00.000Z";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (creationData as any).updatedAt = "2023-01-01T00:00:00.000Z";
      expect(() => PersonalityCreationDataSchema.parse(creationData)).toThrow();
    });
  });

  describe("type inference", () => {
    it("should produce correct type from successful validation", () => {
      const creationData = createValidCreationData();
      const result = PersonalityCreationDataSchema.parse(creationData);

      // Type checking - these should not cause TypeScript errors
      expect(typeof result.name).toBe("string");
      expect(typeof result.isTemplate).toBe("boolean");
      expect(typeof result.openness).toBe("number");
      expect(typeof result.conscientiousness).toBe("number");
      expect(typeof result.extraversion).toBe("number");
      expect(typeof result.agreeableness).toBe("number");
      expect(typeof result.neuroticism).toBe("number");
      expect(typeof result.formality).toBe("number");

      // Optional fields
      if (result.description !== undefined) {
        expect(typeof result.description).toBe("string");
      }
      if (result.customInstructions !== undefined) {
        expect(typeof result.customInstructions).toBe("string");
      }

      // Should not have generated fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).id).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).createdAt).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).updatedAt).toBeUndefined();
    });
  });

  describe("performance", () => {
    it("should validate creation data efficiently", () => {
      const creationData = createValidCreationData();

      // Test that multiple validations can be performed without errors
      for (let i = 0; i < 100; i++) {
        expect(() =>
          PersonalityCreationDataSchema.parse(creationData),
        ).not.toThrow();
      }
    });
  });
});

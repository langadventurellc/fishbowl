/**
 * @fileoverview PersonalityUpdateDataSchema Tests
 *
 * Comprehensive test suite for PersonalityUpdateDataSchema validation including:
 * - Partial update validation scenarios (single/multiple fields)
 * - Required id field validation
 * - Business rule enforcement (template protection, createdAt prevention)
 * - Optional field validation when present
 * - Performance benchmarks
 */

import { PersonalityUpdateDataSchema } from "../PersonalityUpdateDataSchema";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

describe("PersonalityUpdateDataSchema", () => {
  /**
   * Creates base valid personality update data for testing
   */
  const createValidUpdateData = () => ({
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Updated Creative Assistant",
    openness: 75,
    imagination: 80,
  });

  /**
   * Creates minimal valid update data with only required id field and one other field
   */
  const createMinimalUpdateData = () => ({
    id: "550e8400-e29b-41d4-a716-446655440000",
    openness: 75,
  });

  describe("valid partial updates", () => {
    it("should validate update with single field change", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        openness: 80,
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).not.toThrow();
    });

    it("should validate update with multiple field changes", () => {
      const updateData = createValidUpdateData();
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).not.toThrow();
    });

    it("should validate update with subset of Big Five traits", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        openness: 85,
        conscientiousness: 70,
        extraversion: 60,
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).not.toThrow();
    });

    it("should validate update with subset of behavioral traits", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        formality: 60,
        humor: 75,
        empathy: 90,
        patience: 85,
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).not.toThrow();
    });

    it("should validate update with only metadata fields", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Updated Name",
        description: "Updated description",
        customInstructions: "Updated instructions",
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).not.toThrow();
    });

    it("should validate update with mixed trait and metadata changes", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        openness: 90,
        imagination: 85,
        name: "Creative AI Assistant",
        customInstructions: "Focus on innovative solutions",
        updatedAt: "2024-01-15T10:30:00.000Z",
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).not.toThrow();
    });

    it("should return validated object matching input for valid updates", () => {
      const updateData = createValidUpdateData();
      const result = PersonalityUpdateDataSchema.parse(updateData);
      expect(result).toEqual(updateData);
    });
  });

  describe("required id field validation", () => {
    it("should require id field", () => {
      const updateData = {
        openness: 75,
        name: "Updated Name",
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();
    });

    it("should validate valid UUID formats for id", () => {
      const validUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      ];

      validUUIDs.forEach((uuid) => {
        const updateData = {
          id: uuid,
          openness: 75,
        };
        expect(() =>
          PersonalityUpdateDataSchema.parse(updateData),
        ).not.toThrow();
      });
    });

    it("should reject invalid UUID formats for id", () => {
      const invalidUUIDs = [
        "invalid-uuid",
        "123",
        "550e8400-e29b-41d4-a716",
        "550e8400-e29b-41d4-a716-446655440000-extra",
        "",
      ];

      invalidUUIDs.forEach((uuid) => {
        const updateData = {
          id: uuid,
          openness: 75,
        };
        expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
          "Personality ID must be a valid UUID",
        );
      });
    });
  });

  describe("business rule validation", () => {
    it("should prevent template personality modifications", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        isTemplate: true,
        name: "Trying to update template",
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
        PERSONALITY_VALIDATION_ERRORS.TEMPLATE_MODIFICATION_FORBIDDEN,
      );
    });

    it("should allow non-template personality updates", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        isTemplate: false,
        name: "Updated non-template personality",
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).not.toThrow();
    });

    it("should prevent createdAt field updates", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Updated Name",
        createdAt: "2024-01-15T10:30:00.000Z", // This should be omitted from schema
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();
    });

    it("should require at least one field besides id", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
        "At least one field besides id must be provided for update",
      );
    });

    it("should allow updatedAt field updates", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        updatedAt: "2024-01-15T10:30:00.000Z",
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).not.toThrow();
    });
  });

  describe("optional field validation when present", () => {
    describe("Big Five trait validation", () => {
      const bigFiveTraits = [
        "openness",
        "conscientiousness",
        "extraversion",
        "agreeableness",
        "neuroticism",
      ] as const;

      bigFiveTraits.forEach((trait) => {
        it(`should validate ${trait} within 0-100 range when provided`, () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>)[trait] = 50;
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();

          (updateData as Record<string, unknown>)[trait] = 0;
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();

          (updateData as Record<string, unknown>)[trait] = 100;
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();
        });

        it(`should reject ${trait} values outside 0-100 range`, () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>)[trait] = 101;
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();

          (updateData as Record<string, unknown>)[trait] = -1;
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();
        });

        it(`should reject non-integer ${trait} values`, () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>)[trait] = 50.5;
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();
        });
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
        it(`should validate ${trait} within 0-100 range when provided`, () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>)[trait] = 75;
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();
        });

        it(`should reject ${trait} values outside 0-100 range`, () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>)[trait] = 101;
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();

          (updateData as Record<string, unknown>)[trait] = -1;
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();
        });

        it(`should reject non-integer ${trait} values`, () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>)[trait] = 25.7;
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();
        });
      });
    });

    describe("metadata field validation", () => {
      describe("name field validation", () => {
        it("should validate names within length limits when provided", () => {
          const updateData = createMinimalUpdateData() as Record<
            string,
            unknown
          >;
          updateData.name = "Valid Updated Name";
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();

          updateData.name = "A".repeat(100); // Maximum length
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();

          updateData.name = "AB"; // Minimum length
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();
        });

        it("should reject names that are too short when provided", () => {
          const updateData = createMinimalUpdateData() as Record<
            string,
            unknown
          >;
          updateData.name = "A"; // Too short
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
            PERSONALITY_VALIDATION_ERRORS.NAME_TOO_SHORT,
          );

          updateData.name = ""; // Empty string
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
            PERSONALITY_VALIDATION_ERRORS.NAME_TOO_SHORT,
          );
        });

        it("should reject names that are too long when provided", () => {
          const updateData = createMinimalUpdateData() as Record<
            string,
            unknown
          >;
          updateData.name = "A".repeat(101); // Too long
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
            PERSONALITY_VALIDATION_ERRORS.NAME_TOO_LONG,
          );
        });
      });

      describe("description field validation", () => {
        it("should validate description when provided", () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>).description =
            "Updated description";
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();

          (updateData as Record<string, unknown>).description = "A".repeat(500); // Maximum length
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();
        });

        it("should reject descriptions that are too long when provided", () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>).description = "A".repeat(501); // Too long
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
            PERSONALITY_VALIDATION_ERRORS.DESCRIPTION_TOO_LONG,
          );
        });
      });

      describe("customInstructions field validation", () => {
        it("should validate customInstructions when provided", () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>).customInstructions =
            "Updated custom instructions";
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();

          (updateData as Record<string, unknown>).customInstructions =
            "A".repeat(2000); // Maximum length
          expect(() =>
            PersonalityUpdateDataSchema.parse(updateData),
          ).not.toThrow();
        });

        it("should reject customInstructions that are too long when provided", () => {
          const updateData = createMinimalUpdateData();
          (updateData as Record<string, unknown>).customInstructions =
            "A".repeat(2001); // Too long
          expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
            PERSONALITY_VALIDATION_ERRORS.CUSTOM_INSTRUCTIONS_TOO_LONG,
          );
        });
      });

      describe("timestamp field validation", () => {
        it("should validate ISO datetime strings for updatedAt when provided", () => {
          const updateData = createMinimalUpdateData();
          const validTimestamps = [
            "2023-01-01T00:00:00.000Z",
            "2023-12-31T23:59:59.999Z",
            "2024-02-29T12:30:45.123Z", // Leap year
          ];

          validTimestamps.forEach((timestamp) => {
            (updateData as Record<string, unknown>).updatedAt = timestamp;
            expect(() =>
              PersonalityUpdateDataSchema.parse(updateData),
            ).not.toThrow();
          });
        });

        it("should reject invalid datetime strings for updatedAt when provided", () => {
          const updateData = createMinimalUpdateData();
          const invalidTimestamps = [
            "invalid-date",
            "2023-01-01",
            "2023-01-01T00:00:00",
            "2023-13-01T00:00:00.000Z", // Invalid month
            "2023-01-32T00:00:00.000Z", // Invalid day
            "",
          ];

          invalidTimestamps.forEach((timestamp) => {
            (updateData as Record<string, unknown>).updatedAt = timestamp;
            expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow(
              "Updated timestamp must be a valid ISO datetime string",
            );
          });
        });
      });
    });
  });

  describe("excess property handling", () => {
    it("should reject updates with excess properties", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        openness: 75,
        extraField: "not allowed", // Excess property
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();
    });

    it("should reject updates with typos in field names", () => {
      const updateData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        openess: 75, // Typo: should be "openness"
      };
      expect(() => PersonalityUpdateDataSchema.parse(updateData)).toThrow();
    });
  });

  describe("performance requirements", () => {
    it("should complete validation in under 10ms", () => {
      const updateData = createValidUpdateData();
      const iterations = 100;

      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        PersonalityUpdateDataSchema.parse(updateData);
      }
      const end = Date.now();

      const averageTime = (end - start) / iterations;
      expect(averageTime).toBeLessThan(10);
    });

    it("should handle multiple concurrent validations efficiently", () => {
      const updateData = createValidUpdateData();
      const promises = Array.from({ length: 50 }, () =>
        Promise.resolve().then(() =>
          PersonalityUpdateDataSchema.parse(updateData),
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

  describe("comprehensive update scenarios", () => {
    it("should validate realistic partial personality update", () => {
      const realisticUpdate = {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        // Update some Big Five traits
        openness: 90,
        conscientiousness: 85,
        // Update some behavioral traits
        imagination: 95,
        curiosity: 90,
        empathy: 85,
        // Update metadata
        name: "Enhanced Creative Assistant",
        customInstructions:
          "Focus on creative problem-solving with empathetic responses",
        updatedAt: "2024-01-15T10:30:00.000Z",
      };

      expect(() =>
        PersonalityUpdateDataSchema.parse(realisticUpdate),
      ).not.toThrow();
      const result = PersonalityUpdateDataSchema.parse(realisticUpdate);
      expect(result).toEqual(realisticUpdate);
    });

    it("should validate minimal update with single trait change", () => {
      const minimalUpdate = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        curiosity: 95,
      };

      expect(() =>
        PersonalityUpdateDataSchema.parse(minimalUpdate),
      ).not.toThrow();
    });

    it("should validate update with all optional traits at boundary values", () => {
      const boundaryUpdate = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        // All traits at minimum
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
        formality: 0,
        humor: 0,
        assertiveness: 0,
        empathy: 0,
        patience: 100, // One trait at maximum
      };

      expect(() =>
        PersonalityUpdateDataSchema.parse(boundaryUpdate),
      ).not.toThrow();
    });
  });
});

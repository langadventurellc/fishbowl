import { z } from "zod";
import { SettingsValidationError } from "../../errors/SettingsValidationError";
import { validatePersonalitiesData } from "../validatePersonalitiesData";
import { persistedPersonalitiesSettingsSchema } from "../../../../types/settings/personalitiesSettingsSchema";

describe("validatePersonalitiesData", () => {
  describe("successful validation", () => {
    it("should validate complete personalities data with all fields", () => {
      const validData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Creative Thinker",
            bigFive: {
              openness: 85,
              conscientiousness: 70,
              extraversion: 60,
              agreeableness: 75,
              neuroticism: 30,
            },
            behaviors: {
              analytical: 80,
              creative: 90,
              collaborative: 70,
            },
            customInstructions: "Focus on innovative solutions",
            createdAt: "2025-01-15T10:00:00.000Z",
            updatedAt: "2025-01-15T10:00:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      const result = validatePersonalitiesData(
        validData,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "loadPersonalities",
      );

      expect(result).toEqual(validData);
      expect(result.personalities).toHaveLength(1);
      expect(result.personalities[0]!.name).toBe("Creative Thinker");
      expect(result.personalities[0]!.bigFive.openness).toBe(85);
    });

    it("should handle null timestamps gracefully", () => {
      const dataWithNullTimestamps = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Analytical Mind",
            bigFive: {
              openness: 70,
              conscientiousness: 85,
              extraversion: 40,
              agreeableness: 60,
              neuroticism: 20,
            },
            behaviors: {
              analytical: 95,
              methodical: 85,
            },
            customInstructions: "Focus on logical analysis",
            createdAt: null,
            updatedAt: null,
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      const result = validatePersonalitiesData(
        dataWithNullTimestamps,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "loadPersonalities",
      );

      expect(result.personalities[0]!.createdAt).toBeNull();
      expect(result.personalities[0]!.updatedAt).toBeNull();
    });

    it("should handle missing optional timestamps", () => {
      const dataWithoutTimestamps = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Social Coordinator",
            bigFive: {
              openness: 65,
              conscientiousness: 75,
              extraversion: 90,
              agreeableness: 85,
              neuroticism: 25,
            },
            behaviors: {
              collaborative: 90,
              communicative: 85,
            },
            customInstructions: "Emphasize team coordination",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      const result = validatePersonalitiesData(
        dataWithoutTimestamps,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "loadPersonalities",
      );

      expect(result.personalities[0]!.createdAt).toBeUndefined();
      expect(result.personalities[0]!.updatedAt).toBeUndefined();
    });

    it("should validate empty personalities array", () => {
      const emptyPersonalitiesData = {
        schemaVersion: "1.0.0",
        personalities: [],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      const result = validatePersonalitiesData(
        emptyPersonalitiesData,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "initializePersonalities",
      );

      expect(result.personalities).toEqual([]);
    });

    it("should allow additional fields via passthrough", () => {
      const dataWithExtraFields = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Innovation Leader",
            bigFive: {
              openness: 95,
              conscientiousness: 80,
              extraversion: 75,
              agreeableness: 70,
              neuroticism: 15,
            },
            behaviors: {
              innovative: 95,
              leadership: 85,
            },
            customInstructions: "Drive innovation initiatives",
            futureField: "future-value",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
        customMetadata: { version: "2.0" },
      };
      const filePath = "/path/to/personalities.json";

      const result = validatePersonalitiesData(
        dataWithExtraFields,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "loadPersonalities",
      );

      expect(result).toMatchObject(dataWithExtraFields);
    });

    it("should handle empty behaviors object", () => {
      const dataWithEmptyBehaviors = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Basic Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "Standard approach",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      const result = validatePersonalitiesData(
        dataWithEmptyBehaviors,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "loadPersonalities",
      );

      expect(result.personalities[0]!.behaviors).toEqual({});
    });

    it("should apply schema defaults", () => {
      const dataWithDefaults = {};
      const filePath = "/path/to/personalities.json";

      const result = validatePersonalitiesData(
        dataWithDefaults,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "initializePersonalities",
      );

      expect(result.schemaVersion).toBe("1.0.0");
      expect(result.personalities).toEqual([]);
      expect(result.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  describe("validation failures", () => {
    it("should throw SettingsValidationError for missing required fields", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            // Missing required 'id' and 'name'
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/invalid-personalities.json";

      expect(() =>
        validatePersonalitiesData(
          invalidData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "loadPersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          invalidData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "loadPersonalities",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe("loadPersonalities");
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.id",
              message: "Personality ID must be a string",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.name",
              message: "Personality name must be a string",
            }),
          );
        }
      }
    });

    it("should validate character limits", () => {
      const dataExceedingLimits = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "a".repeat(51), // Exceeds 50 char limit
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "b".repeat(501), // Exceeds 500 char limit
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      expect(() =>
        validatePersonalitiesData(
          dataExceedingLimits,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          dataExceedingLimits,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.name",
              message: "Personality name cannot exceed 50 characters",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.customInstructions",
              message: "Custom instructions cannot exceed 500 characters",
            }),
          );
        }
      }
    });

    it("should validate Big Five trait ranges", () => {
      const invalidBigFiveData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Test Personality",
            bigFive: {
              openness: 150, // Out of range
              conscientiousness: -10, // Out of range
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      expect(() =>
        validatePersonalitiesData(
          invalidBigFiveData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          invalidBigFiveData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.bigFive.openness",
              message: "Openness cannot exceed 100",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.bigFive.conscientiousness",
              message: "Conscientiousness must be at least 0",
            }),
          );
        }
      }
    });

    it("should validate behavior trait ranges", () => {
      const invalidBehaviorData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Test Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {
              analytical: 105, // Out of range
              creative: -5, // Out of range
            },
            customInstructions: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      expect(() =>
        validatePersonalitiesData(
          invalidBehaviorData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          invalidBehaviorData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.behaviors.analytical",
              message: "Behavior values cannot exceed 100",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.behaviors.creative",
              message: "Behavior values must be at least 0",
            }),
          );
        }
      }
    });

    it("should validate missing Big Five traits", () => {
      const missingBigFiveData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Test Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              // Missing extraversion, agreeableness, neuroticism
            },
            behaviors: {},
            customInstructions: "Test",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      expect(() =>
        validatePersonalitiesData(
          missingBigFiveData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          missingBigFiveData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.bigFive.extraversion",
              message: "Extraversion must be a number",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.bigFive.agreeableness",
              message: "Agreeableness must be a number",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.bigFive.neuroticism",
              message: "Neuroticism must be a number",
            }),
          );
        }
      }
    });

    it("should validate timestamp formats", () => {
      const invalidTimestampData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Test Personality",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "Test",
            createdAt: "not-a-valid-date",
            updatedAt: "2025-13-45T25:99:99.000Z", // Invalid date
          },
        ],
        lastUpdated: "invalid-date",
      };
      const filePath = "/path/to/personalities.json";

      expect(() =>
        validatePersonalitiesData(
          invalidTimestampData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "loadPersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          invalidTimestampData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "loadPersonalities",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(
            error.fieldErrors.some(
              (e) =>
                e.path.includes("createdAt") &&
                e.message.includes("valid ISO datetime"),
            ),
          ).toBe(true);
          expect(
            error.fieldErrors.some(
              (e) =>
                e.path.includes("updatedAt") &&
                e.message.includes("valid ISO datetime"),
            ),
          ).toBe(true);
          expect(
            error.fieldErrors.some(
              (e) =>
                e.path === "lastUpdated" &&
                e.message.includes("valid ISO datetime"),
            ),
          ).toBe(true);
        }
      }
    });

    it("should handle malformed data structure", () => {
      const malformedData = {
        schemaVersion: "1.0.0",
        personalities: "not-an-array", // Should be array
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      expect(() =>
        validatePersonalitiesData(
          malformedData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "loadPersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          malformedData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "loadPersonalities",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities",
              message: "Personalities must be an array of personality objects",
            }),
          );
        }
      }
    });

    it("should handle empty required strings", () => {
      const emptyStringsData = {
        schemaVersion: "",
        personalities: [
          {
            id: "",
            name: "",
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/personalities.json";

      expect(() =>
        validatePersonalitiesData(
          emptyStringsData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          emptyStringsData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "savePersonalities",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "schemaVersion",
              message: "Schema version cannot be empty",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.id",
              message: "Personality ID cannot be empty",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.name",
              message: "Personality name is required",
            }),
          );
        }
      }
    });

    it("should handle wrong data types", () => {
      const wrongTypeData = {
        schemaVersion: 123, // Should be string
        personalities: [
          {
            id: 456, // Should be string
            name: true, // Should be string
            bigFive: "not-an-object", // Should be object
            behaviors: [], // Should be object
            customInstructions: {}, // Should be string
          },
        ],
        lastUpdated: false, // Should be string
      };
      const filePath = "/path/to/personalities.json";

      expect(() =>
        validatePersonalitiesData(
          wrongTypeData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "loadPersonalities",
        ),
      ).toThrow(SettingsValidationError);

      try {
        validatePersonalitiesData(
          wrongTypeData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          "loadPersonalities",
        );
      } catch (error) {
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "schemaVersion",
              message: "Schema version must be a string",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.id",
              message: "Personality ID must be a string",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "personalities.0.name",
              message: "Personality name must be a string",
            }),
          );
          expect(error.fieldErrors).toContainEqual(
            expect.objectContaining({
              path: "lastUpdated",
              message: "Last updated must be an ISO timestamp string",
            }),
          );
        }
      }
    });

    it("should provide correct file path and operation in errors", () => {
      const invalidData = { invalid: "structure" };
      const filePath = "/custom/path/to/personalities.json";
      const operation = "customOperation";

      try {
        validatePersonalitiesData(
          invalidData,
          persistedPersonalitiesSettingsSchema,
          filePath,
          operation,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe(operation);
        }
      }
    });

    it("should handle unexpected errors gracefully", () => {
      // Create a schema that will throw an unexpected error
      const throwingSchema = z.custom(() => {
        throw new Error("Unexpected internal error");
      });

      const filePath = "/path/to/personalities.json";
      const operation = "testOperation";

      try {
        validatePersonalitiesData({}, throwingSchema, filePath, operation);
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.filePath).toBe(filePath);
          expect(error.operation).toBe(operation);
          expect(error.fieldErrors).toHaveLength(1);
          expect(error.fieldErrors[0]).toEqual({
            path: "root",
            message: expect.stringContaining("Unexpected validation error"),
          });
        }
      }
    });
  });

  describe("edge cases", () => {
    it("should handle decimal values in trait scores", () => {
      const decimalData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Precise Personality",
            bigFive: {
              openness: 75.5,
              conscientiousness: 82.3,
              extraversion: 67.8,
              agreeableness: 91.2,
              neuroticism: 34.7,
            },
            behaviors: {
              analytical: 88.9,
              creative: 72.1,
            },
            customInstructions: "Precision matters",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/decimal-personalities.json";

      const result = validatePersonalitiesData(
        decimalData,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "loadPersonalities",
      );

      expect(result.personalities[0]!.bigFive.openness).toBe(75.5);
      expect(result.personalities[0]!.behaviors.analytical).toBe(88.9);
    });

    it("should handle unicode characters in personality fields", () => {
      const unicodeData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-unicode",
            name: "🧠 Creative Genius",
            bigFive: {
              openness: 95,
              conscientiousness: 80,
              extraversion: 70,
              agreeableness: 85,
              neuroticism: 25,
            },
            behaviors: {
              创新性: 90, // Chinese characters
              креативность: 85, // Russian characters
              إبداع: 80, // Arabic characters
            },
            customInstructions: "Think outside the box! 🚀",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };
      const filePath = "/path/to/unicode-personalities.json";

      const result = validatePersonalitiesData(
        unicodeData,
        persistedPersonalitiesSettingsSchema,
        filePath,
        "loadPersonalities",
      );

      expect(result.personalities[0]!.name).toBe("🧠 Creative Genius");
      expect(result.personalities[0]!.behaviors["创新性"]).toBe(90);
      expect(result.personalities[0]!.customInstructions).toContain("🚀");
    });

    it("should validate using custom personality schema", () => {
      const customSchema = z.object({
        id: z.string(),
        customScore: z.number(),
      });

      const customData = {
        id: "custom-1",
        customScore: 42,
      };
      const filePath = "/path/to/custom.json";

      const result = validatePersonalitiesData(
        customData,
        customSchema,
        filePath,
        "customValidation",
      );

      expect(result.customScore).toBe(42);
    });
  });

  describe("integration with validateWithSchema", () => {
    it("should properly delegate to validateWithSchema", () => {
      const validData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "integration-test",
            name: "Integration Personality",
            bigFive: {
              openness: 70,
              conscientiousness: 75,
              extraversion: 60,
              agreeableness: 80,
              neuroticism: 30,
            },
            behaviors: {
              systematic: 85,
            },
            customInstructions: "Testing integration",
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      const result = validatePersonalitiesData(
        validData,
        persistedPersonalitiesSettingsSchema,
        "/integration.json",
        "test",
      );
      expect(result).toEqual(validData);
    });

    it("should preserve error details from validateWithSchema", () => {
      const invalidData = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "test-personality",
            name: "a".repeat(51), // Exceeds limit
            bigFive: {
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
            },
            behaviors: {},
            customInstructions: "b".repeat(501), // Exceeds limit
          },
        ],
        lastUpdated: "2025-01-15T10:00:00.000Z",
      };

      try {
        validatePersonalitiesData(
          invalidData,
          persistedPersonalitiesSettingsSchema,
          "/preserve-errors.json",
          "test",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SettingsValidationError);
        if (error instanceof SettingsValidationError) {
          expect(error.fieldErrors).toHaveLength(2);
          expect(error.fieldErrors).toContainEqual({
            path: "personalities.0.name",
            message: "Personality name cannot exceed 50 characters",
          });
          expect(error.fieldErrors).toContainEqual({
            path: "personalities.0.customInstructions",
            message: "Custom instructions cannot exceed 500 characters",
          });
        }
      }
    });
  });
});

import { z } from "zod";
import {
  persistedPersonalitiesSettingsSchema,
  persistedPersonalitySchema,
} from "../personalitiesSettingsSchema";

describe("persistedPersonalitySchema", () => {
  describe("valid data validation", () => {
    it("should accept complete valid personality object", () => {
      const validPersonality = {
        id: "personality-123",
        name: "Creative Thinker",
        behaviors: {
          creativity: 90,
          analytical: 70,
          empathy: 85,
        },
        customInstructions: "Focus on creative and innovative solutions",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedPersonalitySchema.parse(validPersonality);
      expect(result).toEqual(validPersonality);
    });

    it("should accept personality with null timestamps", () => {
      const personalityWithNullTimestamps = {
        id: "personality-456",
        name: "Analytical Mind",
        behaviors: {
          logical: 95,
          detail: 90,
        },
        customInstructions: "Approach problems systematically",
        createdAt: null,
        updatedAt: null,
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithNullTimestamps,
      );
      expect(result.createdAt).toBeNull();
      expect(result.updatedAt).toBeNull();
    });

    it("should accept personality with missing optional fields", () => {
      const personalityWithoutTimestamps = {
        id: "personality-789",
        name: "Balanced",
        behaviors: {},
        customInstructions: "",
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithoutTimestamps,
      );
      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });

    it("should accept personality with empty behaviors and custom instructions", () => {
      const personalityWithEmptyFields = {
        id: "personality-empty",
        name: "Minimal",
        behaviors: {},
        customInstructions: "",
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithEmptyFields,
      );
      expect(result.behaviors).toEqual({});
      expect(result.customInstructions).toBe("");
    });

    it("should accept personality with minimum and maximum trait values", () => {
      const personalityWithExtremeValues = {
        id: "personality-extreme",
        name: "Extreme",
        behaviors: {
          minBehavior: 0,
          maxBehavior: 100,
        },
        customInstructions: "",
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithExtremeValues,
      );
      expect(result.behaviors.minBehavior).toBe(0);
      expect(result.behaviors.maxBehavior).toBe(100);
    });

    it("should accept personality with minimum name length", () => {
      const personalityWithMinName = {
        id: "p",
        name: "A",
        behaviors: {},
        customInstructions: "",
      };

      const result = persistedPersonalitySchema.parse(personalityWithMinName);
      expect(result.name).toBe("A");
    });

    it("should accept personality with maximum name and instructions length", () => {
      const personalityWithMaxFields = {
        id: "personality-max",
        name: "A".repeat(50), // 50 characters
        behaviors: {},
        customInstructions: "I".repeat(500), // 500 characters
      };

      const result = persistedPersonalitySchema.parse(personalityWithMaxFields);
      expect(result.name).toHaveLength(50);
      expect(result.customInstructions).toHaveLength(500);
    });

    it("should accept personality with Unicode characters", () => {
      const personalityWithUnicode = {
        id: "personality-unicode",
        name: "Creatîve Thînker 🎨",
        behaviors: {
          artístico: 90,
          créativité: 85,
        },
        customInstructions: "Focus on creativity and innovation 🚀",
      };

      const result = persistedPersonalitySchema.parse(personalityWithUnicode);
      expect(result.name).toBe("Creatîve Thînker 🎨");
      expect(result.behaviors["artístico"]).toBe(90);
      expect(result.behaviors["créativité"]).toBe(85);
    });

    it("should accept personality with complex behavior names", () => {
      const personalityWithComplexBehaviors = {
        id: "personality-complex",
        name: "Complex Thinker",
        behaviors: {
          "problem-solving": 85,
          creative_thinking: 90,
          "analytical reasoning": 80,
          emotional_intelligence: 75,
        },
        customInstructions: "Balance analytical and creative approaches",
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithComplexBehaviors,
      );
      expect(result.behaviors["problem-solving"]).toBe(85);
      expect(result.behaviors["creative_thinking"]).toBe(90);
    });
  });

  describe("field validation", () => {
    describe("id field", () => {
      it("should reject empty id", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "",
            name: "Test Personality",
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality ID cannot be empty");
      });

      it("should reject non-string id", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: 123,
            name: "Test Personality",
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality ID must be a string");
      });

      it("should reject null id", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: null,
            name: "Test Personality",
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality ID must be a string");
      });

      it("should reject undefined id", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            name: "Test Personality",
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality ID must be a string");
      });
    });

    describe("name field", () => {
      it("should reject empty name", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "",
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality name is required");
      });

      it("should reject name exceeding 50 characters", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "A".repeat(51), // 51 characters
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality name cannot exceed 50 characters");
      });

      it("should reject non-string name", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: 123,
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality name must be a string");
      });

      it("should reject null name", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: null,
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality name must be a string");
      });

      it("should reject undefined name", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            behaviors: {},
            customInstructions: "",
          });
        }).toThrow("Personality name must be a string");
      });
    });

    describe("behaviors field", () => {
      it("should reject non-object behaviors", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: "not-an-object",
            customInstructions: "",
          });
        }).toThrow(
          "Behaviors must be an object with string keys and numeric values",
        );
      });

      it("should reject null behaviors", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: null,
            customInstructions: "",
          });
        }).toThrow(
          "Behaviors must be an object with string keys and numeric values",
        );
      });

      it("should reject behaviors with non-numeric values", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {
              creativity: "high",
            },
            customInstructions: "",
          });
        }).toThrow("Behavior values must be numbers");
      });

      it("should reject behaviors with values below 0", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {
              creativity: -1,
            },
            customInstructions: "",
          });
        }).toThrow("Behavior values must be at least 0");
      });

      it("should reject behaviors with values above 100", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {
              creativity: 101,
            },
            customInstructions: "",
          });
        }).toThrow("Behavior values cannot exceed 100");
      });
    });

    describe("customInstructions field", () => {
      it("should accept empty custom instructions", () => {
        const result = persistedPersonalitySchema.parse({
          id: "test-id",
          name: "Test",
          behaviors: {},
          customInstructions: "",
        });
        expect(result.customInstructions).toBe("");
      });

      it("should reject custom instructions exceeding 500 characters", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {},
            customInstructions: "I".repeat(501), // 501 characters
          });
        }).toThrow("Custom instructions cannot exceed 500 characters");
      });

      it("should reject non-string custom instructions", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {},
            customInstructions: 123,
          });
        }).toThrow("Custom instructions must be a string");
      });

      it("should reject null custom instructions", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {},
            customInstructions: null,
          });
        }).toThrow("Custom instructions must be a string");
      });

      it("should reject undefined custom instructions", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {},
          });
        }).toThrow("Custom instructions must be a string");
      });
    });

    describe("timestamp fields", () => {
      it("should accept valid ISO datetime for createdAt", () => {
        const result = persistedPersonalitySchema.parse({
          id: "test-id",
          name: "Test",
          behaviors: {},
          customInstructions: "",
          createdAt: "2025-01-15T10:30:00.000Z",
        });
        expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
      });

      it("should accept valid ISO datetime for updatedAt", () => {
        const result = persistedPersonalitySchema.parse({
          id: "test-id",
          name: "Test",
          behaviors: {},
          customInstructions: "",
          updatedAt: "2025-01-15T10:30:00.000Z",
        });
        expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
      });

      it("should reject invalid datetime format for createdAt", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {},
            customInstructions: "",
            createdAt: "2025-01-15 10:30:00",
          });
        }).toThrow("Created timestamp must be a valid ISO datetime");
      });

      it("should reject invalid datetime format for updatedAt", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {},
            customInstructions: "",
            updatedAt: "invalid-date",
          });
        }).toThrow("Updated timestamp must be a valid ISO datetime");
      });

      it("should reject non-string timestamp values", () => {
        expect(() => {
          persistedPersonalitySchema.parse({
            id: "test-id",
            name: "Test",
            behaviors: {},
            customInstructions: "",
            createdAt: 1642252200000,
          });
        }).toThrow("Created timestamp must be a string");
      });
    });
  });

  describe("error messages", () => {
    it("should provide clear error message for multiple validation failures", () => {
      expect(() => {
        persistedPersonalitySchema.parse({
          id: "",
          name: "",
          behaviors: {
            invalidBehavior: 101,
          },
          customInstructions: "I".repeat(501),
          createdAt: "invalid-date",
        });
      }).toThrow(); // Should contain multiple error messages
    });

    it("should reference field names in error messages", () => {
      expect(() => {
        persistedPersonalitySchema.parse({
          id: "test",
          name: "A".repeat(51),
          behaviors: {},
          customInstructions: "",
        });
      }).toThrow("Personality name cannot exceed 50 characters");
    });

    it("should include character limits in error messages", () => {
      expect(() => {
        persistedPersonalitySchema.parse({
          id: "test",
          name: "test",
          behaviors: {},
          customInstructions: "I".repeat(501),
        });
      }).toThrow("Custom instructions cannot exceed 500 characters");
    });
  });

  describe("type inference", () => {
    it("should properly infer TypeScript type from schema", () => {
      type InferredType = z.infer<typeof persistedPersonalitySchema>;

      const testPersonality: InferredType = {
        id: "test-personality",
        name: "Test Personality",
        behaviors: {
          creativity: 85,
          analysis: 70,
        },
        customInstructions: "Be creative and analytical",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedPersonalitySchema.parse(testPersonality);
      expect(result).toEqual(testPersonality);
    });

    it("should infer optional timestamp fields correctly", () => {
      type InferredType = z.infer<typeof persistedPersonalitySchema>;

      const testPersonalityNoTimestamps: InferredType = {
        id: "test-personality",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "",
      };

      const result = persistedPersonalitySchema.parse(
        testPersonalityNoTimestamps,
      );
      expect(result).toEqual(testPersonalityNoTimestamps);
    });

    it("should infer nullable timestamp fields correctly", () => {
      type InferredType = z.infer<typeof persistedPersonalitySchema>;

      const testPersonalityNullTimestamps: InferredType = {
        id: "test-personality",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "",
        createdAt: null,
        updatedAt: null,
      };

      const result = persistedPersonalitySchema.parse(
        testPersonalityNullTimestamps,
      );
      expect(result).toEqual(testPersonalityNullTimestamps);
    });
  });

  describe("passthrough functionality", () => {
    it("should allow unknown fields for schema evolution", () => {
      const personalityWithExtraFields = {
        id: "test-personality",
        name: "Test Personality",
        behaviors: {},
        customInstructions: "",
        extraField: "should be preserved",
        anotherField: 123,
      };

      const result = persistedPersonalitySchema.parse(
        personalityWithExtraFields,
      );
      expect(result.extraField).toBe("should be preserved");
      expect(result.anotherField).toBe(123);
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        persistedPersonalitySchema.parse(null);
      }).toThrow("Invalid input: expected object, received null");
    });

    it("should reject array input", () => {
      expect(() => {
        persistedPersonalitySchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        persistedPersonalitySchema.parse("invalid");
      }).toThrow();
    });

    it("should reject number input", () => {
      expect(() => {
        persistedPersonalitySchema.parse(42);
      }).toThrow();
    });

    it("should reject undefined input", () => {
      expect(() => {
        persistedPersonalitySchema.parse(undefined);
      }).toThrow("Invalid input: expected object, received undefined");
    });
  });
});

describe("persistedPersonalitiesSettingsSchema", () => {
  describe("valid file structure validation", () => {
    it("should accept empty personalities array with defaults", () => {
      const result = persistedPersonalitiesSettingsSchema.parse({});
      expect(result.personalities).toEqual([]);
      expect(result.schemaVersion).toBe("1.0.0");
      expect(result.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should accept multiple valid personalities in array", () => {
      const validPersonalities = [
        {
          id: "personality-1",
          name: "Creative",
          behaviors: {
            creativity: 90,
          },
          customInstructions: "Be creative",
        },
        {
          id: "personality-2",
          name: "Analytical",
          behaviors: {
            logic: 95,
          },
          customInstructions: "Be logical",
        },
      ];

      const result = persistedPersonalitiesSettingsSchema.parse({
        personalities: validPersonalities,
      });
      expect(result.personalities).toHaveLength(2);
      expect(result.personalities[0]?.name).toBe("Creative");
      expect(result.personalities[1]?.name).toBe("Analytical");
    });

    it("should accept file with all metadata fields", () => {
      const completeFile = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Balanced",
            behaviors: {},
            customInstructions: "",
            createdAt: "2025-01-15T10:30:00.000Z",
            updatedAt: "2025-01-15T10:30:00.000Z",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedPersonalitiesSettingsSchema.parse(completeFile);
      expect(result).toEqual(completeFile);
    });

    it("should accept file with extra unknown fields (passthrough)", () => {
      const fileWithExtras = {
        personalities: [],
        futureField: "new feature",
        metadata: { custom: "data" },
      };

      const result = persistedPersonalitiesSettingsSchema.parse(fileWithExtras);
      expect(result.futureField).toBe("new feature");
      expect(result.metadata).toEqual({ custom: "data" });
    });
  });

  describe("schema version validation", () => {
    it("should default to current version", () => {
      const result = persistedPersonalitiesSettingsSchema.parse({
        personalities: [],
      });
      expect(result.schemaVersion).toBe("1.0.0");
    });

    it("should accept custom version strings", () => {
      const result = persistedPersonalitiesSettingsSchema.parse({
        schemaVersion: "2.0.0-beta",
        personalities: [],
      });
      expect(result.schemaVersion).toBe("2.0.0-beta");
    });

    it("should reject empty version strings", () => {
      expect(() => {
        persistedPersonalitiesSettingsSchema.parse({
          schemaVersion: "",
          personalities: [],
        });
      }).toThrow("Schema version cannot be empty");
    });

    it("should reject non-string version", () => {
      expect(() => {
        persistedPersonalitiesSettingsSchema.parse({
          schemaVersion: 1.0,
          personalities: [],
        });
      }).toThrow("Schema version must be a string");
    });
  });

  describe("personalities array validation", () => {
    it("should default to empty array", () => {
      const result = persistedPersonalitiesSettingsSchema.parse({});
      expect(result.personalities).toEqual([]);
    });

    it("should validate each personality in array", () => {
      const personalitiesWithInvalid = [
        {
          id: "valid-personality",
          name: "Valid",
          behaviors: {},
          customInstructions: "",
        },
        {
          id: "", // Invalid - empty ID
          name: "Invalid",
          behaviors: {},
          customInstructions: "",
        },
      ];

      expect(() => {
        persistedPersonalitiesSettingsSchema.parse({
          personalities: personalitiesWithInvalid,
        });
      }).toThrow("Personality ID cannot be empty");
    });

    it("should provide clear error messages for specific array indices", () => {
      const personalitiesWithInvalid = [
        {
          id: "personality-1",
          name: "Valid Personality",
          behaviors: {},
          customInstructions: "",
        },
        {
          id: "personality-2",
          name: "A".repeat(51), // Invalid - exceeds 50 chars
          behaviors: {},
          customInstructions: "",
        },
      ];

      expect(() => {
        persistedPersonalitiesSettingsSchema.parse({
          personalities: personalitiesWithInvalid,
        });
      }).toThrow("Personality name cannot exceed 50 characters");
    });

    it("should reject non-array personalities field", () => {
      expect(() => {
        persistedPersonalitiesSettingsSchema.parse({
          personalities: "not-an-array",
        });
      }).toThrow("Personalities must be an array of personality objects");
    });
  });

  describe("timestamp validation", () => {
    it("should generate automatic timestamp", () => {
      const before = new Date().toISOString();
      const result = persistedPersonalitiesSettingsSchema.parse({
        personalities: [],
      });
      const after = new Date().toISOString();

      expect(new Date(result.lastUpdated).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime(),
      );
      expect(new Date(result.lastUpdated).getTime()).toBeLessThanOrEqual(
        new Date(after).getTime(),
      );
    });

    it("should accept custom valid timestamps", () => {
      const customTimestamp = "2025-01-15T10:30:00.000Z";
      const result = persistedPersonalitiesSettingsSchema.parse({
        personalities: [],
        lastUpdated: customTimestamp,
      });
      expect(result.lastUpdated).toBe(customTimestamp);
    });

    it("should reject invalid timestamp formats", () => {
      expect(() => {
        persistedPersonalitiesSettingsSchema.parse({
          personalities: [],
          lastUpdated: "not-a-date",
        });
      }).toThrow("Last updated must be a valid ISO datetime");
    });
  });

  describe("future compatibility", () => {
    it("should preserve unknown fields", () => {
      const fileWithFutureFields = {
        personalities: [],
        experimental: { feature: true },
        version2Fields: ["field1", "field2"],
      };

      const result =
        persistedPersonalitiesSettingsSchema.parse(fileWithFutureFields);
      expect(result.experimental).toEqual({ feature: true });
      expect(result.version2Fields).toEqual(["field1", "field2"]);
    });

    it("should handle JSON serialization round-trip", () => {
      const original = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "personality-1",
            name: "Test Personality",
            behaviors: {
              creativity: 85,
            },
            customInstructions: "Be creative",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
        customField: "preserved",
      };

      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);
      const result = persistedPersonalitiesSettingsSchema.parse(parsed);

      expect(result).toEqual(original);
    });
  });

  describe("type inference", () => {
    it("should properly infer TypeScript types", () => {
      type InferredType = z.infer<typeof persistedPersonalitiesSettingsSchema>;

      const testFile: InferredType = {
        schemaVersion: "1.0.0",
        personalities: [
          {
            id: "test",
            name: "Test",
            behaviors: {},
            customInstructions: "",
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedPersonalitiesSettingsSchema.parse(testFile);
      expect(result).toEqual(testFile);
    });
  });
});

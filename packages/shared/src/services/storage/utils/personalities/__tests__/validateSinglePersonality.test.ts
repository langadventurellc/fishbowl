import { validateSinglePersonality } from "../validateSinglePersonality";

describe("validateSinglePersonality", () => {
  const validPersonality = {
    id: "test-personality",
    name: "Test Personality",
    bigFive: {
      openness: 75,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 85,
      neuroticism: 40,
    },
    behaviors: {
      analytical: 70,
      creative: 80,
      leadership: 65,
    },
    customInstructions: "Test instructions",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };

  describe("valid personality data", () => {
    it("should pass validation for valid personality", () => {
      const result = validateSinglePersonality(validPersonality);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });

    it("should accept minimal valid personality", () => {
      const minimal = {
        id: "minimal",
        name: "M",
        bigFive: {
          openness: 0,
          conscientiousness: 0,
          extraversion: 0,
          agreeableness: 0,
          neuroticism: 0,
        },
        behaviors: {},
        customInstructions: "",
      };

      const result = validateSinglePersonality(minimal);
      expect(result.isValid).toBe(true);
    });

    it("should accept decimal values for Big Five traits", () => {
      const withDecimals = {
        ...validPersonality,
        bigFive: {
          openness: 75.5,
          conscientiousness: 80.2,
          extraversion: 60.8,
          agreeableness: 85.1,
          neuroticism: 40.9,
        },
      };

      const result = validateSinglePersonality(withDecimals);
      expect(result.isValid).toBe(true);
    });

    it("should accept null timestamps", () => {
      const withNullTimestamps = {
        ...validPersonality,
        createdAt: null,
        updatedAt: null,
      };

      const result = validateSinglePersonality(withNullTimestamps);
      expect(result.isValid).toBe(true);
    });
  });

  describe("null/undefined input", () => {
    it("should reject null input", () => {
      const result = validateSinglePersonality(null);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Personality data is required and cannot be null or undefined",
      );
    });

    it("should reject undefined input", () => {
      const result = validateSinglePersonality(undefined);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Personality data is required and cannot be null or undefined",
      );
    });
  });

  describe("ID validation", () => {
    it("should reject empty ID", () => {
      const invalid = { ...validPersonality, id: "" };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("id:");
      expect(result.error).toContain("cannot be empty");
    });

    it("should reject missing ID", () => {
      const { id, ...invalid } = validPersonality;
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("id:");
    });

    it("should reject non-string ID", () => {
      const invalid = { ...validPersonality, id: 123 };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("id:");
      expect(result.error).toContain("must be a string");
    });
  });

  describe("name validation", () => {
    it("should reject empty name", () => {
      const invalid = { ...validPersonality, name: "" };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("name:");
      expect(result.error).toContain("required");
    });

    it("should reject name over 50 characters", () => {
      const invalid = { ...validPersonality, name: "a".repeat(51) };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("name:");
      expect(result.error).toContain("cannot exceed 50 characters");
    });

    it("should accept name at 50 character limit", () => {
      const valid = { ...validPersonality, name: "a".repeat(50) };
      const result = validateSinglePersonality(valid);

      expect(result.isValid).toBe(true);
    });

    it("should reject non-string name", () => {
      const invalid = { ...validPersonality, name: 123 };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("name:");
      expect(result.error).toContain("must be a string");
    });
  });

  describe("Big Five traits validation", () => {
    it("should reject missing Big Five object", () => {
      const { bigFive, ...invalid } = validPersonality;
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("bigFive");
    });

    it("should reject incomplete Big Five traits", () => {
      const invalid = {
        ...validPersonality,
        bigFive: {
          openness: 75,
          conscientiousness: 80,
          // Missing extraversion, agreeableness, neuroticism
        },
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
    });

    it("should reject Big Five values below 0", () => {
      const invalid = {
        ...validPersonality,
        bigFive: { ...validPersonality.bigFive, openness: -1 },
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("openness");
      expect(result.error).toContain("at least 0");
    });

    it("should reject Big Five values above 100", () => {
      const invalid = {
        ...validPersonality,
        bigFive: { ...validPersonality.bigFive, extraversion: 101 },
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("extraversion");
      expect(result.error).toContain("cannot exceed 100");
    });

    it("should reject non-numeric Big Five values", () => {
      const invalid = {
        ...validPersonality,
        bigFive: { ...validPersonality.bigFive, conscientiousness: "high" },
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("conscientiousness");
      expect(result.error).toContain("must be a number");
    });

    it("should accept Big Five values at boundaries (0 and 100)", () => {
      const boundary = {
        ...validPersonality,
        bigFive: {
          openness: 0,
          conscientiousness: 100,
          extraversion: 0,
          agreeableness: 100,
          neuroticism: 50,
        },
      };
      const result = validateSinglePersonality(boundary);

      expect(result.isValid).toBe(true);
    });
  });

  describe("behaviors validation", () => {
    it("should accept empty behaviors object", () => {
      const valid = { ...validPersonality, behaviors: {} };
      const result = validateSinglePersonality(valid);

      expect(result.isValid).toBe(true);
    });

    it("should reject behavior values below 0", () => {
      const invalid = {
        ...validPersonality,
        behaviors: { analytical: -1 },
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("analytical");
      expect(result.error).toContain("at least 0");
    });

    it("should reject behavior values above 100", () => {
      const invalid = {
        ...validPersonality,
        behaviors: { creative: 101 },
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("creative");
      expect(result.error).toContain("cannot exceed 100");
    });

    it("should reject non-numeric behavior values", () => {
      const invalid = {
        ...validPersonality,
        behaviors: { leadership: "strong" },
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("leadership");
      expect(result.error).toContain("must be numbers");
    });

    it("should accept decimal behavior values", () => {
      const valid = {
        ...validPersonality,
        behaviors: { analytical: 75.5, creative: 80.2 },
      };
      const result = validateSinglePersonality(valid);

      expect(result.isValid).toBe(true);
    });
  });

  describe("custom instructions validation", () => {
    it("should accept empty custom instructions", () => {
      const valid = { ...validPersonality, customInstructions: "" };
      const result = validateSinglePersonality(valid);

      expect(result.isValid).toBe(true);
    });

    it("should reject custom instructions over 500 characters", () => {
      const invalid = {
        ...validPersonality,
        customInstructions: "a".repeat(501),
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("customInstructions");
      expect(result.error).toContain("cannot exceed 500 characters");
    });

    it("should accept custom instructions at 500 character limit", () => {
      const valid = {
        ...validPersonality,
        customInstructions: "a".repeat(500),
      };
      const result = validateSinglePersonality(valid);

      expect(result.isValid).toBe(true);
    });

    it("should reject non-string custom instructions", () => {
      const invalid = { ...validPersonality, customInstructions: 123 };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("customInstructions");
      expect(result.error).toContain("must be a string");
    });
  });

  describe("timestamp validation", () => {
    it("should accept valid ISO datetime strings", () => {
      const valid = {
        ...validPersonality,
        createdAt: "2023-12-01T10:30:00.000Z",
        updatedAt: "2023-12-01T11:30:00.123Z",
      };
      const result = validateSinglePersonality(valid);

      expect(result.isValid).toBe(true);
    });

    it("should reject invalid timestamp format", () => {
      const invalid = {
        ...validPersonality,
        createdAt: "invalid-date",
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("createdAt");
      expect(result.error).toContain("valid ISO datetime");
    });

    it("should reject non-string timestamps", () => {
      const invalid = {
        ...validPersonality,
        updatedAt: 1234567890,
      };
      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("updatedAt");
      expect(result.error).toContain("must be a string");
    });
  });

  describe("multiple validation errors", () => {
    it("should return multiple errors when multiple fields are invalid", () => {
      const invalid = {
        id: "",
        name: "",
        bigFive: {
          openness: -1,
          conscientiousness: 101,
          extraversion: "invalid",
          agreeableness: 50,
          neuroticism: 50,
        },
        behaviors: {
          analytical: -5,
          creative: 105,
        },
        customInstructions: "a".repeat(501),
      };

      const result = validateSinglePersonality(invalid);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(1);
      expect(result.error).toBeUndefined(); // Should use errors array instead
    });
  });

  describe("malformed input handling", () => {
    it("should handle string input gracefully", () => {
      const result = validateSinglePersonality("invalid");

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle number input gracefully", () => {
      const result = validateSinglePersonality(123);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle boolean input gracefully", () => {
      const result = validateSinglePersonality(true);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle array input gracefully", () => {
      const result = validateSinglePersonality([]);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("performance", () => {
    it("should complete validation within reasonable time", () => {
      const start = Date.now();

      // Run validation multiple times to test performance
      for (let i = 0; i < 100; i++) {
        validateSinglePersonality(validPersonality);
      }

      const end = Date.now();
      const timePerValidation = (end - start) / 100;

      // Should complete within reasonable time (using Date.now for compatibility)
      expect(timePerValidation).toBeLessThan(50); // More lenient timing with Date.now
    });
  });
});

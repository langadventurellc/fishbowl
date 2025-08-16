import { PERSONALITIES_SCHEMA_VERSION } from "../../../../../types/settings/personalitiesSettingsSchema";
import { validatePersonalitiesData } from "../validatePersonalitiesData";

describe("validatePersonalitiesData", () => {
  const validPersonality1 = {
    id: "personality-1",
    name: "Creative Thinker",
    bigFive: {
      openness: 85,
      conscientiousness: 70,
      extraversion: 60,
      agreeableness: 75,
      neuroticism: 45,
    },
    behaviors: {
      analytical: 70,
      creative: 90,
    },
    customInstructions: "Think creatively and outside the box",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };

  const validPersonality2 = {
    id: "personality-2",
    name: "Analytical Mind",
    bigFive: {
      openness: 65,
      conscientiousness: 90,
      extraversion: 40,
      agreeableness: 60,
      neuroticism: 30,
    },
    behaviors: {
      analytical: 95,
      methodical: 85,
    },
    customInstructions: "Focus on data and logical analysis",
    createdAt: "2023-01-02T00:00:00.000Z",
    updatedAt: "2023-01-02T00:00:00.000Z",
  };

  const validCompleteData = {
    schemaVersion: PERSONALITIES_SCHEMA_VERSION,
    personalities: [validPersonality1, validPersonality2],
    lastUpdated: "2023-01-02T00:00:00.000Z",
  };

  describe("valid complete file data", () => {
    it("should pass validation for valid complete file", () => {
      const result = validatePersonalitiesData(validCompleteData);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });

    it("should accept empty personalities array", () => {
      const emptyData = {
        schemaVersion: PERSONALITIES_SCHEMA_VERSION,
        personalities: [],
        lastUpdated: "2023-01-01T00:00:00.000Z",
      };

      const result = validatePersonalitiesData(emptyData);
      expect(result.isValid).toBe(true);
    });

    it("should accept minimal valid file structure", () => {
      const minimal = {
        schemaVersion: PERSONALITIES_SCHEMA_VERSION,
        personalities: [
          {
            id: "min",
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
          },
        ],
        lastUpdated: "2023-01-01T00:00:00.000Z",
      };

      const result = validatePersonalitiesData(minimal);
      expect(result.isValid).toBe(true);
    });
  });

  describe("null/undefined input", () => {
    it("should reject null input", () => {
      const result = validatePersonalitiesData(null);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Personalities data is required and cannot be null or undefined",
      );
    });

    it("should reject undefined input", () => {
      const result = validatePersonalitiesData(undefined);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Personalities data is required and cannot be null or undefined",
      );
    });
  });

  describe("file structure validation", () => {
    it("should reject missing schema version", () => {
      const { schemaVersion: _, ...invalid } = validCompleteData;
      const result = validatePersonalitiesData(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("schemaVersion");
    });

    it("should reject invalid schema version", () => {
      const invalid = {
        ...validCompleteData,
        schemaVersion: "",
      };
      const result = validatePersonalitiesData(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("schemaVersion");
      expect(result.error).toContain("cannot be empty");
    });

    it("should reject missing personalities array", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { personalities: _, ...invalid } = validCompleteData;
      const result = validatePersonalitiesData(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("personalities");
    });

    it("should reject non-array personalities", () => {
      const invalid = {
        ...validCompleteData,
        personalities: "not-an-array",
      };
      const result = validatePersonalitiesData(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("personalities");
      expect(result.error).toContain("array");
    });

    it("should reject missing lastUpdated", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { lastUpdated: _, ...invalid } = validCompleteData;
      const result = validatePersonalitiesData(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("lastUpdated");
    });

    it("should reject invalid lastUpdated format", () => {
      const invalid = {
        ...validCompleteData,
        lastUpdated: "invalid-date",
      };
      const result = validatePersonalitiesData(invalid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("lastUpdated");
      expect(result.error).toContain("valid ISO datetime");
    });
  });

  describe("duplicate ID detection", () => {
    it("should reject duplicate personality IDs", () => {
      const withDuplicateIds = {
        ...validCompleteData,
        personalities: [
          validPersonality1,
          { ...validPersonality2, id: "personality-1" }, // Duplicate ID
        ],
      };

      const result = validatePersonalitiesData(withDuplicateIds);

      expect(result.isValid).toBe(false);
      expect(result.error || result.errors?.join(" ")).toContain(
        "Duplicate personality ID 'personality-1'",
      );
      expect(result.error || result.errors?.join(" ")).toContain("index 1");
    });

    it("should detect multiple duplicate IDs", () => {
      const withMultipleDuplicates = {
        ...validCompleteData,
        personalities: [
          validPersonality1,
          { ...validPersonality2, id: "personality-1" },
          { ...validPersonality1, id: "personality-2" },
        ],
      };

      const result = validatePersonalitiesData(withMultipleDuplicates);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(1);
    });
  });

  describe("duplicate name detection (case-insensitive)", () => {
    it("should reject duplicate personality names", () => {
      const withDuplicateNames = {
        ...validCompleteData,
        personalities: [
          validPersonality1,
          { ...validPersonality2, name: "Creative Thinker" }, // Duplicate name
        ],
      };

      const result = validatePersonalitiesData(withDuplicateNames);

      expect(result.isValid).toBe(false);
      expect(result.error || result.errors?.join(" ")).toContain(
        "Duplicate personality name 'Creative Thinker'",
      );
      expect(result.error || result.errors?.join(" ")).toContain("index 1");
    });

    it("should reject duplicate names with different case", () => {
      const withCaseInsensitiveDuplicate = {
        ...validCompleteData,
        personalities: [
          validPersonality1,
          { ...validPersonality2, name: "CREATIVE THINKER" }, // Case-insensitive duplicate
        ],
      };

      const result = validatePersonalitiesData(withCaseInsensitiveDuplicate);

      expect(result.isValid).toBe(false);
      expect(result.error || result.errors?.join(" ")).toContain(
        "Duplicate personality name 'CREATIVE THINKER'",
      );
      expect(result.error || result.errors?.join(" ")).toContain(
        "case-insensitive match",
      );
    });
  });

  describe("individual personality validation", () => {
    it("should reject file with invalid personality", () => {
      const withInvalidPersonality = {
        ...validCompleteData,
        personalities: [
          validPersonality1,
          {
            ...validPersonality2,
            bigFive: {
              ...validPersonality2.bigFive,
              openness: 150, // Invalid value
            },
          },
        ],
      };

      const result = validatePersonalitiesData(withInvalidPersonality);

      expect(result.isValid).toBe(false);
      expect(result.error || result.errors?.join(" ")).toContain(
        "Personality 1",
      );
      expect(result.error || result.errors?.join(" ")).toContain("openness");
      expect(result.error || result.errors?.join(" ")).toContain(
        "cannot exceed 100",
      );
    });

    it("should aggregate multiple personality validation errors", () => {
      const withMultipleInvalidPersonalities = {
        ...validCompleteData,
        personalities: [
          {
            ...validPersonality1,
            id: "", // Invalid ID
          },
          {
            ...validPersonality2,
            name: "", // Invalid name
          },
        ],
      };

      const result = validatePersonalitiesData(
        withMultipleInvalidPersonalities,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(
        result.errors!.some((error) => error.includes("Personality 0")),
      ).toBe(true);
      expect(
        result.errors!.some((error) => error.includes("Personality 1")),
      ).toBe(true);
    });
  });

  describe("error aggregation", () => {
    it("should combine global and individual personality errors", () => {
      const withBothTypes = {
        ...validCompleteData,
        personalities: [
          validPersonality1,
          { ...validPersonality1, id: "personality-1" }, // Duplicate ID + reuse same object
          {
            ...validPersonality2,
            bigFive: {
              ...validPersonality2.bigFive,
              openness: -5, // Invalid trait value
            },
          },
        ],
      };

      const result = validatePersonalitiesData(withBothTypes);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      // Should have duplicate ID error and personality validation error
      expect(result.errors!.some((error) => error.includes("Duplicate"))).toBe(
        true,
      );
      expect(
        result.errors!.some((error) => error.includes("Personality 2")),
      ).toBe(true);
    });
  });

  describe("malformed input handling", () => {
    it("should handle string input gracefully", () => {
      const result = validatePersonalitiesData("invalid");

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle number input gracefully", () => {
      const result = validatePersonalitiesData(123);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle boolean input gracefully", () => {
      const result = validatePersonalitiesData(true);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle array input gracefully", () => {
      const result = validatePersonalitiesData([]);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

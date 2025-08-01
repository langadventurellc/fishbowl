import { mapAdvancedSettingsUIToPersistence } from "../mapAdvancedSettingsUIToPersistence";
import type { AdvancedSettingsFormData } from "../../../types/settings/advancedSettings";
import type { PersistedAdvancedSettingsData } from "@fishbowl-ai/shared";

describe("mapAdvancedSettingsUIToPersistence", () => {
  describe("successful mapping", () => {
    it("should map valid UI data to persistence format", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: true,
      };

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result).toEqual<PersistedAdvancedSettingsData>({
        debugMode: true,
        experimentalFeatures: true,
      });
    });

    it("should map false values correctly", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: false,
        experimentalFeatures: false,
      };

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result).toEqual<PersistedAdvancedSettingsData>({
        debugMode: false,
        experimentalFeatures: false,
      });
    });

    it("should map mixed boolean values correctly", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result).toEqual<PersistedAdvancedSettingsData>({
        debugMode: true,
        experimentalFeatures: false,
      });
    });
  });

  describe("boolean coercion", () => {
    it("should coerce string 'true' to boolean true", () => {
      const uiData = {
        debugLogging: "true" as unknown,
        experimentalFeatures: "false" as unknown,
      } as AdvancedSettingsFormData;

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result.debugMode).toBe(true);
      expect(result.experimentalFeatures).toBe(false);
    });

    it("should coerce numeric values correctly", () => {
      const uiData = {
        debugLogging: 1 as unknown,
        experimentalFeatures: 0 as unknown,
      } as AdvancedSettingsFormData;

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result.debugMode).toBe(true);
      expect(result.experimentalFeatures).toBe(false);
    });

    it("should coerce string representations correctly", () => {
      const testCases = [
        { input: "1", expected: true },
        { input: "0", expected: false },
        { input: "yes", expected: true },
        { input: "no", expected: false },
        { input: "YES", expected: true },
        { input: "NO", expected: false },
        { input: " true ", expected: true },
        { input: " false ", expected: false },
      ];

      testCases.forEach(({ input, expected }) => {
        const uiData = {
          debugLogging: input as unknown,
          experimentalFeatures: false,
        } as AdvancedSettingsFormData;

        const result = mapAdvancedSettingsUIToPersistence(uiData);
        expect(result.debugMode).toBe(expected);
      });
    });

    it("should handle invalid string values according to Boolean coercion", () => {
      const testCases = [
        { input: "invalid", expected: true }, // Non-empty string is truthy
        { input: "maybe", expected: true }, // Non-empty string is truthy
        { input: "null", expected: true }, // Non-empty string is truthy
        { input: "undefined", expected: true }, // Non-empty string is truthy
        { input: "", expected: false }, // Empty string is falsy
      ];

      testCases.forEach(({ input, expected }) => {
        const uiData = {
          debugLogging: input as unknown,
          experimentalFeatures: false,
        } as AdvancedSettingsFormData;

        const result = mapAdvancedSettingsUIToPersistence(uiData);
        expect(result.debugMode).toBe(expected);
      });
    });

    it("should handle various numeric edge cases", () => {
      const testCases = [
        { input: 0, expected: false },
        { input: 1, expected: true },
        { input: -1, expected: true },
        { input: 42, expected: true },
        { input: 0.1, expected: true },
        { input: NaN, expected: false },
        { input: Infinity, expected: true },
        { input: -Infinity, expected: true },
      ];

      testCases.forEach(({ input, expected }) => {
        const uiData = {
          debugLogging: input as unknown,
          experimentalFeatures: false,
        } as AdvancedSettingsFormData;

        const result = mapAdvancedSettingsUIToPersistence(uiData);
        expect(result.debugMode).toBe(expected);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle null input by coercing to false", () => {
      const uiData = {
        debugLogging: null as unknown,
        experimentalFeatures: null as unknown,
      } as AdvancedSettingsFormData;

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result).toEqual<PersistedAdvancedSettingsData>({
        debugMode: false,
        experimentalFeatures: false,
      });
    });

    it("should handle undefined input by coercing to false", () => {
      const uiData = {
        debugLogging: undefined as unknown,
        experimentalFeatures: undefined as unknown,
      } as AdvancedSettingsFormData;

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result).toEqual<PersistedAdvancedSettingsData>({
        debugMode: false,
        experimentalFeatures: false,
      });
    });

    it("should handle complex objects by coercing to truthy/falsy", () => {
      const testCases = [
        { input: {}, expected: true }, // Empty object is truthy in Boolean context
        { input: { prop: true }, expected: true }, // Non-empty object is truthy
        { input: [], expected: true }, // Empty array is truthy in Boolean context
        { input: [1, 2, 3], expected: true }, // Non-empty array is truthy
        { input: new Date(), expected: true }, // Objects are truthy
      ];

      testCases.forEach(({ input, expected }) => {
        const uiData = {
          debugLogging: input as unknown,
          experimentalFeatures: false,
        } as AdvancedSettingsFormData;

        const result = mapAdvancedSettingsUIToPersistence(uiData);
        expect(result.debugMode).toBe(expected);
      });
    });
  });

  describe("field name mapping", () => {
    it("should correctly map debugLogging to debugMode", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result).toHaveProperty("debugMode", true);
      expect(result).not.toHaveProperty("debugLogging");
    });

    it("should preserve experimentalFeatures field name", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: false,
        experimentalFeatures: true,
      };

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result).toHaveProperty("experimentalFeatures", true);
    });
  });

  describe("schema validation", () => {
    it("should validate the mapped data against the schema", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: true,
      };

      // Should not throw error for valid data
      expect(() => mapAdvancedSettingsUIToPersistence(uiData)).not.toThrow();
    });

    it("should return data with schema defaults applied", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: true,
      };

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      // Schema validation should ensure all required fields are present
      expect(result).toHaveProperty("debugMode");
      expect(result).toHaveProperty("experimentalFeatures");
      expect(typeof result.debugMode).toBe("boolean");
      expect(typeof result.experimentalFeatures).toBe("boolean");
    });
  });

  describe("security validation", () => {
    it("should default all options to false when coercion results in falsy values", () => {
      const falsyInputs = [null, undefined, 0, "", false, NaN];

      falsyInputs.forEach((falsyValue) => {
        const uiData = {
          debugLogging: falsyValue as unknown,
          experimentalFeatures: falsyValue as unknown,
        } as AdvancedSettingsFormData;

        const result = mapAdvancedSettingsUIToPersistence(uiData);
        expect(result.debugMode).toBe(false);
        expect(result.experimentalFeatures).toBe(false);
      });
    });

    it("should handle potentially dangerous input types safely", () => {
      const dangerousInputs = [
        (): boolean => true, // Function
        Symbol("test"), // Symbol
        Promise.resolve(true), // Promise
        new Map([["key", "value"]]), // Map
        new Set([1, 2, 3]), // Set
      ];

      dangerousInputs.forEach((dangerousValue) => {
        const uiData = {
          debugLogging: dangerousValue as unknown,
          experimentalFeatures: false,
        } as AdvancedSettingsFormData;

        const result = mapAdvancedSettingsUIToPersistence(uiData);
        // All of these should coerce to true via Boolean() since they're truthy objects
        expect(result.debugMode).toBe(true);
        expect(typeof result.debugMode).toBe("boolean");
      });
    });
  });

  describe("type safety", () => {
    it("should maintain TypeScript type safety", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: false,
        experimentalFeatures: true,
      };

      const result: PersistedAdvancedSettingsData =
        mapAdvancedSettingsUIToPersistence(uiData);

      // TypeScript ensures these properties exist and are the correct type
      expect(typeof result.debugMode).toBe("boolean");
      expect(typeof result.experimentalFeatures).toBe("boolean");
    });

    it("should return a complete PersistedAdvancedSettingsData object", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: true,
      };

      const result = mapAdvancedSettingsUIToPersistence(uiData);

      // Verify the result has all expected properties
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(["debugMode", "experimentalFeatures"]),
      );
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  describe("functional purity", () => {
    it("should not modify the input data", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      const originalData = { ...uiData };
      mapAdvancedSettingsUIToPersistence(uiData);

      expect(uiData).toEqual(originalData);
    });

    it("should return a new object instance", () => {
      const uiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      const result1 = mapAdvancedSettingsUIToPersistence(uiData);
      const result2 = mapAdvancedSettingsUIToPersistence(uiData);

      expect(result1).not.toBe(result2); // Different object instances
      expect(result1).toEqual(result2); // But with the same values
    });
  });
});

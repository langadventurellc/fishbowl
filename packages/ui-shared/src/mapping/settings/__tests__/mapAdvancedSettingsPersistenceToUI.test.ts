import { mapAdvancedSettingsPersistenceToUI } from "../mapAdvancedSettingsPersistenceToUI";
import { mapAdvancedSettingsUIToPersistence } from "../mapAdvancedSettingsUIToPersistence";
import type { PersistedAdvancedSettingsData } from "@fishbowl-ai/shared";
import type { AdvancedSettingsFormData } from "../../../types/settings/advancedSettings";
import { defaultAdvancedSettings } from "../../../types/settings/advancedSettings";

describe("mapAdvancedSettingsPersistenceToUI", () => {
  describe("successful mapping", () => {
    it("should map all fields correctly with valid data", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: true,
        experimentalFeatures: true,
      };

      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toEqual<AdvancedSettingsFormData>({
        debugLogging: true,
        experimentalFeatures: true,
      });
    });

    it("should map false values correctly", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: false,
        experimentalFeatures: false,
      };

      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toEqual<AdvancedSettingsFormData>({
        debugLogging: false,
        experimentalFeatures: false,
      });
    });

    it("should map mixed boolean values correctly", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: true,
        experimentalFeatures: false,
      };

      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toEqual<AdvancedSettingsFormData>({
        debugLogging: true,
        experimentalFeatures: false,
      });
    });
  });

  describe("default value handling", () => {
    it("should apply defaults for missing fields", () => {
      const partialData = {
        debugMode: true,
      } as unknown as PersistedAdvancedSettingsData;

      const result = mapAdvancedSettingsPersistenceToUI(partialData);

      expect(result).toEqual<AdvancedSettingsFormData>({
        debugLogging: true,
        experimentalFeatures: false, // defaultAdvancedSettings.experimentalFeatures
      });
    });

    it("should apply defaults for empty object", () => {
      const emptyData = {} as PersistedAdvancedSettingsData;

      const result = mapAdvancedSettingsPersistenceToUI(emptyData);

      expect(result).toEqual(defaultAdvancedSettings);
    });

    it("should handle null/undefined values with defaults", () => {
      const nullishData = {
        debugMode: null,
        experimentalFeatures: undefined,
      } as unknown as PersistedAdvancedSettingsData;

      const result = mapAdvancedSettingsPersistenceToUI(nullishData);

      expect(result).toEqual(defaultAdvancedSettings);
    });

    it("should use defaults for all undefined fields", () => {
      const undefinedData = {
        debugMode: undefined,
        experimentalFeatures: undefined,
      } as unknown as PersistedAdvancedSettingsData;

      const result = mapAdvancedSettingsPersistenceToUI(undefinedData);

      expect(result).toEqual<AdvancedSettingsFormData>({
        debugLogging: false,
        experimentalFeatures: false,
      });
    });
  });

  describe("boolean coercion", () => {
    it("should coerce string boolean values correctly", () => {
      const stringBoolean = {
        debugMode: "true" as unknown,
        experimentalFeatures: "false" as unknown,
      } as PersistedAdvancedSettingsData;

      const result = mapAdvancedSettingsPersistenceToUI(stringBoolean);

      expect(result.debugLogging).toBe(true);
      expect(result.experimentalFeatures).toBe(false);
    });

    it("should coerce numeric boolean values correctly", () => {
      const numericBoolean = {
        debugMode: 1 as unknown,
        experimentalFeatures: 0 as unknown,
      } as PersistedAdvancedSettingsData;

      const result = mapAdvancedSettingsPersistenceToUI(numericBoolean);

      expect(result.debugLogging).toBe(true);
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
        const persistedData = {
          debugMode: input as unknown,
          experimentalFeatures: false,
        } as PersistedAdvancedSettingsData;

        const result = mapAdvancedSettingsPersistenceToUI(persistedData);
        expect(result.debugLogging).toBe(expected);
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
        const persistedData = {
          debugMode: input as unknown,
          experimentalFeatures: false,
        } as PersistedAdvancedSettingsData;

        const result = mapAdvancedSettingsPersistenceToUI(persistedData);
        expect(result.debugLogging).toBe(expected);
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
        const persistedData = {
          debugMode: input as unknown,
          experimentalFeatures: false,
        } as PersistedAdvancedSettingsData;

        const result = mapAdvancedSettingsPersistenceToUI(persistedData);
        expect(result.debugLogging).toBe(expected);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle complex objects by coercing to truthy/falsy", () => {
      const testCases = [
        { input: {}, expected: true }, // Empty object is truthy
        { input: { prop: true }, expected: true }, // Non-empty object is truthy
        { input: [], expected: true }, // Empty array is truthy
        { input: [1, 2, 3], expected: true }, // Non-empty array is truthy
        { input: new Date(), expected: true }, // Objects are truthy
      ];

      testCases.forEach(({ input, expected }) => {
        const persistedData = {
          debugMode: input as unknown,
          experimentalFeatures: false,
        } as PersistedAdvancedSettingsData;

        const result = mapAdvancedSettingsPersistenceToUI(persistedData);
        expect(result.debugLogging).toBe(expected);
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
        const persistedData = {
          debugMode: dangerousValue as unknown,
          experimentalFeatures: false,
        } as PersistedAdvancedSettingsData;

        const result = mapAdvancedSettingsPersistenceToUI(persistedData);
        // All of these should coerce to true via Boolean() since they're truthy objects
        expect(result.debugLogging).toBe(true);
        expect(typeof result.debugLogging).toBe("boolean");
      });
    });
  });

  describe("field name mapping", () => {
    it("should correctly map debugMode to debugLogging", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: true,
        experimentalFeatures: false,
      };

      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toHaveProperty("debugLogging", true);
      expect(result).not.toHaveProperty("debugMode");
    });

    it("should preserve experimentalFeatures field name", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: false,
        experimentalFeatures: true,
      };

      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toHaveProperty("experimentalFeatures", true);
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain data fidelity through UI->Persistence->UI conversion", () => {
      const originalUiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      const persistedData = mapAdvancedSettingsUIToPersistence(originalUiData);
      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toEqual(originalUiData);
    });

    it("should maintain false values through conversion", () => {
      const originalUiData: AdvancedSettingsFormData = {
        debugLogging: false,
        experimentalFeatures: false,
      };

      const persistedData = mapAdvancedSettingsUIToPersistence(originalUiData);
      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toEqual(originalUiData);
    });

    it("should maintain true values through conversion", () => {
      const originalUiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: true,
      };

      const persistedData = mapAdvancedSettingsUIToPersistence(originalUiData);
      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toEqual(originalUiData);
    });

    it("should maintain mixed values through conversion", () => {
      const originalUiData: AdvancedSettingsFormData = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      const persistedData = mapAdvancedSettingsUIToPersistence(originalUiData);
      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result).toEqual(originalUiData);
    });
  });

  describe("security validation", () => {
    it("should default all options to false when coercion results in security-safe values", () => {
      const falsyInputs = [null, undefined, 0, "", false, NaN];

      falsyInputs.forEach((falsyValue) => {
        const persistedData = {
          debugMode: falsyValue as unknown,
          experimentalFeatures: falsyValue as unknown,
        } as PersistedAdvancedSettingsData;

        const result = mapAdvancedSettingsPersistenceToUI(persistedData);
        expect(result.debugLogging).toBe(false);
        expect(result.experimentalFeatures).toBe(false);
      });
    });

    it("should apply security defaults for completely empty input", () => {
      const emptyData = {} as PersistedAdvancedSettingsData;

      const result = mapAdvancedSettingsPersistenceToUI(emptyData);

      // All developer options should default to false for security
      expect(result.debugLogging).toBe(false);
      expect(result.experimentalFeatures).toBe(false);
    });
  });

  describe("type safety", () => {
    it("should maintain TypeScript type safety", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: false,
        experimentalFeatures: true,
      };

      const result: AdvancedSettingsFormData =
        mapAdvancedSettingsPersistenceToUI(persistedData);

      // TypeScript ensures these properties exist and are the correct type
      expect(typeof result.debugLogging).toBe("boolean");
      expect(typeof result.experimentalFeatures).toBe("boolean");
    });

    it("should return a complete AdvancedSettingsFormData object", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: true,
        experimentalFeatures: true,
      };

      const result = mapAdvancedSettingsPersistenceToUI(persistedData);

      // Verify the result has all expected properties
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(["debugLogging", "experimentalFeatures"]),
      );
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  describe("functional purity", () => {
    it("should not modify the input data", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: true,
        experimentalFeatures: false,
      };

      const originalData = { ...persistedData };
      mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(persistedData).toEqual(originalData);
    });

    it("should return a new object instance", () => {
      const persistedData: PersistedAdvancedSettingsData = {
        debugMode: true,
        experimentalFeatures: false,
      };

      const result1 = mapAdvancedSettingsPersistenceToUI(persistedData);
      const result2 = mapAdvancedSettingsPersistenceToUI(persistedData);

      expect(result1).not.toBe(result2); // Different object instances
      expect(result1).toEqual(result2); // But with the same values
    });
  });

  describe("boundary testing", () => {
    it("should handle boolean boundary values correctly", () => {
      const trueBoundary: PersistedAdvancedSettingsData = {
        debugMode: true,
        experimentalFeatures: true,
      };

      const falseBoundary: PersistedAdvancedSettingsData = {
        debugMode: false,
        experimentalFeatures: false,
      };

      expect(mapAdvancedSettingsPersistenceToUI(trueBoundary)).toEqual({
        debugLogging: true,
        experimentalFeatures: true,
      });

      expect(mapAdvancedSettingsPersistenceToUI(falseBoundary)).toEqual({
        debugLogging: false,
        experimentalFeatures: false,
      });
    });
  });

  describe("consistency with defaults", () => {
    it("should produce result consistent with defaultAdvancedSettings structure", () => {
      const emptyData = {} as PersistedAdvancedSettingsData;
      const result = mapAdvancedSettingsPersistenceToUI(emptyData);

      // Result should have same keys as defaults
      expect(Object.keys(result).sort()).toEqual(
        Object.keys(defaultAdvancedSettings).sort(),
      );

      // All values should match defaults when no data provided
      expect(result).toEqual(defaultAdvancedSettings);
    });
  });
});

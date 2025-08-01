import { mapAppearanceSettingsPersistenceToUI } from "../mapAppearanceSettingsPersistenceToUI";
import type { PersistedAppearanceSettingsData } from "@fishbowl-ai/shared";
import { defaultAppearanceSettings } from "../../../types/settings/appearanceSettings";

describe("mapAppearanceSettingsPersistenceToUI", () => {
  it("should map all fields correctly with valid data", () => {
    const persistedData: PersistedAppearanceSettingsData = {
      theme: "dark",
      showTimestamps: "hover",
      showActivityTime: false,
      compactList: true,
      fontSize: 16,
      messageSpacing: "compact",
    };

    const result = mapAppearanceSettingsPersistenceToUI(persistedData);

    expect(result).toEqual({
      theme: "dark",
      showTimestamps: "hover",
      showActivityTime: false,
      compactList: true,
      fontSize: 16,
      messageSpacing: "compact",
    });
  });

  it("should return default values when input is null", () => {
    const result = mapAppearanceSettingsPersistenceToUI(null);
    expect(result).toEqual(defaultAppearanceSettings);
  });

  it("should return default values when input is undefined", () => {
    const result = mapAppearanceSettingsPersistenceToUI(undefined);
    expect(result).toEqual(defaultAppearanceSettings);
  });

  it("should apply defaults for missing fields", () => {
    const partialData = {
      theme: "light",
      fontSize: 18,
    } as unknown as PersistedAppearanceSettingsData;

    const result = mapAppearanceSettingsPersistenceToUI(partialData);

    expect(result).toEqual({
      theme: "light",
      showTimestamps: defaultAppearanceSettings.showTimestamps,
      showActivityTime: defaultAppearanceSettings.showActivityTime,
      compactList: defaultAppearanceSettings.compactList,
      fontSize: 18,
      messageSpacing: defaultAppearanceSettings.messageSpacing,
    });
  });

  it("should normalize invalid enum values to defaults", () => {
    const invalidEnums = {
      theme: "invalid-theme",
      showTimestamps: "invalid-timestamp",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "invalid-spacing",
    } as unknown as PersistedAppearanceSettingsData;

    const result = mapAppearanceSettingsPersistenceToUI(invalidEnums);

    expect(result.theme).toBe(defaultAppearanceSettings.theme);
    expect(result.showTimestamps).toBe(
      defaultAppearanceSettings.showTimestamps,
    );
    expect(result.messageSpacing).toBe(
      defaultAppearanceSettings.messageSpacing,
    );
    expect(result.showActivityTime).toBe(true);
    expect(result.compactList).toBe(false);
    expect(result.fontSize).toBe(14);
  });

  it("should coerce boolean values correctly", () => {
    const stringBooleans = {
      ...defaultAppearanceSettings,
      showActivityTime: "true",
      compactList: "false",
    } as unknown as PersistedAppearanceSettingsData;

    const numberBooleans = {
      ...defaultAppearanceSettings,
      showActivityTime: 1,
      compactList: 0,
    } as unknown as PersistedAppearanceSettingsData;

    const stringResult = mapAppearanceSettingsPersistenceToUI(stringBooleans);
    const numberResult = mapAppearanceSettingsPersistenceToUI(numberBooleans);

    expect(stringResult.showActivityTime).toBe(true);
    expect(stringResult.compactList).toBe(false);
    expect(numberResult.showActivityTime).toBe(true);
    expect(numberResult.compactList).toBe(false);
  });

  it("should clamp fontSize to valid UI range (12-20)", () => {
    const testCases = [
      { input: 8, expected: 12 },
      { input: 12, expected: 12 },
      { input: 16, expected: 16 },
      { input: 18, expected: 18 },
      { input: 20, expected: 20 },
      { input: 25, expected: 20 },
    ];

    testCases.forEach(({ input, expected }) => {
      const persistedData: PersistedAppearanceSettingsData = {
        ...defaultAppearanceSettings,
        fontSize: input,
      };

      const result = mapAppearanceSettingsPersistenceToUI(persistedData);
      expect(result.fontSize).toBe(expected);
    });
  });

  it("should handle invalid fontSize values with defaults", () => {
    const invalidValues = [
      { fontSize: null },
      { fontSize: undefined },
      { fontSize: "not-a-number" },
      { fontSize: NaN },
      { fontSize: {} },
      { fontSize: [] },
    ];

    invalidValues.forEach((partialData) => {
      const persistedData = {
        ...defaultAppearanceSettings,
        ...partialData,
      } as unknown as PersistedAppearanceSettingsData;

      const result = mapAppearanceSettingsPersistenceToUI(persistedData);
      expect(result.fontSize).toBe(defaultAppearanceSettings.fontSize);
    });
  });

  it("should handle null/undefined individual field values with defaults", () => {
    const nullishData = {
      theme: null,
      showTimestamps: undefined,
      showActivityTime: null,
      compactList: undefined,
      fontSize: null,
      messageSpacing: undefined,
    } as unknown as PersistedAppearanceSettingsData;

    const result = mapAppearanceSettingsPersistenceToUI(nullishData);

    expect(result).toEqual(defaultAppearanceSettings);
  });

  it("should handle empty object with all defaults", () => {
    const emptyData = {} as PersistedAppearanceSettingsData;

    const result = mapAppearanceSettingsPersistenceToUI(emptyData);

    expect(result).toEqual(defaultAppearanceSettings);
  });

  it("should handle boundary values correctly", () => {
    const boundaryData: PersistedAppearanceSettingsData = {
      theme: "system",
      showTimestamps: "never",
      showActivityTime: false,
      compactList: true,
      fontSize: 12,
      messageSpacing: "relaxed",
    };

    const result = mapAppearanceSettingsPersistenceToUI(boundaryData);

    expect(result).toEqual(boundaryData);
  });

  it("should handle round-trip conversion maintaining data fidelity", () => {
    const originalData: PersistedAppearanceSettingsData = {
      theme: "dark",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 16,
      messageSpacing: "normal",
    };

    const converted = mapAppearanceSettingsPersistenceToUI(originalData);

    expect(converted).toEqual({
      theme: "dark",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 16,
      messageSpacing: "normal",
    });
  });

  it("should handle all valid enum combinations", () => {
    const allEnumCombinations = [
      {
        theme: "light" as const,
        showTimestamps: "always" as const,
        messageSpacing: "compact" as const,
      },
      {
        theme: "dark" as const,
        showTimestamps: "hover" as const,
        messageSpacing: "normal" as const,
      },
      {
        theme: "system" as const,
        showTimestamps: "never" as const,
        messageSpacing: "relaxed" as const,
      },
    ];

    allEnumCombinations.forEach((enums) => {
      const persistedData: PersistedAppearanceSettingsData = {
        ...defaultAppearanceSettings,
        ...enums,
      };

      const result = mapAppearanceSettingsPersistenceToUI(persistedData);

      expect(result.theme).toBe(enums.theme);
      expect(result.showTimestamps).toBe(enums.showTimestamps);
      expect(result.messageSpacing).toBe(enums.messageSpacing);
    });
  });

  it("should handle mixed valid and invalid data", () => {
    const mixedData = {
      theme: "light", // valid
      showTimestamps: "invalid", // invalid - should use default
      showActivityTime: "yes", // truthy string - should become true
      compactList: 0, // falsy number - should become false
      fontSize: 25, // out of range - should clamp to 20
      messageSpacing: "normal", // valid
    } as unknown as PersistedAppearanceSettingsData;

    const result = mapAppearanceSettingsPersistenceToUI(mixedData);

    expect(result.theme).toBe("light");
    expect(result.showTimestamps).toBe(
      defaultAppearanceSettings.showTimestamps,
    );
    expect(result.showActivityTime).toBe(true);
    expect(result.compactList).toBe(false);
    expect(result.fontSize).toBe(20);
    expect(result.messageSpacing).toBe("normal");
  });

  it("should coerce various truthy/falsy values to booleans", () => {
    const truthyValues = ["true", "yes", "1", 1, true, "any-string"];
    const falsyValues = ["false", "no", "0", 0, false, "", null, undefined];

    truthyValues.forEach((value) => {
      const data = {
        ...defaultAppearanceSettings,
        showActivityTime: value,
      } as unknown as PersistedAppearanceSettingsData;

      const result = mapAppearanceSettingsPersistenceToUI(data);
      expect(result.showActivityTime).toBe(true);
    });

    falsyValues.forEach((value) => {
      const data = {
        ...defaultAppearanceSettings,
        compactList: value,
      } as unknown as PersistedAppearanceSettingsData;

      const result = mapAppearanceSettingsPersistenceToUI(data);
      expect(result.compactList).toBe(false);
    });
  });
});

import { mapAppearanceSettingsUIToPersistence } from "../mapAppearanceSettingsUIToPersistence";
import type { AppearanceSettingsFormData } from "../../../types/settings/appearanceSettings";

describe("mapAppearanceSettingsUIToPersistence", () => {
  it("should map all fields correctly with valid data", () => {
    const uiData: AppearanceSettingsFormData = {
      theme: "dark",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: false,
      fontSize: 16,
      messageSpacing: "normal",
    };

    const result = mapAppearanceSettingsUIToPersistence(uiData);

    expect(result).toEqual({
      theme: "dark",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: false,
      fontSize: 16,
      messageSpacing: "normal",
    });
  });

  it("should clamp fontSize to persistence layer's valid range", () => {
    const tooLowFontSize: AppearanceSettingsFormData = {
      theme: "light",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 8, // Below minimum (12)
      messageSpacing: "compact",
    };

    const tooHighFontSize: AppearanceSettingsFormData = {
      theme: "system",
      showTimestamps: "never",
      showActivityTime: false,
      compactList: true,
      fontSize: 25, // Above persistence maximum (18)
      messageSpacing: "relaxed",
    };

    expect(mapAppearanceSettingsUIToPersistence(tooLowFontSize).fontSize).toBe(
      12,
    );
    expect(mapAppearanceSettingsUIToPersistence(tooHighFontSize).fontSize).toBe(
      18,
    );
  });

  it("should handle edge case fontSize values at boundaries", () => {
    const minFontSize: AppearanceSettingsFormData = {
      theme: "light",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 12, // Minimum valid value
      messageSpacing: "compact",
    };

    const maxFontSize: AppearanceSettingsFormData = {
      theme: "dark",
      showTimestamps: "hover",
      showActivityTime: false,
      compactList: true,
      fontSize: 18, // Maximum valid value for persistence
      messageSpacing: "relaxed",
    };

    const minResult = mapAppearanceSettingsUIToPersistence(minFontSize);
    const maxResult = mapAppearanceSettingsUIToPersistence(maxFontSize);

    expect(minResult.fontSize).toBe(12);
    expect(maxResult.fontSize).toBe(18);
    expect(minResult).toEqual(minFontSize);
    expect(maxResult).toEqual(maxFontSize);
  });

  it("should handle all theme variations", () => {
    const lightTheme: AppearanceSettingsFormData = {
      theme: "light",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    };

    const darkTheme: AppearanceSettingsFormData = {
      ...lightTheme,
      theme: "dark",
    };

    const systemTheme: AppearanceSettingsFormData = {
      ...lightTheme,
      theme: "system",
    };

    expect(mapAppearanceSettingsUIToPersistence(lightTheme).theme).toBe(
      "light",
    );
    expect(mapAppearanceSettingsUIToPersistence(darkTheme).theme).toBe("dark");
    expect(mapAppearanceSettingsUIToPersistence(systemTheme).theme).toBe(
      "system",
    );
  });

  it("should handle all showTimestamps variations", () => {
    const baseData: AppearanceSettingsFormData = {
      theme: "system",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    };

    const alwaysTimestamps = { ...baseData, showTimestamps: "always" as const };
    const hoverTimestamps = { ...baseData, showTimestamps: "hover" as const };
    const neverTimestamps = { ...baseData, showTimestamps: "never" as const };

    expect(
      mapAppearanceSettingsUIToPersistence(alwaysTimestamps).showTimestamps,
    ).toBe("always");
    expect(
      mapAppearanceSettingsUIToPersistence(hoverTimestamps).showTimestamps,
    ).toBe("hover");
    expect(
      mapAppearanceSettingsUIToPersistence(neverTimestamps).showTimestamps,
    ).toBe("never");
  });

  it("should handle all messageSpacing variations", () => {
    const baseData: AppearanceSettingsFormData = {
      theme: "system",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    };

    const compactSpacing = { ...baseData, messageSpacing: "compact" as const };
    const normalSpacing = { ...baseData, messageSpacing: "normal" as const };
    const relaxedSpacing = { ...baseData, messageSpacing: "relaxed" as const };

    expect(
      mapAppearanceSettingsUIToPersistence(compactSpacing).messageSpacing,
    ).toBe("compact");
    expect(
      mapAppearanceSettingsUIToPersistence(normalSpacing).messageSpacing,
    ).toBe("normal");
    expect(
      mapAppearanceSettingsUIToPersistence(relaxedSpacing).messageSpacing,
    ).toBe("relaxed");
  });

  it("should handle boolean display preferences", () => {
    const allTrue: AppearanceSettingsFormData = {
      theme: "system",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: true,
      fontSize: 14,
      messageSpacing: "normal",
    };

    const allFalse: AppearanceSettingsFormData = {
      theme: "system",
      showTimestamps: "hover",
      showActivityTime: false,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    };

    const trueResult = mapAppearanceSettingsUIToPersistence(allTrue);
    const falseResult = mapAppearanceSettingsUIToPersistence(allFalse);

    expect(trueResult.showActivityTime).toBe(true);
    expect(trueResult.compactList).toBe(true);
    expect(falseResult.showActivityTime).toBe(false);
    expect(falseResult.compactList).toBe(false);
  });

  it("should pass schema validation with valid data", () => {
    const validData: AppearanceSettingsFormData = {
      theme: "dark",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: false,
      fontSize: 16,
      messageSpacing: "normal",
    };

    expect(() => mapAppearanceSettingsUIToPersistence(validData)).not.toThrow();
  });

  it("should throw error for invalid theme values", () => {
    const invalidTheme = {
      theme: "invalid-theme",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    } as unknown as AppearanceSettingsFormData;

    expect(() => mapAppearanceSettingsUIToPersistence(invalidTheme)).toThrow(
      /Invalid appearance settings data/,
    );
  });

  it("should throw error for invalid showTimestamps values", () => {
    const invalidTimestamps = {
      theme: "system",
      showTimestamps: "sometimes",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    } as unknown as AppearanceSettingsFormData;

    expect(() =>
      mapAppearanceSettingsUIToPersistence(invalidTimestamps),
    ).toThrow(/Invalid appearance settings data/);
  });

  it("should throw error for invalid messageSpacing values", () => {
    const invalidSpacing = {
      theme: "system",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "wide",
    } as unknown as AppearanceSettingsFormData;

    expect(() => mapAppearanceSettingsUIToPersistence(invalidSpacing)).toThrow(
      /Invalid appearance settings data/,
    );
  });

  it("should throw error for NaN fontSize values", () => {
    const nanFontSize: AppearanceSettingsFormData = {
      theme: "system",
      showTimestamps: "hover",
      showActivityTime: true,
      compactList: false,
      fontSize: NaN,
      messageSpacing: "normal",
    };

    expect(() => mapAppearanceSettingsUIToPersistence(nanFontSize)).toThrow(
      /Invalid numeric input: NaN values not allowed/,
    );
  });

  it("should maintain all original values when no clamping is needed", () => {
    const perfectData: AppearanceSettingsFormData = {
      theme: "dark",
      showTimestamps: "never",
      showActivityTime: false,
      compactList: true,
      fontSize: 15, // Within valid range
      messageSpacing: "compact",
    };

    const result = mapAppearanceSettingsUIToPersistence(perfectData);
    expect(result).toEqual(perfectData);
  });
});

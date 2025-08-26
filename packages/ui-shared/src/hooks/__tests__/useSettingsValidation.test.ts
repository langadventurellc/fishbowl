import { renderHook } from "@testing-library/react";
import type { SettingsFormData } from "../../types/settings/combined/SettingsFormData.js";
import { useSettingsValidation } from "../useSettingsValidation.js";

describe("useSettingsValidation", () => {
  describe("validateSettings", () => {
    it("should validate valid complete settings successfully", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const validData: SettingsFormData = {
        general: {
          responseDelay: 1000,
          maximumMessages: 10,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 5,
          checkUpdates: true,
        },
        appearance: {
          theme: "light",
          showTimestamps: "hover",
          showActivityTime: true,
          compactList: false,
          fontSize: 14,
          messageSpacing: "normal",
        },
        advanced: {
          debugLogging: false,
          experimentalFeatures: false,
        },
      };

      const validationResult = result.current.validateSettings(validData);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toBeUndefined();
    });

    it("should validate valid partial settings successfully", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const validPartialData: Partial<SettingsFormData> = {
        general: {
          responseDelay: 1000,
          maximumMessages: 10,
          maximumWaitTime: 30000,
          defaultMode: "manual",
          maximumAgents: 5,
          checkUpdates: true,
        },
      };

      const validationResult =
        result.current.validateSettings(validPartialData);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toBeUndefined();
    });

    it("should validate empty partial settings successfully", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const emptyData: Partial<SettingsFormData> = {};

      const validationResult = result.current.validateSettings(emptyData);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toBeUndefined();
    });
  });

  describe("validateCategory", () => {
    it("should validate valid general category data", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const validGeneralData = {
        responseDelay: 1000,
        maximumMessages: 10,
        maximumWaitTime: 30000,
        defaultMode: "manual",
        maximumAgents: 5,
        checkUpdates: true,
      };

      const errors = result.current.validateCategory(
        "general",
        validGeneralData,
      );
      expect(errors).toEqual([]);
    });

    it("should validate valid appearance category data", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const validAppearanceData = {
        theme: "dark",
        showTimestamps: "always",
        showActivityTime: false,
        compactList: true,
        fontSize: 16,
        messageSpacing: "compact",
      };

      const errors = result.current.validateCategory(
        "appearance",
        validAppearanceData,
      );
      expect(errors).toEqual([]);
    });

    it("should validate valid advanced category data", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const validAdvancedData = {
        debugLogging: true,
        experimentalFeatures: false,
      };

      const errors = result.current.validateCategory(
        "advanced",
        validAdvancedData,
      );
      expect(errors).toEqual([]);
    });

    it("should return errors for invalid general category data", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const invalidGeneralData = {
        responseDelay: -1, // Invalid: too small
        maximumMessages: "not-a-number", // Invalid: wrong type
        maximumWaitTime: 30000,
        defaultMode: "invalid-mode", // Invalid: not in enum
        maximumAgents: 5,
        checkUpdates: true,
      };

      const errors = result.current.validateCategory(
        "general",
        invalidGeneralData,
      );
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.includes("responseDelay"))).toBe(
        true,
      );
    });

    it("should return errors for invalid appearance category data", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const invalidAppearanceData = {
        theme: "invalid-theme", // Invalid: not in enum
        showTimestamps: "invalid-option", // Invalid: not in enum
        showActivityTime: "not-boolean", // Invalid: wrong type
        compactList: false,
        fontSize: 5, // Invalid: too small
        messageSpacing: "normal",
      };

      const errors = result.current.validateCategory(
        "appearance",
        invalidAppearanceData,
      );
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some(
          (error) =>
            error.includes("theme") || error.includes("showTimestamps"),
        ),
      ).toBe(true);
    });

    it("should return errors for invalid advanced category data", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const invalidAdvancedData = {
        debugLogging: "not-boolean", // Invalid: wrong type
        experimentalFeatures: null, // Invalid: null instead of boolean
      };

      const errors = result.current.validateCategory(
        "advanced",
        invalidAdvancedData,
      );
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some(
          (error) =>
            error.includes("debugLogging") ||
            error.includes("experimentalFeatures"),
        ),
      ).toBe(true);
    });

    it("should handle completely invalid data gracefully", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const errors = result.current.validateCategory("general", null);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("canUpdate", () => {
    const currentData: SettingsFormData = {
      general: {
        responseDelay: 1000,
        maximumMessages: 10,
        maximumWaitTime: 30000,
        defaultMode: "manual",
        maximumAgents: 5,
        checkUpdates: true,
      },
      appearance: {
        theme: "light",
        showTimestamps: "hover",
        showActivityTime: true,
        compactList: false,
        fontSize: 14,
        messageSpacing: "normal",
      },
      advanced: {
        debugLogging: false,
        experimentalFeatures: false,
      },
    };

    it("should return true for valid updates with changes", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const validUpdate: Partial<SettingsFormData> = {
        general: {
          ...currentData.general,
          checkUpdates: false, // Changed from true to false
        },
      };

      const canUpdate = result.current.canUpdate(currentData, validUpdate);
      expect(canUpdate).toBe(true);
    });

    it("should return false when no actual changes are made", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const noChanges: Partial<SettingsFormData> = {
        general: {
          ...currentData.general,
          checkUpdates: true, // Same as current value
        },
      };

      const canUpdate = result.current.canUpdate(currentData, noChanges);
      expect(canUpdate).toBe(false);
    });

    it("should handle multiple category updates", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const multiCategoryUpdate: Partial<SettingsFormData> = {
        general: {
          ...currentData.general,
          checkUpdates: false,
        },
        appearance: {
          ...currentData.appearance,
          theme: "dark",
        },
      };

      const canUpdate = result.current.canUpdate(
        currentData,
        multiCategoryUpdate,
      );
      expect(canUpdate).toBe(true);
    });

    it("should handle empty updates", () => {
      const { result } = renderHook(() => useSettingsValidation());

      const emptyUpdate: Partial<SettingsFormData> = {};

      const canUpdate = result.current.canUpdate(currentData, emptyUpdate);
      expect(canUpdate).toBe(false);
    });
  });

  describe("memoization", () => {
    it("should return the same function references on re-renders", () => {
      const { result, rerender } = renderHook(() => useSettingsValidation());

      const firstValidateSettings = result.current.validateSettings;
      const firstValidateCategory = result.current.validateCategory;
      const firstCanUpdate = result.current.canUpdate;

      rerender();

      expect(result.current.validateSettings).toBe(firstValidateSettings);
      expect(result.current.validateCategory).toBe(firstValidateCategory);
      expect(result.current.canUpdate).toBe(firstCanUpdate);
    });
  });
});

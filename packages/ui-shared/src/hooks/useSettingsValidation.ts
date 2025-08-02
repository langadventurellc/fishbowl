import { useCallback } from "react";
import type { SettingsFormData } from "../types/settings/combined/SettingsFormData.js";
import type { SettingsCategory } from "../types/settings/combined/SettingsCategory.js";
import type { SettingsValidationResult } from "../types/settings/combined/SettingsValidationResult.js";
import type { UseSettingsValidationReturn } from "./UseSettingsValidationReturn.js";
import {
  generalSettingsSchema,
  appearanceSettingsSchema,
  advancedSettingsSchema,
} from "@fishbowl-ai/shared";

/**
 * Helper function to extract user-friendly error messages from ZodError
 */
function extractErrorMessages(error: unknown): string[] {
  if (!error || typeof error !== "object" || !("issues" in error)) {
    return ["Validation failed"];
  }

  const zodError = error as {
    issues: Array<{ path?: string[]; message: string }>;
  };
  return zodError.issues.map((issue) => {
    const path = issue.path?.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * Hook providing validation functions for settings data
 * Validates individual categories and complete settings objects
 */
export function useSettingsValidation(): UseSettingsValidationReturn {
  /**
   * Validates complete settings form data
   * @param formData - Combined settings to validate
   * @returns Validation result with category-specific errors
   */
  const validateSettings = useCallback(
    (formData: Partial<SettingsFormData>): SettingsValidationResult => {
      const errors: Record<SettingsCategory, string[]> = {
        general: [],
        appearance: [],
        advanced: [],
      };

      let isValid = true;

      // Validate each category if present
      if (formData.general) {
        const result = generalSettingsSchema.safeParse(formData.general);
        if (!result.success) {
          isValid = false;
          errors.general = extractErrorMessages(result.error);
        }
      }

      if (formData.appearance) {
        const result = appearanceSettingsSchema.safeParse(formData.appearance);
        if (!result.success) {
          isValid = false;
          errors.appearance = extractErrorMessages(result.error);
        }
      }

      if (formData.advanced) {
        const result = advancedSettingsSchema.safeParse(formData.advanced);
        if (!result.success) {
          isValid = false;
          errors.advanced = extractErrorMessages(result.error);
        }
      }

      return {
        isValid,
        errors: isValid ? undefined : errors,
      };
    },
    [],
  );

  /**
   * Validates a single settings category
   * @param category - The category to validate
   * @param data - The data to validate
   * @returns Array of validation errors or empty array
   */
  const validateCategory = useCallback(
    (category: SettingsCategory, data: unknown): string[] => {
      const schemas = {
        general: generalSettingsSchema,
        appearance: appearanceSettingsSchema,
        advanced: advancedSettingsSchema,
      };

      const result = schemas[category].safeParse(data);
      if (!result.success) {
        return extractErrorMessages(result.error);
      }

      return [];
    },
    [],
  );

  /**
   * Checks if a partial update would result in valid settings
   * @param currentData - Current settings data
   * @param updates - Partial updates to apply
   * @returns Whether the merged data would be valid
   */
  const canUpdate = useCallback(
    (
      currentData: SettingsFormData,
      updates: Partial<SettingsFormData>,
    ): boolean => {
      // Check if there are actual changes
      let hasChanges = false;

      if (updates.general) {
        hasChanges = Object.keys(updates.general).some((key) => {
          const typedKey = key as keyof typeof updates.general;
          return currentData.general[typedKey] !== updates.general![typedKey];
        });
      }

      if (!hasChanges && updates.appearance) {
        hasChanges = Object.keys(updates.appearance).some((key) => {
          const typedKey = key as keyof typeof updates.appearance;
          return (
            currentData.appearance[typedKey] !== updates.appearance![typedKey]
          );
        });
      }

      if (!hasChanges && updates.advanced) {
        hasChanges = Object.keys(updates.advanced).some((key) => {
          const typedKey = key as keyof typeof updates.advanced;
          return currentData.advanced[typedKey] !== updates.advanced![typedKey];
        });
      }

      if (!hasChanges) {
        return false;
      }

      // Only validate if there are changes
      const merged = {
        general: { ...currentData.general, ...updates.general },
        appearance: { ...currentData.appearance, ...updates.appearance },
        advanced: { ...currentData.advanced, ...updates.advanced },
      };

      const result = validateSettings(merged);
      return result.isValid;
    },
    [validateSettings],
  );

  return {
    validateSettings,
    validateCategory,
    canUpdate,
  };
}

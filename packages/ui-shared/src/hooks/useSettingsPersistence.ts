import { useState, useEffect, useCallback } from "react";
import type { SettingsFormData } from "../types/settings/combined/SettingsFormData";
import { SettingsError } from "../utils/settings/SettingsError";
import { SettingsErrorCode } from "../utils/settings/SettingsErrorCode";
import { createSettingsError } from "../utils/settings/createSettingsError";
import { transformPersistenceError } from "../utils/settings/transformPersistenceError";
import { useSettingsMapper } from "./useSettingsMapper";
import { useSettingsValidation } from "./useSettingsValidation";
import { defaultGeneralSettings } from "../types/settings/generalSettings";
import { defaultAppearanceSettings } from "../types/settings/appearanceSettings";
import { defaultAdvancedSettings } from "../types/settings/advancedSettings";
import type { UseSettingsPersistenceOptions } from "./UseSettingsPersistenceOptions";
import type { UseSettingsPersistenceReturn } from "./UseSettingsPersistenceReturn";

/**
 * Hook for managing settings persistence with atomic operations
 *
 * Provides comprehensive settings management with atomic save/load operations,
 * validation, error handling, and loading states. Coordinates between the
 * persistence adapter, validation, and mapping layers to ensure data integrity.
 *
 * @param options - Configuration options for the hook
 * @returns Settings management interface
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   const {
 *     settings,
 *     isLoading,
 *     error,
 *     saveSettings,
 *     resetSettings
 *   } = useSettingsPersistence({
 *     adapter: desktopSettingsAdapter,
 *     onError: (error) => {
 *       console.error('Settings error:', error);
 *       toast.error(error.message);
 *     }
 *   });
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!settings) return null;
 *
 *   return (
 *     <SettingsForm
 *       settings={settings}
 *       onSave={saveSettings}
 *       onReset={resetSettings}
 *     />
 *   );
 * }
 * ```
 */
export function useSettingsPersistence(
  options: UseSettingsPersistenceOptions,
): UseSettingsPersistenceReturn {
  const { adapter, onError } = options;

  // State management
  const [settings, setSettings] = useState<SettingsFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SettingsError | null>(null);

  // Get mapper and validator functions
  const { mapToPersistence, mapToUI } = useSettingsMapper();
  const { validateSettings } = useSettingsValidation();

  // Helper to handle errors consistently
  const handleError = useCallback(
    (err: unknown) => {
      const settingsError =
        err instanceof SettingsError
          ? err
          : createSettingsError(
              transformPersistenceError(err),
              SettingsErrorCode.PERSISTENCE_FAILED,
            );

      setError(settingsError);
      onError?.(settingsError);
      return settingsError;
    },
    [onError],
  );

  /**
   * Loads settings from storage atomically
   * Maps persisted data to UI format and validates before setting state
   */
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const persistedData = await adapter.load();

      if (persistedData) {
        // Map to UI format
        const formData = mapToUI(persistedData);

        // Validate loaded data
        const validation = validateSettings(formData);
        if (!validation.isValid) {
          throw createSettingsError(
            "Loaded settings contain invalid data",
            SettingsErrorCode.VALIDATION_FAILED,
            { errors: validation.errors },
          );
        }

        setSettings(formData);
      } else {
        // No saved settings, use defaults
        const defaultSettings: SettingsFormData = {
          general: defaultGeneralSettings,
          appearance: defaultAppearanceSettings,
          advanced: defaultAdvancedSettings,
        };
        setSettings(defaultSettings);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [adapter, mapToUI, validateSettings, handleError]);

  /**
   * Saves settings to storage atomically
   * Validates before saving and maps to persistence format
   */
  const saveSettings = useCallback(
    async (formData: SettingsFormData) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate before saving
        const validation = validateSettings(formData);
        if (!validation.isValid) {
          throw createSettingsError(
            "Cannot save invalid settings",
            SettingsErrorCode.VALIDATION_FAILED,
            { errors: validation.errors },
          );
        }

        // Map to persistence format
        const persistedData = mapToPersistence(formData);

        // Save atomically
        await adapter.save(persistedData);

        // Update local state on success
        setSettings(formData);
      } catch (err) {
        const settingsError = handleError(err);
        // Re-throw to allow caller to handle
        throw settingsError;
      } finally {
        setIsLoading(false);
      }
    },
    [adapter, mapToPersistence, validateSettings, handleError],
  );

  /**
   * Resets settings to defaults
   * Clears storage and applies default values
   */
  const resetSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await adapter.reset();

      const defaultSettings: SettingsFormData = {
        general: defaultGeneralSettings,
        appearance: defaultAppearanceSettings,
        advanced: defaultAdvancedSettings,
      };

      setSettings(defaultSettings);
    } catch (err) {
      const settingsError = handleError(err);
      throw settingsError;
    } finally {
      setIsLoading(false);
    }
  }, [adapter, handleError]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    loadSettings,
    resetSettings,
  };
}

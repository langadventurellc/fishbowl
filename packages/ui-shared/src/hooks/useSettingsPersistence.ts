import { useCallback, useEffect, useState } from "react";
import { defaultAdvancedSettings } from "../types/settings/advancedSettings";
import { defaultAppearanceSettings } from "../types/settings/appearanceSettings";
import type { SettingsFormData } from "../types/settings/combined/SettingsFormData";
import { defaultGeneralSettings } from "../types/settings/generalSettings";
import { SettingsError } from "../utils/settings/SettingsError";
import { SettingsErrorCode } from "../utils/settings/SettingsErrorCode";
import { createSettingsError } from "../utils/settings/createSettingsError";
import { transformPersistenceError } from "../utils/settings/transformPersistenceError";
import type { UseSettingsPersistenceOptions } from "./UseSettingsPersistenceOptions";
import type { UseSettingsPersistenceReturn } from "./UseSettingsPersistenceReturn";
import { useSettingsMapper } from "./useSettingsMapper";
import { useSettingsValidation } from "./useSettingsValidation";

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
  const [isLoading, setIsLoading] = useState(true); // Start with true since we need to load
  const [error, setError] = useState<SettingsError | null>(null);

  // Get mapper and validator functions
  const mapperHooks = useSettingsMapper();
  const validationHooks = useSettingsValidation();

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
        const formData = mapperHooks.mapToUI(persistedData);

        // Validate loaded data
        const validation = validationHooks.validateSettings(formData);
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
  }, [adapter, mapperHooks, validationHooks, handleError]);

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
        const validation = validationHooks.validateSettings(formData);
        if (!validation.isValid) {
          throw createSettingsError(
            "Cannot save invalid settings",
            SettingsErrorCode.VALIDATION_FAILED,
            { errors: validation.errors },
          );
        }

        // Map to persistence format
        const persistedData = mapperHooks.mapToPersistence(formData);

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
    [adapter, mapperHooks, validationHooks, handleError],
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

  // Load settings only once on mount
  useEffect(() => {
    let mounted = true;

    const performInitialLoad = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const persistedData = await adapter.load();

        if (!mounted) return;

        if (persistedData) {
          // Map to UI format
          const formData = mapperHooks.mapToUI(persistedData);

          // Validate loaded data
          const validation = validationHooks.validateSettings(formData);
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
        if (!mounted) return;

        const settingsError =
          err instanceof SettingsError
            ? err
            : createSettingsError(
                transformPersistenceError(err),
                SettingsErrorCode.PERSISTENCE_FAILED,
              );

        setError(settingsError);
        onError?.(settingsError);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    performInitialLoad();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once on mount

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    loadSettings,
    resetSettings,
  };
}

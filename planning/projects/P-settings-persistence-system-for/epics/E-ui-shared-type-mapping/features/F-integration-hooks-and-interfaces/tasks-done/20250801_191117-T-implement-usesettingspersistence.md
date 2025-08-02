---
kind: task
id: T-implement-usesettingspersistence
parent: F-integration-hooks-and-interfaces
status: done
title: Implement useSettingsPersistence main hook
priority: high
prerequisites:
  - T-implement-4
  - T-implement-usesettingsmapper-hook
  - T-implement-usesettingsvalidation
  - T-create-settings-error
created: "2025-08-01T15:03:37.493769"
updated: "2025-08-01T18:37:34.888597"
schema_version: "1.1"
worktree: null
---

# Implement useSettingsPersistence main hook

## Purpose

Create the primary React hook that provides atomic save/load operations for settings management. This hook coordinates the mapper, validator, and persistence adapter to provide a complete settings persistence solution with proper error handling and loading states.

## Implementation Details

### File Location

`packages/ui-shared/src/hooks/useSettingsPersistence.ts`

### Hook Implementation

```typescript
/**
 * Main hook for atomic settings persistence operations
 * Coordinates mapping, validation, and storage for all settings categories
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

  /**
   * Loads settings from storage atomically
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
        setSettings({
          general: defaultGeneralSettings,
          appearance: defaultAppearanceSettings,
          advanced: defaultAdvancedSettings,
        });
      }
    } catch (err) {
      const settingsError =
        err instanceof SettingsError
          ? err
          : createSettingsError(
              transformPersistenceError(err, "load"),
              SettingsErrorCode.PERSISTENCE_FAILED,
            );

      setError(settingsError);
      onError?.(settingsError);
    } finally {
      setIsLoading(false);
    }
  }, [adapter, mapToUI, validateSettings, onError]);

  /**
   * Saves settings to storage atomically
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
        const settingsError =
          err instanceof SettingsError
            ? err
            : createSettingsError(
                transformPersistenceError(err, "save"),
                SettingsErrorCode.PERSISTENCE_FAILED,
              );

        setError(settingsError);
        onError?.(settingsError);

        // Re-throw to allow caller to handle
        throw settingsError;
      } finally {
        setIsLoading(false);
      }
    },
    [adapter, mapToPersistence, validateSettings, onError],
  );

  /**
   * Resets settings to defaults
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
      const settingsError = createSettingsError(
        transformPersistenceError(err, "reset"),
        SettingsErrorCode.PERSISTENCE_FAILED,
      );

      setError(settingsError);
      onError?.(settingsError);
    } finally {
      setIsLoading(false);
    }
  }, [adapter, onError]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    loadSettings,
    resetSettings,
  };
}
```

### Type Definitions

```typescript
export interface UseSettingsPersistenceOptions {
  adapter: SettingsPersistenceAdapter;
  onError?: (error: SettingsError) => void;
}

export interface UseSettingsPersistenceReturn {
  settings: SettingsFormData | null;
  isLoading: boolean;
  error: SettingsError | null;
  saveSettings: (settings: SettingsFormData) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
}
```

### Implementation Requirements

1. **Atomic Operations**: All saves/loads handle complete settings
2. **Validation**: Validate before save and after load
3. **Error Handling**: Transform all errors to user-friendly messages
4. **Loading States**: Track loading for UI feedback
5. **Default Values**: Use category defaults when no saved data
6. **Auto-load**: Load settings on hook mount
7. **Memoization**: All callbacks properly memoized

### Unit Testing

Create `packages/ui-shared/src/hooks/__tests__/useSettingsPersistence.test.ts`:

1. Test initial load on mount
2. Test saveSettings with valid data
3. Test saveSettings with invalid data (validation failure)
4. Test loadSettings with existing data
5. Test loadSettings with no saved data (defaults)
6. Test resetSettings functionality
7. Test error handling for adapter failures
8. Test loading state transitions
9. Test onError callback invocation

**IMPORTANT**: This task should only include unit tests. Do NOT create integration tests or performance tests.

### Example Usage

```typescript
function SettingsPage() {
  const {
    settings,
    isLoading,
    error,
    saveSettings,
    resetSettings
  } = useSettingsPersistence({
    adapter: desktopSettingsAdapter,
    onError: (error) => {
      console.error('Settings error:', error);
      toast.error(error.message);
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!settings) return null;

  return (
    <SettingsForm
      settings={settings}
      onSave={saveSettings}
      onReset={resetSettings}
    />
  );
}
```

## Acceptance Criteria

- ✓ Hook provides atomic save/load/reset operations
- ✓ All operations validate settings data
- ✓ Proper error transformation and handling
- ✓ Loading states tracked accurately
- ✓ Settings loaded automatically on mount
- ✓ Defaults applied when no saved settings
- ✓ All callbacks properly memoized
- ✓ TypeScript types fully implemented
- ✓ Comprehensive unit tests
- ✓ JSDoc documentation with examples
- ✓ Hook exported from hooks/index.ts
- ✓ All quality checks pass

## Dependencies

- SettingsPersistenceAdapter interface
- useSettingsMapper hook
- useSettingsValidation hook
- Error transformation utilities
- Default settings from each category
- React hooks (useState, useEffect, useCallback)

## Performance Requirements

- Hook initialization < 5ms
- Save operation < 50ms (excluding adapter time)
- Load operation < 50ms (excluding adapter time)
- Minimal re-renders through proper memoization

### Log

**2025-08-02T00:11:17.241482Z** - Successfully implemented useSettingsPersistence hook with atomic operations, comprehensive error handling, loading states, and unit tests. Fixed ESLint configuration to properly support React hooks rules.

- filesChanged: ["packages/ui-shared/src/hooks/useSettingsPersistence.ts", "packages/ui-shared/src/hooks/UseSettingsPersistenceOptions.ts", "packages/ui-shared/src/hooks/UseSettingsPersistenceReturn.ts", "packages/ui-shared/src/hooks/__tests__/useSettingsPersistence.test.ts", "packages/ui-shared/src/hooks/index.ts", "packages/eslint-config/react.js", "packages/ui-shared/eslint.config.cjs"]

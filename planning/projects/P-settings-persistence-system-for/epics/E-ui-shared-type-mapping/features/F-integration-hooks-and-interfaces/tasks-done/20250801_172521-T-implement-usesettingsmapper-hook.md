---
kind: task
id: T-implement-usesettingsmapper-hook
parent: F-integration-hooks-and-interfaces
status: done
title: Implement useSettingsMapper hook
priority: high
prerequisites:
  - T-create-combined-settings-types
created: "2025-08-01T15:02:32.201093"
updated: "2025-08-01T17:16:20.126909"
schema_version: "1.1"
worktree: null
---

# Implement useSettingsMapper hook

## Purpose

Create a React hook that provides bidirectional mapping functions for converting between UI form data and persistence formats. This hook coordinates all individual category mappers to provide unified settings transformation.

## Implementation Details

### File Location

`packages/ui-shared/src/hooks/useSettingsMapper.ts`

### Hook Implementation

```typescript
/**
 * Hook providing bidirectional mapping functions for settings data
 * Coordinates all category mappers for atomic transformations
 */
export function useSettingsMapper() {
  /**
   * Maps UI form data to persistence format
   * @param formData - Combined settings from UI forms
   * @returns Data ready for persistence
   */
  const mapToPersistence = useCallback(
    (formData: SettingsFormData): PersistedSettingsData => {
      return {
        general: mapGeneralSettingsUIToPersistence(formData.general),
        appearance: mapAppearanceSettingsUIToPersistence(formData.appearance),
        advanced: mapAdvancedSettingsUIToPersistence(formData.advanced),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        lastUpdated: new Date().toISOString(),
      };
    },
    [],
  );

  /**
   * Maps persistence data to UI form format
   * @param persistedData - Data from storage
   * @returns Data ready for UI forms
   */
  const mapToUI = useCallback(
    (persistedData: PersistedSettingsData): SettingsFormData => {
      return {
        general: mapGeneralSettingsPersistenceToUI(persistedData.general),
        appearance: mapAppearanceSettingsPersistenceToUI(
          persistedData.appearance,
        ),
        advanced: mapAdvancedSettingsPersistenceToUI(persistedData.advanced),
      };
    },
    [],
  );

  return {
    mapToPersistence,
    mapToUI,
  };
}
```

### Required Imports

- All six individual mapper functions from mapping/settings
- React hooks (useCallback) for memoization
- Type definitions (SettingsFormData, PersistedSettingsData)
- Schema version constant from shared package

### Implementation Requirements

1. **Memoization**: Use useCallback to prevent unnecessary re-renders
2. **Atomic Operations**: Both functions must transform all categories together
3. **Error Handling**: Let individual mappers handle validation
4. **Metadata**: Add schemaVersion and lastUpdated when mapping to persistence
5. **Type Safety**: Maintain full TypeScript type checking
6. **Pure Functions**: No side effects in mapping operations

### Hook Return Type

```typescript
export interface UseSettingsMapperReturn {
  mapToPersistence: (formData: SettingsFormData) => PersistedSettingsData;
  mapToUI: (persistedData: PersistedSettingsData) => SettingsFormData;
}
```

### Unit Testing

Create `packages/ui-shared/src/hooks/__tests__/useSettingsMapper.test.ts`:

1. Test hook renders without errors
2. Test mapToPersistence with complete data
3. Test mapToUI with complete data
4. Test round-trip conversion (UI → Persistence → UI)
5. Test memoization (functions don't change between renders)
6. Test with partial data (relies on individual mappers)
7. Verify metadata fields are added correctly

**IMPORTANT**: This task should only include unit tests. Do NOT create integration tests or performance tests.

### Example Usage

```typescript
function SettingsForm() {
  const { mapToPersistence, mapToUI } = useSettingsMapper();

  const handleSave = async (formData: SettingsFormData) => {
    const persistedData = mapToPersistence(formData);
    await adapter.save(persistedData);
  };

  const handleLoad = async () => {
    const persistedData = await adapter.load();
    if (persistedData) {
      const formData = mapToUI(persistedData);
      setFormData(formData);
    }
  };
}
```

## Acceptance Criteria

- ✓ Hook coordinates all six individual mapper functions
- ✓ Both mapping functions are memoized with useCallback
- ✓ Atomic transformation of all settings categories
- ✓ Proper metadata added during persistence mapping
- ✓ Full TypeScript type safety maintained
- ✓ JSDoc documentation with usage examples
- ✓ Unit tests verify all mapping scenarios
- ✓ Hook exported from hooks/index.ts
- ✓ All quality checks pass

## Dependencies

- All individual mapper functions from completed tasks
- Combined settings types (SettingsFormData, PersistedSettingsData)
- React hooks for memoization
- CURRENT_SCHEMA_VERSION from shared package

## Performance Requirements

- Hook initialization < 5ms
- Mapping operations < 2ms total (sum of individual mappers)
- Functions memoized to prevent re-renders
- No unnecessary object allocations

### Log

**2025-08-01T22:25:21.597089Z** - Implemented useSettingsMapper hook with bidirectional mapping functions for converting between UI form data and persistence formats. The hook coordinates all individual category mappers to provide unified settings transformation with atomic operations, memoization, and full TypeScript type safety.

Key features implemented:

- useCallback memoization for optimal performance
- Atomic transformation of all settings categories (general, appearance, advanced)
- Metadata addition (schemaVersion, lastUpdated) during persistence mapping
- Field name transformation handling (debugLogging ↔ debugMode)
- Comprehensive JSDoc documentation with usage examples
- Full TypeScript type safety with separate interface file

Performance characteristics achieved:

- Hook initialization and operations complete without errors
- Functions properly memoized to prevent unnecessary re-renders
- Round-trip data conversion maintains data integrity

Testing includes:

- Mapping function behavior verification
- Memoization and performance validation
- Round-trip conversion testing
- Integration with all six mapper functions
- Atomic operations across all categories
- Field name transformation verification
- filesChanged: ["packages/ui-shared/src/hooks/useSettingsMapper.ts", "packages/ui-shared/src/hooks/UseSettingsMapperReturn.ts", "packages/ui-shared/src/hooks/__tests__/useSettingsMapper.test.ts", "packages/ui-shared/src/hooks/index.ts"]

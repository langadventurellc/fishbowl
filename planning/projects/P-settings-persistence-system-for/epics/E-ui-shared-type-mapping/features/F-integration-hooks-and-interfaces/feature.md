---
kind: feature
id: F-integration-hooks-and-interfaces
title: Integration Hooks and Interfaces
status: in-progress
priority: normal
prerequisites:
  - F-general-settings-type-mapping
  - F-appearance-settings-type-mapping
  - F-advanced-settings-type-mapping
  - F-common-mapping-utilities
created: "2025-07-31T22:04:13.786942"
updated: "2025-07-31T22:04:13.786942"
schema_version: "1.1"
parent: E-ui-shared-type-mapping
---

# Integration Hooks and Interfaces

## Purpose and Functionality

Create comprehensive React hooks and TypeScript interfaces that provide a clean, atomic API for settings management in the ui-shared package. This feature implements the integration layer that platform applications (desktop and future mobile) use to interact with the settings persistence system. Following the architecture decision that settings are saved and loaded atomically as a single operation, these hooks coordinate all individual mappers to provide unified settings management.

## Key Components to Implement

### 1. Unified Settings Types

- `SettingsFormData`: Combined type for all UI settings categories
- `PersistedSettingsData`: Combined type for all persisted settings
- Type unions and intersections for complete settings

### 2. Atomic Operation Hooks

- `useSettingsPersistence`: Main hook for atomic save/load operations
- `useSettingsMapper`: Hook providing bidirectional mapping functions
- `useSettingsValidation`: Hook for complete settings validation

### 3. Integration Interfaces

- `SettingsPersistenceAdapter`: Interface for platform-specific storage
- `SettingsMapperConfig`: Configuration for mapping behavior
- `SettingsErrorHandler`: Standardized error handling interface

### 4. Error Transformation Utilities

- `transformPersistenceError`: Convert storage errors to user-friendly messages
- `transformValidationError`: Convert Zod errors to UI format
- `createSettingsError`: Factory for consistent error objects

## Detailed Acceptance Criteria

### Functional Behavior

- ✓ Single hook call saves ALL settings categories atomically
- ✓ Single hook call loads ALL settings categories atomically
- ✓ Hooks coordinate general, appearance, and advanced mappers internally
- ✓ Complete validation before persistence
- ✓ Rollback on any save failure
- ✓ Error messages suitable for UI display

### Atomic Operation Requirements

- ✓ `saveSettings` persists all three categories in one operation
- ✓ `loadSettings` retrieves all three categories in one operation
- ✓ Partial saves/loads are not exposed in the API
- ✓ All mappers work together seamlessly
- ✓ Consistent state management across categories

### Type Safety Requirements

- ✓ Combined types maintain individual category type safety
- ✓ No 'any' types in public API
- ✓ Full IntelliSense support
- ✓ Type guards for runtime validation

### Integration Points

- ✓ Uses all individual mapper functions internally
- ✓ Compatible with @fishbowl-ai/shared repository
- ✓ Platform-agnostic interfaces
- ✓ Works with existing UI components

### Performance Requirements

- ✓ Hook initialization < 5ms
- ✓ Mapping operations < 2ms total
- ✓ Efficient memoization
- ✓ No unnecessary re-renders

## Technical Requirements

### Implementation Structure

```typescript
// packages/ui-shared/src/types/settings/combined.ts
export interface SettingsFormData {
  general: GeneralSettingsFormData;
  appearance: AppearanceSettingsFormData;
  advanced: AdvancedSettingsFormData;
}

// packages/ui-shared/src/hooks/useSettingsPersistence.ts
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

export function useSettingsPersistence(
  options: UseSettingsPersistenceOptions,
): UseSettingsPersistenceReturn;

// packages/ui-shared/src/interfaces/SettingsPersistenceAdapter.ts
export interface SettingsPersistenceAdapter {
  save(settings: PersistedSettingsData): Promise<void>;
  load(): Promise<PersistedSettingsData>;
  reset(): Promise<void>;
}
```

### Dependencies

- All individual mapper functions
- React hooks (useState, useEffect, useCallback)
- TypeScript utility types
- Zod for validation coordination

## Implementation Guidance

### Technical Approach

1. Create combined types that aggregate all settings
2. Implement main persistence hook with atomic operations
3. Coordinate all mappers within single save/load flow
4. Create platform adapter interface
5. Implement comprehensive error handling

### Hook Design Principles

- Single source of truth for settings state
- Atomic operations only (no partial updates)
- Clear loading and error states
- Memoized callbacks to prevent re-renders
- Platform-agnostic implementation

## Testing Requirements

### Unit Tests

- Test atomic save operations
- Test atomic load operations
- Test error handling and rollback
- Test hook lifecycle
- Test memoization
- Test adapter interface

### Integration Tests

- Test with actual UI components
- Test with persistence layer
- Test error scenarios
- Test state synchronization

## Security Considerations

- Never expose partial settings data
- Validate complete settings object
- Sanitize error messages
- No sensitive data in logs

## Performance Requirements

- Atomic operations must be efficient
- Proper memoization of callbacks
- Minimal re-renders
- Efficient state updates

## Developer Experience

- Simple, intuitive API
- Clear documentation with examples
- TypeScript autocomplete
- Helpful error messages
- Easy platform integration

### Log

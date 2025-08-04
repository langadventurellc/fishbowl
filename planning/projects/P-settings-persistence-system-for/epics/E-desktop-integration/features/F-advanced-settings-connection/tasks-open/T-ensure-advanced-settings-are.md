---
kind: task
id: T-ensure-advanced-settings-are
title: Ensure advanced settings are included in settings persistence types
status: open
priority: high
prerequisites: []
created: "2025-08-03T23:07:00.248417"
updated: "2025-08-03T23:07:00.248417"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Ensure Advanced Settings Are Included in Settings Persistence Types

## Context

The settings persistence system needs to include advanced settings in its type definitions and interfaces. This ensures that advanced settings are properly loaded, saved, and typed throughout the application.

## Implementation Requirements

### 1. Check Settings Interface

Verify that the main settings interface includes advanced settings. Search for the settings type definition (likely in `@fishbowl-ai/ui-shared` or `@fishbowl-ai/shared`) and ensure it includes:

```typescript
interface Settings {
  general: GeneralSettingsFormData;
  appearance: AppearanceSettingsFormData;
  advanced: AdvancedSettingsFormData; // This should exist
}
```

### 2. Update Type Exports

Ensure all necessary types are exported from the ui-shared package:

- `AdvancedSettingsFormData`
- `advancedSettingsSchema`
- `defaultAdvancedSettings`

Check `packages/ui-shared/src/index.ts` or the main export file.

### 3. Verify Persistence Adapter

Check that the persistence adapter properly handles advanced settings:

- Loading: Maps persisted data to form data
- Saving: Maps form data to persistence format
- Default values: Uses defaultAdvancedSettings when no data exists

### 4. Update Settings Context/Hooks

If there are any settings-related contexts or hooks, ensure they handle advanced settings:

- Type definitions include advanced settings
- Default values include advanced settings
- Validation includes advanced settings schema

### 5. Migration Considerations

If there's a migration system, ensure it handles:

- Adding advanced settings to existing persisted data
- Setting default values for users upgrading from previous versions

## Technical Approach

1. Search codebase for settings type definitions
2. Add advanced settings to main interface if missing
3. Ensure proper type exports
4. Verify persistence flow handles all three setting categories
5. Test loading and saving with all settings

## Acceptance Criteria

- ✓ Settings interface includes advanced property
- ✓ All advanced settings types are properly exported
- ✓ Persistence adapter handles advanced settings
- ✓ Default values are applied when no data exists
- ✓ TypeScript compilation succeeds
- ✓ Settings load and save correctly with all three tabs

## Testing Requirements

- Write unit tests for type definitions
- Test persistence adapter with advanced settings
- Verify default values are applied correctly
- Test migration scenarios if applicable

### Log

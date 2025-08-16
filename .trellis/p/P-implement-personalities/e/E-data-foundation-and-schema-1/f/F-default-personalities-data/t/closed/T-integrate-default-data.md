---
id: T-integrate-default-data
title: Integrate default data loading with factory function
status: done
priority: medium
parent: F-default-personalities-data
prerequisites:
  - T-create-default-personalities-1
  - T-create-default-personalities
affectedFiles:
  packages/shared/src/types/settings/createDefaultPersonalitiesSettings.ts:
    Updated factory function to support includeDefaults parameter with ES6
    import, validation, and error handling
  packages/shared/src/types/settings/getDefaultPersonalities.ts: New helper function to get bundled default personalities with validation
  packages/shared/src/types/settings/validateDefaultPersonalities.ts: New validation function for bundled default data schema compliance
  packages/shared/src/types/settings/index.ts: Added exports for new helper functions
  packages/shared/src/types/settings/__tests__/createDefaultPersonalitiesSettings.test.ts:
    Updated existing tests for backward compatibility and added comprehensive
    tests for includeDefaults functionality
  packages/shared/src/types/settings/__tests__/getDefaultPersonalities.test.ts: New comprehensive test suite for getDefaultPersonalities helper function
  packages/shared/src/types/settings/__tests__/validateDefaultPersonalities.test.ts: New test suite for validateDefaultPersonalities function
log:
  - "Successfully integrated default data loading with the factory function.
    Updated createDefaultPersonalitiesSettings to support an optional
    includeDefaults parameter (default: true) that loads the bundled default
    personalities from JSON. Created helper functions for default data
    management and comprehensive error handling for corrupted or missing data.
    All tests pass with 100% coverage including new functionality."
schema: v1.0
childrenIds: []
created: 2025-08-15T18:07:22.755Z
updated: 2025-08-15T18:07:22.755Z
---

# Integrate Default Data Loading with Factory Function

## Context

Update the `createDefaultPersonalitiesSettings` factory function to load default personalities from the JSON file, providing users with pre-configured examples on first launch while maintaining the ability to reset to empty state.

## Implementation Requirements

### Update: `packages/shared/src/types/settings/createDefaultPersonalitiesSettings.ts`

Modify the factory function to support loading default personalities:

```typescript
import { PersistedPersonalitiesSettingsData } from "./PersistedPersonalitiesSettingsData";
import defaultPersonalitiesData from "../../data/defaultPersonalities.json";

/**
 * Creates the default personalities settings structure
 * @param includeDefaults - Whether to include the bundled default personalities
 * @returns Default personalities settings with optional default personalities
 */
export function createDefaultPersonalitiesSettings(
  includeDefaults: boolean = true,
): PersistedPersonalitiesSettingsData {
  return {
    schemaVersion: "1.0.0",
    personalities: includeDefaults
      ? defaultPersonalitiesData.personalities
      : [],
    lastUpdated: new Date().toISOString(),
  };
}
```

### Additional Utilities

Create helper functions for default data management:

```typescript
/**
 * Gets the bundled default personalities without wrapper metadata
 * @returns Array of default personality data
 */
export function getDefaultPersonalities(): PersistedPersonalityData[] {
  return defaultPersonalitiesData.personalities;
}

/**
 * Validates that the bundled default data matches current schema
 * @returns True if valid, throws error if invalid
 */
export function validateDefaultPersonalities(): boolean {
  // Validate against current schema
  return true;
}
```

## Acceptance Criteria

- [ ] Factory function updated with optional `includeDefaults` parameter
- [ ] Default personalities load correctly from JSON file when `includeDefaults=true`
- [ ] Empty personalities array returned when `includeDefaults=false`
- [ ] JSON import works correctly in TypeScript environment
- [ ] Helper functions for accessing and validating default data
- [ ] All default personalities validate against current schema
- [ ] Error handling for corrupted or missing default data file
- [ ] JSDoc documentation updated for new functionality
- [ ] Unit tests cover both include and exclude default scenarios
- [ ] No breaking changes to existing API (default behavior preserved)

## Error Handling Requirements

- Handle missing default data file gracefully
- Validate default data on load and provide clear error messages
- Fallback to empty array if default data is corrupted
- Log warnings for data validation issues

## Testing Requirements (include in this task)

- Test factory function with `includeDefaults=true` returns 5 personalities
- Test factory function with `includeDefaults=false` returns empty array
- Test default personalities load and validate correctly
- Test error handling for missing or corrupted JSON file
- Test helper functions return expected data
- Test JSON import works in build environment
- Test schema validation passes for all default personalities

## Dependencies

- Requires T-create-default-personalities-1 (JSON file) to be completed
- Requires T-create-default-personalities (original factory) to be completed

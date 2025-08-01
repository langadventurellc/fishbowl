---
kind: task
id: T-implement-generalsettingsmapper
parent: F-general-settings-type-mapping
status: done
title:
  Implement general settings mapping functions in separate files with matching
  unit tests
priority: high
prerequisites: []
created: "2025-08-01T12:16:13.673236"
updated: "2025-08-01T12:21:59.300870"
schema_version: "1.1"
worktree: null
---

# Implement general settings mapping functions in separate files with matching unit tests

## Purpose

Create individual mapper functions that convert General Settings data between UI form types and persistence types, with each function in its own file to comply with the one-export-per-file rule.

## Implementation Structure

Create separate files for each mapping function in: `packages/ui-shared/src/mapping/settings/`

### File Structure

```
packages/ui-shared/src/mapping/settings/
├── mapGeneralSettingsUIToPersistence.ts
├── mapGeneralSettingsPersistenceToUI.ts
└── __tests__/
    ├── mapGeneralSettingsUIToPersistence.test.ts
    └── mapGeneralSettingsPersistenceToUI.test.ts
```

## Required Imports (for both files)

```typescript
import type { GeneralSettingsFormData } from "../../types/settings/generalSettings";
import type { PersistedGeneralSettingsData } from "@fishbowl-ai/shared";
import { defaultGeneralSettings } from "../../types/settings/generalSettings";
import { generalSettingsSchema } from "@fishbowl-ai/shared";
import { mapWithDefaults, applyDefaults } from "../utils/defaults";
import { coerceBoolean, clampNumber } from "../utils/transformers";
```

## Common Mapping Utilities

The common mapping utilities are located at `packages/ui-shared/src/mapping/utils/`:

- **`applyDefaults`**: Apply default values to missing fields
- **`mapWithDefaults`**: Combine mapping with default injection in one operation
- **`coerceBoolean`**: Safely convert values to boolean
- **`clampNumber`**: Ensure numeric values stay within valid bounds

## File 1: mapGeneralSettingsUIToPersistence.ts

```typescript
export function mapGeneralSettingsUIToPersistence(
  uiData: GeneralSettingsFormData,
): PersistedGeneralSettingsData;
```

- Convert from UI form data to persistence format
- Since field names and types match, use direct mapping with validation
- Leverage `mapWithDefaults` utility to ensure all fields are present
- Use `clampNumber` for numeric fields to ensure they stay within bounds
- Include JSDoc documentation explaining purpose and usage

## File 2: mapGeneralSettingsPersistenceToUI.ts

```typescript
export function mapGeneralSettingsPersistenceToUI(
  persistedData: PersistedGeneralSettingsData,
): GeneralSettingsFormData;
```

- Convert from persistence format to UI form data
- Apply defaults from `defaultGeneralSettings` for any missing fields
- Use `applyDefaults` utility for consistent default handling
- Validate numeric ranges match UI expectations
- Include JSDoc documentation explaining purpose and usage

## Field Mapping Details

All fields have matching names and types between UI and persistence:

- `responseDelay`: number (milliseconds, 1000-30000)
- `maximumMessages`: number (0-500)
- `maximumWaitTime`: number (milliseconds, 5000-120000)
- `defaultMode`: "manual" | "auto"
- `maximumAgents`: number (1-8)
- `checkUpdates`: boolean

## Unit Tests Structure

### File 1: mapGeneralSettingsUIToPersistence.test.ts

Test the `mapGeneralSettingsUIToPersistence` function:

1. **Successful mapping** - Verify all fields map correctly
2. **Missing fields handling** - Apply defaults when fields are missing
3. **Extra/unknown fields** - Handle gracefully without errors
4. **Edge cases** - Test with null, undefined, partial objects
5. **Boundary values** - Test min/max values for numeric fields
6. **Type validation** - Ensure type safety is maintained

### File 2: mapGeneralSettingsPersistenceToUI.test.ts

Test the `mapGeneralSettingsPersistenceToUI` function:

1. **Successful mapping** - Verify all fields map correctly
2. **Missing fields handling** - Apply defaults when fields are missing
3. **Extra/unknown fields** - Handle gracefully without errors
4. **Edge cases** - Test with null, undefined, partial objects
5. **Boundary values** - Test min/max values for numeric fields
6. **Round-trip conversion** - UI → Persistence → UI results in identical data

## Acceptance Criteria

- ✓ Each mapping function in its own file with single export
- ✓ Test files match production files one-to-one
- ✓ Both mapping functions correctly convert all fields
- ✓ Round-trip conversion maintains data fidelity
- ✓ Missing fields handled with appropriate defaults
- ✓ Type safety enforced at compile time
- ✓ No runtime errors during mapping
- ✓ Pure functions with no side effects
- ✓ Mapping operations complete in < 1ms

## Security Considerations

- Validate input types before mapping
- Ensure no sensitive data in error messages
- Use utilities for safe type coercion
- No dynamic property iteration to prevent injection

## Documentation

Include JSDoc comments for both public functions explaining:

- Purpose and usage
- Input/output types
- Example usage
- Any special behavior or edge cases

### Log

**2025-08-01T17:32:06.723069Z** - Implemented comprehensive general settings mapping functions with bidirectional conversion between UI form data and persistence format. Created separate files for each mapping function following the one-export-per-file rule. Both mappers utilize existing common mapping utilities (applyDefaults, clampNumber, coerceBoolean) for consistent behavior. Added comprehensive test coverage including boundary testing, type coercion, schema validation, and null/undefined handling. All tests pass and quality checks are clean.

- filesChanged: ["packages/ui-shared/src/mapping/settings/mapGeneralSettingsUIToPersistence.ts", "packages/ui-shared/src/mapping/settings/mapGeneralSettingsPersistenceToUI.ts", "packages/ui-shared/src/mapping/settings/__tests__/mapGeneralSettingsUIToPersistence.test.ts", "packages/ui-shared/src/mapping/settings/__tests__/mapGeneralSettingsPersistenceToUI.test.ts", "packages/ui-shared/src/mapping/settings/index.ts"]

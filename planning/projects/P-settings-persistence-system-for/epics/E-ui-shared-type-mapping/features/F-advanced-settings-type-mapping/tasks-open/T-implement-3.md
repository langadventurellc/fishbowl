---
kind: task
id: T-implement-3
title: Implement mapAdvancedSettingsPersistenceToUI function with unit tests
status: open
priority: high
prerequisites:
  - T-create-advancedsettingsformdata
created: "2025-08-01T13:31:28.896712"
updated: "2025-08-01T13:31:28.896712"
schema_version: "1.1"
parent: F-advanced-settings-type-mapping
---

# Implement mapAdvancedSettingsPersistenceToUI function with unit tests

## Purpose

Create the reverse mapping function that converts PersistedAdvancedSettingsData to AdvancedSettingsFormData, enabling UI forms to display persisted advanced settings with safe defaults for developer options.

## Implementation Details

### File Location

Create: `packages/ui-shared/src/mapping/settings/mapAdvancedSettingsPersistenceToUI.ts`

### Required Imports

```typescript
import type { AdvancedSettingsFormData } from "../../types/settings/advancedSettings";
import type { PersistedAdvancedSettingsData } from "@fishbowl-ai/shared";
import { defaultAdvancedSettings } from "../../types/settings/advancedSettings";
import { applyDefaults } from "../utils/defaults";
import { coerceBoolean } from "../utils/transformers";
```

### Function Implementation

```typescript
/**
 * Converts PersistedAdvancedSettingsData to AdvancedSettingsFormData
 *
 * @param persistedData - Advanced settings data from persistence layer
 * @returns Converted data ready for UI forms with safe defaults
 *
 * @example
 * const uiData = mapAdvancedSettingsPersistenceToUI({
 *   debug_logging: true,
 *   experimental_features: false
 * });
 */
export function mapAdvancedSettingsPersistenceToUI(
  persistedData: PersistedAdvancedSettingsData,
): AdvancedSettingsFormData;
```

## Technical Approach

### Field Mapping Strategy

Convert from persistence format to UI format with proper validation and safe defaults:

1. **Boolean Coercion**: Use `coerceBoolean` utility for safe boolean conversion:
   - debugLogging: Convert from various formats to boolean with false fallback
   - experimentalFeatures: Convert from various formats to boolean with false fallback

2. **Default Application**: Use `applyDefaults` with `defaultAdvancedSettings`
   - Ensure all developer options default to false for security
   - Handle missing or corrupted persistence data gracefully

3. **Security Focus**: All developer options default to disabled state

### Implementation Steps

1. Apply defaults for any missing fields using `applyDefaults` with security-focused defaults
2. Convert all boolean fields using `coerceBoolean` with false fallbacks
3. Return properly typed AdvancedSettingsFormData with safe developer settings
4. Handle edge cases with focus on security (default to disabled)

## Unit Testing Requirements

Create: `packages/ui-shared/src/mapping/settings/__tests__/mapAdvancedSettingsPersistenceToUI.test.ts`

### Test Coverage

1. **Successful mapping** - Verify all fields convert correctly from persistence format
2. **Missing fields handling** - Apply safe UI defaults (false) when persistence data is incomplete
3. **Boolean coercion** - Test various input formats (0/1, true/false, "true"/"false", null, undefined)
4. **Round-trip conversion** - UI → Persistence → UI maintains data fidelity
5. **Edge cases** - Test with null, undefined, empty objects, corrupted data
6. **Security validation** - Ensure all developer options default to false for safety
7. **Performance** - Verify mapping completes in < 1ms

### Special Test Cases

```typescript
describe("mapAdvancedSettingsPersistenceToUI", () => {
  it("should handle round-trip conversion correctly", () => {
    // Test UI → Persistence → UI data integrity
  });

  it("should coerce boolean values from various formats", () => {
    // Test 0/1, "true"/"false", boolean conversions
  });

  it("should default to false for security when data is missing", () => {
    // Test that developer options default to disabled state
  });

  it("should handle corrupted persistence data safely", () => {
    // Test malformed data with safe fallbacks
  });
});
```

## Acceptance Criteria

- ✓ Function in separate file with single export following project conventions
- ✓ Correctly converts all PersistedAdvancedSettingsData fields to UI format
- ✓ Uses `coerceBoolean` utility for safe boolean conversions with false fallbacks
- ✓ Uses `applyDefaults` with `defaultAdvancedSettings` for missing fields
- ✓ Round-trip conversion (UI → Persistence → UI) maintains data fidelity
- ✓ Handles corrupted or invalid persistence data gracefully with safe defaults
- ✓ All developer options default to false for security when data is missing/invalid
- ✓ Maintains full TypeScript type safety
- ✓ Pure function with no side effects
- ✓ Mapping operation completes in < 1ms
- ✓ JSDoc documentation with examples and security considerations
- ✓ Unit tests achieve 100% code coverage including round-trip testing
- ✓ All tests pass and quality checks are clean

## Integration Requirements

- Import and use common mapping utilities from F-common-mapping-utilities
- Ensure compatibility with both PersistedAdvancedSettingsData and AdvancedSettingsFormData
- Handle potential format differences between persistence and UI layers
- Export function for use by settings loading logic

## Dependencies

- AdvancedSettingsFormData type and defaults (from T-create-advancedsettingsformdata)
- PersistedAdvancedSettingsData from @fishbowl-ai/shared
- Common mapping utilities (coerceBoolean, applyDefaults)
- Jest for unit testing

## Security Considerations

- Default all developer options to false to prevent accidental enablement
- Safe boolean coercion prevents type confusion attacks
- Handle malformed persistence data without crashing or exposing sensitive info
- No dynamic property access to prevent injection
- Debug logging defaults to false to prevent information leakage
- Experimental features default to false to maintain system stability
- No sensitive data in error messages or logs

### Log

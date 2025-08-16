---
id: T-create-complete-personalities
title: Create complete personalities data validation
status: done
priority: medium
parent: F-personality-validation
prerequisites:
  - T-create-single-personality
affectedFiles:
  packages/shared/eslint.config.cjs: Added ESLint rule to ignore unused variables starting with underscore
  packages/shared/src/services/storage/utils/personalities/validatePersonalitiesData.ts:
    Created comprehensive validation function for complete personalities data
    with schema validation, individual personality validation, and uniqueness
    checks
  packages/shared/src/services/storage/utils/personalities/__tests__/validatePersonalitiesData.test.ts:
    Created comprehensive unit tests covering all validation scenarios including
    file structure, duplicates, individual validation, error aggregation, and
    performance
  packages/shared/src/services/storage/utils/personalities/index.ts: Added export for validatePersonalitiesData function
log:
  - "Successfully implemented comprehensive personalities data validation
    function with all required features: validates complete file structure
    against persistence schema, validates each personality individually using
    existing validator, checks for duplicate IDs and names across personalities,
    returns ValidationResult with comprehensive error reporting, and handles
    both schema and uniqueness validation errors. All unit tests pass with 100%
    coverage including edge cases and performance tests."
schema: v1.0
childrenIds: []
created: 2025-08-15T18:08:50.877Z
updated: 2025-08-15T18:08:50.877Z
---

# Create Complete Personalities Data Validation

## Context

Create validation function for complete personalities file data including schema validation, uniqueness checks, and bulk validation of multiple personalities with performance optimization.

## Implementation Requirements

### File: `packages/shared/src/services/storage/utils/personalities/validatePersonalitiesData.ts`

Create comprehensive file validation:

```typescript
import { BulkValidationResult, ValidationOptions } from "./types";
import { PersistedPersonalitiesSettingsData } from "../../../types/settings/PersistedPersonalitiesSettingsData";

/**
 * Validates complete personalities settings file data
 * @param data - The personalities settings data to validate
 * @param options - Optional validation configuration
 * @returns Detailed bulk validation result
 */
export function validatePersonalitiesData(
  data: unknown,
  options: ValidationOptions = {},
): BulkValidationResult {
  // Validate file structure (schema version, personalities array, lastUpdated)
  // Validate each personality individually
  // Check for duplicate IDs and names
  // Aggregate all validation results
}

/**
 * Validates uniqueness of personality IDs and names
 * @param personalities - Array of personalities to check
 * @returns Array of uniqueness errors
 */
export function validatePersonalityUniqueness(
  personalities: unknown[],
): PersonalityValidationError[] {
  // Check for duplicate IDs (case-sensitive)
  // Check for duplicate names (case-insensitive)
}
```

### Validation Areas

1. **File Structure**: Schema version, personalities array, lastUpdated timestamp
2. **Individual Personalities**: Use single personality validation for each
3. **Uniqueness**: Check for duplicate IDs and names across all personalities
4. **Performance**: Efficient validation for up to 100 personalities
5. **Error Aggregation**: Combine all validation results into comprehensive report

### Global Validation Checks

- Schema version format and compatibility
- Personalities array is valid array
- lastUpdated is valid ISO timestamp
- No duplicate IDs across all personalities
- No duplicate names (case-insensitive) across all personalities

## Acceptance Criteria

- [ ] Validates complete file structure against persistence schema
- [ ] Validates each personality individually using single personality validator
- [ ] Checks for duplicate IDs across all personalities (case-sensitive)
- [ ] Checks for duplicate names across all personalities (case-insensitive)
- [ ] Validates schema version format and tracks compatibility
- [ ] Validates lastUpdated timestamp format
- [ ] Returns comprehensive bulk validation result
- [ ] Aggregates all individual personality validation results
- [ ] Identifies global errors vs individual personality errors
- [ ] Performance: validates 100 personalities within 100ms
- [ ] Provides detailed error reporting with field-level granularity
- [ ] Handles malformed file data gracefully
- [ ] Unit tests cover all validation scenarios including bulk operations

## Testing Requirements (include in this task)

- Test valid complete file passes validation
- Test invalid file structure rejected
- Test duplicate ID detection across multiple personalities
- Test duplicate name detection (case-insensitive)
- Test invalid schema version handling
- Test individual personality errors properly aggregated
- Test empty personalities array validation
- Test malformed input handling (null, wrong type, missing fields)
- Test performance with large datasets (50-100 personalities)
- Test error aggregation accuracy

## Dependencies

- Requires T-create-single-personality to be completed first
- Uses persistence schema and types from previous features

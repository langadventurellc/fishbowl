---
id: T-create-single-personality
title: Create single personality validation function
status: done
priority: high
parent: F-personality-validation
prerequisites:
  - T-create-validation-types-and
affectedFiles:
  packages/shared/src/services/storage/utils/personalities/validateSinglePersonality.ts:
    Created main validation function that uses existing Zod schema and
    ValidationResult interface for comprehensive personality validation
  packages/shared/src/services/storage/utils/personalities/index.ts: Created barrel export file for personalities validation utilities
  packages/shared/src/services/storage/utils/personalities/__tests__/validateSinglePersonality.test.ts:
    Created comprehensive test suite with 37 test cases covering all validation
    scenarios, edge cases, and error conditions
log:
  - Successfully implemented comprehensive single personality validation
    function using existing validation utilities. Created a clean, simple
    solution that leverages the existing Zod schema and ValidationResult
    interface. The function validates all required fields (ID, name, Big Five
    traits, behaviors, custom instructions, timestamps) with clear error
    messages and handles malformed input gracefully. Comprehensive test suite
    covers all validation scenarios including edge cases, error conditions, and
    performance requirements. All quality checks pass.
schema: v1.0
childrenIds: []
created: 2025-08-15T18:08:15.108Z
updated: 2025-08-15T18:08:15.108Z
---

# Create Single Personality Validation Function

## Context

Create the main validation function for individual personalities that leverages Zod schemas and provides detailed error messages with recovery suggestions for all validation failures.

## Implementation Requirements

### File: `packages/shared/src/services/storage/utils/personalities/validateSinglePersonality.ts`

Create comprehensive individual personality validation:

```typescript
import { PersonalityValidationResult, ValidationOptions } from "./types";
import { persistedPersonalitySchema } from "../../../types/settings/personalitiesSettingsSchema";

/**
 * Validates a single personality against the persistence schema
 * @param personality - The personality data to validate
 * @param options - Optional validation configuration
 * @returns Detailed validation result with errors and warnings
 */
export function validateSinglePersonality(
  personality: unknown,
  options: ValidationOptions = {},
): PersonalityValidationResult {
  // Implementation using Zod schema validation
  // + additional business logic validation
  // + user-friendly error messages
}
```

### Validation Areas to Cover

1. **Schema Validation**: Use Zod schema as foundation
2. **Field Presence**: Ensure all required fields exist
3. **Data Types**: Verify correct types for all fields
4. **Value Ranges**: Validate Big Five (0-100) and behaviors (0-100)
5. **String Limits**: Custom instructions (500 chars), name (1-50 chars)
6. **Timestamp Format**: ISO datetime or null validation
7. **ID Format**: Non-empty string validation

### Error Message Examples

- "ID field is required and cannot be empty"
- "Name must be between 1-50 characters, received: 0 characters"
- "Big Five trait 'openness' must be between 0-100, received: 105"
- "Behavior 'analytical' must be between 0-100, received: -5"
- "Custom instructions exceed 500 character limit (current: 523)"
- "Timestamp must be ISO datetime string or null, received: 'invalid'"

## Acceptance Criteria

- [ ] Function validates against Zod persistence schema
- [ ] Detailed error messages for all validation failures
- [ ] Recovery suggestions included in error messages
- [ ] Handles malformed input gracefully without crashing
- [ ] Validates all Big Five traits are present and in range (0-100)
- [ ] Validates behaviors are record of string to number (0-100)
- [ ] Validates custom instructions length limit (500 chars)
- [ ] Validates name length limit (1-50 chars) and non-empty
- [ ] Validates timestamps as ISO datetime or null
- [ ] Returns structured validation result with errors and warnings
- [ ] Performance: completes within 5ms for valid personality
- [ ] Comprehensive JSDoc documentation
- [ ] Unit tests cover all validation scenarios and edge cases

## Testing Requirements (include in this task)

- Test valid personality data passes validation
- Test all Big Five traits validation (valid range, out of range, missing, wrong type)
- Test behaviors validation (valid, out of range, wrong type, empty object)
- Test custom instructions validation (valid, over limit, empty)
- Test name validation (valid, too short, too long, empty)
- Test ID validation (valid, empty, null, undefined)
- Test timestamp validation (valid ISO, null, invalid format)
- Test malformed input handling (null, undefined, wrong type)
- Test error message clarity and usefulness
- Test performance with complex personality data

## Dependencies

- Requires T-create-validation-types-and to be completed first
- Uses persistence schema from F-persistence-schema-and-type feature

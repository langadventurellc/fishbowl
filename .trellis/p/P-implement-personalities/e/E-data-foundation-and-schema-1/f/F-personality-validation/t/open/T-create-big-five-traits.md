---
id: T-create-big-five-traits
title: Create Big Five traits validation utility
status: open
priority: medium
parent: F-personality-validation
prerequisites:
  - T-create-validation-types-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T18:08:32.117Z
updated: 2025-08-15T18:08:32.117Z
---

# Create Big Five Traits Validation Utility

## Context

Create specialized validation utility for Big Five personality traits with detailed error messaging for each trait and comprehensive range validation.

## Implementation Requirements

### File: `packages/shared/src/services/storage/utils/personalities/validateBigFiveTraits.ts`

Create specialized Big Five validation:

```typescript
import { PersonalityValidationError } from "./types";

/**
 * Validates Big Five personality traits structure and values
 * @param bigFive - The Big Five traits object to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateBigFiveTraits(
  bigFive: unknown,
): PersonalityValidationError[] {
  // Validate presence of all 5 traits
  // Validate each trait is number between 0-100
  // Provide specific error messages for each trait
}

/**
 * List of required Big Five trait names
 */
export const BIG_FIVE_TRAITS = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
] as const;

/**
 * Validates a single Big Five trait value
 * @param traitName - Name of the trait being validated
 * @param value - Value to validate
 * @returns Validation error if invalid, null if valid
 */
export function validateBigFiveTrait(
  traitName: string,
  value: unknown,
): PersonalityValidationError | null {
  // Validate individual trait
}
```

### Validation Requirements

- All 5 traits must be present (openness, conscientiousness, extraversion, agreeableness, neuroticism)
- Each trait must be a number between 0-100 (inclusive)
- Decimal values are acceptable
- Non-numeric values rejected with clear message
- Missing traits identified specifically

### Error Message Examples

- "Big Five trait 'openness' is required"
- "Big Five trait 'conscientiousness' must be a number, received: 'high'"
- "Big Five trait 'extraversion' must be between 0-100, received: 105"
- "Big Five trait 'neuroticism' must be between 0-100, received: -10"

## Acceptance Criteria

- [ ] Validates all 5 Big Five traits are present
- [ ] Validates each trait is number type between 0-100 (inclusive)
- [ ] Accepts decimal values (e.g., 75.5)
- [ ] Rejects non-numeric values with specific error messages
- [ ] Rejects out-of-range values with range information
- [ ] Identifies missing traits specifically by name
- [ ] Returns empty array for valid Big Five object
- [ ] Provides trait-specific error messages
- [ ] Includes recovery suggestions in error messages
- [ ] Helper function for validating individual traits
- [ ] Exports constant array of required trait names
- [ ] Comprehensive JSDoc documentation
- [ ] Unit tests cover all validation scenarios

## Testing Requirements (include in this task)

- Test valid Big Five object passes validation (returns empty array)
- Test missing traits identified correctly
- Test each trait with valid values (0, 50, 100, 75.5)
- Test each trait with invalid values (negative, over 100, string, null, undefined)
- Test non-object input handling
- Test extra properties are handled gracefully
- Test error messages are specific and helpful
- Test individual trait validation function works correctly

## Dependencies

- Requires T-create-validation-types-and to be completed first

---
kind: task
id: T-implement-value-transformation
title: Implement value transformation functions with unit tests
status: open
priority: normal
prerequisites:
  - T-create-mapping-utilities
created: "2025-07-31T22:17:17.201484"
updated: "2025-07-31T22:17:17.201484"
schema_version: "1.1"
parent: F-common-mapping-utilities
---

# Implement value transformation functions with unit tests

## Context

Implement specialized utility functions for common value transformations needed in settings mapping. These functions handle time unit conversions, enum normalization, boolean coercion, and numeric clamping operations that are frequently needed when converting between UI and persistence formats.

**Epic Context**: [E-ui-shared-type-mapping](/planning/projects/P-settings-persistence-system-for/epics/E-ui-shared-type-mapping/epic.md)
**Feature Context**: [F-common-mapping-utilities](/planning/projects/P-settings-persistence-system-for/epics/E-ui-shared-type-mapping/features/F-common-mapping-utilities/feature.md)

**Related Types**: UI stores time in seconds, persistence layer uses milliseconds for precision

## Implementation Requirements

### Functions to Implement

#### 1. convertTimeUnit

```typescript
/**
 * Convert time values between milliseconds and seconds
 * @param value - Time value to convert
 * @param from - Source time unit
 * @param to - Target time unit
 * @returns Converted time value
 */
export function convertTimeUnit(
  value: number,
  from: TimeUnit,
  to: TimeUnit,
): number;
```

#### 2. normalizeEnum

```typescript
/**
 * Safely convert unknown values to valid enum values with fallback
 * @param value - Value to normalize (potentially invalid)
 * @param validValues - Array of valid enum values
 * @param defaultValue - Fallback value if normalization fails
 * @returns Valid enum value
 */
export function normalizeEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  defaultValue: T,
): T;
```

#### 3. coerceBoolean

```typescript
/**
 * Convert various truthy/falsy values to strict boolean
 * @param value - Value to coerce to boolean
 * @returns Strict boolean value
 */
export function coerceBoolean(value: unknown): boolean;
```

#### 4. clampNumber

```typescript
/**
 * Ensure numeric values stay within specified bounds
 * @param value - Number to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped number within bounds
 */
export function clampNumber(value: number, min: number, max: number): number;
```

## Technical Approach

1. **Create Implementation File**: `packages/ui-shared/src/mapping/utils/transformers.ts`
2. **Type Safety**: Use proper TypeScript types with runtime validation
3. **Performance**: Efficient operations with minimal overhead
4. **Edge Case Handling**: Handle NaN, Infinity, null, undefined gracefully

### Implementation Details

#### Time Conversion Logic

- ms to s: divide by 1000
- s to ms: multiply by 1000
- Same unit: return unchanged
- Handle precision loss carefully

#### Enum Normalization

- Check if value is in validValues array
- Return defaultValue for invalid inputs
- Handle string comparison safely
- Case-sensitive matching

#### Boolean Coercion Rules

- true/false → true/false
- "true"/"false" → true/false
- 1/0 → true/false
- truthy/falsy → true/false
- null/undefined → false

#### Number Clamping

- Handle NaN (return min)
- Handle Infinity (return max)
- Use Math.min/Math.max for efficiency

## Acceptance Criteria

### Functional Requirements

- ✓ `convertTimeUnit` handles ms ↔ s conversions accurately
- ✓ `normalizeEnum` provides safe enum conversion with fallbacks
- ✓ `coerceBoolean` handles all common truthy/falsy patterns
- ✓ `clampNumber` keeps values within specified bounds
- ✓ All functions handle edge cases gracefully

### Type Safety Requirements

- ✓ Generic types work correctly for enum normalization
- ✓ No 'any' types used in implementation
- ✓ Proper TypeScript constraints and inference
- ✓ Runtime type validation where needed

### Performance Requirements

- ✓ All operations complete in < 0.01ms
- ✓ No unnecessary object creation
- ✓ Efficient algorithms for all transformations

## Testing Requirements

### Unit Tests to Implement

Create comprehensive test file: `packages/ui-shared/src/mapping/utils/__tests__/transformers.test.ts`

#### Test Cases for convertTimeUnit

- Convert ms to seconds correctly (2000ms → 2s)
- Convert seconds to ms correctly (2s → 2000ms)
- Handle same unit conversion (passthrough)
- Handle decimal precision correctly
- Handle zero values
- Handle very large numbers

#### Test Cases for normalizeEnum

- Return valid enum value when input matches
- Return default for invalid string input
- Return default for null/undefined input
- Return default for non-string input
- Handle empty string input
- Work with different enum types

#### Test Cases for coerceBoolean

- Handle true/false boolean values
- Handle "true"/"false" string values
- Handle 1/0 numeric values
- Handle truthy values (non-empty string, objects)
- Handle falsy values (null, undefined, "", 0)
- Handle edge cases (NaN, empty arrays)

#### Test Cases for clampNumber

- Clamp values above maximum
- Clamp values below minimum
- Pass through values within bounds
- Handle edge boundaries correctly
- Handle NaN input (return min)
- Handle Infinity input (return max)
- Handle negative numbers

### Edge Cases to Test

- Invalid inputs (null, undefined, wrong types)
- Boundary conditions (exactly min/max values)
- Precision edge cases for time conversion
- Very large numbers
- Special numeric values (NaN, Infinity)

## Integration Requirements

- ✓ Export all functions from utils/index.ts
- ✓ Use TimeUnit type from base types
- ✓ Ready for use by settings mappers
- ✓ No external dependencies

## Real-World Use Cases

These transformations support actual settings mapping scenarios:

- **Time conversion**: UI shows seconds, persistence stores milliseconds
- **Enum normalization**: User selections to backend enum values
- **Boolean coercion**: Various truthy inputs to strict booleans
- **Number clamping**: Enforce validation rules on numeric settings

## Dependencies

- **Prerequisite**: T-create-mapping-utilities (directory structure and TimeUnit type)

## Files to Create/Modify

- Create: `packages/ui-shared/src/mapping/utils/transformers.ts`
- Create: `packages/ui-shared/src/mapping/utils/__tests__/transformers.test.ts`
- Modify: `packages/ui-shared/src/mapping/utils/index.ts` (add exports)

### Log

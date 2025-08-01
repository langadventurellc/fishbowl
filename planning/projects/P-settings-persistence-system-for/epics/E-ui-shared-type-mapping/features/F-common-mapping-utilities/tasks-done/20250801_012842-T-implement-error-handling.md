---
kind: task
id: T-implement-error-handling
parent: F-common-mapping-utilities
status: done
title: Implement error handling utilities with unit tests
priority: normal
prerequisites:
  - T-create-mapping-utilities
created: "2025-07-31T22:18:23.611357"
updated: "2025-08-01T01:18:11.983529"
schema_version: "1.1"
worktree: null
---

# Implement error handling utilities with unit tests

## Context

Implement standardized error handling utilities for mapping operations. These utilities provide consistent error creation, mapper wrapping with error boundaries, validation integration, and result type handling to ensure robust error management across all mapping functions.

**Epic Context**: [E-ui-shared-type-mapping](/planning/projects/P-settings-persistence-system-for/epics/E-ui-shared-type-mapping/epic.md)
**Feature Context**: [F-common-mapping-utilities](/planning/projects/P-settings-persistence-system-for/epics/E-ui-shared-type-mapping/features/F-common-mapping-utilities/feature.md)

**Design Principle**: Never throw exceptions from mappers - always return Result types for predictable error handling.

## Implementation Requirements

### Functions to Implement

#### 1. createMappingError

```typescript
/**
 * Create standardized mapping error objects
 * @param code - Error code for programmatic handling
 * @param message - Human-readable error message
 * @param field - Optional field name where error occurred
 * @param value - Optional value that caused the error
 * @returns Standardized MappingError object
 */
export function createMappingError(
  code: string,
  message: string,
  field?: string,
  value?: unknown,
): MappingError;
```

#### 2. wrapMapper

```typescript
/**
 * Add error boundary to mapping functions
 * @param mapper - Unsafe mapper that might throw
 * @returns Safe mapper that returns MappingResult
 */
export function wrapMapper<T, U>(mapper: (input: T) => U): SafeMapper<T, U>;
```

#### 3. validateAndMap

```typescript
/**
 * Combine validation with mapping in single operation
 * @param input - Input to validate and map
 * @param validator - Validation function
 * @param mapper - Mapping function
 * @returns MappingResult with validation and mapping
 */
export function validateAndMap<T, U>(
  input: T,
  validator: (input: T) => boolean | string,
  mapper: (input: T) => U,
): MappingResult<U>;
```

#### 4. Result Type Utilities

```typescript
/**
 * Check if result is successful
 */
export function isSuccess<T>(
  result: MappingResult<T>,
): result is { success: true; data: T };

/**
 * Check if result is an error
 */
export function isError<T>(
  result: MappingResult<T>,
): result is { success: false; error: MappingError };

/**
 * Extract data from successful result or throw
 */
export function unwrapResult<T>(result: MappingResult<T>): T;

/**
 * Extract data from result with fallback
 */
export function unwrapOr<T>(result: MappingResult<T>, fallback: T): T;
```

## Technical Approach

1. **Create Implementation File**: `packages/ui-shared/src/mapping/utils/errors.ts`
2. **Consistent Error Format**: Use MappingError interface throughout
3. **No Exceptions**: Return Result types instead of throwing
4. **Type Guards**: Provide utility functions for result type checking
5. **Validation Integration**: Seamless validation and mapping workflow

### Implementation Details

#### Error Creation Strategy

- Standardized error codes for programmatic handling
- Human-readable messages for debugging
- Optional field and value context
- Consistent error structure

#### Mapper Wrapping

- Catch all exceptions in unsafe mappers
- Convert exceptions to MappingError objects
- Preserve stack traces for debugging
- Return MappingResult types

#### Validation Integration

- Support boolean and string return from validators
- String returns become error messages
- Boolean false triggers generic validation error
- Seamless error propagation

#### Result Type Utilities

- Type guards for success/error checking
- Safe unwrapping with type narrowing
- Fallback mechanisms for error cases

## Acceptance Criteria

### Functional Requirements

- ✓ `createMappingError` produces consistent error objects
- ✓ `wrapMapper` converts unsafe mappers to safe ones
- ✓ `validateAndMap` combines validation and mapping seamlessly
- ✓ Result utilities provide type-safe error handling
- ✓ No exceptions thrown from any error handling utilities

### Type Safety Requirements

- ✓ Full TypeScript type safety for all utilities
- ✓ Proper type guards and narrowing
- ✓ Generic types preserved through error handling
- ✓ No use of 'any' types

### Error Handling Requirements

- ✓ Consistent error format across all utilities
- ✓ Helpful error messages for debugging
- ✓ Context preservation (field, value information)
- ✓ No information loss during error wrapping

## Testing Requirements

### Unit Tests to Implement

Create comprehensive test file: `packages/ui-shared/src/mapping/utils/__tests__/errors.test.ts`

#### Test Cases for createMappingError

- Create basic error with code and message
- Include optional field information
- Include optional value information
- Handle various value types safely
- Verify consistent error structure

#### Test Cases for wrapMapper

- Wrap successful mapper (returns success result)
- Wrap mapper that throws exception (returns error result)
- Preserve original mapper behavior when successful
- Convert various exception types to MappingError
- Handle async mappers if applicable

#### Test Cases for validateAndMap

- Valid input with successful mapping
- Invalid input with boolean validator
- Invalid input with string validator (custom message)
- Validation passes but mapping fails
- Various input types and validators

#### Test Cases for Result Utilities

- `isSuccess` type guard behavior
- `isError` type guard behavior
- `unwrapResult` with successful result
- `unwrapResult` with error result (should throw)
- `unwrapOr` with successful result
- `unwrapOr` with error result (returns fallback)

### Edge Cases to Test

- Null and undefined inputs
- Validators that throw exceptions
- Mappers that return null/undefined
- Very large error objects
- Circular references in error values

## Integration Requirements

- ✓ Export all functions from utils/index.ts
- ✓ Use MappingError and MappingResult from base types
- ✓ Compatible with other mapping utilities
- ✓ Ready for use by settings mappers

## Error Codes Standard

Define standard error codes for common mapping scenarios:

- `VALIDATION_FAILED`: Input validation failed
- `MAPPING_FAILED`: Transformation operation failed
- `FIELD_MISSING`: Required field not present
- `TYPE_MISMATCH`: Value type doesn't match expected type
- `VALUE_OUT_OF_RANGE`: Numeric value outside allowed range

## Real-World Use Cases

- **Error Boundary**: Wrap potentially unsafe transformations
- **Validation Flow**: Check inputs before expensive mapping operations
- **Error Aggregation**: Collect multiple mapping errors for batch processing
- **Debugging Support**: Rich error context for troubleshooting

## Dependencies

- **Prerequisite**: T-create-mapping-utilities (MappingError and MappingResult types)

## Files to Create/Modify

- Create: `packages/ui-shared/src/mapping/utils/errors.ts`
- Create: `packages/ui-shared/src/mapping/utils/__tests__/errors.test.ts`
- Modify: `packages/ui-shared/src/mapping/utils/index.ts` (add exports)

### Log

**2025-08-01T06:28:42.646762Z** - Implemented comprehensive error handling utilities for the mapping system in ui-shared package. Added MappingError class, Result type pattern, type guards, error boundary wrappers, validation integration, result chaining, and array mapping with error handling. All utilities are pure functions with full TypeScript support and comprehensive test coverage (290 tests passing).

- filesChanged: ["packages/ui-shared/src/mapping/utils/errors/MappingError.ts", "packages/ui-shared/src/mapping/utils/errors/MappingResult.ts", "packages/ui-shared/src/mapping/utils/errors/createMappingError.ts", "packages/ui-shared/src/mapping/utils/errors/isSuccess.ts", "packages/ui-shared/src/mapping/utils/errors/isError.ts", "packages/ui-shared/src/mapping/utils/errors/wrapMapper.ts", "packages/ui-shared/src/mapping/utils/errors/unwrapResult.ts", "packages/ui-shared/src/mapping/utils/errors/getOrDefault.ts", "packages/ui-shared/src/mapping/utils/errors/validateAndMap.ts", "packages/ui-shared/src/mapping/utils/errors/chainResults.ts", "packages/ui-shared/src/mapping/utils/errors/mapArrayWithErrors.ts", "packages/ui-shared/src/mapping/utils/errors/index.ts", "packages/ui-shared/src/mapping/utils/errors/__tests__/MappingError.test.ts", "packages/ui-shared/src/mapping/utils/errors/__tests__/createMappingError.test.ts", "packages/ui-shared/src/mapping/utils/errors/__tests__/typeGuards.test.ts", "packages/ui-shared/src/mapping/utils/errors/__tests__/wrapMapper.test.ts", "packages/ui-shared/src/mapping/utils/errors/__tests__/resultUtilities.test.ts", "packages/ui-shared/src/mapping/utils/errors/__tests__/validateAndMap.test.ts", "packages/ui-shared/src/mapping/utils/errors/__tests__/chainResults.test.ts", "packages/ui-shared/src/mapping/utils/errors/__tests__/mapArrayWithErrors.test.ts"]

---
kind: task
id: T-implement-generic-mapping
parent: F-common-mapping-utilities
status: done
title: Implement generic mapping helpers with unit tests
priority: normal
prerequisites:
  - T-create-mapping-utilities
created: "2025-07-31T22:16:47.560932"
updated: "2025-07-31T22:37:50.120848"
schema_version: "1.1"
worktree: null
---

# Implement generic mapping helpers with unit tests

## Context

Implement core generic mapping helper functions that provide reusable patterns for common mapping operations. These helpers will be used by individual settings mappers to handle default value injection, mapper creation, and type-safe transformations.

**Epic Context**: [E-ui-shared-type-mapping](/planning/projects/P-settings-persistence-system-for/epics/E-ui-shared-type-mapping/epic.md)
**Feature Context**: [F-common-mapping-utilities](/planning/projects/P-settings-persistence-system-for/epics/E-ui-shared-type-mapping/features/F-common-mapping-utilities/feature.md)

## Implementation Requirements

### Functions to Implement

#### 1. applyDefaults<T>

```typescript
/**
 * Apply default values to partial objects, creating complete objects
 * @param partial - Partial object with some fields
 * @param defaults - Complete default object
 * @returns Complete object with defaults applied to missing fields
 */
export function applyDefaults<T extends Record<string, unknown>>(
  partial: Partial<T>,
  defaults: T,
): T;
```

#### 2. mapWithDefaults<T, U>

```typescript
/**
 * Create a mapper that applies defaults before transformation
 * @param mapper - Transformation function
 * @param defaults - Default values for output type
 * @returns Mapper function that handles partial inputs
 */
export function mapWithDefaults<T, U extends Record<string, unknown>>(
  mapper: (input: T) => U,
  defaults: U,
): (input: Partial<T>) => U;
```

#### 3. createMapper<T, U>

```typescript
/**
 * Factory for creating type-safe mappers with optional validation
 * @param mapperFn - Core mapping function
 * @param validator - Optional input validation function
 * @returns Type-safe mapper with error handling
 */
export function createMapper<T, U>(
  mapperFn: (input: T) => U,
  validator?: (input: T) => boolean,
): SafeMapper<T, U>;
```

## Technical Approach

1. **Create Implementation File**: `packages/ui-shared/src/mapping/utils/defaults.ts`
2. **Generic Type Safety**: Use proper TypeScript generics with constraints
3. **Pure Functions**: All functions must be pure with no side effects
4. **Error Handling**: Return error results rather than throwing exceptions
5. **Performance**: Efficient object operations with minimal cloning

### Implementation Details

- Use `{ ...defaults, ...partial }` pattern for shallow merge
- Validate inputs using TypeScript type guards
- Return `MappingResult<T>` for functions that can fail
- Document edge cases (null, undefined, empty objects)

## Acceptance Criteria

### Functional Requirements

- ✓ `applyDefaults` correctly merges partial objects with defaults
- ✓ `mapWithDefaults` creates mappers that handle missing fields
- ✓ `createMapper` produces type-safe mappers with error handling
- ✓ All functions are pure with no side effects
- ✓ Type inference works correctly with TypeScript

### Type Safety Requirements

- ✓ Full generic type support with proper constraints
- ✓ No use of 'any' types anywhere
- ✓ Type errors caught at compile time
- ✓ IntelliSense autocomplete works correctly

### Performance Requirements

- ✓ Operations complete in < 0.1ms for typical objects
- ✓ No unnecessary object cloning
- ✓ Efficient algorithms for all operations

## Testing Requirements

### Unit Tests to Implement

Create comprehensive test file: `packages/ui-shared/src/mapping/utils/__tests__/defaults.test.ts`

#### Test Cases for applyDefaults

- Merge partial object with complete defaults
- Handle empty partial object (returns defaults)
- Handle complete object (no defaults needed)
- Preserve existing values in partial
- Handle nested objects correctly
- Handle null and undefined values

#### Test Cases for mapWithDefaults

- Create mapper that applies defaults
- Handle partial input objects
- Preserve transformation logic
- Work with different input/output types
- Handle mapping errors gracefully

#### Test Cases for createMapper

- Create basic type-safe mapper
- Add validation to mapper creation
- Handle validation failures
- Return proper MappingResult types
- Work with complex object types

### Edge Cases to Test

- Empty objects
- Null and undefined values
- Objects with prototype pollution
- Very large objects (performance)
- Circular references (should avoid infinite loops)

## Integration Requirements

- ✓ Export all functions from utils/index.ts
- ✓ Compatible with MappingResult and MappingError types
- ✓ Ready for use by settings mappers
- ✓ No external dependencies beyond TypeScript

## Security Considerations

- Prevent prototype pollution in object merging
- Validate inputs to prevent unexpected behavior
- No code execution through object properties
- Safe handling of user-provided data

## Dependencies

- **Prerequisite**: T-create-mapping-utilities (directory structure and base types)

## Files to Create/Modify

- Create: `packages/ui-shared/src/mapping/utils/defaults.ts`
- Create: `packages/ui-shared/src/mapping/utils/__tests__/defaults.test.ts`
- Modify: `packages/ui-shared/src/mapping/utils/index.ts` (add exports)

### Log

**2025-08-01T03:53:24.036205Z** - Implemented generic mapping helper functions with comprehensive unit tests and security measures.

Created three core mapping utilities:

- applyDefaults: Merges partial objects with defaults, including prototype pollution protection
- mapWithDefaults: Creates mappers that apply defaults before transformation
- createMapper: Factory for type-safe mappers with validation and error handling

All functions follow the codebase's strict one-export-per-file pattern and are properly organized in the defaults/ subdirectory with barrel exports. Implementation includes comprehensive error handling using existing MappingResult and MappingError types.

Security features:

- Prototype pollution prevention by filtering dangerous keys (**proto**, constructor, prototype)
- Input validation support in createMapper
- Safe error handling with proper error wrapping

All tests pass with 100% coverage including edge cases for null/undefined values, validation failures, and security scenarios.

- filesChanged: ["packages/ui-shared/src/mapping/utils/defaults/applyDefaults.ts", "packages/ui-shared/src/mapping/utils/defaults/mapWithDefaults.ts", "packages/ui-shared/src/mapping/utils/defaults/createMapper.ts", "packages/ui-shared/src/mapping/utils/defaults/index.ts", "packages/ui-shared/src/mapping/utils/defaults/__tests__/applyDefaults.test.ts", "packages/ui-shared/src/mapping/utils/defaults/__tests__/mapWithDefaults.test.ts", "packages/ui-shared/src/mapping/utils/defaults/__tests__/createMapper.test.ts", "packages/ui-shared/src/mapping/index.ts", "packages/ui-shared/src/mapping/utils/factories/index.ts"]

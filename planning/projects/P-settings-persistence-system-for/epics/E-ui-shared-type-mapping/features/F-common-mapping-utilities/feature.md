---
kind: feature
id: F-common-mapping-utilities
title: Common Mapping Utilities
status: done
priority: normal
prerequisites: []
created: "2025-07-31T22:03:33.191777"
updated: "2025-08-01T15:46:33.073003+00:00"
schema_version: "1.1"
parent: E-ui-shared-type-mapping
---

# Common Mapping Utilities

## Purpose and Functionality

Create reusable utility functions and helpers for common mapping operations in the ui-shared package. These utilities support the individual settings mappers by providing generic transformation functions, default value handling, nested object operations, and error handling patterns that can be shared across all mapping implementations.

## Key Components to Implement

### 1. Generic Mapping Helpers

- `applyDefaults<T>`: Apply default values to partial objects
- `mapWithDefaults<T, U>`: Map with automatic default injection
- `createMapper<T, U>`: Factory for creating type-safe mappers

### 2. Value Transformation Functions

- `convertTimeUnit`: Convert between milliseconds/seconds
- `normalizeEnum`: Safe enum value conversion with fallback
- `coerceBoolean`: Convert various truthy/falsy values to boolean
- `clampNumber`: Ensure numeric values stay within bounds

### 3. Nested Object Utilities

- `flattenObject`: Convert nested structure to flat key-value pairs
- `unflattenObject`: Reconstruct nested structure from flat pairs
- `mergeDeep`: Deep merge objects with type safety
- `pickFields`: Type-safe field selection

### 4. Error Handling Utilities

- `createMappingError`: Standardized error creation
- `wrapMapper`: Add error boundary to mapping functions
- `validateAndMap`: Combine validation with mapping
- Result type utilities for error handling

## Detailed Acceptance Criteria

### Functional Behavior

- ✓ All utilities are pure functions with no side effects
- ✓ Generic utilities work with any TypeScript types
- ✓ Time conversion handles milliseconds ↔ seconds correctly
- ✓ Enum normalization provides safe fallbacks
- ✓ Deep merge preserves all data without mutation
- ✓ Error utilities provide consistent error handling

### Type Safety Requirements

- ✓ Full generic type support with proper constraints
- ✓ No use of 'any' types
- ✓ Type inference works correctly
- ✓ Compile-time type checking preserved

### Integration Points

- ✓ Utilities exported from central location
- ✓ Used by all settings mappers
- ✓ Compatible with Zod schemas
- ✓ Works with both UI and persistence types

### Performance Requirements

- ✓ All operations complete in < 0.1ms
- ✓ No unnecessary object cloning
- ✓ Efficient algorithms for nested operations
- ✓ Minimal memory allocation

### Developer Experience

- ✓ Intuitive API design
- ✓ Clear JSDoc documentation
- ✓ TypeScript autocomplete support
- ✓ Helpful error messages

## Technical Requirements

### Implementation Structure

```typescript
// packages/ui-shared/src/mapping/utils/defaults.ts
export function applyDefaults<T>(partial: Partial<T>, defaults: T): T;
export function mapWithDefaults<T, U>(
  mapper: (input: T) => U,
  defaults: U,
): (input: Partial<T>) => U;

// packages/ui-shared/src/mapping/utils/transformers.ts
export function convertTimeUnit(
  value: number,
  from: "ms" | "s",
  to: "ms" | "s",
): number;
export function normalizeEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  defaultValue: T,
): T;

// packages/ui-shared/src/mapping/utils/objects.ts
export function mergeDeep<T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T;
export function pickFields<T, K extends keyof T>(
  obj: T,
  fields: K[],
): Pick<T, K>;

// packages/ui-shared/src/mapping/utils/errors.ts
export type MappingResult<T> =
  | { success: true; data: T }
  | { success: false; error: MappingError };
export function wrapMapper<T, U>(
  mapper: (input: T) => U,
): (input: T) => MappingResult<U>;
```

### Dependencies

- TypeScript utility types
- No external dependencies for core utilities
- Compatible with Zod for validation integration

## Implementation Guidance

### Technical Approach

1. Create utils directory structure in mapping folder
2. Group utilities by functionality (defaults, transformers, etc.)
3. Use TypeScript generics for maximum reusability
4. Implement comprehensive type constraints
5. Export all utilities from central index

### Best Practices

- Keep utilities small and focused
- Use descriptive names for clarity
- Avoid coupling to specific types
- Provide sensible defaults
- Document edge cases

## Testing Requirements

### Unit Tests

- Test each utility in isolation
- Test with various TypeScript types
- Test edge cases (null, undefined, empty)
- Test type inference
- Test error scenarios
- Verify immutability

### Integration Tests

- Test utilities with actual mappers
- Verify composition of utilities
- Test with real settings data

## Security Considerations

- Validate inputs in transformation functions
- Prevent prototype pollution in deep merge
- Safe handling of untrusted data
- No code execution through values

## Performance Requirements

- O(1) operations where possible
- Efficient deep cloning algorithms
- Lazy evaluation where beneficial
- Minimal intermediate objects

## Reusability

- Generic enough for future mapping needs
- Not coupled to settings domain
- Usable by mobile platform
- Extensible for new transformations

### Log

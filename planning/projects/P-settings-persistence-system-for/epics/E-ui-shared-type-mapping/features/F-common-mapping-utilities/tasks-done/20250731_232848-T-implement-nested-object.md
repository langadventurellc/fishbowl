---
kind: task
id: T-implement-nested-object
parent: F-common-mapping-utilities
status: done
title: Implement nested object utilities with unit tests
priority: normal
prerequisites:
  - T-create-mapping-utilities
created: "2025-07-31T22:17:49.883712"
updated: "2025-07-31T23:16:06.367196"
schema_version: "1.1"
worktree: null
---

# Implement nested object utilities with unit tests

## Context

Implement utilities for manipulating nested object structures commonly needed in settings mapping. These functions handle object flattening/unflattening, deep merging, and field selection operations while maintaining type safety and preventing common security issues.

**Epic Context**: [E-ui-shared-type-mapping](/planning/projects/P-settings-persistence-system-for/epics/E-ui-shared-type-mapping/epic.md)
**Feature Context**: [F-common-mapping-utilities](/planning/projects/P-settings-persistence-system-for/epics/E-ui-shared-type-mapping/features/F-common-mapping-utilities/feature.md)

**Note**: While current settings use flat structures, these utilities prepare for future nested configurations and provide robust object manipulation capabilities.

## Implementation Requirements

### Functions to Implement

#### 1. flattenObject

```typescript
/**
 * Convert nested object structure to flat key-value pairs
 * @param obj - Nested object to flatten
 * @param separator - Key separator (default: '.')
 * @returns Flat object with dot-notation keys
 */
export function flattenObject<T extends Record<string, unknown>>(
  obj: T,
  separator?: string,
): Record<string, unknown>;
```

#### 2. unflattenObject

```typescript
/**
 * Reconstruct nested object from flat key-value pairs
 * @param flat - Flat object with dot-notation keys
 * @param separator - Key separator (default: '.')
 * @returns Nested object structure
 */
export function unflattenObject<T = Record<string, unknown>>(
  flat: Record<string, unknown>,
  separator?: string,
): T;
```

#### 3. mergeDeep

```typescript
/**
 * Deep merge objects with type safety and immutability
 * @param target - Base object
 * @param sources - Objects to merge into target
 * @returns New merged object (target unchanged)
 */
export function mergeDeep<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T;
```

#### 4. pickFields

```typescript
/**
 * Type-safe field selection from objects
 * @param obj - Source object
 * @param fields - Array of field names to pick
 * @returns New object with only selected fields
 */
export function pickFields<T, K extends keyof T>(
  obj: T,
  fields: K[],
): Pick<T, K>;
```

## Technical Approach

1. **Create Implementation File**: `packages/ui-shared/src/mapping/utils/objects.ts`
2. **Type Safety**: Preserve TypeScript types through transformations
3. **Immutability**: All operations return new objects without mutation
4. **Security**: Prevent prototype pollution attacks
5. **Performance**: Efficient algorithms for deep operations

### Implementation Details

#### Flattening Algorithm

- Recursive descent through object properties
- Build dot-notation keys (e.g., "user.preferences.theme")
- Handle arrays as indexed properties
- Skip functions and symbols

#### Unflattening Algorithm

- Parse dot-notation keys to rebuild structure
- Create nested objects as needed
- Handle array reconstruction correctly
- Preserve value types

#### Deep Merge Strategy

- Recursive merge for nested objects
- Array concatenation vs replacement (configurable)
- Prototype pollution prevention
- Type preservation throughout merge

#### Field Picking

- Type-safe key selection
- Preserve original value types
- Handle computed properties correctly

## Acceptance Criteria

### Functional Requirements

- ✓ `flattenObject` converts nested structures to flat key-value pairs
- ✓ `unflattenObject` reconstructs original nested structure
- ✓ `mergeDeep` combines objects without mutating originals
- ✓ `pickFields` selects fields with full type safety
- ✓ Round-trip operations preserve data integrity

### Type Safety Requirements

- ✓ Generic types preserved through all transformations
- ✓ No loss of TypeScript type information
- ✓ Compile-time type checking for field selection
- ✓ No use of 'any' types in implementation

### Security Requirements

- ✓ Prototype pollution prevention in merge operations
- ✓ Safe handling of constructor and **proto** properties
- ✓ No code execution through object properties
- ✓ Input validation for untrusted data

### Performance Requirements

- ✓ O(n) complexity for flat operations where possible
- ✓ Efficient deep cloning algorithms
- ✓ Minimal intermediate object creation
- ✓ Operations complete in < 1ms for typical objects

## Testing Requirements

### Unit Tests to Implement

Create comprehensive test file: `packages/ui-shared/src/mapping/utils/__tests__/objects.test.ts`

#### Test Cases for flattenObject

- Flatten simple nested object
- Handle arrays in nested structure
- Custom separator characters
- Empty objects and null values
- Very deep nesting levels
- Objects with mixed value types

#### Test Cases for unflattenObject

- Reconstruct simple nested structure
- Handle array reconstruction
- Custom separator characters
- Empty flat objects
- Invalid key patterns
- Type preservation during reconstruction

#### Test Cases for mergeDeep

- Merge simple objects
- Deep merge nested structures
- Handle array merging
- Prevent prototype pollution
- Multiple source objects
- Empty objects and null values
- Preserve immutability (original unchanged)

#### Test Cases for pickFields

- Pick single field
- Pick multiple fields
- Non-existent fields (ignored)
- Type safety verification
- Empty field arrays
- Complex object types

### Security Test Cases

- Prototype pollution attempts
- Constructor property handling
- **proto** property handling
- Invalid key injection attempts

### Edge Cases to Test

- Circular references (should handle gracefully)
- Very large objects (performance)
- Objects with special properties
- Empty and null inputs
- Invalid separator characters

## Integration Requirements

- ✓ Export all functions from utils/index.ts
- ✓ Compatible with existing mapping utilities
- ✓ Ready for use by settings mappers
- ✓ No external dependencies beyond TypeScript

## Real-World Use Cases

- **Flattening**: Convert complex UI state to storage format
- **Unflattening**: Reconstruct UI state from flat storage
- **Deep Merge**: Combine user settings with defaults
- **Field Picking**: Extract specific settings for validation

## Dependencies

- **Prerequisite**: T-create-mapping-utilities (directory structure and base types)

## Files to Create/Modify

- Create: `packages/ui-shared/src/mapping/utils/objects.ts`
- Create: `packages/ui-shared/src/mapping/utils/__tests__/objects.test.ts`
- Modify: `packages/ui-shared/src/mapping/utils/index.ts` (add exports)

### Log

**2025-08-01T04:28:48.307641Z** - Implemented comprehensive nested object utilities with full type safety and security protections. Created four core functions: flattenObject (converts nested structures to dot-notation), unflattenObject (reconstructs nested structures), mergeDeep (immutable deep merge with prototype pollution prevention), and pickFields (type-safe field selection). All functions include security measures against prototype pollution attacks and comprehensive test coverage with 227 passing tests. Functions are optimized for performance and follow strict TypeScript patterns with no 'any' types.

- filesChanged: ["packages/ui-shared/src/mapping/utils/objects/flattenObject.ts", "packages/ui-shared/src/mapping/utils/objects/unflattenObject.ts", "packages/ui-shared/src/mapping/utils/objects/mergeDeep.ts", "packages/ui-shared/src/mapping/utils/objects/pickFields.ts", "packages/ui-shared/src/mapping/utils/__tests__/objects.test.ts"]

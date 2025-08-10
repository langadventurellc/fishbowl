---
id: T-create-roles-mapping-utility
title: Create roles mapping utility functions with comprehensive unit tests
status: open
priority: medium
parent: F-data-mapping-layer
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-10T22:19:20.553Z
updated: 2025-08-10T22:19:20.553Z
---

# Create Roles Mapping Utility Functions with Comprehensive Unit Tests

## Context and Purpose

Implement specialized utility functions for roles data transformation, including timestamp handling, field normalization, and validation helpers. These utilities support the core mapping functions and ensure consistent data processing across the roles mapping layer.

## Implementation Location

**Files to Create:**

- `packages/ui-shared/src/mapping/roles/utils/handleNullTimestamps.ts`
- `packages/ui-shared/src/mapping/roles/utils/normalizeRoleFields.ts`
- `packages/ui-shared/src/mapping/roles/utils/__tests__/handleNullTimestamps.test.ts`
- `packages/ui-shared/src/mapping/roles/utils/__tests__/normalizeRoleFields.test.ts`
- `packages/ui-shared/src/mapping/roles/utils/index.ts` (barrel exports)

## Reference Implementation Pattern

Follow patterns from `packages/ui-shared/src/mapping/utils/transformers/` and existing utility functions like `clampNumber`, `coerceBoolean`.

## Detailed Implementation Requirements

### Core Utility Functions

#### handleNullTimestamps Function

```typescript
/**
 * Handles null/undefined timestamps by generating new ISO timestamps.
 * Used for manually edited JSON files that may have null timestamp values.
 *
 * @param role - Role data with potentially null timestamps
 * @returns Object with valid ISO timestamp strings
 */
export function handleNullTimestamps(role: {
  createdAt?: string | null;
  updatedAt?: string | null;
}): {
  createdAt: string;
  updatedAt: string;
} {
  const now = new Date().toISOString();

  return {
    createdAt: role.createdAt || now,
    updatedAt: role.updatedAt || now,
  };
}
```

#### normalizeRoleFields Function

```typescript
import { clampString } from "../../utils/transformers";

/**
 * Normalizes role fields by applying length constraints and trimming whitespace.
 * Ensures role data meets persistence schema requirements.
 *
 * @param role - Role data to normalize
 * @returns Role with normalized fields
 */
export function normalizeRoleFields(role: {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
}): {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
} {
  return {
    id: role.id.trim(),
    name: clampString(role.name?.trim() || "", 1, 100),
    description: clampString(role.description?.trim() || "", 0, 500),
    systemPrompt: clampString(role.systemPrompt?.trim() || "", 0, 2000),
  };
}
```

### Function Requirements

#### handleNullTimestamps Requirements

- [ ] **Null Handling**: Convert null timestamps to current ISO string
- [ ] **Undefined Handling**: Convert undefined timestamps to current ISO string
- [ ] **Preserve Valid**: Keep existing valid ISO timestamp strings unchanged
- [ ] **Consistency**: Use same timestamp for both fields when both are missing
- [ ] **ISO Format**: Always return valid ISO 8601 timestamp strings

#### normalizeRoleFields Requirements

- [ ] **String Trimming**: Remove leading/trailing whitespace from all string fields
- [ ] **Length Constraints**: Apply schema-defined max lengths (name: 100, description: 500, systemPrompt: 2000)
- [ ] **Required Fields**: Ensure name field has minimum length of 1 character
- [ ] **Default Values**: Provide empty strings for missing optional fields
- [ ] **ID Preservation**: Preserve role ID exactly (only trim whitespace)

### Unit Tests Implementation

#### handleNullTimestamps.test.ts Coverage

```typescript
describe("handleNullTimestamps", () => {
  it("should generate timestamps for null values", () => {});
  it("should generate timestamps for undefined values", () => {});
  it("should preserve existing valid timestamps", () => {});
  it("should use same timestamp for both missing fields", () => {});
  it("should generate proper ISO 8601 format", () => {});
  it("should handle mixed null and valid timestamps", () => {});
  it("should handle empty string timestamps as invalid", () => {});
  it("should handle malformed timestamp strings", () => {});
});
```

#### normalizeRoleFields.test.ts Coverage

```typescript
describe("normalizeRoleFields", () => {
  it("should trim whitespace from all string fields", () => {});
  it("should apply length constraints to name field", () => {});
  it("should apply length constraints to description field", () => {});
  it("should apply length constraints to systemPrompt field", () => {});
  it("should enforce minimum name length", () => {});
  it("should provide defaults for missing optional fields", () => {});
  it("should handle unicode characters correctly", () => {});
  it("should preserve role ID with trimming only", () => {});
  it("should handle very long strings gracefully", () => {});
  it("should handle empty strings appropriately", () => {});
});
```

### Advanced Test Scenarios

- [ ] **Unicode Character Handling**: Test proper length calculation with unicode characters
- [ ] **Edge Case Strings**: Test strings at exact length limits
- [ ] **Control Characters**: Test handling of newlines, tabs, and other control characters
- [ ] **Performance**: Test processing with large string inputs
- [ ] **Malformed Data**: Test handling of null/undefined inputs

## Technical Implementation Details

### String Utility Integration

- [ ] **clampString Implementation**: Create if not exists, or use existing transformer
- [ ] **Length Calculation**: Use proper character-based length (not byte length)
- [ ] **Unicode Support**: Handle multi-byte characters correctly
- [ ] **Trimming Strategy**: Remove only leading/trailing whitespace, preserve internal spacing

### Timestamp Utility Integration

- [ ] **ISO Format Validation**: Ensure generated timestamps are valid ISO 8601
- [ ] **Timezone Handling**: Always generate UTC timestamps (Z suffix)
- [ ] **Precision**: Use millisecond precision for timestamps
- [ ] **Consistency**: Use consistent timestamp generation strategy

### Barrel Exports Implementation

```typescript
// packages/ui-shared/src/mapping/roles/utils/index.ts
export { handleNullTimestamps } from "./handleNullTimestamps";
export { normalizeRoleFields } from "./normalizeRoleFields";
```

## Acceptance Criteria

### Functional Requirements

- [ ] Both utility functions implemented following established patterns
- [ ] Timestamp handling works for all null/undefined cases
- [ ] Field normalization applies all constraints correctly
- [ ] Functions integrate with existing mapping utilities
- [ ] Performance meets requirements for large datasets

### Testing Requirements

- [ ] 100% test coverage for both utility functions
- [ ] All edge cases covered (unicode, control characters, boundary conditions)
- [ ] Performance tests with large string inputs
- [ ] Integration tests with mapping functions

### Code Quality

- [ ] Clear JSDoc documentation with examples
- [ ] TypeScript types are precise and well-integrated
- [ ] Follows existing utility function patterns
- [ ] Barrel exports provide clean module interface

## Technical Notes

- **Pattern Consistency**: Follow exact patterns from existing mapping transformers
- **Performance Optimization**: Use efficient string operations for large inputs
- **Memory Management**: Avoid unnecessary string copying in hot paths
- **Error Handling**: Functions should be predictable and not throw exceptions

## Dependencies

- May require new `clampString` utility if not existing in transformers
- Uses existing TypeScript types from UI and shared packages
- Integrates with barrel export pattern from mapping utilities

## Definition of Done

- [ ] Both utility functions fully implemented with comprehensive validation
- [ ] Unit tests provide 100% coverage including edge cases
- [ ] Functions integrate correctly with core mapping functions
- [ ] Performance benchmarks meet requirements
- [ ] Barrel exports provide clean module interface
- [ ] Code passes all TypeScript compilation and quality checks

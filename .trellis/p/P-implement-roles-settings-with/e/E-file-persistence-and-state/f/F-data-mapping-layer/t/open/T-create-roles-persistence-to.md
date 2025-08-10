---
id: T-create-roles-persistence-to
title: Create roles persistence to UI mapping functions with comprehensive unit tests
status: open
priority: high
parent: F-data-mapping-layer
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-10T22:18:46.798Z
updated: 2025-08-10T22:18:46.798Z
---

# Create Roles Persistence to UI Mapping Functions with Comprehensive Unit Tests

## Context and Purpose

Implement mapping functions that transform persisted roles data to UI view models, following the established patterns from settings mappers. These functions handle data recovery, field normalization, and null/undefined timestamp handling from manually edited JSON files.

## Implementation Location

**Files to Create:**

- `packages/ui-shared/src/mapping/roles/mapRolesPersistenceToUI.ts`
- `packages/ui-shared/src/mapping/roles/mapSingleRolePersistenceToUI.ts`
- `packages/ui-shared/src/mapping/roles/__tests__/mapRolesPersistenceToUI.test.ts`
- `packages/ui-shared/src/mapping/roles/__tests__/mapSingleRolePersistenceToUI.test.ts`

## Reference Implementation Pattern

Follow the exact pattern from `packages/ui-shared/src/mapping/settings/mapGeneralSettingsPersistenceToUI.ts` with its null-checking and default application patterns.

## Detailed Implementation Requirements

### Core Mapping Functions

#### mapRolesPersistenceToUI Function

```typescript
import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import type { RoleViewModel } from "@fishbowl-ai/ui-shared";
import { handleNullTimestamps, normalizeRoleFields } from "./utils";

export function mapRolesPersistenceToUI(
  persistedData: PersistedRolesSettingsData | null,
): RoleViewModel[] {
  // Handle null/undefined input
  if (!persistedData || !persistedData.roles) {
    return [];
  }

  // Transform each role with error recovery
  const transformedRoles: RoleViewModel[] = [];

  for (const role of persistedData.roles) {
    try {
      const transformedRole = mapSingleRolePersistenceToUI(role);
      transformedRoles.push(transformedRole);
    } catch (error) {
      // Log error but continue processing other roles
      console.warn(`Failed to transform role ${role.id}:`, error);
    }
  }

  return transformedRoles;
}
```

#### mapSingleRolePersistenceToUI Function

```typescript
export function mapSingleRolePersistenceToUI(
  persistedRole: PersistedRole,
): RoleViewModel {
  const normalizedFields = normalizeRoleFields(persistedRole);
  const timestamps = handleNullTimestamps(persistedRole);

  return {
    id: normalizedFields.id,
    name: normalizedFields.name,
    description: normalizedFields.description || "",
    systemPrompt: normalizedFields.systemPrompt || "",
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
}
```

### Function Requirements

- [ ] **Null Input Handling**: Return empty array for null/undefined persistence data
- [ ] **Error Recovery**: Log errors but continue processing remaining roles
- [ ] **Field Normalization**: Apply string trimming and length constraints
- [ ] **Timestamp Handling**: Generate timestamps for null/undefined values from manual JSON edits
- [ ] **Type Safety**: Ensure output conforms to RoleViewModel interface
- [ ] **Graceful Degradation**: Never lose data due to validation failures

### Unit Tests Implementation

#### Test Coverage Requirements

**mapRolesPersistenceToUI.test.ts:**

```typescript
describe("mapRolesPersistenceToUI", () => {
  it("should transform complete persistence data to UI format", () => {});
  it("should return empty array for null input", () => {});
  it("should return empty array for undefined input", () => {});
  it("should handle empty roles array", () => {});
  it("should continue processing when individual roles fail", () => {});
  it("should preserve valid roles when some are invalid", () => {});
  it("should handle missing optional fields", () => {});
  it("should normalize field constraints", () => {});
});
```

**mapSingleRolePersistenceToUI.test.ts:**

```typescript
describe("mapSingleRolePersistenceToUI", () => {
  it("should transform complete persisted role to UI format", () => {});
  it("should generate timestamps for null values", () => {});
  it("should generate timestamps for undefined values", () => {});
  it("should preserve existing valid timestamps", () => {});
  it("should handle empty string fields", () => {});
  it("should trim and normalize string fields", () => {});
  it("should enforce field length constraints", () => {});
  it("should handle malformed timestamp strings", () => {});
});
```

### Specialized Test Scenarios

- [ ] **Manual JSON Recovery**: Test handling of manually edited JSON with null timestamps
- [ ] **Partial Data Recovery**: Test processing when some fields are missing or invalid
- [ ] **Field Constraint Application**: Test string length enforcement and trimming
- [ ] **Unicode Handling**: Test proper handling of unicode characters in role fields
- [ ] **Large Dataset Processing**: Test performance with 100+ roles
- [ ] **Mixed Validity Data**: Test processing arrays with both valid and invalid roles

## Technical Integration

### Utility Function Integration

- [ ] **handleNullTimestamps**: Generate ISO timestamps for null/undefined timestamp fields
- [ ] **normalizeRoleFields**: Apply string trimming and length constraints
- [ ] **Field Validation**: Apply roleSchema validation where appropriate
- [ ] **Error Logging**: Use consistent logging patterns for transformation failures

### Error Handling Strategy

- [ ] **Non-Throwing Design**: Functions log errors but don't throw exceptions
- [ ] **Partial Recovery**: Return partial results when some data is valid
- [ ] **Detailed Logging**: Include role ID and error context in log messages
- [ ] **Graceful Defaults**: Apply sensible defaults for missing optional fields

## Acceptance Criteria

### Functional Requirements

- [ ] Both mapping functions implemented following established patterns
- [ ] Null and undefined input handling with empty array returns
- [ ] Timestamp generation for manually edited JSON files
- [ ] Field normalization with length constraints applied
- [ ] Error recovery without data loss

### Testing Requirements

- [ ] 100% test coverage for both functions
- [ ] Manual JSON edit scenarios tested (null timestamps, missing fields)
- [ ] Error recovery scenarios verified
- [ ] Performance tests with large datasets
- [ ] Round-trip compatibility with UI-to-persistence mappers

### Data Integrity

- [ ] No data loss during transformation errors
- [ ] Consistent field validation and normalization
- [ ] Proper timestamp handling for all edge cases
- [ ] Unicode and special character handling

## Technical Notes

- **Pattern Consistency**: Follow exact patterns from `mapGeneralSettingsPersistenceToUI.ts`
- **Null Semantics**: Distinguish between null (user cleared) and undefined (not set)
- **Error Recovery**: Individual role failures don't prevent processing other roles
- **Performance**: Efficient processing for large role arrays

## Dependencies

- Requires utility functions in `packages/ui-shared/src/mapping/roles/utils/`
- Uses validation schemas from `@fishbowl-ai/shared`
- Integrates with existing mapping error handling patterns

## Definition of Done

- [ ] Both mapping functions fully implemented with error recovery
- [ ] Comprehensive unit tests with 100% coverage including edge cases
- [ ] Functions handle all null/undefined timestamp scenarios
- [ ] Performance benchmarks meet requirements (< 50ms for 100 roles)
- [ ] Integration with utility functions working correctly
- [ ] Code passes all TypeScript compilation and quality checks

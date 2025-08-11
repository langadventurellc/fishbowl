---
id: T-create-roles-ui-to-persistence
title: Create roles UI to persistence mapping functions with comprehensive unit tests
status: done
priority: high
parent: F-data-mapping-layer
prerequisites: []
affectedFiles:
  packages/ui-shared/src/mapping/roles/mapSingleRoleUIToPersistence.ts:
    Created new mapping function that transforms individual RoleViewModel to
    PersistedRoleData format with field normalization and timestamp generation
  packages/ui-shared/src/mapping/roles/mapRolesUIToPersistence.ts:
    Created new mapping function that transforms RoleViewModel array to
    PersistedRolesSettingsData with schema validation and metadata generation
  packages/ui-shared/src/mapping/roles/__tests__/mapSingleRoleUIToPersistence.test.ts:
    Added comprehensive unit tests with 100% coverage including field
    normalization, timestamp generation, and constraint enforcement
  packages/ui-shared/src/mapping/roles/__tests__/mapRolesUIToPersistence.test.ts:
    Added comprehensive unit tests including edge cases, performance testing,
    and schema validation with 100% coverage
  packages/ui-shared/src/mapping/roles/index.ts:
    Updated barrel exports to include
    new UI-to-persistence mapping functions for consumption by other packages
log:
  - Successfully implemented roles UI to persistence mapping functions with
    comprehensive unit tests. Created mapRolesUIToPersistence and
    mapSingleRoleUIToPersistence functions that transform RoleViewModel data to
    PersistedRolesSettingsData format with proper field normalization, timestamp
    generation, and schema validation. Both functions follow established
    patterns and include full JSDoc documentation. Comprehensive unit tests
    achieve 100% coverage with edge cases including empty arrays, missing
    fields, field constraints, and performance testing with 100+ roles. All
    quality checks pass (lint, format, type-check, tests).
schema: v1.0
childrenIds: []
created: 2025-08-10T22:18:15.860Z
updated: 2025-08-10T22:18:15.860Z
---

# Create Roles UI to Persistence Mapping Functions with Comprehensive Unit Tests

## Context and Purpose

Implement the core mapping functions that transform UI role data structures to persistence format, following the established patterns from settings mappers. These functions ensure data integrity and proper field transformation when saving roles to storage.

## Implementation Location

**Files to Create:**

- `packages/ui-shared/src/mapping/roles/mapRolesUIToPersistence.ts`
- `packages/ui-shared/src/mapping/roles/mapSingleRoleUIToPersistence.ts`
- `packages/ui-shared/src/mapping/roles/__tests__/mapRolesUIToPersistence.test.ts`
- `packages/ui-shared/src/mapping/roles/__tests__/mapSingleRoleUIToPersistence.test.ts`

## Reference Implementation Pattern

Follow the exact pattern from `packages/ui-shared/src/mapping/settings/mapGeneralSettingsUIToPersistence.ts` and existing mapping utilities.

## Detailed Implementation Requirements

### Core Mapping Functions

#### mapRolesUIToPersistence Function

```typescript
import type { RoleViewModel } from "@fishbowl-ai/ui-shared";
import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import {
  persistedRolesSettingsSchema,
  CURRENT_ROLES_SCHEMA_VERSION,
} from "@fishbowl-ai/shared";
import { normalizeRoleFields } from "./utils";

export function mapRolesUIToPersistence(
  roles: RoleViewModel[],
): PersistedRolesSettingsData {
  const mappedRoles = roles.map(mapSingleRoleUIToPersistence);

  const persistedData: PersistedRolesSettingsData = {
    schemaVersion: CURRENT_ROLES_SCHEMA_VERSION,
    roles: mappedRoles,
    lastUpdated: new Date().toISOString(),
  };

  // Validate against schema
  const result = persistedRolesSettingsSchema.safeParse(persistedData);
  if (!result.success) {
    throw new Error(`Invalid roles persistence data: ${result.error.message}`);
  }

  return result.data;
}
```

#### mapSingleRoleUIToPersistence Function

```typescript
export function mapSingleRoleUIToPersistence(
  role: RoleViewModel,
): PersistedRole {
  const normalizedRole = normalizeRoleFields(role);

  return {
    id: normalizedRole.id,
    name: normalizedRole.name,
    description: normalizedRole.description || "",
    systemPrompt: normalizedRole.systemPrompt || "",
    createdAt: normalizedRole.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
```

### Function Requirements

- [ ] **Schema Validation**: All output validated against `persistedRolesSettingsSchema`
- [ ] **Field Normalization**: Apply length constraints and trimming using utility functions
- [ ] **Timestamp Generation**: Generate ISO timestamps for missing createdAt/updatedAt
- [ ] **Schema Version**: Always include current schema version
- [ ] **Empty Array Handling**: Handle empty roles array gracefully
- [ ] **Null Safety**: Handle null/undefined inputs without throwing

### Unit Tests Implementation

#### Test Coverage Requirements

**mapRolesUIToPersistence.test.ts:**

```typescript
describe("mapRolesUIToPersistence", () => {
  it("should transform complete role array to persistence format", () => {});
  it("should handle empty roles array", () => {});
  it("should generate schema version and timestamp", () => {});
  it("should validate output against schema", () => {});
  it("should throw on invalid transformed data", () => {});
  it("should preserve role field data correctly", () => {});
  it("should handle large role arrays (100+ roles)", () => {});
});
```

**mapSingleRoleUIToPersistence.test.ts:**

```typescript
describe("mapSingleRoleUIToPersistence", () => {
  it("should transform complete role to persistence format", () => {});
  it("should generate timestamps for missing fields", () => {});
  it("should preserve existing timestamps", () => {});
  it("should normalize string fields", () => {});
  it("should handle empty optional fields", () => {});
  it("should enforce field length constraints", () => {});
});
```

### Test Requirements

- [ ] **Complete Role Transformation**: Test full RoleViewModel to PersistedRole mapping
- [ ] **Empty Array Handling**: Verify empty roles array produces valid persistence data
- [ ] **Field Validation**: Test field length constraints and trimming
- [ ] **Timestamp Generation**: Verify automatic timestamp creation for missing fields
- [ ] **Schema Compliance**: Ensure output always validates against persistence schema
- [ ] **Edge Cases**: Test null, undefined, and malformed input handling
- [ ] **Performance**: Test with large role arrays (100+ items)

## Technical Integration

### Import Management

- [ ] Import types from appropriate packages (`@fishbowl-ai/ui-shared`, `@fishbowl-ai/shared`)
- [ ] Use utility functions from mapping utils directory
- [ ] Import validation schemas for output validation

### Error Handling

- [ ] Clear error messages for validation failures
- [ ] Preserve original data context in errors
- [ ] Non-throwing behavior for data normalization (log warnings instead)

## Acceptance Criteria

### Functional Requirements

- [ ] Both mapping functions implemented following established patterns
- [ ] All role fields properly transformed with validation
- [ ] Schema validation ensures output compliance
- [ ] Timestamp generation for missing fields
- [ ] Field normalization applies length constraints

### Testing Requirements

- [ ] 100% test coverage for both functions
- [ ] All edge cases covered (empty arrays, missing fields, invalid data)
- [ ] Performance tests with large datasets
- [ ] Round-trip compatibility tests (can be reversed by persistence-to-UI mapper)

### Code Quality

- [ ] Follows existing mapping function patterns exactly
- [ ] Uses established validation and utility functions
- [ ] Clear JSDoc documentation with examples
- [ ] TypeScript types are precise and well-integrated

## Dependencies

- Requires `packages/ui-shared/src/mapping/roles/utils/` directory structure
- Uses validation schemas from `@fishbowl-ai/shared`
- Follows patterns from existing settings mappers

## Definition of Done

- [ ] Both mapping functions fully implemented with validation
- [ ] Comprehensive unit tests with 100% coverage
- [ ] Functions integrate with existing validation utilities
- [ ] Code passes all TypeScript compilation and quality checks
- [ ] Performance benchmarks meet requirements (< 50ms for 100 roles)
- [ ] Functions are ready for integration with barrel exports

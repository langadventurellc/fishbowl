---
id: T-create-roles-file-structure
title: Create Roles File Structure Schema with Metadata
status: done
priority: high
parent: F-roles-persistence-schema-and
prerequisites:
  - T-create-individual-role-zod
affectedFiles:
  packages/shared/src/types/settings/rolesSettingsSchema.ts: Added
    ROLES_SCHEMA_VERSION and CURRENT_ROLES_SCHEMA_VERSION constants, implemented
    persistedRolesSettingsSchema with schema version, roles array, and
    lastUpdated fields with proper defaults and validation
  packages/shared/src/types/settings/PersistedRolesSettingsData.ts:
    Created new TypeScript type file that exports PersistedRolesSettingsData
    type inferred from the roles file schema
  packages/shared/src/types/settings/index.ts: Updated barrel exports to include
    new schema constants, persistedRolesSettingsSchema, and
    PersistedRolesSettingsData type
  packages/shared/src/types/settings/__tests__/rolesSettingsSchema.test.ts:
    Added 24 comprehensive test cases covering file structure validation, schema
    version validation, roles array validation, timestamp validation, future
    compatibility, and type inference
log:
  - Successfully implemented complete roles file structure schema with metadata
    validation. Created Zod schema for roles.json files including schema
    versioning (1.0.0), roles array validation, automatic timestamp generation,
    and future compatibility support. Added comprehensive test coverage with 24
    new test cases covering all validation scenarios, error handling, and edge
    cases. Schema follows existing patterns exactly and integrates seamlessly
    with the codebase architecture.
schema: v1.0
childrenIds: []
created: 2025-08-09T19:43:15.884Z
updated: 2025-08-09T19:43:15.884Z
---

# Create Roles File Structure Schema with Metadata Task

## Context and Background

This task creates the complete Zod schema for the `roles.json` file structure, including the array of roles and metadata fields like schema version and last updated timestamp. This schema validates the entire file contents and provides the main interface for roles persistence.

**Related Objects:**

- **Feature**: F-roles-persistence-schema-and (Roles Persistence Schema and Types)
- **Epic**: E-data-foundation-and-schema (Data Foundation and Schema Design)
- **Project**: P-implement-roles-settings-with (Implement Roles Settings with JSON File Persistence)
- **Dependency**: T-create-individual-role-zod (must complete first to import individual role schema)

## Specific Implementation Requirements

### File Extension

Extend existing `packages/shared/src/types/settings/rolesSettingsSchema.ts` with file structure schema.

### Schema Constants to Define

```typescript
export const ROLES_SCHEMA_VERSION = "1.0.0";
export const CURRENT_ROLES_SCHEMA_VERSION = ROLES_SCHEMA_VERSION;
```

### File Schema to Implement

```typescript
export const persistedRolesSettingsSchema = z
  .object({
    schemaVersion: z.string().min(1).default(CURRENT_ROLES_SCHEMA_VERSION),
    roles: z.array(persistedRoleSchema).default([]),
    lastUpdated: z
      .string()
      .datetime()
      .default(() => new Date().toISOString()),
  })
  .passthrough(); // Allow additional fields for future compatibility
```

### Technical Approach to Follow

1. **Import Individual Role Schema**: Import `persistedRoleSchema` from same file
2. **Define Version Constants**: Create version constants following existing settings patterns
3. **Implement File Schema**: Create complete file structure validation
4. **Add Default Values**: Use Zod's `.default()` for empty arrays and current timestamps
5. **Export Types**: Export `PersistedRolesSettingsData` type for file structure

### Pattern Research Required

Examine existing settings schemas to understand:

- How schema versioning is implemented (look for VERSION constants)
- How `.passthrough()` is used for future compatibility
- How default values are set for complex objects
- Naming conventions for file-level vs item-level schemas

## Detailed Acceptance Criteria

### File Schema Validation Requirements

- [ ] **Schema Version Validation**:
  - `schemaVersion` field required with default value "1.0.0"
  - Version string validation rejects empty strings
  - Version constant exported for use by other components

- [ ] **Roles Array Validation**:
  - `roles` field validates as array of individual role objects
  - Empty array accepted as valid default
  - Each role in array validates against individual role schema
  - Invalid roles in array cause specific error messages

- [ ] **Timestamp Validation**:
  - `lastUpdated` field required with automatic current timestamp default
  - Accepts valid ISO datetime strings
  - Rejects invalid datetime formats with clear error messages

- [ ] **Future Compatibility**:
  - `.passthrough()` allows additional unknown fields
  - Schema doesn't fail when extra metadata fields present
  - Maintains backward compatibility approach

### Type Definition Requirements

- [ ] **File Type Export**: `PersistedRolesSettingsData` type properly inferred
- [ ] **Version Type Export**: Schema version constant available for import
- [ ] **Type Compatibility**: File type includes individual role type as array element

### Error Handling Requirements

- [ ] **Array Validation Errors**: Clear indication which role in array failed validation
- [ ] **Nested Error Reporting**: Individual role errors properly bubbled up
- [ ] **Metadata Errors**: Clear messages for schema version or timestamp issues

## Testing Requirements (Include in Same Task)

### Additional Unit Tests in: `packages/shared/src/types/settings/__tests__/rolesSettingsSchema.test.ts`

```typescript
describe("persistedRolesSettingsSchema", () => {
  describe("valid file structure validation", () => {
    // Test empty roles array with defaults
    // Test multiple valid roles in array
    // Test file with all metadata fields
    // Test file with extra unknown fields (passthrough)
  });

  describe("schema version validation", () => {
    // Test default version assignment
    // Test custom version strings
    // Test empty or invalid version strings
  });

  describe("roles array validation", () => {
    // Test empty array default
    // Test array with mix of valid/invalid roles
    // Test error messages for specific array indices
  });

  describe("timestamp validation", () => {
    // Test automatic timestamp generation
    // Test custom valid timestamps
    // Test invalid timestamp formats
  });

  describe("future compatibility", () => {
    // Test unknown fields are preserved
    // Test schema evolution scenarios
  });
});
```

### Integration Test Scenarios

- Complete roles.json file validation
- Mixed valid/invalid roles in array
- File structure with extra metadata
- Default value generation and validation

## Dependencies

- **Prerequisites**: T-create-individual-role-zod (individual role schema must exist)
- **Dependents**: Default configuration factory and export tasks depend on this schema

## Security Considerations

### File Structure Security

- Validate that roles array cannot exceed reasonable size limits
- Ensure schema version cannot be manipulated for injection attacks
- Timestamp validation prevents malformed datetime strings

### Resource Protection

- Large roles arrays don't cause memory exhaustion during validation
- Schema validation completes in reasonable time regardless of file size

## Performance Requirements

### Validation Performance

- File schema validation completes in <10ms for typical files (1-20 roles)
- Large files (50+ roles) validate within 100ms
- Error message generation doesn't significantly impact validation time

### Memory Efficiency

- Schema objects reused efficiently without recreation
- Validation doesn't create memory leaks during repeated operations

## Integration Context

This schema will be used by:

- Desktop file persistence layer (apps/desktop services)
- UI mapping functions (packages/ui-shared)
- Default configuration factory (next task in this feature)
- File validation during application startup

## Success Metrics

- [ ] Complete roles.json files validate correctly against schema
- [ ] Invalid files produce specific, actionable error messages
- [ ] Default values automatically applied for missing fields
- [ ] Schema versioning supports future migration scenarios
- [ ] Unit tests cover all validation scenarios including edge cases
- [ ] Performance requirements met for typical and large file sizes
- [ ] TypeScript compilation produces proper type inference for file structure

---
id: F-data-mapping-layer
title: Data Mapping Layer
status: open
priority: medium
parent: E-file-persistence-and-state
prerequisites:
  - F-roles-persistence-adapter
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-10T21:34:24.882Z
updated: 2025-08-10T21:34:24.882Z
---

# Data Mapping Layer

## Purpose and Functionality

Implement bidirectional data transformation functions that convert between UI role models (RoleViewModel/RoleFormData) and persistence format (PersistedRolesSettingsData). This layer ensures data integrity during transformations and handles edge cases like missing timestamps from manual JSON edits.

## Key Components to Implement

### Mapping Functions (`packages/ui-shared/src/mapping/roles/`)

- **mapRolesUIToPersistence**: Transform UI role array to persistence format
- **mapRolesPersistenceToUI**: Transform persisted data to UI view models
- **mapSingleRoleUIToPersistence**: Transform individual role for updates
- **mapSingleRolePersistenceToUI**: Transform individual persisted role

### Utility Functions

- **handleNullTimestamps**: Generate timestamps for manually edited JSON files
- **validateRoleData**: Ensure data meets schema requirements before transformation
- **normalizeRoleFields**: Apply field constraints and defaults

## Detailed Acceptance Criteria

### UI to Persistence Mapping

- [ ] Transform RoleViewModel array to PersistedRolesSettingsData structure
- [ ] Preserve all role fields (id, name, description, systemPrompt)
- [ ] Maintain timestamp accuracy (createdAt, updatedAt)
- [ ] Add schema version to persisted data
- [ ] Validate against Zod schema before returning
- [ ] Handle empty arrays gracefully

### Persistence to UI Mapping

- [ ] Transform PersistedRolesSettingsData to RoleViewModel array
- [ ] Handle null/undefined timestamps by generating new ones
- [ ] Apply field constraints (name length, description length)
- [ ] Validate each role against roleSchema
- [ ] Filter out invalid roles with error logging
- [ ] Return empty array for null/undefined input

### Field Handling Requirements

- [ ] Name field: Trim whitespace, enforce max length (100 chars)
- [ ] Description field: Trim whitespace, enforce max length (500 chars)
- [ ] System prompt: Preserve formatting, enforce max length (2000 chars)
- [ ] ID field: Preserve existing IDs, never modify
- [ ] Timestamps: ISO string format, generate if missing

### Error Handling

- [ ] Log validation errors without throwing
- [ ] Return partial data when some roles are invalid
- [ ] Provide detailed error context for debugging
- [ ] Never lose data due to validation failures
- [ ] Include recovery suggestions in error logs

## Technical Requirements

### File Structure

```
packages/ui-shared/src/mapping/roles/
├── mapRolesUIToPersistence.ts
├── mapRolesPersistenceToUI.ts
├── mapSingleRoleUIToPersistence.ts
├── mapSingleRolePersistenceToUI.ts
├── utils/
│   ├── handleNullTimestamps.ts
│   ├── normalizeRoleFields.ts
│   └── index.ts
└── index.ts (barrel exports)
```

### Implementation Patterns

Follow patterns from existing mapping functions:

- Use the validation utilities from `@fishbowl-ai/shared`
- Apply the same null-checking patterns as settings mappers
- Use existing utility functions like `clampString` if available
- Integrate with existing validation error formatting

## Dependencies

- Requires F-roles-persistence-adapter (for type imports)
- Uses schemas from E-data-foundation-and-schema
- Imports validation utilities from shared package

## Testing Requirements

- Unit tests for each mapping function
- Edge case tests for null/undefined handling
- Validation tests for field constraints
- Round-trip tests (UI → Persistence → UI)
- Performance tests for large role arrays (100+ roles)

## Security Considerations

- Sanitize string inputs to prevent injection attacks
- Validate field lengths to prevent memory issues
- Never expose internal IDs in error messages
- Strip any unexpected fields during transformation

## Performance Requirements

- Mapping 100 roles should complete in < 50ms
- Use efficient array methods (map, filter)
- Avoid deep cloning unless necessary
- Cache validation schemas for repeated use

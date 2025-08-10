---
id: F-roles-persistence-adapter
title: Roles Persistence Adapter Interface
status: done
priority: medium
parent: E-file-persistence-and-state
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-10T21:33:53.219Z
updated: 2025-08-10T21:33:53.219Z
---

# Roles Persistence Adapter Interface

## Purpose and Functionality

Define the platform-agnostic interface for roles persistence operations, establishing the contract that all platform-specific implementations must follow. This feature creates the foundation for abstracting file operations away from the UI layer.

## Key Components to Implement

### Interface Definition (`packages/ui-shared/src/types/roles/persistence/`)

- **RolesPersistenceAdapter Interface**: Core adapter interface with save/load/reset methods
- **RolesPersistenceError Class**: Specialized error class for roles persistence failures
- **Type Exports**: Export types from shared package for use in adapter

### Error Handling Structure

- **Error Types**: Define specific error types (file not found, permission denied, validation failed)
- **Error Context**: Include operation type and original error for debugging
- **Recovery Strategies**: Define how errors should be handled at the UI layer

## Detailed Acceptance Criteria

### Interface Requirements

- [ ] RolesPersistenceAdapter interface defines `save(roles: PersistedRolesSettingsData): Promise<void>`
- [ ] Interface defines `load(): Promise<PersistedRolesSettingsData | null>`
- [ ] Interface defines `reset(): Promise<void>` to clear all roles
- [ ] All methods include comprehensive JSDoc documentation with examples
- [ ] Interface is exported from `@fishbowl-ai/ui-shared` package

### Error Handling Requirements

- [ ] RolesPersistenceError extends base Error class
- [ ] Error includes operation type ('save' | 'load' | 'reset')
- [ ] Error preserves original error for debugging
- [ ] Error messages are user-friendly and actionable
- [ ] Error class is exported alongside the interface

### Type Integration Requirements

- [ ] Import PersistedRolesSettingsData from `@fishbowl-ai/shared`
- [ ] Interface uses proper TypeScript generics where applicable
- [ ] All return types are properly typed with Promise wrappers
- [ ] Null return from load() indicates no existing data (not an error)

## Technical Requirements

### File Structure

```
packages/ui-shared/src/types/roles/persistence/
├── RolesPersistenceAdapter.ts
├── RolesPersistenceError.ts
└── index.ts (barrel exports)
```

### Implementation Pattern

Follow the exact pattern from `SettingsPersistenceAdapter.ts`:

- Clear method signatures with single responsibilities
- Comprehensive JSDoc with usage examples
- Consistent error handling approach
- Platform-agnostic design

## Dependencies

- Must complete after E-data-foundation-and-schema (types must exist)
- No other feature dependencies

## Testing Requirements

- Unit tests for error class construction and properties
- Type tests to ensure interface compatibility
- Mock implementations for testing consuming code

## Security Considerations

- Interface documentation should note file permission requirements
- Error messages must not expose sensitive file paths
- Consider rate limiting for save operations in documentation

## Performance Requirements

- Interface should support async operations for non-blocking UI
- Documentation should note expected performance characteristics
- Consider batching strategies for multiple role updates

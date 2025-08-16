---
id: F-persistence-adapter-interface
title: Persistence Adapter Interface
status: in-progress
priority: medium
parent: E-persistence-layer-and-state
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/personalities/persistence/PersonalitiesPersistenceError.ts:
    Created new error class extending Error with operation and cause properties,
    following RolesPersistenceError pattern
  packages/ui-shared/src/types/personalities/persistence/__tests__/PersonalitiesPersistenceError.test.ts:
    Comprehensive unit tests covering all constructor scenarios, operation
    types, error inheritance, and stack trace handling
  packages/ui-shared/src/types/personalities/persistence/index.ts: Export barrel file for personalities persistence types
  packages/ui-shared/src/types/personalities/index.ts: Export barrel file for personalities types
  packages/ui-shared/src/types/index.ts: Added personalities export to main types barrel file
log: []
schema: v1.0
childrenIds:
  - T-create-personalitiespersistenc-1
  - T-create-personalitiespersistenc
  - T-setup-directory-structure-and
created: 2025-08-16T20:58:21.418Z
updated: 2025-08-16T20:58:21.418Z
---

# Persistence Adapter Interface

## Purpose

Define the adapter interface and error handling for personalities persistence, following the exact pattern established by the Roles implementation. This provides the contract between the UI store and platform-specific storage implementations.

## Key Components

- `PersonalitiesPersistenceAdapter` interface definition
- `PersonalitiesPersistenceError` class for error handling
- Type definitions for adapter methods

## Acceptance Criteria

- [ ] Interface matches Roles adapter pattern exactly with save(), load(), and reset() methods
- [ ] Error class provides clear error messages and error codes
- [ ] Type definitions include proper generics for type safety
- [ ] All methods return Promises for async operations
- [ ] Interface is exported from ui-shared package barrel exports

## Technical Requirements

- Create in `packages/ui-shared/src/types/personalities/persistence/`
- Follow exact naming and structure from `RolesPersistenceAdapter`
- Use existing `PersistedPersonalitiesSettingsData` type from shared package
- Include JSDoc comments for all interface methods
- No default implementations - keep it as a pure interface

## Implementation Guidance

**IMPORTANT**: Keep this simple. Do not over-engineer or add unnecessary features.

- Look at `packages/ui-shared/src/types/roles/persistence/RolesPersistenceAdapter.ts` as the template
- Copy the structure but adapt types for personalities
- Methods should be: save(data), load(), reset()
- Error class should extend Error with a code property
- Do not add extra methods or complexity beyond what Roles has

## Testing Requirements

- Unit tests for error class construction and properties
- No integration or performance tests
- Type checking ensures interface compatibility

## Dependencies

None - this is the foundational interface that other features depend on

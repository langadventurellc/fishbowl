---
id: T-implement-crud-operations
title: Implement CRUD operations with validation and state management
status: open
priority: high
parent: F-state-store-with-auto-save
prerequisites:
  - T-create-personalities-store
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-16T22:00:57.147Z
updated: 2025-08-16T22:00:57.147Z
---

# Implement CRUD Operations with Validation and State Management

## Context

This task implements the core CRUD operations for the personalities store, following the established roles store pattern. This includes create, update, delete, and get operations with proper validation, error handling, and state management.

## Technical Approach

Extend the existing store implementation with CRUD methods that follow the exact pattern from `useRolesStore.ts`:

1. **Create Operation**: Add personality with validation, ID generation, and pending operation tracking
2. **Update Operation**: Modify existing personality with validation and rollback data
3. **Delete Operation**: Remove personality with rollback data for recovery
4. **Get Operation**: Retrieve personality by ID with optional validation
5. **Validation**: Name uniqueness checking and data validation using Zod schemas
6. **Pending Operations**: Track all changes for rollback and audit purposes

## Implementation Requirements

- Follow the exact method signatures and patterns from `useRolesStore.ts`
- Use `personalitySchema` from shared types for validation (should exist from schema task)
- Implement `isPersonalityNameUnique` validation method
- Generate IDs using `generateId()` utility (nanoid)
- Track pending operations for each CRUD action
- Trigger auto-save after each successful operation (without implementing the save logic)

## Detailed Acceptance Criteria

### Create Personality (`createPersonality`)

- [ ] Accepts `PersonalityFormData` and returns personality ID string
- [ ] Validates input data using `personalitySchema`
- [ ] Checks name uniqueness before creation
- [ ] Generates unique ID using `generateId()`
- [ ] Sets created/updated timestamps
- [ ] Adds to store state and tracks pending operation
- [ ] Triggers auto-save via `_debouncedSave()`
- [ ] Returns empty string on validation errors

### Update Personality (`updatePersonality`)

- [ ] Accepts ID and `PersonalityFormData`
- [ ] Validates input data using `personalitySchema`
- [ ] Checks personality exists before updating
- [ ] Checks name uniqueness (excluding current personality)
- [ ] Updates personality and sets updated timestamp
- [ ] Stores original data for rollback
- [ ] Tracks pending operation
- [ ] Triggers auto-save

### Delete Personality (`deletePersonality`)

- [ ] Accepts personality ID
- [ ] Checks personality exists before deletion
- [ ] Removes from store state
- [ ] Stores deleted personality for potential rollback
- [ ] Tracks pending operation
- [ ] Triggers auto-save

### Get Operations

- [ ] `getPersonalityById` returns personality or undefined
- [ ] `isPersonalityNameUnique` checks uniqueness with optional exclude ID
- [ ] Efficient lookup and validation logic

### Error Handling

- [ ] All operations set appropriate error states on failure
- [ ] Validation errors prevent state changes
- [ ] Clear error state on successful operations
- [ ] Log errors appropriately without exposing sensitive data

### State Management

- [ ] Pending operations track all changes with rollback data
- [ ] Operations update timestamps correctly
- [ ] State remains consistent during validation failures
- [ ] Memory efficient with proper cleanup

## Unit Tests

Create comprehensive tests covering:

- [ ] Create personality with valid data
- [ ] Create personality with invalid data (validation errors)
- [ ] Create personality with duplicate name
- [ ] Update existing personality
- [ ] Update with validation errors
- [ ] Update with duplicate name (excluding self)
- [ ] Delete existing personality
- [ ] Delete non-existent personality
- [ ] Get personality by valid ID
- [ ] Get personality by invalid ID
- [ ] Name uniqueness checking
- [ ] Pending operations tracking
- [ ] Error state management
- [ ] Timestamp generation and updates

## Dependencies

- Requires completion of T-create-personalities-store
- Requires `personalitySchema` from shared types (should exist)
- Requires mapping functions from F-mapping-layer-implementation

## Technical Notes

- Do not implement the actual persistence/save logic (separate task)
- Focus on state management and validation
- Ensure operations are synchronous to UI
- Follow memory efficiency patterns from roles store
- Use existing logger utility for error reporting

## Files to Modify

- Extend: `packages/ui-shared/src/stores/usePersonalitiesStore.ts`
- Add comprehensive unit tests within the same implementation approach

## Performance Considerations

- Operations must complete synchronously for UI responsiveness
- Efficient array operations for personality lists
- Minimal memory allocations during CRUD operations
- Proper cleanup of pending operations

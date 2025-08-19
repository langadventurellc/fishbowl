---
id: T-implement-agentsrepositorymana
title: Implement agentsRepositoryManager singleton with initialization and unit tests
status: done
priority: high
parent: F-agent-repository-file-storage
prerequisites:
  - T-implement-agentsrepository
affectedFiles:
  apps/desktop/src/data/repositories/agentsRepositoryManager.ts:
    Created new agentsRepositoryManager singleton following exact pattern from
    personalitiesRepositoryManager. Implements get(), initialize(), and reset()
    methods with proper error handling and singleton pattern.
  apps/desktop/src/data/repositories/__tests__/agentsRepositoryManager.test.ts:
    Created comprehensive unit test suite with 17 test cases covering singleton
    behavior, initialization/cleanup lifecycle, error handling, edge cases, and
    integration with AgentsRepository. All tests passing.
log:
  - >-
    Successfully implemented agentsRepositoryManager singleton following the
    exact pattern from personalitiesRepositoryManager. The implementation
    provides centralized access to the AgentsRepository instance with proper
    initialization and cleanup through a thread-safe singleton pattern.


    Key features implemented:

    - Singleton pattern with private static instance variable

    - initialize(dataPath: string) method for setup with proper error handling

    - get() method returning repository instance with validation

    - reset() method for testing purposes and instance cleanup

    - Comprehensive error handling with clear error messages

    - Dependency injection support for testing compatibility


    Created comprehensive unit tests covering all methods and edge cases:

    - Singleton behavior validation (17 test cases)

    - Initialization and cleanup lifecycle testing

    - Error handling for uninitialized access

    - Multiple initialization prevention

    - Edge cases with special characters in paths

    - Integration testing with AgentsRepository


    All quality checks pass (linting, formatting, type checking) and all 17 unit
    tests are passing successfully.
schema: v1.0
childrenIds: []
created: 2025-08-19T00:17:14.758Z
updated: 2025-08-19T00:17:14.758Z
---

## Context

Implement the agentsRepositoryManager singleton following the exact pattern from personalitiesRepositoryManager. This provides centralized access to the AgentsRepository instance with proper initialization and cleanup.

**Reference Implementation**: `apps/desktop/src/data/repositories/personalitiesRepositoryManager.ts`
**File Location**: `apps/desktop/src/data/repositories/agentsRepositoryManager.ts`
**Dependencies**: Uses AgentsRepository class from previous task

## Implementation Requirements

### Manager Structure

- Copy personalitiesRepositoryManager.ts structure exactly
- Replace "personalities" with "agents" throughout
- Maintain identical singleton pattern and method signatures

### Required Methods

- `get()`: Returns AgentsRepository instance, throws if not initialized
- `initialize(dataPath: string)`: Sets up repository instance, returns Promise<void>
- `cleanup()`: Tears down repository instance, returns Promise<void>

### Singleton Pattern

- Private static instance variable
- Thread-safe access to repository instance
- Proper error handling when accessing uninitialized manager
- Clear error messages for initialization state

### Dependency Injection Support

- Constructor parameter support for testing
- Maintain compatibility with existing patterns
- Proper lifecycle management

## Acceptance Criteria

- ✅ agentsRepositoryManager follows personalitiesRepositoryManager pattern exactly
- ✅ Singleton pattern implemented with proper instance management
- ✅ All three methods (get/initialize/cleanup) implemented
- ✅ Proper error handling when accessing uninitialized manager
- ✅ Clear error messages matching existing patterns
- ✅ Comprehensive unit tests covering all methods and scenarios
- ✅ Tests cover: singleton behavior, initialization/cleanup, multiple get() calls, error handling, uninitialized access
- ✅ Thread-safe access patterns maintained

## Testing Requirements (Include in Same Task)

Create comprehensive unit tests in `apps/desktop/src/data/repositories/__tests__/agentsRepositoryManager.test.ts`:

- Test singleton pattern behavior (multiple calls return same instance)
- Test initialize() method with valid dataPath
- Test cleanup() method clears instance
- Test get() method when initialized
- Test get() method when not initialized (throws error)
- Test error handling during initialization
- Test multiple initialize/cleanup cycles
- Mock AgentsRepository dependencies

## Technical Notes

- Follow exact error message patterns from personalitiesRepositoryManager
- Use same initialization/cleanup logic
- Maintain identical method signatures and behavior
- Ensure compatibility with existing testing patterns
- Use consistent logging if any logging is needed

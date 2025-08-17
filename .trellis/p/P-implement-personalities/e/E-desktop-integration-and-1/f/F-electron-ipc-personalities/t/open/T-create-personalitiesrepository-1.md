---
id: T-create-personalitiesrepository-1
title: Create personalitiesRepositoryManager following roles pattern
status: open
priority: medium
parent: F-electron-ipc-personalities
prerequisites:
  - T-create-personalitiesrepository
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T03:00:10.095Z
updated: 2025-08-17T03:00:10.095Z
---

# Create personalitiesRepositoryManager following roles pattern

## Context and Purpose

Create a repository manager for personalities that follows the exact pattern established by `rolesRepositoryManager`. This manager provides a singleton instance of the PersonalitiesRepository and handles initialization with the user data path.

## Implementation Requirements

### File Location

- Create `apps/desktop/src/data/repositories/personalitiesRepositoryManager.ts`
- Follow the exact structure and patterns from `apps/desktop/src/data/repositories/rolesRepositoryManager.ts`

### Implementation Structure

```typescript
import { PersonalitiesRepository } from "./PersonalitiesRepository";

class PersonalitiesRepositoryManager {
  private repository: PersonalitiesRepository | null = null;

  initialize(userDataPath: string): void {
    if (this.repository) {
      return; // Already initialized
    }
    this.repository = new PersonalitiesRepository(userDataPath);
  }

  get(): PersonalitiesRepository {
    if (!this.repository) {
      throw new Error(
        "PersonalitiesRepositoryManager not initialized. Call initialize() first.",
      );
    }
    return this.repository;
  }

  reset(): void {
    this.repository = null;
  }
}

export const personalitiesRepositoryManager =
  new PersonalitiesRepositoryManager();
```

### Integration Requirements

- Import `PersonalitiesRepository` from the same directory
- Follow exact same patterns as `rolesRepositoryManager`
- Provide singleton instance export
- Ensure thread-safety for initialization
- Handle error cases when repository not initialized

### Functionality Requirements

**initialize(userDataPath: string):**

- Accept user data path for repository initialization
- Create new PersonalitiesRepository instance if not already initialized
- Ignore subsequent calls if already initialized
- Pass userDataPath to PersonalitiesRepository constructor

**get():**

- Return initialized PersonalitiesRepository instance
- Throw descriptive error if called before initialization
- Ensure type safety with non-null assertion

**reset():**

- Reset internal repository to null
- Used primarily for testing and cleanup
- Allow re-initialization after reset

## Unit Tests Requirements

Create unit tests in `apps/desktop/src/data/repositories/__tests__/personalitiesRepositoryManager.test.ts`:

**Test Coverage Required:**

- Successful initialization with valid user data path
- Repository retrieval after initialization
- Error when getting repository before initialization
- Multiple initialization calls (should not create multiple instances)
- Reset functionality and re-initialization
- Thread-safety verification

**Test Structure:**

- Mock `PersonalitiesRepository` constructor
- Test initialization flow
- Test error conditions
- Verify singleton behavior
- Test reset and re-initialization cycle

## Dependencies

- `PersonalitiesRepository` class (created in previous task)
- Follow exact same dependencies as `rolesRepositoryManager`

## Acceptance Criteria

- [ ] PersonalitiesRepositoryManager class created following rolesRepositoryManager pattern exactly
- [ ] Singleton instance exported as personalitiesRepositoryManager
- [ ] All three methods (initialize, get, reset) implemented correctly
- [ ] Proper error handling for uninitialized state
- [ ] Unit tests with 100% code coverage
- [ ] All tests passing with proper mocking
- [ ] Integration with PersonalitiesRepository working correctly

**File References:**

- Pattern: `apps/desktop/src/data/repositories/rolesRepositoryManager.ts`
- Usage: `apps/desktop/src/electron/rolesHandlers.ts:30` (repository access pattern)

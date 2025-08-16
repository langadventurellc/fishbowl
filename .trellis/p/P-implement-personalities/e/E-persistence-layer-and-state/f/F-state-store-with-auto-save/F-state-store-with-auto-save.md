---
id: F-state-store-with-auto-save
title: State Store with Auto-Save
status: open
priority: medium
parent: E-persistence-layer-and-state
prerequisites:
  - F-persistence-adapter-interface
  - F-mapping-layer-implementation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-16T20:59:05.479Z
updated: 2025-08-16T20:59:05.479Z
---

# State Store with Auto-Save

## Purpose

Create the Zustand store for managing personalities state with CRUD operations, auto-save capabilities, and proper error handling. This is the central state management solution that UI components will interact with.

## Key Components

- `usePersonalitiesStore` Zustand store
- CRUD operations (create, update, delete, get)
- Auto-save with 1-second debouncing
- Retry logic with exponential backoff (up to 3 retries)
- Loading and error state management
- Adapter initialization and persistence

## Acceptance Criteria

- [ ] Store provides all CRUD operations that work synchronously
- [ ] Auto-save triggers after changes with 1-second debounce
- [ ] Failed saves retry up to 3 times with exponential backoff
- [ ] Store maintains isLoading, error, and sync states
- [ ] Initialize method accepts and stores adapter instance
- [ ] persistChanges method saves current state to storage
- [ ] syncWithStorage method loads data from storage
- [ ] Store operations don't block UI interactions
- [ ] Memory efficient with up to 100 personalities

## Technical Requirements

- Create in `packages/ui-shared/src/stores/usePersonalitiesStore.ts`
- Use Zustand with TypeScript for state management
- Import mapping functions from mapping layer
- Use adapter interface for persistence operations
- Implement debouncing for auto-save (1 second)
- Use nanoid for generating new personality IDs

## Implementation Guidance

**IMPORTANT**: Follow the roles store pattern but keep it simple.

- Look at `packages/ui-shared/src/stores/useRolesStore.ts` as the template
- Store structure:
  ```typescript
  {
    personalities: PersonalityViewModel[],
    isLoading: boolean,
    error: ErrorState | null,
    adapter: PersonalitiesPersistenceAdapter | null,
    // CRUD methods
    // Persistence methods
  }
  ```
- Auto-save implementation:
  - Use setTimeout for debouncing
  - Clear previous timeout on new changes
  - Only save if adapter is initialized
- Retry logic:
  - Exponential backoff: 1s, 2s, 4s
  - Stop after 3 failures
  - Set error state on final failure
- Do not over-complicate - simple debounce and retry is enough

## Testing Requirements

- Unit tests for all store actions
- Test CRUD operations
- Test auto-save debouncing
- Test retry logic with mock failing adapter
- No integration or performance tests
- Verify no memory leaks from timers

## Dependencies

- F-persistence-adapter-interface (for adapter type)
- F-mapping-layer-implementation (for mapping functions)

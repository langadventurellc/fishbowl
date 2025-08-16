---
id: F-state-store-with-auto-save
title: State Store
status: in-progress
priority: medium
parent: E-persistence-layer-and-state
prerequisites:
  - F-persistence-adapter-interface
  - F-mapping-layer-implementation
affectedFiles:
  packages/ui-shared/src/stores/PersonalitiesErrorState.ts: Created
    PersonalitiesErrorState interface matching RolesErrorState pattern exactly
  packages/ui-shared/src/types/personalities/PendingOperation.ts:
    Created PendingOperation interface for personalities with personalityId
    field and proper imports
  packages/ui-shared/src/stores/PersonalitiesState.ts:
    Created PersonalitiesState
    interface with all required properties matching roles pattern
  packages/ui-shared/src/stores/PersonalitiesActions.ts: Created PersonalitiesActions interface with all required method signatures
  packages/ui-shared/src/stores/PersonalitiesStore.ts: Created PersonalitiesStore type definition combining state and actions
  packages/ui-shared/src/stores/usePersonalitiesStore.ts: Implemented complete
    usePersonalitiesStore with Zustand, error handling utilities, state
    management, and foundation for future CRUD operations
  packages/ui-shared/src/stores/__tests__/usePersonalitiesStore.test.ts:
    Created comprehensive unit tests covering all basic functionality, error
    handling, and TypeScript compliance
log: []
schema: v1.0
childrenIds:
  - T-create-personalities-store
  - T-implement-crud-operations
  - T-implement-retry-logic-and
created: 2025-08-16T20:59:05.479Z
updated: 2025-08-16T20:59:05.479Z
---

# State Store

## Purpose

Create the Zustand store for managing personalities state with CRUD operations and proper error handling. This is the central state management solution that UI components will interact with.

## Key Components

- `usePersonalitiesStore` Zustand store
- CRUD operations (create, update, delete, get)
- Retry logic with exponential backoff (up to 3 retries)
- Loading and error state management
- Adapter initialization and persistence

## Acceptance Criteria

- [ ] Store provides all CRUD operations that work synchronously
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
- Retry logic:
  - Exponential backoff: 1s, 2s, 4s
  - Stop after 3 failures
  - Set error state on final failure
- Do not over-complicate - simple retry logic is enough

## Testing Requirements

- Unit tests for all store actions
- Test CRUD operations
- Test retry logic with mock failing adapter
- No integration or performance tests
- Verify no memory leaks from timers

## Dependencies

- F-persistence-adapter-interface (for adapter type)
- F-mapping-layer-implementation (for mapping functions)

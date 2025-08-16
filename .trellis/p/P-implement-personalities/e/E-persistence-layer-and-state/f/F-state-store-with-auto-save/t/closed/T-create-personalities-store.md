---
id: T-create-personalities-store
title: Create personalities store structure and basic state management
status: done
priority: high
parent: F-state-store-with-auto-save
prerequisites: []
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
log:
  - >-
    Successfully created the personalities store structure and basic state
    management following the exact pattern from useRolesStore.ts. The
    implementation includes:


    **Core Components Created:**

    - PersonalitiesErrorState interface matching RolesErrorState pattern

    - PersonalitiesState, PersonalitiesActions, and PersonalitiesStore type
    definitions

    - PendingOperation interface for personalities with personalityId field

    - usePersonalitiesStore with complete foundation and error handling
    infrastructure


    **Key Features Implemented:**

    - Store initialization with correct default values for all properties

    - Comprehensive error state management with _createErrorState,
    _clearErrorState, _isRetryableError, and _getErrorMessage utilities

    - Basic state management methods (setLoading, setError, clearError,
    setAdapter, clearErrorState, getErrorDetails)

    - All required method signatures defined (CRUD operations placeholder with
    "not yet implemented" errors)

    - Complete retry timers cleanup functionality

    - Full TypeScript strict mode compliance


    **Testing Coverage:**

    - Comprehensive unit tests covering store initialization, error handling,
    loading state management, adapter management, retry timers cleanup,
    TypeScript interface compliance, and unimplemented method validation

    - All tests pass with proper type safety


    **Quality Standards Met:**

    - All lint checks pass with no errors or warnings

    - Complete TypeScript type safety with no type errors

    - Code formatted according to project standards

    - Follows exact pattern established by useRolesStore.ts

    - Constants match specification: DEBOUNCE_DELAY_MS = 1000,
    MAX_RETRY_ATTEMPTS = 3, RETRY_BASE_DELAY_MS = 1000


    The store is now ready for CRUD operations to be implemented in a separate
    task, with all foundation infrastructure properly established.
schema: v1.0
childrenIds: []
created: 2025-08-16T22:00:33.075Z
updated: 2025-08-16T22:00:33.075Z
---

# Create Personalities Store Structure and Basic State Management

## Context

This task creates the foundational structure for `usePersonalitiesStore` following the established roles store pattern. This includes the basic Zustand store setup, TypeScript interfaces, and initial state management without CRUD operations.

## Technical Approach

Create the store in `packages/ui-shared/src/stores/usePersonalitiesStore.ts` following the exact pattern from `useRolesStore.ts`:

1. **Store Interface**: Define `PersonalitiesStore` interface with all required properties and methods
2. **State Structure**: Initialize with personalities array, loading states, error handling, and adapter reference
3. **Error State Management**: Create error handling utilities following the roles pattern
4. **Basic Helper Functions**: Implement error creation, clearing, and validation utilities
5. **Store Creation**: Use Zustand's `create` function with TypeScript generics

## Implementation Requirements

- Follow the exact structure pattern from `packages/ui-shared/src/stores/useRolesStore.ts`
- Import required types: `PersonalityViewModel`, `PersonalityFormData`, `PersonalitiesPersistenceAdapter`
- Import mapping functions: `mapPersonalitiesPersistenceToUI`, `mapPersonalitiesUIToPersistence`
- Use `nanoid` for ID generation (`generateId` utility)
- Constants: `DEBOUNCE_DELAY_MS = 1000`, `MAX_RETRY_ATTEMPTS = 3`, `RETRY_BASE_DELAY_MS = 1000`

## Detailed Acceptance Criteria

### Store Interface

- [ ] `PersonalitiesStore` interface defines all required properties:
  - `personalities: PersonalityViewModel[]`
  - `isLoading: boolean`
  - `error: PersonalitiesErrorState | null`
  - `adapter: PersonalitiesPersistenceAdapter | null`
  - `isInitialized: boolean`
  - `isSaving: boolean`
  - `lastSyncTime: string | null`
  - `pendingOperations: PendingOperation[]`
  - All method signatures for CRUD and persistence operations
- [ ] Error state interface matches roles pattern with operation, retry, and timestamp fields

### State Initialization

- [ ] Store initializes with empty personalities array
- [ ] Loading and error states start in correct default values
- [ ] Adapter starts as null until initialization
- [ ] All internal timers and counters are properly initialized

### Error Management Utilities

- [ ] `_createErrorState` function creates properly formatted error objects
- [ ] `_clearErrorState` function returns clean error state
- [ ] `_isRetryableError` function determines retry eligibility
- [ ] `_getErrorMessage` function formats user-friendly error messages

### Unit Tests

- [ ] Test store creation and initial state
- [ ] Test error state creation and clearing utilities
- [ ] Test error retry eligibility logic
- [ ] Test TypeScript type safety and interface compliance
- [ ] Verify no memory leaks from store creation

## Dependencies

- Requires completion of F-persistence-adapter-interface for adapter types
- Requires completion of F-mapping-layer-implementation for mapping functions

## Technical Notes

- Store should be created but not yet include CRUD operations (separate task)
- Focus on establishing the foundation and error handling infrastructure
- Ensure TypeScript strict mode compliance
- Follow existing code patterns for consistency

## Testing Requirements

Create comprehensive unit tests in the same file covering:

- Store initialization with correct default values
- Error state management utilities functionality
- TypeScript interface compliance
- Memory management (no leaks from store creation)

## Files to Create/Modify

- Create: `packages/ui-shared/src/stores/usePersonalitiesStore.ts`
- Tests should be inline with implementation following project patterns

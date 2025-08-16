---
id: E-persistence-layer-and-state
title: Persistence Layer and State Management
status: in-progress
priority: medium
parent: P-implement-personalities
prerequisites:
  - E-data-foundation-and-schema-1
affectedFiles:
  packages/ui-shared/src/types/personalities/persistence/PersonalitiesPersistenceError.ts:
    Created new error class extending Error with operation and cause properties,
    following RolesPersistenceError pattern
  packages/ui-shared/src/types/personalities/persistence/__tests__/PersonalitiesPersistenceError.test.ts:
    Comprehensive unit tests covering all constructor scenarios, operation
    types, error inheritance, and stack trace handling
  packages/ui-shared/src/types/personalities/persistence/index.ts:
    Export barrel file for personalities persistence types; Added export for
    PersonalitiesPersistenceAdapter interface
  packages/ui-shared/src/types/personalities/index.ts: Export barrel file for personalities types
  packages/ui-shared/src/types/index.ts: Added personalities export to main types barrel file
  packages/ui-shared/src/types/personalities/persistence/PersonalitiesPersistenceAdapter.ts:
    Created new interface with save(), load(), and reset() methods,
    comprehensive JSDoc with personality-specific examples
  packages/ui-shared/src/types/settings/PersonalityViewModel.ts:
    Created new PersonalityViewModel interface extending PersonalityFormData
    with id and timestamp fields, following RoleViewModel pattern
  packages/ui-shared/src/types/settings/index.ts: Added export for PersonalityViewModel type
  packages/ui-shared/src/mapping/personalities/mapSinglePersonalityPersistenceToUI.ts:
    Implemented function to convert persisted personality data to UI format with
    null timestamp handling, ID generation, and Big Five/behaviors preservation
  packages/ui-shared/src/mapping/personalities/mapSinglePersonalityUIToPersistence.ts:
    Implemented function to convert UI personality data to persistence format
    with timestamp generation and field preservation
  packages/ui-shared/src/mapping/personalities/index.ts: Created barrel exports
    for both mapping functions; Updated barrel exports to include new array
    mapping functions
  packages/ui-shared/src/mapping/personalities/__tests__/mapSinglePersonalityPersistenceToUI.test.ts:
    Created comprehensive unit tests covering complete transformations,
    timestamp handling, ID generation, Big Five traits, behaviors, field
    defaults, and edge cases
  packages/ui-shared/src/mapping/personalities/__tests__/mapSinglePersonalityUIToPersistence.test.ts:
    Created comprehensive unit tests covering complete transformations,
    timestamp handling, ID generation, field preservation, and return type
    validation
  packages/ui-shared/src/mapping/personalities/mapPersonalitiesPersistenceToUI.ts:
    Created array mapping function to transform persisted personalities data to
    UI view model format, handling null/undefined input gracefully
  packages/ui-shared/src/mapping/personalities/mapPersonalitiesUIToPersistence.ts:
    Created array mapping function to transform UI personality view models to
    persistence format with schema validation
  packages/ui-shared/src/mapping/personalities/__tests__/mapPersonalitiesPersistenceToUI.test.ts:
    Created comprehensive test suite covering transformation scenarios, edge
    cases, large datasets, unicode handling, and data integrity verification
  packages/ui-shared/src/mapping/personalities/__tests__/mapPersonalitiesUIToPersistence.test.ts:
    Created comprehensive test suite covering validation, field processing,
    performance, error handling, and round-trip data integrity
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
    management, and foundation for future CRUD operations; Implemented full CRUD
    operations (create, update, delete, get, isNameUnique) with validation,
    error handling, and auto-save triggers following roles store patterns
  packages/ui-shared/src/stores/__tests__/usePersonalitiesStore.test.ts:
    Created comprehensive unit tests covering all basic functionality, error
    handling, and TypeScript compliance; Removed obsolete test expecting CRUD
    methods to throw 'not implemented' errors since they are now implemented
  packages/ui-shared/src/stores/__tests__/personalitiesStore.test.ts:
    Added comprehensive unit tests covering all CRUD operations, validation,
    error handling, pending operations, and timestamp management
log: []
schema: v1.0
childrenIds:
  - F-mapping-layer-implementation
  - F-persistence-adapter-interface
  - F-simple-shared-utilities
  - F-state-store-with-auto-save
created: 2025-08-15T17:59:24.215Z
updated: 2025-08-15T17:59:24.215Z
---

# Persistence Layer and State Management

## Purpose and Goals

Implement the persistence adapter pattern and Zustand store for personalities, following the established Roles architecture. This epic creates the bridge between UI components and file storage, including mapping functions, the persistence adapter interface, and the state management store with auto-save capabilities.

## Major Components and Deliverables

### Persistence Adapter Interface (`packages/ui-shared`)

- Define `PersonalitiesPersistenceAdapter` interface
- Create `PersonalitiesPersistenceError` class
- Follow exact pattern from Roles adapter

### Mapping Layer (`packages/ui-shared`)

- Implement `mapPersonalitiesPersistenceToUI` function
- Implement `mapPersonalitiesUIToPersistence` function
- Handle Big Five traits and behaviors mapping
- Gracefully handle null timestamps

### State Store (`packages/ui-shared`)

- Create `usePersonalitiesStore` with Zustand
- Implement CRUD operations (create, read, update, delete)
- Add auto-save with debouncing
- Include retry logic for failed operations
- Add loading and error states

### Simple Code Reuse

- Extract minimal common patterns from roles store
- Create simple shared utilities only where obvious duplication exists
- Keep abstractions lightweight and focused

## Detailed Acceptance Criteria

### Functional Deliverables

- [ ] Personalities store provides all CRUD operations
- [ ] Auto-save triggers after changes with 1-second debounce
- [ ] Failed saves retry up to 3 times with exponential backoff
- [ ] Store maintains loading, error, and sync states
- [ ] Mapping functions handle all personality fields correctly
- [ ] Null timestamps handled gracefully for manual JSON edits

### Integration Requirements

- [ ] Adapter interface matches Roles pattern exactly
- [ ] Store integrates cleanly with persistence adapter
- [ ] Mapping functions work bidirectionally without data loss
- [ ] Error states propagate correctly to UI
- [ ] Store can be initialized with desktop adapter

### Performance Standards

- [ ] Store operations complete synchronously
- [ ] Auto-save doesn't block UI interactions
- [ ] Memory efficient with up to 100 personalities
- [ ] No memory leaks from event listeners

### Quality Standards

- [ ] Full TypeScript coverage with proper generics
- [ ] Comprehensive error handling
- [ ] Unit tests for all store actions

## Technical Considerations

### Store Architecture

```typescript
interface PersonalitiesStore {
  personalities: PersonalityViewModel[];
  isLoading: boolean;
  error: ErrorState | null;
  adapter: PersonalitiesPersistenceAdapter | null;

  // CRUD operations
  createPersonality: (data: PersonalityFormData) => string;
  updatePersonality: (id: string, data: PersonalityFormData) => void;
  deletePersonality: (id: string) => void;
  getPersonalityById: (id: string) => PersonalityViewModel | undefined;

  // Persistence operations
  initialize: (adapter: PersonalitiesPersistenceAdapter) => Promise<void>;
  persistChanges: () => Promise<void>;
  syncWithStorage: () => Promise<void>;
}
```

### Mapping Considerations

- BigFive object structure preserved
- Behaviors record maintained as-is
- Timestamps converted between ISO strings and Date objects
- IDs generated using nanoid for new personalities

### Simple Abstractions

Instead of comprehensive libraries, create minimal shared utilities:

- `createPersistenceStore<T>()` - Simple factory for stores with persistence
- `withAutoSave()` - Minimal auto-save wrapper
- `mapTimestamps()` - Simple timestamp conversion utility

## Dependencies

- **E-data-foundation-and-schema-1**: Requires schemas and types to be defined

## Estimated Scale

- 4-5 features covering adapter, mapping, store, and simple abstractions
- Approximately 8-10 development hours
- Critical path for UI integration

## User Stories

- As a user, I want my personalities to save automatically so I don't lose changes
- As a developer, I need a clean adapter pattern so desktop and mobile can share the same store logic
- As a user, I want to see loading states while personalities are being saved or loaded

---
id: E-persistence-layer-and-state
title: Persistence Layer and State Management
status: open
priority: medium
parent: P-implement-personalities
prerequisites:
  - E-data-foundation-and-schema-1
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
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
- [ ] Integration tests for persistence flow

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

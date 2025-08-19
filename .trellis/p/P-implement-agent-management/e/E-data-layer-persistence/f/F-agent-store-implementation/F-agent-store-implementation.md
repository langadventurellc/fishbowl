---
id: F-agent-store-implementation
title: Agent Store Implementation
status: in-progress
priority: medium
parent: E-data-layer-persistence
prerequisites:
  - F-agent-data-types-validation
affectedFiles:
  packages/ui-shared/src/types/agents/persistence/AgentsPersistenceAdapter.ts:
    Created persistence interface following RolesPersistenceAdapter pattern with
    save, load, reset methods
  packages/ui-shared/src/types/agents/persistence/AgentsPersistenceError.ts:
    Created error class following RolesPersistenceError pattern for
    operation-specific error handling
  packages/ui-shared/src/types/agents/persistence/index.ts: Created barrel export for persistence types
  packages/ui-shared/src/types/agents/PendingOperation.ts: Created PendingOperation interface for agent async operation tracking
  packages/ui-shared/src/types/agents/index.ts: Created barrel export for all agent types
  packages/ui-shared/src/types/index.ts: Added agents export to main types barrel
  packages/ui-shared/src/stores/AgentsState.ts: Created AgentsState interface following RolesState pattern exactly
  packages/ui-shared/src/stores/AgentsActions.ts:
    Created AgentsActions interface
    following RolesActions pattern with complete CRUD and persistence methods
  packages/ui-shared/src/stores/AgentsStore.ts: Created AgentsStore type composition combining State and Actions
  packages/ui-shared/src/stores/__tests__/AgentsState.test.ts: Created unit tests validating AgentsState interface structure and types
  packages/ui-shared/src/stores/__tests__/AgentsActions.test.ts: Created unit tests validating AgentsActions interface method signatures
  packages/ui-shared/src/stores/__tests__/AgentsStore.test.ts: Created unit tests validating AgentsStore type composition and inheritance
log: []
schema: v1.0
childrenIds:
  - T-create-agent-store-state-and
  - T-implement-auto-save-mechanism
  - T-implement-core-useagentsstore
  - T-implement-error-handling-and
  - T-implement-persistence-adapter
created: 2025-08-18T23:04:43.563Z
updated: 2025-08-18T23:04:43.563Z
---

## Purpose and Functionality

Implement the Zustand store for agent management with complete CRUD operations, following the exact patterns from useRolesStore and usePersonalitiesStore. Provides reactive state management with auto-save, error handling, and rollback support.

## Key Components to Implement

### Store Structure

- `useAgentsStore` with Zustand pattern
- `AgentsState` interface defining store state
- `AgentsStore` interface defining store actions
- Auto-save with 500ms debouncing
- Error handling with rollback capability

### CRUD Operations

- Create agent with validation
- Update existing agent
- Delete agent by ID
- Load all agents from persistence
- Unique name validation

### State Management

- Loading states for async operations
- Error states with user-friendly messages
- Optimistic updates with rollback
- Persistence adapter integration

## Detailed Acceptance Criteria

### Store State Interface

- ✅ `AgentsState` in `packages/ui-shared/src/stores/AgentsState.ts`
- ✅ Contains agents array (AgentViewModel[])
- ✅ Contains isLoading boolean
- ✅ Contains error state (string | null)
- ✅ Contains isDirty flag for unsaved changes
- ✅ Follows exact pattern from RolesState and PersonalitiesState

### Store Actions Interface

- ✅ `AgentsStore` in `packages/ui-shared/src/stores/AgentsStore.ts`
- ✅ Extends AgentsState interface
- ✅ Contains all CRUD methods with proper signatures
- ✅ Contains utility methods (clearError, setError, etc.)
- ✅ Contains persistence methods (loadAgents, saveAgents)
- ✅ Follows exact pattern from RolesStore interface

### Store Implementation

- ✅ `useAgentsStore` in `packages/ui-shared/src/stores/useAgentsStore.ts`
- ✅ Uses Zustand create() pattern
- ✅ Implements all AgentsStore interface methods
- ✅ Auto-save with 500ms debounce delay
- ✅ Retry logic with exponential backoff (3 attempts max)
- ✅ Rollback snapshot for error recovery

### CRUD Operations Implementation

- ✅ `createAgent`: Validates data, generates ID, adds to store, triggers save
- ✅ `updateAgent`: Validates changes, updates in place, triggers save
- ✅ `deleteAgent`: Removes from array, triggers save
- ✅ `loadAgents`: Fetches from persistence adapter, updates state
- ✅ Name uniqueness validation excludes current agent during edit

### Auto-Save Mechanism

- ✅ Debounced save with 500ms delay
- ✅ Cancels previous save timer on new changes
- ✅ Handles concurrent save attempts
- ✅ Preserves user input during save operations
- ✅ Shows save status to user (saving, saved, error)

### Error Handling & Rollback

- ✅ Rollback snapshot before save attempts
- ✅ Restore previous state on save failure
- ✅ User-friendly error messages
- ✅ Retry mechanism with exponential backoff
- ✅ Maximum 3 retry attempts before giving up

### Persistence Adapter Integration

- ✅ `AgentsPersistenceAdapter` interface
- ✅ `AgentsPersistenceError` type for error handling
- ✅ Dependency injection pattern for testability
- ✅ Error boundary between store and persistence layer

## Implementation Guidance

### Technical Approach

- Copy useRolesStore.ts structure exactly
- Replace "role" with "agent" throughout
- Maintain identical method signatures and behavior
- Use same constants (DEBOUNCE_DELAY_MS, MAX_RETRY_ATTEMPTS, etc.)

### Code Patterns to Follow

- Use crypto.randomUUID() for ID generation with fallback
- Implement debounced save with setTimeout management
- Use optimistic updates with rollback on failure
- Validate data with agentSchema before operations

### Store Organization

- Keep internal helper functions at top of create() function
- Group related methods together (CRUD, persistence, utility)
- Use clear variable names matching roles/personalities pattern
- Maintain consistent error handling approach

## Testing Requirements

### Unit Tests

- ✅ Test create agent with valid data
- ✅ Test update agent with valid changes
- ✅ Test delete agent operation
- ✅ Test load agents from persistence
- ✅ Test unique name validation logic
- ✅ Test auto-save debouncing behavior
- ✅ Test error handling and rollback
- ✅ Test retry mechanism with failures

### State Management Tests

- ✅ Test loading states during async operations
- ✅ Test error states and error clearing
- ✅ Test optimistic updates
- ✅ Test rollback on save failure
- ✅ Test concurrent operation handling

### Persistence Integration Tests

- ✅ Test adapter interface compliance
- ✅ Test error handling from persistence layer
- ✅ Test data transformation with mapping functions
- ✅ Mock persistence adapter for isolated testing

## Security Considerations

### Data Validation

- Validate all agent data with agentSchema before storing
- Sanitize agent names to prevent XSS
- Validate role/personality IDs exist in system
- Prevent prototype pollution in agent objects

### State Protection

- Immutable updates to prevent accidental mutations
- Input sanitization for user-provided data
- Proper error handling to prevent state corruption

## Performance Requirements

### Store Performance

- Create/update/delete operations complete in < 50ms
- Auto-save debouncing prevents excessive persistence calls
- Memory usage scales linearly with number of agents
- No memory leaks from timers or subscriptions

### Reactivity Performance

- Store updates trigger minimal re-renders
- Zustand subscriptions optimized for component needs
- State changes batched appropriately

## Dependencies

- F-agent-data-types-validation (for types and schemas)
- Persistence adapter interface (implemented in next feature)

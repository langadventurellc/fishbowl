---
id: T-implement-core-useagentsstore
title: Implement Core useAgentsStore with CRUD Operations
status: done
priority: high
parent: F-agent-store-implementation
prerequisites:
  - T-create-agent-store-state-and
affectedFiles:
  packages/ui-shared/src/stores/useAgentsStore.ts: Created new Zustand store for
    agent management with complete CRUD operations, auto-save, error handling,
    and persistence integration following established patterns
  packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts:
    Created comprehensive unit test suite with 35 tests covering store
    initialization, CRUD operations, error handling, validation, and edge cases
log:
  - >-
    Successfully implemented the core useAgentsStore with complete CRUD
    operations following the exact patterns from useRolesStore and
    usePersonalitiesStore. The implementation includes:


    **Core Store Features:**

    - Zustand store with AgentsStore interface compliance

    - Complete CRUD operations (create, update, delete, getById, nameUnique
    validation)

    - Auto-save with 500ms debouncing and exponential backoff retry logic

    - Comprehensive error handling with rollback capability

    - Loading state management and persistence adapter integration


    **Key Implementation Details:**

    - ID generation using crypto.randomUUID() with fallback

    - Unique name validation (case-insensitive, excludes current agent during
    updates)

    - Optimistic updates with pending operations tracking

    - Validation using agentSchema from shared package

    - Error state management with user-friendly messages

    - Memory leak prevention via cleanup methods


    **Quality Assurance:**

    - 35 comprehensive unit tests covering all functionality

    - All tests passing with 100% coverage of CRUD operations

    - TypeScript compilation successful without errors

    - ESLint and Prettier compliance

    - Proper error handling for edge cases and validation failures


    The store is ready for integration with the persistence layer and UI
    components.
schema: v1.0
childrenIds: []
created: 2025-08-19T04:07:58.973Z
updated: 2025-08-19T04:07:58.973Z
---

## Purpose

Implement the core Zustand store `useAgentsStore` with basic CRUD operations, following the exact pattern from `useRolesStore` and `usePersonalitiesStore`.

## Implementation Requirements

### File to Create

**`packages/ui-shared/src/stores/useAgentsStore.ts`**

### Technical Approach

1. **Copy useRolesStore Structure**
   - Use `packages/ui-shared/src/stores/useRolesStore.ts` as exact template
   - Replace "role" with "agent" throughout
   - Maintain identical function structure and patterns
   - Use same constants (DEBOUNCE_DELAY_MS = 500, etc.)

2. **Store Creation Pattern**

   ```typescript
   export const useAgentsStore = create&lt;AgentsStore&gt;()((set, get) =&gt; {
     // Internal helper functions at top
     // State initialization
     // Return store object with methods
   });
   ```

3. **CRUD Operations Implementation**
   - **createAgent**: Validate data with agentSchema, generate ID with crypto.randomUUID(), add to array, trigger save
   - **updateAgent**: Validate changes, find agent by ID, update in place, trigger save
   - **deleteAgent**: Remove from agents array by ID, trigger save
   - **loadAgents**: Clear current state, call persistence adapter, update store

4. **ID Generation Pattern**

   ```typescript
   const generateId = (): string =&gt; {
     try {
       return crypto.randomUUID();
     } catch {
       return `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
     }
   };
   ```

5. **Validation Implementation**
   - Use agentSchema from shared package for data validation
   - Implement unique name validation excluding current agent during edit
   - Validate all required fields before operations

### Core Methods to Implement

**createAgent Method**

- Validate input data with agentSchema
- Check name uniqueness with validateAgentName
- Generate unique ID and timestamps
- Add to agents array
- Set isDirty flag
- Return success (auto-save handled separately)

**updateAgent Method**

- Find agent by ID, return error if not found
- Validate updates with partial schema validation
- Check name uniqueness if name changed
- Update agent with new data and updatedAt timestamp
- Set isDirty flag

**deleteAgent Method**

- Find agent by ID, return error if not found
- Remove from agents array
- Set isDirty flag

**loadAgents Method**

- Set isLoading to true
- Clear current agents array
- Call persistence adapter (placeholder for now)
- Update agents state
- Set isLoading to false

**validateAgentName Method**

- Check if name already exists in agents array
- Exclude current agent ID during edit operations
- Return boolean result

### State Management

**Initial State**

```typescript
{
  agents: [],
  isLoading: false,
  error: null,
  isDirty: false,
}
```

**Utility Methods**

- `clearError`: Set error to null
- `setError`: Set error message
- `setLoading`: Set isLoading state

### Acceptance Criteria

- ✅ useAgentsStore created with Zustand create() pattern
- ✅ All AgentsStore interface methods implemented
- ✅ CRUD operations work with proper validation
- ✅ ID generation with crypto.randomUUID() and fallback
- ✅ Unique name validation excludes current agent during edit
- ✅ Error handling with user-friendly messages
- ✅ Loading state management for async operations
- ✅ isDirty flag tracks unsaved changes
- ✅ TypeScript compilation succeeds without errors

### Unit Tests

**Test File: `packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts`**

**Basic Store Structure Tests**

- Test initial state matches expected structure
- Test store creation and basic functionality
- Test all methods exist on store interface

**Create Agent Tests**

- Test successful agent creation with valid data
- Test ID generation and timestamp creation
- Test unique name validation during creation
- Test validation errors with invalid data
- Test isDirty flag set after creation

**Update Agent Tests**

- Test successful agent update with valid changes
- Test partial updates (only some fields changed)
- Test name uniqueness validation during update (excluding current agent)
- Test error when agent ID not found
- Test updatedAt timestamp changes
- Test isDirty flag set after update

**Delete Agent Tests**

- Test successful agent deletion
- Test error when agent ID not found
- Test agent removed from array
- Test isDirty flag set after deletion

**Load Agents Tests**

- Test loading state management (isLoading true/false)
- Test agents array cleared and populated
- Test error handling during load

**Validation Tests**

- Test validateAgentName with unique names
- Test validateAgentName with duplicate names
- Test validateAgentName excluding current agent during edit
- Test data validation with agentSchema

**Utility Methods Tests**

- Test clearError functionality
- Test setError functionality
- Test setLoading functionality

### Dependencies

- Requires AgentsState and AgentsStore interfaces from previous task
- Requires AgentViewModel and agentSchema from shared package
- Requires Zustand library for store creation

### Security Considerations

- All input data validated with agentSchema before storage
- Agent names sanitized to prevent XSS
- Immutable updates prevent accidental state mutations
- Proper error handling prevents state corruption

### Performance Requirements

- CRUD operations complete in &lt; 50ms
- Memory usage scales linearly with agent count
- No memory leaks from store subscriptions
- State updates trigger minimal re-renders

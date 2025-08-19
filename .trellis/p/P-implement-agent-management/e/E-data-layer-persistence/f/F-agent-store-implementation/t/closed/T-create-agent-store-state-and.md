---
id: T-create-agent-store-state-and
title: Create Agent Store State and Actions Interfaces
status: done
priority: high
parent: F-agent-store-implementation
prerequisites: []
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
log:
  - >-
    Successfully implemented foundational TypeScript interfaces for Agent Store
    following exact patterns from RolesState/RolesStore and
    PersonalitiesState/PersonalitiesStore.


    Created AgentsState interface with all required properties (agents array,
    loading states, error handling, persistence adapter integration). Created
    AgentsActions interface with complete CRUD operations, validation methods,
    persistence methods, and error recovery. Created AgentsStore type combining
    State and Actions via type intersection.


    All interfaces follow established patterns exactly, replacing "role" with
    "agent" throughout while maintaining identical method signatures and
    property types. Added comprehensive unit tests validating interface
    structure and type composition. All quality checks pass (TypeScript
    compilation, ESLint, formatting).
schema: v1.0
childrenIds: []
created: 2025-08-19T04:07:28.925Z
updated: 2025-08-19T04:07:28.925Z
---

## Purpose

Create the foundational TypeScript interfaces for the Agent Store following the exact patterns from RolesState/RolesStore and PersonalitiesState/PersonalitiesStore.

## Implementation Requirements

### Files to Create

**`packages/ui-shared/src/stores/AgentsState.ts`**

- `AgentsState` interface with:
  - `agents: AgentViewModel[]` - array of agent view models
  - `isLoading: boolean` - loading state for async operations
  - `error: string | null` - error message state
  - `isDirty: boolean` - flag for unsaved changes

**`packages/ui-shared/src/stores/AgentsStore.ts`**

- `AgentsStore` interface extending `AgentsState` with:
  - CRUD methods: `createAgent`, `updateAgent`, `deleteAgent`, `loadAgents`
  - Utility methods: `clearError`, `setError`, `setLoading`
  - Persistence methods: `saveAgents`
  - Validation methods: `validateAgentName`

### Technical Approach

1. **Copy Structure from Existing Stores**
   - Use `packages/ui-shared/src/stores/RolesState.ts` as template
   - Use `packages/ui-shared/src/stores/RolesStore.ts` as template
   - Replace "role" with "agent" throughout
   - Maintain identical method signatures and property types

2. **Import Required Types**
   - Import `AgentViewModel` from `@fishbowl-ai/shared`
   - Follow same import patterns as existing store interfaces

3. **Method Signatures**
   - `createAgent(agent: Omit&lt;AgentViewModel, 'id' | 'createdAt' | 'updatedAt'&gt;): Promise&lt;void&gt;`
   - `updateAgent(id: string, updates: Partial&lt;AgentFormData&gt;): Promise&lt;void&gt;`
   - `deleteAgent(id: string): Promise&lt;void&gt;`
   - `loadAgents(): Promise&lt;void&gt;`
   - `validateAgentName(name: string, excludeId?: string): boolean`

### Acceptance Criteria

- ✅ `AgentsState` interface matches RolesState pattern exactly
- ✅ `AgentsStore` interface extends AgentsState and includes all required methods
- ✅ Method signatures match existing store patterns
- ✅ All types properly imported from shared package
- ✅ Files placed in correct locations within ui-shared package
- ✅ TypeScript compilation succeeds without errors

### Unit Tests

**Test File: `packages/ui-shared/src/stores/__tests__/AgentsState.test.ts`**

- Test interface structure and property types
- Verify AgentsState interface has all required properties
- Test that AgentsStore extends AgentsState properly

**Test File: `packages/ui-shared/src/stores/__tests__/AgentsStore.test.ts`**

- Test interface method signatures
- Verify all CRUD methods are defined with correct types
- Test utility method signatures
- Verify persistence method signatures

### Dependencies

- Requires AgentViewModel type from F-agent-data-types-validation feature
- Must follow patterns established in existing RolesState/RolesStore interfaces

### Security Considerations

- Interfaces define type safety boundaries
- Method signatures enforce proper data validation
- Error state properly typed for safe error handling

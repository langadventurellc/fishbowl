---
id: T-connect-librarytab-to-real
title: Connect LibraryTab to Real Agent Store Data
status: done
priority: high
parent: F-delete-agent-feature
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/agents/LibraryTab.tsx: Replaced mock data
    with useAgentsStore integration, added loading state with spinner,
    implemented error state with retry functionality using Card components,
    updated type imports to use AgentSettingsViewModel
  apps/desktop/src/components/settings/agents/__tests__/LibraryTab.test.tsx:
    Created comprehensive test suite with 25 tests covering store integration,
    loading states, error states, empty states, component state changes, type
    compatibility, accessibility, and edge cases
  apps/desktop/src/components/settings/agents/__tests__/AgentsSection.test.tsx:
    Updated useAgentsStore mock to return proper agent data structure compatible
    with LibraryTab changes
log:
  - Successfully connected LibraryTab component to real agent store data,
    replacing mock data with useAgentsStore integration. Implemented
    comprehensive loading and error state handling with user-friendly UI. Added
    complete test coverage verifying all functionality including store
    integration, state transitions, and edge cases. Fixed related test failures
    in AgentsSection to properly mock store state. All quality checks and unit
    tests passing.
schema: v1.0
childrenIds: []
created: 2025-08-20T00:51:46.499Z
updated: 2025-08-20T00:51:46.499Z
---

## Purpose

Replace mock data in LibraryTab with real agent data from useAgentsStore to enable actual agent management operations.

## Context

Currently, LibraryTab uses mock data instead of real agent store data:

```typescript
const [agents] = useState<AgentCardType[]>(mockAgents);
```

This prevents actual agent operations (create, edit, delete) from working properly. The component needs to be connected to the real agent store to display and manage actual agents.

## Implementation Requirements

### 1. Replace Mock Data with Store Data

- Remove `useState` with mock agents
- Import and use `useAgentsStore` hook
- Get agents array from store state
- Handle loading and error states from store

### 2. Add Store Initialization

- Ensure store is properly initialized before displaying agents
- Handle loading state while agents are being loaded
- Display appropriate loading UI during initialization

### 3. Update Component Props and Types

- Verify `AgentCardType` matches `AgentSettingsViewModel` from store
- Update imports to use proper types from shared package
- Remove mock data imports

### 4. Handle Empty State

- Display empty state when no agents exist in store
- Ensure empty state shows correctly after store initialization
- Maintain existing empty state component integration

### 5. Add Error Handling

- Display error messages from store if agent loading fails
- Provide retry functionality for failed loads
- Ensure graceful degradation when store operations fail

## Technical Approach

1. **File to modify**: `apps/desktop/src/components/settings/agents/LibraryTab.tsx`

2. **Store integration pattern**:

   ```typescript
   const { agents, isLoading, error, isInitialized } = useAgentsStore();
   ```

3. **Type verification**: Ensure `AgentCardType` and `AgentSettingsViewModel` are compatible

4. **Loading state handling**: Show loading indicator while `isLoading` is true

5. **Error handling**: Display errors from store and provide retry options

## Acceptance Criteria

- [ ] LibraryTab displays real agents from useAgentsStore instead of mock data
- [ ] Loading state is properly displayed during agent loading
- [ ] Error states from store are displayed to user with retry options
- [ ] Empty state shows correctly when no agents exist
- [ ] Store initialization is handled properly
- [ ] Type safety is maintained between component and store types
- [ ] Component re-renders appropriately when store state changes

## Testing Requirements

Create unit tests in `apps/desktop/src/components/settings/agents/__tests__/LibraryTab.test.tsx` that verify:

- [ ] Component displays real agents from store
- [ ] Loading state is shown while agents are being loaded
- [ ] Error states are properly displayed
- [ ] Empty state appears when no agents exist
- [ ] Component handles store state changes correctly
- [ ] Error recovery and retry functionality works
- [ ] Type compatibility between store and component

## Security Considerations

- Ensure agent data is properly validated before display
- Handle potential data corruption gracefully
- Verify agent permissions and access control (if applicable)

## Dependencies

- Requires existing `useAgentsStore` implementation
- Should be completed before delete functionality tasks
- May require updates to agent type definitions for consistency

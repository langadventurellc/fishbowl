---
id: T-update-agents-store-to-remove
title: Update Agents Store to Remove Defaults Functionality
status: done
priority: high
parent: F-remove-agent-defaults-and
prerequisites:
  - T-update-persistence-schemas-to
affectedFiles:
  packages/ui-shared/src/stores/AgentsState.ts: Removed defaults property and AgentDefaults import from interface
  packages/ui-shared/src/stores/AgentsActions.ts: Removed all defaults-related
    methods (setDefaults, getDefaults, loadDefaults, saveDefaults,
    resetDefaults) and AgentDefaults import
  packages/ui-shared/src/stores/useAgentsStore.ts: Removed AgentDefaults import,
    DEFAULT_AGENT_DEFAULTS constant, defaultsDebounceTimer variable,
    debouncedDefaultsSave function, defaults property from initial state, and
    all defaults management methods
  packages/ui-shared/src/stores/__tests__/AgentsState.test.ts: Removed AgentDefaults import and defaults property references from test mocks
  packages/ui-shared/src/stores/__tests__/AgentsActions.test.ts:
    Removed AgentDefaults import, defaults property from mock exportAgents
    return, all defaults method mocks, and related test expectations
log:
  - Successfully updated Agents Store to remove all defaults functionality.
    Removed `defaultAgentSettings` property from AgentsState, eliminated
    `setDefaultAgentSettings`, `getDefaults`, `loadDefaults`, `saveDefaults`,
    and `resetDefaults` methods from AgentsActions interface, updated
    useAgentsStore implementation to remove defaults-related code including
    debounced save timer and constants, and updated test files to remove
    defaults references. All quality checks (lint, format, type-check) and unit
    tests pass.
schema: v1.0
childrenIds: []
created: 2025-08-20T18:31:04.762Z
updated: 2025-08-20T18:31:04.762Z
---

## Context

Update the Zustand agents store to remove all defaults-related functionality. This involves removing `defaultAgentSettings` from the store state, eliminating the `setDefaultAgentSettings` method, and updating store methods to work with the simplified schema structure.

**Related Feature**: F-remove-agent-defaults-and  
**File Location**: `packages/shared/src/store/agents.ts`

## Implementation Requirements

### Primary Deliverables

1. **Update AgentsState Interface**
   - Remove `defaultAgentSettings: AgentDefaults | null` from state interface
   - Remove `setDefaultAgentSettings: (defaults: AgentDefaults | null) => void` method
   - Maintain all other agent management methods

2. **Update Store Implementation**
   - Remove defaultAgentSettings from initial state
   - Remove setDefaultAgentSettings method implementation
   - Update setStore and exportStore methods to work without defaults
   - Update resetStore method to exclude defaults

3. **Clean Up Related Code**
   - Remove any imports related to AgentDefaults type
   - Remove any references to defaults in store methods
   - Update JSDoc comments that mention defaults

4. **Add Unit Tests for Store Updates**
   - Test store state excludes defaultAgentSettings
   - Test store methods work without defaults functionality
   - Test store export/import works with simplified schema
   - Test store reset works correctly

### Technical Approach

**Current AgentsState Interface (from research):**

```typescript
export interface AgentsState {
  agents: Agent[];
  defaultAgentSettings: AgentDefaults | null;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  getAgent: (id: string) => Agent | undefined;
  resetAgents: () => void;
  setAgents: (agents: Agent[]) => void;
  setDefaultAgentSettings: (defaults: AgentDefaults | null) => void;
  setStore: (state: AgentsData) => void;
  exportStore: () => AgentsData;
  resetStore: () => void;
  toggleAgentActive: (id: string) => void;
  toggleMultipleAgentsActive: (ids: string[], forceActive?: boolean) => void;
}
```

**Target AgentsState Interface:**

```typescript
export interface AgentsState {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  getAgent: (id: string) => Agent | undefined;
  resetAgents: () => void;
  setAgents: (agents: Agent[]) => void;
  setStore: (state: AgentsData) => void;
  exportStore: () => AgentsData;
  resetStore: () => void;
  toggleAgentActive: (id: string) => void;
  toggleMultipleAgentsActive: (ids: string[], forceActive?: boolean) => void;
}
```

### Step-by-Step Implementation

**Step 1: Update AgentsState Interface**

1. Remove `defaultAgentSettings: AgentDefaults | null` from interface
2. Remove `setDefaultAgentSettings: (defaults: AgentDefaults | null) => void` from interface
3. Remove any imports of `AgentDefaults` type

**Step 2: Update Store Implementation**

1. Remove defaultAgentSettings from initial state
2. Remove setDefaultAgentSettings method implementation
3. Update setStore method to only handle agents array
4. Update exportStore method to return only agents array
5. Update resetStore method to exclude defaults

**Step 3: Update Store Methods**

```typescript
// Update setStore method
setStore: (state: AgentsData) => {
  set({
    agents: state.agents || [],
    // Remove: defaultAgentSettings: state.defaultAgentSettings || null,
  });
},

// Update exportStore method
exportStore: (): AgentsData => {
  const state = get();
  return {
    agents: state.agents,
    // Remove: defaultAgentSettings: state.defaultAgentSettings,
  };
},

// Update resetStore method
resetStore: () => {
  set({
    agents: [],
    // Remove: defaultAgentSettings: null,
  });
},
```

**Step 4: Create/Update Unit Tests**
Create test file: `packages/shared/src/store/__tests__/agents.test.ts`

```typescript
import { useAgentsStore } from "../agents";

describe("Agents Store", () => {
  beforeEach(() => {
    // Reset store before each test
    useAgentsStore.getState().resetStore();
  });

  describe("Store State", () => {
    it("does not include defaultAgentSettings in state", () => {
      const state = useAgentsStore.getState();

      expect(state).not.toHaveProperty("defaultAgentSettings");
      expect(state).not.toHaveProperty("setDefaultAgentSettings");
    });

    it("includes all required agent management methods", () => {
      const state = useAgentsStore.getState();

      expect(state.addAgent).toBeInstanceOf(Function);
      expect(state.updateAgent).toBeInstanceOf(Function);
      expect(state.deleteAgent).toBeInstanceOf(Function);
      expect(state.getAgent).toBeInstanceOf(Function);
      expect(state.resetAgents).toBeInstanceOf(Function);
      expect(state.setAgents).toBeInstanceOf(Function);
      expect(state.setStore).toBeInstanceOf(Function);
      expect(state.exportStore).toBeInstanceOf(Function);
      expect(state.resetStore).toBeInstanceOf(Function);
    });
  });

  describe("Store Export/Import", () => {
    it("exports store data without defaultAgentSettings", () => {
      const testAgent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
        personalityBehaviors: {
          humor: 50,
          responseLength: -25,
          focus: 75,
        },
      };

      useAgentsStore.getState().addAgent(testAgent);
      const exportedData = useAgentsStore.getState().exportStore();

      expect(exportedData).toEqual({
        agents: [testAgent],
      });
      expect(exportedData).not.toHaveProperty("defaultAgentSettings");
    });

    it("imports store data without expecting defaultAgentSettings", () => {
      const testData = {
        agents: [
          {
            id: "imported-id",
            name: "Imported Agent",
            description: "Imported description",
          },
        ],
      };

      expect(() => {
        useAgentsStore.getState().setStore(testData);
      }).not.toThrow();

      const state = useAgentsStore.getState();
      expect(state.agents).toHaveLength(1);
      expect(state.agents[0].name).toBe("Imported Agent");
    });
  });

  describe("Store Reset", () => {
    it("resets store to clean state without defaults", () => {
      // Add some data first
      useAgentsStore.getState().addAgent({
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
      });

      // Reset store
      useAgentsStore.getState().resetStore();

      const state = useAgentsStore.getState();
      expect(state.agents).toEqual([]);
      expect(state).not.toHaveProperty("defaultAgentSettings");
    });
  });

  describe("Agent Management", () => {
    it("adds agent with new personality behaviors", () => {
      const testAgent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
        personalityBehaviors: {
          humor: 25,
          formality: -10,
          brevity: 50,
          assertiveness: 0,
          responseLength: 75,
          randomness: -25,
          focus: 100,
        },
      };

      useAgentsStore.getState().addAgent(testAgent);

      const state = useAgentsStore.getState();
      expect(state.agents).toHaveLength(1);
      expect(state.agents[0].personalityBehaviors?.responseLength).toBe(75);
      expect(state.agents[0].personalityBehaviors?.randomness).toBe(-25);
      expect(state.agents[0].personalityBehaviors?.focus).toBe(100);
    });
  });
});
```

## Acceptance Criteria

### Functional Requirements

- [ ] AgentsState interface excludes defaultAgentSettings property
- [ ] AgentsState interface excludes setDefaultAgentSettings method
- [ ] Store state does not include defaults-related properties
- [ ] All existing agent management functionality continues to work

### Technical Requirements

- [ ] Store implementation compiles without TypeScript errors
- [ ] Store methods work with simplified AgentsData schema
- [ ] Store export/import excludes defaults data
- [ ] Store reset functionality works correctly
- [ ] No references to AgentDefaults type remain

### Testing Requirements

- [ ] Unit test verifies store state excludes defaults properties
- [ ] Unit test confirms store export excludes defaultAgentSettings
- [ ] Unit test validates store import works without defaults
- [ ] Unit test checks store reset works correctly
- [ ] Unit test verifies agent management with new personality behaviors
- [ ] Tests pass with `pnpm test` command

## Files to Modify

1. **Primary File**: `packages/shared/src/store/agents.ts`
2. **Test File**: `packages/shared/src/store/__tests__/agents.test.ts` (create if doesn't exist)

## Dependencies

**Prerequisites**:

- T-update-persistence-schemas-to (Schemas must be updated first)

**Blocks**:

- Components that use the agents store
- Application functionality that depends on store structure

## Security Considerations

**Reduced Attack Surface**: Removing unused defaults state reduces potential security vulnerabilities and simplifies the security model.

## Testing Strategy

**Unit Testing Approach:**

- Test store interface excludes defaults functionality
- Verify store methods work with simplified data structure
- Test store persistence (export/import) without defaults
- Confirm agent management continues to work correctly

**Store Testing:**

- Use Zustand testing patterns
- Test state changes and method calls
- Verify store persistence and hydration

**Test Commands:**

```bash
# Run specific store tests
pnpm test agents.test.ts

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Build shared package to test imports
pnpm build:libs
```

## Implementation Notes

- Completely remove defaults functionality - don't mark as deprecated
- Update all JSDoc comments that reference defaults
- Ensure store methods handle the simplified AgentsData structure
- Test store persistence works correctly with the simplified schema
- Verify components using the store continue to work (may need updates)

## Success Criteria

1. **Clean Interface**: AgentsState excludes all defaults-related properties and methods
2. **Functional Store**: All agent management operations continue to work correctly
3. **Simplified Persistence**: Store export/import works with simplified schema structure
4. **No Broken References**: No references to removed defaults functionality remain
5. **Test Coverage**: Unit tests verify store works correctly without defaults
6. **Quality Checks**: TypeScript compilation and linting pass without errors

This task completes the backend simplification by removing all defaults functionality from the state management layer, creating a cleaner and more focused agent management system.

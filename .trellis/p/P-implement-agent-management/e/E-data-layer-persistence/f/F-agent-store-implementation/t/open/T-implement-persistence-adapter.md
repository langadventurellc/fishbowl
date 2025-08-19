---
id: T-implement-persistence-adapter
title: Implement Persistence Adapter Integration
status: open
priority: medium
parent: F-agent-store-implementation
prerequisites:
  - T-implement-error-handling-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-19T04:09:38.088Z
updated: 2025-08-19T04:09:38.088Z
---

## Purpose

Implement the persistence adapter integration interfaces and dependency injection pattern for the agents store, following the exact patterns from useRolesStore and usePersonalitiesStore to enable testable and flexible data persistence.

## Implementation Requirements

### Persistence Adapter Interface

**Create `packages/ui-shared/src/stores/types/AgentsPersistenceAdapter.ts`**

```typescript
export interface AgentsPersistenceAdapter {
  loadAgents(): Promise&lt;AgentViewModel[]&gt;;
  saveAgents(agents: AgentViewModel[]): Promise&lt;void&gt;;
  resetAgents(): Promise&lt;void&gt;;
}

export class AgentsPersistenceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AgentsPersistenceError';
  }
}
```

### Store Integration

**Update useAgentsStore.ts**

1. **Dependency Injection Setup**

   ```typescript
   // Global adapter instance
   let persistenceAdapter: AgentsPersistenceAdapter | null = null;

   // Adapter registration
   export const setAgentsPersistenceAdapter = (adapter: AgentsPersistenceAdapter): void =&gt; {
     persistenceAdapter = adapter;
   };

   // Adapter getter with validation
   const getPersistenceAdapter = (): AgentsPersistenceAdapter =&gt; {
     if (!persistenceAdapter) {
       throw new AgentsPersistenceError(
         'Agents persistence adapter not initialized',
         'ADAPTER_NOT_INITIALIZED'
       );
     }
     return persistenceAdapter;
   };
   ```

2. **Implement Persistence Methods**

   ```typescript
   // In store return object
   loadAgents: async () =&gt; {
     set({ isLoading: true, error: null });

     try {
       const adapter = getPersistenceAdapter();
       const loadedAgents = await adapter.loadAgents();

       set({
         agents: loadedAgents,
         isLoading: false,
         isDirty: false
       });

     } catch (error) {
       const errorMessage = getErrorMessage(error);
       set({
         isLoading: false,
         error: `Failed to load agents: ${errorMessage}`
       });
       throw error;
     }
   },

   saveAgents: async () =&gt; {
     const adapter = getPersistenceAdapter();
     const currentAgents = get().agents;

     try {
       await adapter.saveAgents(currentAgents);
     } catch (error) {
       const persistenceError = new AgentsPersistenceError(
         'Failed to save agents',
         'SAVE_FAILED',
         error instanceof Error ? error : new Error(String(error))
       );
       throw persistenceError;
     }
   },

   resetAgents: async () =&gt; {
     set({ isLoading: true, error: null });

     try {
       const adapter = getPersistenceAdapter();
       await adapter.resetAgents();

       set({
         agents: [],
         isLoading: false,
         isDirty: false
       });

     } catch (error) {
       const errorMessage = getErrorMessage(error);
       set({
         isLoading: false,
         error: `Failed to reset agents: ${errorMessage}`
       });
       throw error;
     }
   }
   ```

### Error Boundary Implementation

**Enhanced Error Handling**

```typescript
const handlePersistenceError = (error: unknown): AgentsPersistenceError =&gt; {
  if (error instanceof AgentsPersistenceError) {
    return error;
  }

  if (error instanceof Error) {
    return new AgentsPersistenceError(
      error.message,
      'UNKNOWN_ERROR',
      error
    );
  }

  return new AgentsPersistenceError(
    'Unknown persistence error occurred',
    'UNKNOWN_ERROR'
  );
};
```

### Testing Adapter Implementation

**Create `packages/ui-shared/src/stores/types/TestAgentsPersistenceAdapter.ts`**

```typescript
export class TestAgentsPersistenceAdapter implements AgentsPersistenceAdapter {
  private agents: AgentViewModel[] = [];
  private shouldThrowError = false;
  private errorToThrow: AgentsPersistenceError | null = null;

  async loadAgents(): Promise&lt;AgentViewModel[]&gt; {
    if (this.shouldThrowError && this.errorToThrow) {
      throw this.errorToThrow;
    }
    return [...this.agents];
  }

  async saveAgents(agents: AgentViewModel[]): Promise&lt;void&gt; {
    if (this.shouldThrowError && this.errorToThrow) {
      throw this.errorToThrow;
    }
    this.agents = [...agents];
  }

  async resetAgents(): Promise&lt;void&gt; {
    if (this.shouldThrowError && this.errorToThrow) {
      throw this.errorToThrow;
    }
    this.agents = [];
  }

  // Test utilities
  setTestError(error: AgentsPersistenceError | null): void {
    this.errorToThrow = error;
    this.shouldThrowError = error !== null;
  }

  getStoredAgents(): AgentViewModel[] {
    return [...this.agents];
  }

  setStoredAgents(agents: AgentViewModel[]): void {
    this.agents = [...agents];
  }
}
```

### Export Updates

**Update `packages/ui-shared/src/stores/index.ts`**

```typescript
export * from "./useAgentsStore";
export * from "./types/AgentsPersistenceAdapter";
export * from "./types/TestAgentsPersistenceAdapter";
```

### Technical Approach

1. **Copy Adapter Pattern from Existing Stores**
   - Use identical interface structure from roles/personalities
   - Maintain same dependency injection pattern
   - Follow same error handling approach

2. **Dependency Injection Benefits**
   - Enables testing with mock adapters
   - Allows different persistence strategies
   - Decouples store from specific persistence implementation

3. **Error Boundary Design**
   - Adapter errors wrapped in AgentsPersistenceError
   - Original error preserved for debugging
   - Consistent error interface for store consumers

### Acceptance Criteria

- ✅ AgentsPersistenceAdapter interface defines all required methods
- ✅ AgentsPersistenceError class for error handling
- ✅ setAgentsPersistenceAdapter function for dependency injection
- ✅ loadAgents method uses adapter with error handling
- ✅ saveAgents method uses adapter with error handling
- ✅ resetAgents method uses adapter with error handling
- ✅ TestAgentsPersistenceAdapter for unit testing
- ✅ Error boundary between store and persistence layer
- ✅ All exports properly configured

### Unit Tests

**Test File: Add to `packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts`**

**Persistence Adapter Integration Tests**

- Test setAgentsPersistenceAdapter registration
- Test error when adapter not initialized
- Test loadAgents calls adapter.loadAgents()
- Test saveAgents calls adapter.saveAgents()
- Test resetAgents calls adapter.resetAgents()

**Error Handling Tests**

- Test AgentsPersistenceError creation and properties
- Test error wrapping from adapter failures
- Test error code preservation
- Test original error preservation

**TestAgentsPersistenceAdapter Tests**

- Test successful load/save/reset operations
- Test error simulation with setTestError
- Test data persistence in test adapter
- Test test utility methods

**Dependency Injection Tests**

- Test adapter registration and retrieval
- Test multiple adapter registrations (last wins)
- Test adapter persistence across store operations

**Integration Tests with Mock Adapter**

- Test complete load flow with mock data
- Test complete save flow with verification
- Test error scenarios with mock failures
- Test retry behavior with adapter errors

### Dependencies

- Requires error handling system from previous task
- Requires AgentViewModel type from shared package
- Follows adapter patterns from existing stores

### Performance Requirements

- Adapter operations don't block store methods
- Error wrapping minimal performance overhead
- Test adapter provides fast in-memory operations
- Dependency injection setup happens once

### Security Considerations

- Adapter interface abstracts persistence security concerns
- Error messages don't expose persistence internals
- Test adapter doesn't persist sensitive data
- Error boundaries prevent adapter failures from corrupting store state

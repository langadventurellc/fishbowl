/**
 * Unit tests for AgentsStore type composition.
 *
 * Tests that the AgentsStore type properly combines AgentsState and AgentsActions
 * and includes all required methods and properties.
 *
 * @module stores/__tests__/AgentsStore.test
 */

import type { AgentsStore } from "../AgentsStore";
import type { AgentsState } from "../AgentsState";
import type { AgentsActions } from "../AgentsActions";

describe("AgentsStore Type", () => {
  it("should extend both AgentsState and AgentsActions", () => {
    // Type-only test - if this compiles, the type composition is correct
    // This test validates that the type intersection works properly
    const typeTest = (): void => {
      const store: AgentsStore = {} as AgentsStore;

      // These should not cause TypeScript errors
      const _agents = store.agents;
      const _isLoading = store.isLoading;
      const _createAgent = store.createAgent;
      const _updateAgent = store.updateAgent;

      // Test passes if TypeScript compilation succeeds
      expect(store).toBeDefined();
    };

    expect(() => typeTest()).not.toThrow();
  });

  it("should be assignable to both AgentsState and AgentsActions", () => {
    // Type compatibility test
    const mockStore = {} as AgentsStore;

    // Should be assignable to AgentsState
    const state: AgentsState = mockStore;
    expect(state).toBeDefined();

    // Should be assignable to AgentsActions
    const actions: AgentsActions = mockStore;
    expect(actions).toBeDefined();
  });
});

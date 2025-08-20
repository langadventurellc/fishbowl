/**
 * Unit tests for AgentsState interface.
 *
 * Tests interface structure and property types to ensure the interface
 * matches the established pattern from RolesState.
 *
 * @module stores/__tests__/AgentsState.test
 */

import type { StructuredLogger } from "@fishbowl-ai/shared";
import type {
  AgentSettingsViewModel,
  AgentsPersistenceAdapter,
} from "../../types";
import type { PendingOperation } from "../../types/agents/PendingOperation";
import type { ErrorState } from "../ErrorState";
import type { AgentsState } from "../AgentsState";

describe("AgentsState Interface", () => {
  it("should have all required properties with correct types", () => {
    // This test validates the interface structure exists and compiles
    const mockState: AgentsState = {
      agents: [] as AgentSettingsViewModel[],
      isLoading: false,
      error: null as ErrorState | null,
      adapter: null as AgentsPersistenceAdapter | null,
      logger: {} as StructuredLogger,
      isInitialized: false,
      isSaving: false,
      lastSyncTime: null,
      pendingOperations: [] as PendingOperation[],
      retryTimers: new Map<string, ReturnType<typeof setTimeout>>(),
    };

    // Verify the state object matches the interface
    expect(mockState).toBeDefined();
    expect(Array.isArray(mockState.agents)).toBe(true);
    expect(typeof mockState.isLoading).toBe("boolean");
    expect(typeof mockState.isInitialized).toBe("boolean");
    expect(typeof mockState.isSaving).toBe("boolean");
    expect(Array.isArray(mockState.pendingOperations)).toBe(true);
    expect(mockState.retryTimers instanceof Map).toBe(true);
  });

  it("should match RolesState pattern structure", () => {
    // Type-only test - if this compiles, the interface structure is correct
    const validateInterface = (state: AgentsState): void => {
      // Validate all required properties exist
      expect(state.agents).toBeDefined();
      expect(state.isLoading).toBeDefined();
      expect(state.error).toBeDefined();
      expect(state.adapter).toBeDefined();
      expect(state.logger).toBeDefined();
      expect(state.isInitialized).toBeDefined();
      expect(state.isSaving).toBeDefined();
      expect(state.lastSyncTime).toBeDefined();
      expect(state.pendingOperations).toBeDefined();
      expect(state.retryTimers).toBeDefined();
    };

    const mockState: AgentsState = {
      agents: [],
      isLoading: false,
      error: null,
      adapter: null,
      logger: {} as StructuredLogger,
      isInitialized: false,
      isSaving: false,
      lastSyncTime: null,
      pendingOperations: [],
      retryTimers: new Map(),
    };

    expect(() => validateInterface(mockState)).not.toThrow();
  });
});

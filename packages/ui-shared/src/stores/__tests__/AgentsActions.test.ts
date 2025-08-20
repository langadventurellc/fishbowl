/**
 * Unit tests for AgentsActions interface.
 *
 * Tests interface method signatures and completeness to ensure the interface
 * matches the established pattern from RolesActions.
 *
 * @module stores/__tests__/AgentsActions.test
 */

import type {
  PersistedAgentsSettingsData,
  StructuredLogger,
} from "@fishbowl-ai/shared";
import type {
  AgentDefaults,
  AgentFormData,
  AgentSettingsViewModel,
  AgentsPersistenceAdapter,
} from "../../types";
import type { ErrorState } from "../ErrorState";
import type { AgentsActions } from "../AgentsActions";

describe("AgentsActions Interface", () => {
  it("should have all required CRUD methods with correct signatures", () => {
    // Type-only test to validate method signatures
    const mockActions: AgentsActions = {
      // CRUD methods
      createAgent: (_agentData: AgentFormData): string => "test-id",
      updateAgent: (_id: string, _agentData: AgentFormData): void => {},
      deleteAgent: (_id: string): void => {},
      getAgentById: (_id: string): AgentSettingsViewModel | undefined =>
        undefined,
      isAgentNameUnique: (_name: string, _excludeId?: string): boolean => true,

      // State management methods
      setLoading: (_loading: boolean): void => {},
      setError: (_error: string | null): void => {},
      clearError: (): void => {},

      // Adapter integration methods
      setAdapter: (_adapter: AgentsPersistenceAdapter): void => {},
      initialize: async (
        _adapter: AgentsPersistenceAdapter,
        _logger: StructuredLogger,
      ): Promise<void> => {},

      // Auto-save methods
      persistChanges: async (): Promise<void> => {},
      syncWithStorage: async (): Promise<void> => {},

      // Sync and bulk operation methods
      exportAgents: async (): Promise<PersistedAgentsSettingsData> => ({
        schemaVersion: "1.0.0",
        lastUpdated: "",
        agents: [],
      }),
      importAgents: async (
        _data: PersistedAgentsSettingsData,
      ): Promise<void> => {},
      resetAgents: async (): Promise<void> => {},

      // Error recovery methods
      retryLastOperation: async (): Promise<void> => {},
      clearErrorState: (): void => {},
      getErrorDetails: (): ErrorState => ({
        message: null,
        operation: null,
        isRetryable: false,
        retryCount: 0,
        timestamp: null,
      }),

      // Cleanup method
      destroy: (): void => {},

      // Defaults management methods
      setDefaults: (_defaults: AgentDefaults): void => {},
      getDefaults: (): AgentDefaults => ({
        temperature: 1.0,
        maxTokens: 1000,
        topP: 0.95,
      }),
      loadDefaults: async (): Promise<void> => {},
      saveDefaults: async (_defaults: AgentDefaults): Promise<void> => {},
      resetDefaults: async (): Promise<void> => {},
    };

    // Verify all methods are defined
    expect(typeof mockActions.createAgent).toBe("function");
    expect(typeof mockActions.updateAgent).toBe("function");
    expect(typeof mockActions.deleteAgent).toBe("function");
    expect(typeof mockActions.getAgentById).toBe("function");
    expect(typeof mockActions.isAgentNameUnique).toBe("function");
    expect(typeof mockActions.setLoading).toBe("function");
    expect(typeof mockActions.setError).toBe("function");
    expect(typeof mockActions.clearError).toBe("function");
    expect(typeof mockActions.setAdapter).toBe("function");
    expect(typeof mockActions.initialize).toBe("function");
    expect(typeof mockActions.persistChanges).toBe("function");
    expect(typeof mockActions.syncWithStorage).toBe("function");
    expect(typeof mockActions.exportAgents).toBe("function");
    expect(typeof mockActions.importAgents).toBe("function");
    expect(typeof mockActions.resetAgents).toBe("function");
    expect(typeof mockActions.retryLastOperation).toBe("function");
    expect(typeof mockActions.clearErrorState).toBe("function");
    expect(typeof mockActions.getErrorDetails).toBe("function");
    expect(typeof mockActions.destroy).toBe("function");
    expect(typeof mockActions.setDefaults).toBe("function");
    expect(typeof mockActions.getDefaults).toBe("function");
    expect(typeof mockActions.loadDefaults).toBe("function");
    expect(typeof mockActions.saveDefaults).toBe("function");
    expect(typeof mockActions.resetDefaults).toBe("function");
  });

  it("should match RolesActions pattern structure", () => {
    // Type-only test to validate interface structure
    const typeTest = (): void => {
      const actions: AgentsActions = {} as AgentsActions;

      // These should not cause TypeScript errors if interface is properly defined
      const _createAgent = actions.createAgent;
      const _updateAgent = actions.updateAgent;
      const _deleteAgent = actions.deleteAgent;
      const _setAdapter = actions.setAdapter;
      const _initialize = actions.initialize;
      const _exportAgents = actions.exportAgents;
      const _destroy = actions.destroy;
      const _setDefaults = actions.setDefaults;
      const _getDefaults = actions.getDefaults;
      const _loadDefaults = actions.loadDefaults;
      const _saveDefaults = actions.saveDefaults;
      const _resetDefaults = actions.resetDefaults;

      // Test passes if TypeScript compilation succeeds
      expect(actions).toBeDefined();
    };

    expect(() => typeTest()).not.toThrow();
  });
});

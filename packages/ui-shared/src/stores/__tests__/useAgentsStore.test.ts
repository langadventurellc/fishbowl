/**
 * Unit tests for the agents Zustand store.
 *
 * Tests store initialization, CRUD operations, validation, error handling,
 * persistence integration, and interface compliance.
 *
 * @module stores/__tests__/useAgentsStore.test
 */

import { AgentsPersistenceAdapter } from "../../types/agents/persistence/AgentsPersistenceAdapter";
import { AgentFormData } from "../../types/settings/AgentFormData";
import { useAgentsStore } from "../useAgentsStore";

// Mock console methods
const mockConsoleError = jest.fn();

beforeEach(() => {
  // Reset store to clean state
  useAgentsStore.setState({
    agents: [],
    isLoading: false,
    error: {
      message: null,
      operation: null,
      isRetryable: false,
      retryCount: 0,
      timestamp: null,
    },
    adapter: null,
    isInitialized: false,
    isSaving: false,
    lastSyncTime: null,
    pendingOperations: [],
    retryTimers: new Map(),
  });

  // Reset console mocks
  mockConsoleError.mockClear();
  jest.spyOn(console, "error").mockImplementation(mockConsoleError);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useAgentsStore", () => {
  describe("store initialization", () => {
    it("should initialize with correct default values", () => {
      const state = useAgentsStore.getState();

      expect(state.agents).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error?.message).toBeNull();
      expect(state.error?.operation).toBeNull();
      expect(state.error?.isRetryable).toBe(false);
      expect(state.error?.retryCount).toBe(0);
      expect(state.error?.timestamp).toBeNull();
      expect(state.adapter).toBeNull();
      expect(state.isInitialized).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.lastSyncTime).toBeNull();
      expect(state.pendingOperations).toEqual([]);
      expect(state.retryTimers).toBeInstanceOf(Map);
    });

    it("should have all required methods", () => {
      const store = useAgentsStore.getState();

      // CRUD operations
      expect(typeof store.createAgent).toBe("function");
      expect(typeof store.updateAgent).toBe("function");
      expect(typeof store.deleteAgent).toBe("function");
      expect(typeof store.getAgentById).toBe("function");
      expect(typeof store.isAgentNameUnique).toBe("function");

      // State management
      expect(typeof store.setLoading).toBe("function");
      expect(typeof store.setError).toBe("function");
      expect(typeof store.clearError).toBe("function");

      // Adapter integration
      expect(typeof store.setAdapter).toBe("function");
      expect(typeof store.initialize).toBe("function");

      // Persistence
      expect(typeof store.persistChanges).toBe("function");
      expect(typeof store.syncWithStorage).toBe("function");

      // Bulk operations
      expect(typeof store.exportAgents).toBe("function");
      expect(typeof store.importAgents).toBe("function");
      expect(typeof store.resetAgents).toBe("function");

      // Error recovery
      expect(typeof store.retryLastOperation).toBe("function");
      expect(typeof store.clearErrorState).toBe("function");
      expect(typeof store.getErrorDetails).toBe("function");

      // Cleanup
      expect(typeof store.destroy).toBe("function");
    });
  });

  describe("error state management", () => {
    it("should set error correctly", () => {
      const store = useAgentsStore.getState();

      store.setError("Test error message");
      const state = useAgentsStore.getState();

      expect(state.error?.message).toBe("Test error message");
      expect(state.error?.timestamp).toBeTruthy();
      expect(typeof state.error?.timestamp).toBe("string");
    });

    it("should clear error correctly", () => {
      const store = useAgentsStore.getState();

      // Set an error first
      store.setError("Test error");
      expect(useAgentsStore.getState().error?.message).toBe("Test error");

      // Clear the error
      store.clearError();
      const state = useAgentsStore.getState();

      expect(state.error?.message).toBeNull();
      expect(state.error?.timestamp).toBeNull();
    });

    it("should set error to null when passing null", () => {
      const store = useAgentsStore.getState();

      // Set an error first
      store.setError("Test error");
      expect(useAgentsStore.getState().error?.message).toBe("Test error");

      // Clear by setting null
      store.setError(null);
      const state = useAgentsStore.getState();

      expect(state.error?.message).toBeNull();
      expect(state.error?.timestamp).toBeNull();
    });

    it("should get error details correctly", () => {
      const store = useAgentsStore.getState();

      store.setError("Test error details");
      const errorDetails = store.getErrorDetails();

      expect(errorDetails?.message).toBe("Test error details");
      expect(errorDetails?.timestamp).toBeTruthy();
    });

    it("should return clean error state when no error exists", () => {
      const store = useAgentsStore.getState();
      const errorDetails = store.getErrorDetails();

      expect(errorDetails?.message).toBeNull();
      expect(errorDetails?.operation).toBeNull();
      expect(errorDetails?.isRetryable).toBe(false);
      expect(errorDetails?.retryCount).toBe(0);
      expect(errorDetails?.timestamp).toBeNull();
    });
  });

  describe("loading state management", () => {
    it("should set loading state to true", () => {
      const store = useAgentsStore.getState();

      store.setLoading(true);

      expect(useAgentsStore.getState().isLoading).toBe(true);
    });

    it("should set loading state to false", () => {
      const store = useAgentsStore.getState();

      store.setLoading(false);

      expect(useAgentsStore.getState().isLoading).toBe(false);
    });

    it("should convert truthy values to boolean", () => {
      const store = useAgentsStore.getState();

      store.setLoading("truthy string" as unknown as boolean);
      expect(useAgentsStore.getState().isLoading).toBe(true);

      store.setLoading(0 as unknown as boolean);
      expect(useAgentsStore.getState().isLoading).toBe(false);
    });
  });

  describe("adapter management", () => {
    it("should set adapter correctly", () => {
      const store = useAgentsStore.getState();
      const mockAdapter = {} as AgentsPersistenceAdapter;

      store.setAdapter(mockAdapter);

      expect(useAgentsStore.getState().adapter).toBe(mockAdapter);
    });
  });

  describe("retry timers cleanup", () => {
    it("should clear retry timers when clearing error state", () => {
      const store = useAgentsStore.getState();

      // Add a mock timer
      const mockTimer = setTimeout(() => {}, 1000);
      store.retryTimers.set("test", mockTimer);

      expect(store.retryTimers.size).toBe(1);

      store.clearErrorState();

      expect(store.retryTimers.size).toBe(0);
      clearTimeout(mockTimer); // cleanup
    });

    it("should clear error state when clearing error state", () => {
      const store = useAgentsStore.getState();

      // Set an error first
      store.setError("Test error");
      expect(useAgentsStore.getState().error?.message).toBe("Test error");

      store.clearErrorState();
      const state = useAgentsStore.getState();

      expect(state.error?.message).toBeNull();
      expect(state.error?.timestamp).toBeNull();
    });
  });

  describe("CRUD operations", () => {
    const validAgentData: AgentFormData = {
      name: "Test Agent",
      model: "claude-3-haiku",
      role: "test-role-id",
      personality: "test-personality-id",
      systemPrompt: "You are a helpful test agent.",
    };

    describe("createAgent", () => {
      it("should create agent with valid data", () => {
        const store = useAgentsStore.getState();

        const agentId = store.createAgent(validAgentData);

        expect(agentId).toBeTruthy();
        expect(typeof agentId).toBe("string");

        const state = useAgentsStore.getState();
        expect(state.agents).toHaveLength(1);
        expect(state.agents[0]!.name).toBe("Test Agent");
        expect(state.agents[0]!.model).toBe("claude-3-haiku");
        expect(state.agents[0]!.id).toBe(agentId);
        expect(state.agents[0]!.createdAt).toBeTruthy();
        expect(state.agents[0]!.updatedAt).toBeTruthy();
        expect(state.error?.message).toBeNull();
      });

      it("should add pending operation for create", () => {
        const store = useAgentsStore.getState();

        store.createAgent(validAgentData);

        const state = useAgentsStore.getState();
        expect(state.pendingOperations).toHaveLength(1);
        expect(state.pendingOperations[0]!.type).toBe("create");
        expect(state.pendingOperations[0]!.status).toBe("pending");
        expect(state.pendingOperations[0]!.rollbackData).toBeUndefined();
      });

      it("should reject duplicate names", () => {
        const store = useAgentsStore.getState();

        const firstId = store.createAgent(validAgentData);
        expect(firstId).toBeTruthy();

        const secondId = store.createAgent(validAgentData);
        expect(secondId).toBe("");

        const state = useAgentsStore.getState();
        expect(state.agents).toHaveLength(1);
        expect(state.error?.message).toBe(
          "An agent with this name already exists",
        );
      });

      it("should handle validation errors", () => {
        const store = useAgentsStore.getState();

        const invalidData = {
          ...validAgentData,
          name: "", // Invalid: empty name
        };

        const agentId = store.createAgent(invalidData);

        expect(agentId).toBe("");
        const state = useAgentsStore.getState();
        expect(state.agents).toHaveLength(0);
        expect(state.error?.message).toContain("Agent name is required");
      });

      it("should generate unique IDs", () => {
        const store = useAgentsStore.getState();

        const agent1Data = { ...validAgentData, name: "Agent 1" };
        const agent2Data = { ...validAgentData, name: "Agent 2" };

        const id1 = store.createAgent(agent1Data);
        const id2 = store.createAgent(agent2Data);

        expect(id1).not.toBe(id2);
        expect(id1).toBeTruthy();
        expect(id2).toBeTruthy();

        // Verify both agents were created with correct IDs
        const state = useAgentsStore.getState();
        expect(state.agents).toHaveLength(2);
        expect(state.agents.find((a) => a.id === id1)?.name).toBe("Agent 1");
        expect(state.agents.find((a) => a.id === id2)?.name).toBe("Agent 2");
      });
    });

    describe("updateAgent", () => {
      it("should update existing agent", () => {
        const store = useAgentsStore.getState();

        const agentId = store.createAgent(validAgentData);
        expect(agentId).toBeTruthy();

        const updateData = {
          ...validAgentData,
          name: "Updated Agent",
        };

        store.updateAgent(agentId, updateData);

        const state = useAgentsStore.getState();
        const updatedAgent = state.agents.find((a) => a.id === agentId);
        expect(updatedAgent).toBeTruthy();
        expect(updatedAgent!.name).toBe("Updated Agent");
        expect(updatedAgent!.name).toBe("Updated Agent");
        // Check that updatedAt is a valid timestamp (may be same as createdAt if update happens quickly)
        expect(updatedAgent!.updatedAt).toBeTruthy();
        expect(typeof updatedAgent!.updatedAt).toBe("string");
        expect(state.error?.message).toBeNull();
      });

      it("should add pending operation for update with rollback data", () => {
        const store = useAgentsStore.getState();

        const agentId = store.createAgent(validAgentData);
        const originalAgent = store.getAgentById(agentId)!;

        const updateData = { ...validAgentData, name: "Updated Agent" };
        store.updateAgent(agentId, updateData);

        const state = useAgentsStore.getState();
        const updateOperation = state.pendingOperations.find(
          (op) => op.type === "update",
        );
        expect(updateOperation).toBeTruthy();
        expect(updateOperation!.rollbackData).toEqual(originalAgent);
      });

      it("should handle agent not found", () => {
        const store = useAgentsStore.getState();

        store.updateAgent("non-existent-id", validAgentData);

        const state = useAgentsStore.getState();
        expect(state.error?.message).toBe("Agent not found");
      });

      it("should reject duplicate names (excluding current agent)", () => {
        const store = useAgentsStore.getState();

        const agent1Data = { ...validAgentData, name: "Agent 1" };
        const agent2Data = { ...validAgentData, name: "Agent 2" };

        const id1 = store.createAgent(agent1Data);
        const id2 = store.createAgent(agent2Data);

        // Try to update agent 2 to have the same name as agent 1
        const updateData = { ...validAgentData, name: "Agent 1" };
        store.updateAgent(id2, updateData);

        const state = useAgentsStore.getState();
        expect(state.error?.message).toBe(
          "An agent with this name already exists",
        );

        // Agent 2 should not have been updated
        const agent2 = state.agents.find((a) => a.id === id2);
        expect(agent2?.name).toBe("Agent 2");

        // Agent 1 should remain unchanged
        const agent1 = state.agents.find((a) => a.id === id1);
        expect(agent1?.name).toBe("Agent 1");
      });

      it("should allow updating agent with same name", () => {
        const store = useAgentsStore.getState();

        const agentId = store.createAgent(validAgentData);

        // Update with same name but different model
        const updateData = {
          ...validAgentData,
          name: validAgentData.name, // Same name
          model: "claude-3-opus",
        };

        store.updateAgent(agentId, updateData);

        const state = useAgentsStore.getState();
        const updatedAgent = state.agents.find((a) => a.id === agentId);
        expect(updatedAgent?.model).toBe("claude-3-opus");
        expect(state.error?.message).toBeNull();
      });
    });

    describe("deleteAgent", () => {
      it("should delete existing agent", () => {
        const store = useAgentsStore.getState();

        const agentId = store.createAgent(validAgentData);
        expect(useAgentsStore.getState().agents).toHaveLength(1);

        store.deleteAgent(agentId);

        const state = useAgentsStore.getState();
        expect(state.agents).toHaveLength(0);
        expect(state.error?.message).toBeNull();
      });

      it("should add pending operation for delete with rollback data", () => {
        const store = useAgentsStore.getState();

        const agentId = store.createAgent(validAgentData);
        const originalAgent = store.getAgentById(agentId)!;

        store.deleteAgent(agentId);

        const state = useAgentsStore.getState();
        const deleteOperation = state.pendingOperations.find(
          (op) => op.type === "delete",
        );
        expect(deleteOperation).toBeTruthy();
        expect(deleteOperation!.rollbackData).toEqual(originalAgent);
      });

      it("should handle agent not found", () => {
        const store = useAgentsStore.getState();

        store.deleteAgent("non-existent-id");

        const state = useAgentsStore.getState();
        expect(state.error?.message).toBe("Agent not found");
      });
    });

    describe("getAgentById", () => {
      it("should return agent by ID", () => {
        const store = useAgentsStore.getState();

        const agentId = store.createAgent(validAgentData);
        const agent = store.getAgentById(agentId);

        expect(agent).toBeTruthy();
        expect(agent!.id).toBe(agentId);
        expect(agent!.name).toBe("Test Agent");
      });

      it("should return undefined for non-existent ID", () => {
        const store = useAgentsStore.getState();

        const agent = store.getAgentById("non-existent-id");

        expect(agent).toBeUndefined();
      });
    });

    describe("isAgentNameUnique", () => {
      it("should return true for unique names", () => {
        const store = useAgentsStore.getState();

        store.createAgent(validAgentData);

        expect(store.isAgentNameUnique("Different Name")).toBe(true);
      });

      it("should return false for duplicate names", () => {
        const store = useAgentsStore.getState();

        store.createAgent(validAgentData);

        expect(store.isAgentNameUnique("Test Agent")).toBe(false);
      });

      it("should be case-insensitive", () => {
        const store = useAgentsStore.getState();

        store.createAgent(validAgentData);

        expect(store.isAgentNameUnique("test agent")).toBe(false);
        expect(store.isAgentNameUnique("TEST AGENT")).toBe(false);
      });

      it("should exclude specified ID", () => {
        const store = useAgentsStore.getState();

        const agentId = store.createAgent(validAgentData);

        expect(store.isAgentNameUnique("Test Agent", agentId)).toBe(true);
      });

      it("should return true for empty store", () => {
        const store = useAgentsStore.getState();

        expect(store.isAgentNameUnique("Any Name")).toBe(true);
      });
    });
  });

  describe("cleanup", () => {
    it("should have destroy method", () => {
      const store = useAgentsStore.getState();

      expect(typeof store.destroy).toBe("function");
    });

    it("should not throw when destroy is called", () => {
      const store = useAgentsStore.getState();

      expect(() => store.destroy()).not.toThrow();
    });
  });
});

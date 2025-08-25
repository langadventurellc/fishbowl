/**
 * Unit tests for useConversationAgents hook.
 *
 * Tests core functionality of the useConversationAgents hook for conversation agent management.
 *
 * @module hooks/__tests__/useConversationAgents.test
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import type { ConversationAgent } from "@fishbowl-ai/shared";
import type {
  ConversationAgentViewModel,
  AgentSettingsViewModel,
} from "@fishbowl-ai/ui-shared";
import { useConversationAgents } from "../useConversationAgents";

// Create stable mock logger to prevent infinite re-renders
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock agent store
const mockGetAgentById = jest.fn();

// Mock useServices hook
jest.mock("../../contexts", () => ({
  useServices: jest.fn(() => ({
    logger: mockLogger,
  })),
}));

// Mock useAgentsStore
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useAgentsStore: jest.fn(() => ({
    getAgentById: mockGetAgentById,
  })),
}));

// Mock data for testing
const mockAgent1: AgentSettingsViewModel = {
  id: "agent-1",
  name: "Assistant Agent",
  role: "Helper",
  personality: "Friendly",
  model: "gpt-4",
  systemPrompt: "You are a helpful assistant",
  createdAt: "2023-01-01T10:00:00.000Z",
  updatedAt: "2023-01-01T10:00:00.000Z",
};

const mockAgent2: AgentSettingsViewModel = {
  id: "agent-2",
  name: "Code Agent",
  role: "Developer",
  personality: "Analytical",
  model: "claude-3-sonnet",
  systemPrompt: "You are a coding assistant",
  createdAt: "2023-01-02T10:00:00.000Z",
  updatedAt: "2023-01-02T10:00:00.000Z",
};

const mockConversationAgent1: ConversationAgent = {
  id: "ca-1",
  conversation_id: "conv-1",
  agent_id: "agent-1",
  added_at: "2023-01-01T12:00:00.000Z",
  is_active: true,
  display_order: 0,
};

const mockConversationAgent2: ConversationAgent = {
  id: "ca-2",
  conversation_id: "conv-1",
  agent_id: "agent-2",
  added_at: "2023-01-01T13:00:00.000Z",
  is_active: true,
  display_order: 1,
};

const mockConversationAgent3: ConversationAgent = {
  id: "ca-3",
  conversation_id: "conv-1",
  agent_id: "agent-3", // This agent doesn't exist in store
  added_at: "2023-01-01T14:00:00.000Z",
  is_active: true,
  display_order: 2,
};

// Mock electronAPI methods
const mockGetByConversation = jest.fn();
const mockAdd = jest.fn();
const mockRemove = jest.fn();

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      conversationAgent: {
        getByConversation: mockGetByConversation,
        add: mockAdd,
        remove: mockRemove,
      },
    },
    writable: true,
    configurable: true,
  });

  // Default agent store responses
  mockGetAgentById.mockImplementation((agentId: string) => {
    switch (agentId) {
      case "agent-1":
        return mockAgent1;
      case "agent-2":
        return mockAgent2;
      default:
        return null; // Agent not found in store
    }
  });

  // Default successful response
  mockGetByConversation.mockResolvedValue([
    mockConversationAgent1,
    mockConversationAgent2,
  ]);
  mockAdd.mockResolvedValue(mockConversationAgent1);
  mockRemove.mockResolvedValue(true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useConversationAgents", () => {
  describe("initial load", () => {
    it("should initialize with empty state when conversationId is null", () => {
      const { result } = renderHook(() => useConversationAgents(null));

      expect(result.current.conversationAgents).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should load conversation agents successfully and sort by display order", async () => {
      const conversationId = "conv-1";
      const { result } = renderHook(() =>
        useConversationAgents(conversationId),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetByConversation).toHaveBeenCalledTimes(1);
      expect(mockGetByConversation).toHaveBeenCalledWith(conversationId);

      // Should have 2 agents (mockConversationAgent3 filtered out because agent not in store)
      expect(result.current.conversationAgents).toHaveLength(2);
      expect(result.current.conversationAgents[0]).toMatchObject({
        id: "ca-1",
        conversationId: "conv-1",
        agentId: "agent-1",
        agent: mockAgent1,
        displayOrder: 0,
      });
      expect(result.current.conversationAgents[1]).toMatchObject({
        id: "ca-2",
        conversationId: "conv-1",
        agentId: "agent-2",
        agent: mockAgent2,
        displayOrder: 1,
      });
      expect(result.current.error).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Loaded 2 conversation agents",
      );
    });

    it("should handle empty conversation agents list", async () => {
      mockGetByConversation.mockResolvedValue([]);
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversationAgents).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Loaded 0 conversation agents",
      );
    });

    it("should filter out agents not found in store and log warnings", async () => {
      mockGetByConversation.mockResolvedValue([
        mockConversationAgent1,
        mockConversationAgent3, // agent-3 not in store
      ]);

      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversationAgents).toHaveLength(1);
      expect(result.current.conversationAgents[0]?.agentId).toBe("agent-1");
      expect(mockLogger.warn).toHaveBeenCalledWith("Agent not found in store", {
        agentId: "agent-3",
      });
    });
  });

  describe("error handling", () => {
    it("should handle API errors during load", async () => {
      const testError = new Error("Failed to fetch conversation agents");
      mockGetByConversation.mockRejectedValue(testError);

      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversationAgents).toEqual([]);
      expect(result.current.error).toBe(testError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to load conversation agents:",
        testError,
      );
    });

    it("should handle non-Error objects as errors", async () => {
      const testError = "String error message";
      mockGetByConversation.mockRejectedValue(testError);

      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversationAgents).toEqual([]);
      expect(result.current.error).toBe(testError);
    });
  });

  describe("non-Electron environment", () => {
    beforeEach(() => {
      // Remove electronAPI to simulate non-Electron environment
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversationAgents).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversation agents load",
      );
    });

    it("should handle missing conversationAgent API gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversationAgents).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversation agents load",
      );
    });

    it("should handle non-function getByConversation method gracefully", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {
          conversationAgent: {
            getByConversation: "not a function",
          },
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversationAgents).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Not running in Electron environment, skipping conversation agents load",
      );
    });
  });

  describe("addAgent functionality", () => {
    it("should add agent and refetch conversation agents", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetByConversation).toHaveBeenCalledTimes(1);

      // Mock updated response after add
      const updatedAgents = [
        mockConversationAgent1,
        mockConversationAgent2,
        { ...mockConversationAgent2, id: "ca-new", agent_id: "agent-3" },
      ];
      mockGetByConversation.mockResolvedValue(updatedAgents);

      await act(async () => {
        await result.current.addAgent("agent-3");
      });

      expect(mockAdd).toHaveBeenCalledWith({
        conversation_id: "conv-1",
        agent_id: "agent-3",
      });
      expect(mockGetByConversation).toHaveBeenCalledTimes(2); // Initial + refetch
    });

    it("should handle add agent errors", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const addError = new Error("Failed to add agent");
      mockAdd.mockRejectedValue(addError);

      await act(async () => {
        await result.current.addAgent("agent-3");
      });

      expect(result.current.error).toBe(addError);
      expect(mockGetByConversation).toHaveBeenCalledTimes(1); // Should not refetch on error
    });

    it("should do nothing when conversationId is null", async () => {
      const { result } = renderHook(() => useConversationAgents(null));

      await act(async () => {
        await result.current.addAgent("agent-3");
      });

      expect(mockAdd).not.toHaveBeenCalled();
    });
  });

  describe("removeAgent functionality", () => {
    it("should remove agent and refetch conversation agents", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetByConversation).toHaveBeenCalledTimes(1);

      // Mock updated response after remove
      mockGetByConversation.mockResolvedValue([mockConversationAgent1]);

      await act(async () => {
        await result.current.removeAgent("agent-2");
      });

      expect(mockRemove).toHaveBeenCalledWith({
        conversation_id: "conv-1",
        agent_id: "agent-2",
      });
      expect(mockGetByConversation).toHaveBeenCalledTimes(2); // Initial + refetch
    });

    it("should handle remove agent errors", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const removeError = new Error("Failed to remove agent");
      mockRemove.mockRejectedValue(removeError);

      await act(async () => {
        await result.current.removeAgent("agent-2");
      });

      expect(result.current.error).toBe(removeError);
      expect(mockGetByConversation).toHaveBeenCalledTimes(1); // Should not refetch on error
    });

    it("should do nothing when conversationId is null", async () => {
      const { result } = renderHook(() => useConversationAgents(null));

      await act(async () => {
        await result.current.removeAgent("agent-2");
      });

      expect(mockRemove).not.toHaveBeenCalled();
    });
  });

  describe("refetch functionality", () => {
    it("should refetch conversation agents successfully", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetByConversation).toHaveBeenCalledTimes(1);

      // Update mock data and refetch
      const newMockAgents = [{ ...mockConversationAgent1, is_active: false }];
      mockGetByConversation.mockResolvedValue(newMockAgents);

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockGetByConversation).toHaveBeenCalledTimes(2);
      expect(result.current.conversationAgents[0]?.isActive).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle refetch errors", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock error on refetch
      const refetchError = new Error("Refetch failed");
      mockGetByConversation.mockRejectedValue(refetchError);

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.error).toBe(refetchError);
    });

    it("should clear previous errors on successful refetch", async () => {
      // Start with an error
      mockGetByConversation.mockRejectedValue(new Error("Initial error"));
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Mock successful refetch
      mockGetByConversation.mockResolvedValue([mockConversationAgent1]);

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.conversationAgents).toHaveLength(1);
      });
    });

    it("should set loading state during refetch", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create a controllable promise to test loading state
      let resolveRefetch: (value: ConversationAgent[]) => void;
      const slowRefetch = new Promise<ConversationAgent[]>((resolve) => {
        resolveRefetch = resolve;
      });
      mockGetByConversation.mockReturnValue(slowRefetch);

      // Start refetch without waiting
      const refetchPromise = result.current.refetch();

      // Check if loading state is set
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve the promise
      resolveRefetch!([mockConversationAgent1]);
      await refetchPromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("conversation ID changes", () => {
    it("should refetch when conversation ID changes", async () => {
      const { result, rerender } = renderHook(
        ({ conversationId }: { conversationId: string | null }) =>
          useConversationAgents(conversationId),
        {
          initialProps: { conversationId: "conv-1" as string | null },
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetByConversation).toHaveBeenCalledTimes(1);
      expect(mockGetByConversation).toHaveBeenCalledWith("conv-1");

      // Change conversation ID
      rerender({ conversationId: "conv-2" });

      await waitFor(() => {
        expect(mockGetByConversation).toHaveBeenCalledTimes(2);
        expect(mockGetByConversation).toHaveBeenCalledWith("conv-2");
      });
    });

    it("should clear agents when conversation ID changes to null", async () => {
      const { result, rerender } = renderHook(
        ({ conversationId }: { conversationId: string | null }) =>
          useConversationAgents(conversationId),
        {
          initialProps: { conversationId: "conv-1" as string | null },
        },
      );

      await waitFor(() => {
        expect(result.current.conversationAgents).toHaveLength(2);
      });

      // Change to null
      rerender({ conversationId: null });

      expect(result.current.conversationAgents).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("sorting behavior", () => {
    it("should sort conversation agents by display order then by added date", async () => {
      // Mixed up order to test sorting
      const unsortedAgents = [
        {
          ...mockConversationAgent2,
          display_order: 2,
          added_at: "2023-01-01T15:00:00.000Z",
        },
        {
          ...mockConversationAgent1,
          display_order: 0,
          added_at: "2023-01-01T12:00:00.000Z",
        },
        {
          ...mockConversationAgent3,
          agent_id: "agent-2",
          display_order: 0,
          added_at: "2023-01-01T10:00:00.000Z",
        },
      ];
      mockGetByConversation.mockResolvedValue(unsortedAgents);

      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be sorted by display order first, then by added date
      expect(result.current.conversationAgents).toHaveLength(3);
      expect(result.current.conversationAgents[0]?.displayOrder).toBe(0);
      expect(result.current.conversationAgents[0]?.addedAt).toBe(
        "2023-01-01T10:00:00.000Z",
      );
      expect(result.current.conversationAgents[1]?.displayOrder).toBe(0);
      expect(result.current.conversationAgents[1]?.addedAt).toBe(
        "2023-01-01T12:00:00.000Z",
      );
      expect(result.current.conversationAgents[2]?.displayOrder).toBe(2);
    });

    it("should handle invalid dates gracefully", async () => {
      const agentsWithInvalidDates = [
        { ...mockConversationAgent1, added_at: "invalid-date" },
        { ...mockConversationAgent2, added_at: "2023-01-15T10:00:00.000Z" },
      ];
      mockGetByConversation.mockResolvedValue(agentsWithInvalidDates);

      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still return conversation agents without throwing
      expect(result.current.conversationAgents).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });
  });

  describe("memory cleanup", () => {
    it("should not cause memory leaks on unmount", () => {
      const { unmount } = renderHook(() => useConversationAgents("conv-1"));

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should not update state after unmount", async () => {
      let resolveGetByConversation: (value: ConversationAgent[]) => void;
      const slowGetByConversation = new Promise<ConversationAgent[]>(
        (resolve) => {
          resolveGetByConversation = resolve;
        },
      );
      mockGetByConversation.mockReturnValue(slowGetByConversation);

      const { unmount } = renderHook(() => useConversationAgents("conv-1"));

      // Unmount immediately
      unmount();

      // Resolve the promise after unmount
      resolveGetByConversation!([mockConversationAgent1]);

      // Should not cause any errors or warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe("data transformation", () => {
    it("should correctly transform ConversationAgent to ConversationAgentViewModel", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const viewModel = result.current.conversationAgents[0];
      expect(viewModel).toMatchObject({
        id: "ca-1",
        conversationId: "conv-1",
        agentId: "agent-1",
        agent: mockAgent1,
        addedAt: "2023-01-01T12:00:00.000Z",
        isActive: true,
        displayOrder: 0,
      });
    });

    it("should use camelCase properties in ViewModel", async () => {
      const { result } = renderHook(() => useConversationAgents("conv-1"));

      await waitFor(() => {
        expect(result.current.conversationAgents).toHaveLength(2);
      });

      const viewModel = result.current
        .conversationAgents[0] as ConversationAgentViewModel;

      // Should have camelCase properties
      expect(viewModel).toHaveProperty("conversationId");
      expect(viewModel).toHaveProperty("agentId");
      expect(viewModel).toHaveProperty("addedAt");
      expect(viewModel).toHaveProperty("isActive");
      expect(viewModel).toHaveProperty("displayOrder");

      // Should not have snake_case properties
      expect(viewModel).not.toHaveProperty("conversation_id");
      expect(viewModel).not.toHaveProperty("agent_id");
      expect(viewModel).not.toHaveProperty("added_at");
      expect(viewModel).not.toHaveProperty("is_active");
      expect(viewModel).not.toHaveProperty("display_order");
    });
  });
});

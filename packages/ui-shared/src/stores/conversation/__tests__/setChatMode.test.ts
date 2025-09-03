/**
 * Unit tests for setChatMode functionality in useConversationStore.
 *
 * Tests cover successful chat mode updates, service integration, state updates,
 * Round Robin invariant enforcement, error handling, and edge cases.
 */

import type {
  ConversationAgent,
  ConversationService,
} from "@fishbowl-ai/shared";
import { useConversationStore } from "../useConversationStore";

// Mock conversation service
const mockConversationService: Partial<ConversationService> = {
  updateConversation: jest.fn(),
  updateConversationAgent: jest.fn(),
};

// Helper to create mock conversation
const createMockConversation = (
  id: string,
  chatMode: "manual" | "round-robin",
) => ({
  id,
  title: `Test Conversation ${id}`,
  chat_mode: chatMode,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Helper to create mock conversation agent
const createMockAgent = (
  id: string,
  displayOrder: number,
  enabled: boolean,
  addedAt: Date = new Date(),
): ConversationAgent => ({
  id,
  conversation_id: "conv-1",
  agent_id: `agent-${id}`,
  enabled,
  is_active: true,
  display_order: displayOrder,
  added_at: addedAt.toISOString(),
});

describe("setChatMode", () => {
  beforeEach(() => {
    // Reset store state
    useConversationStore
      .getState()
      .initialize(mockConversationService as ConversationService);
    useConversationStore.setState({
      activeConversationId: null,
      conversations: [],
      activeConversationAgents: [],
      error: {
        conversations: undefined,
        messages: undefined,
        agents: undefined,
        sending: undefined,
      },
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("successful chat mode updates", () => {
    it("should update conversation chat mode to manual", async () => {
      const mockConversation = createMockConversation("conv-1", "round-robin");
      const updatedConversation = {
        ...mockConversation,
        chat_mode: "manual" as const,
      };

      // Setup initial state
      useConversationStore.setState({
        activeConversationId: "conv-1",
        conversations: [mockConversation],
      });

      // Mock successful service call
      mockConversationService.updateConversation = jest
        .fn()
        .mockResolvedValueOnce(updatedConversation);

      // Execute setChatMode
      await useConversationStore.getState().setChatMode("manual");

      // Verify service was called correctly
      expect(mockConversationService.updateConversation).toHaveBeenCalledWith(
        "conv-1",
        { chat_mode: "manual" },
      );

      // Verify state was updated
      const { conversations } = useConversationStore.getState();
      expect(conversations).toHaveLength(1);
      expect(conversations[0]?.chat_mode).toBe("manual");
    });

    it("should update conversation chat mode to round-robin", async () => {
      const mockConversation = createMockConversation("conv-1", "manual");
      const updatedConversation = {
        ...mockConversation,
        chat_mode: "round-robin" as const,
      };

      // Setup initial state with multiple enabled agents
      const agents = [
        createMockAgent("agent-1", 1, true),
        createMockAgent("agent-2", 2, true),
        createMockAgent("agent-3", 3, true),
      ];

      useConversationStore.setState({
        activeConversationId: "conv-1",
        conversations: [mockConversation],
        activeConversationAgents: agents,
      });

      // Mock successful service calls
      mockConversationService.updateConversation = jest
        .fn()
        .mockResolvedValueOnce(updatedConversation);
      mockConversationService.updateConversationAgent = jest
        .fn()
        .mockImplementation(
          (agentId: string, updates: { enabled: boolean }) => {
            const agent = agents.find((a) => a.id === agentId);
            return Promise.resolve({ ...agent, ...updates });
          },
        );

      // Execute setChatMode
      await useConversationStore.getState().setChatMode("round-robin");

      // Verify conversation service was called
      expect(mockConversationService.updateConversation).toHaveBeenCalledWith(
        "conv-1",
        { chat_mode: "round-robin" },
      );

      // Verify Round Robin invariant enforcement was triggered
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-2", { enabled: false });
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-3", { enabled: false });
    });
  });

  describe("Round Robin invariant enforcement", () => {
    it("should keep first enabled agent by display order", async () => {
      const agents = [
        createMockAgent("agent-1", 3, false),
        createMockAgent("agent-2", 1, true), // Should remain enabled (lowest display_order)
        createMockAgent("agent-3", 2, true), // Should be disabled
      ];

      useConversationStore.setState({
        activeConversationAgents: agents,
      });

      // Mock successful service calls
      mockConversationService.updateConversationAgent = jest
        .fn()
        .mockImplementation((agentId, updates) => {
          const agent = agents.find((a) => a.id === agentId);
          return Promise.resolve({ ...agent, ...updates });
        });

      // Execute enforceRoundRobinInvariant directly
      await useConversationStore.getState().enforceRoundRobinInvariant();

      // Verify correct agents were updated
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-3", { enabled: false });
    });

    it("should use added_at as tiebreaker when display_order is equal", async () => {
      const earlierDate = new Date("2024-01-01");
      const laterDate = new Date("2024-01-02");

      const agents = [
        createMockAgent("agent-1", 1, true, laterDate),
        createMockAgent("agent-2", 1, true, earlierDate), // Should remain (earlier added_at)
      ];

      useConversationStore.setState({
        activeConversationAgents: agents,
      });

      mockConversationService.updateConversationAgent = jest
        .fn()
        .mockImplementation((agentId, updates) => {
          const agent = agents.find((a) => a.id === agentId);
          return Promise.resolve({ ...agent, ...updates });
        });

      await useConversationStore.getState().enforceRoundRobinInvariant();

      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-1", { enabled: false });
    });

    it("should be no-op when only one or no agents are enabled", async () => {
      const agents = [
        createMockAgent("agent-1", 1, true),
        createMockAgent("agent-2", 2, false),
        createMockAgent("agent-3", 3, false),
      ];

      useConversationStore.setState({
        activeConversationAgents: agents,
      });

      await useConversationStore.getState().enforceRoundRobinInvariant();

      expect(
        mockConversationService.updateConversationAgent,
      ).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle service errors gracefully", async () => {
      const mockConversation = createMockConversation("conv-1", "manual");

      useConversationStore.setState({
        activeConversationId: "conv-1",
        conversations: [mockConversation],
      });

      // Mock service error
      const serviceError = new Error("Network connection failed");
      mockConversationService.updateConversation = jest
        .fn()
        .mockRejectedValueOnce(serviceError);

      // Execute setChatMode
      await useConversationStore.getState().setChatMode("round-robin");

      // Verify error state was set
      const { error } = useConversationStore.getState();
      expect(error.agents).toEqual({
        message: "Failed to change chat mode: Network connection failed",
        operation: "save",
        isRetryable: true,
        retryCount: 0,
        timestamp: expect.any(String),
      });

      // Verify conversation state was not modified
      const { conversations } = useConversationStore.getState();
      expect(conversations[0]?.chat_mode).toBe("manual");
    });

    it("should handle unknown error types", async () => {
      useConversationStore.setState({
        activeConversationId: "conv-1",
        conversations: [createMockConversation("conv-1", "manual")],
      });

      // Mock non-Error object
      mockConversationService.updateConversation = jest
        .fn()
        .mockRejectedValueOnce("String error");

      await useConversationStore.getState().setChatMode("round-robin");

      const { error } = useConversationStore.getState();
      expect(error.agents?.message).toBe(
        "Failed to change chat mode: Unknown error",
      );
    });
  });

  describe("edge cases", () => {
    it("should be no-op when no active conversation", async () => {
      useConversationStore.setState({
        activeConversationId: null,
        conversations: [],
      });

      await useConversationStore.getState().setChatMode("round-robin");

      expect(mockConversationService.updateConversation).not.toHaveBeenCalled();
    });

    it("should be no-op when conversation service not initialized", async () => {
      useConversationStore
        .getState()
        .initialize(null as unknown as ConversationService);

      useConversationStore.setState({
        activeConversationId: "conv-1",
        conversations: [createMockConversation("conv-1", "manual")],
      });

      await useConversationStore.getState().setChatMode("round-robin");

      expect(mockConversationService.updateConversation).not.toHaveBeenCalled();
    });

    it("should skip Round Robin enforcement for manual mode", async () => {
      const mockConversation = createMockConversation("conv-1", "round-robin");
      const updatedConversation = {
        ...mockConversation,
        chat_mode: "manual" as const,
      };

      useConversationStore.setState({
        activeConversationId: "conv-1",
        conversations: [mockConversation],
        activeConversationAgents: [
          createMockAgent("agent-1", 1, true),
          createMockAgent("agent-2", 2, true),
        ],
      });

      mockConversationService.updateConversation = jest
        .fn()
        .mockResolvedValueOnce(updatedConversation);

      await useConversationStore.getState().setChatMode("manual");

      // Verify conversation was updated but no agent updates occurred
      expect(mockConversationService.updateConversation).toHaveBeenCalledWith(
        "conv-1",
        { chat_mode: "manual" },
      );
      expect(
        mockConversationService.updateConversationAgent,
      ).not.toHaveBeenCalled();
    });
  });

  describe("state updates", () => {
    it("should update conversations array correctly", async () => {
      const conv1 = createMockConversation("conv-1", "manual");
      const conv2 = createMockConversation("conv-2", "round-robin");
      const updatedConv1 = { ...conv1, chat_mode: "round-robin" as const };

      useConversationStore.setState({
        activeConversationId: "conv-1",
        conversations: [conv1, conv2],
      });

      mockConversationService.updateConversation = jest
        .fn()
        .mockResolvedValueOnce(updatedConv1);

      await useConversationStore.getState().setChatMode("round-robin");

      const { conversations } = useConversationStore.getState();
      expect(conversations).toHaveLength(2);
      expect(conversations.find((c) => c.id === "conv-1")?.chat_mode).toBe(
        "round-robin",
      );
      expect(conversations.find((c) => c.id === "conv-2")?.chat_mode).toBe(
        "round-robin",
      );
    });

    it("should preserve error state structure", async () => {
      useConversationStore.setState({
        activeConversationId: "conv-1",
        conversations: [createMockConversation("conv-1", "manual")],
        error: {
          conversations: {
            message: "Previous error",
            operation: "load",
            isRetryable: false,
            retryCount: 1,
            timestamp: "2024-01-01",
          },
          messages: undefined,
          agents: undefined,
          sending: undefined,
        },
      });

      mockConversationService.updateConversation = jest
        .fn()
        .mockRejectedValueOnce(new Error("New error"));

      await useConversationStore.getState().setChatMode("round-robin");

      const { error } = useConversationStore.getState();
      expect(error.conversations?.message).toBe("Previous error");
      expect(error.agents?.message).toBe(
        "Failed to change chat mode: New error",
      );
    });
  });
});

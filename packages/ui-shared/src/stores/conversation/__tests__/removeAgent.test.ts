/**
 * Unit tests for removeAgent functionality with message refresh integration.
 *
 * Tests the removeAgent method's explicit message refresh capability after successful
 * agent deletion, including error handling, race condition protection, and integration
 * with existing round-robin mode functionality.
 *
 * @module stores/conversation/__tests__/removeAgent.test
 */

import type {
  ConversationAgent,
  ConversationService,
} from "@fishbowl-ai/shared";
import type { ConversationStoreState } from "../ConversationStoreState";
import { useConversationStore } from "../useConversationStore";

// Mock the chat mode factory
jest.mock("../../../chat-modes", () => ({
  createChatModeHandler: jest.fn(),
}));

// Mock conversation service
const mockConversationService: Partial<ConversationService> = {
  removeAgent: jest.fn(),
  updateConversationAgent: jest.fn(),
};

// Mock data factory functions
const createMockAgent = (
  id: string,
  enabled: boolean = false,
  displayOrder: number = 0,
): ConversationAgent => ({
  id,
  conversation_id: "conv-1",
  agent_id: id.replace("agent-", ""),
  enabled,
  display_order: displayOrder,
  added_at: "2025-01-01T00:00:00.000Z",
  is_active: true,
  color: "",
});

const createMockState = (
  chatMode: "manual" | "round-robin" | null = null,
  agents: ConversationAgent[] = [],
  conversationId: string = "conv-1",
): Partial<ConversationStoreState> => ({
  activeConversationId: chatMode ? conversationId : null,
  conversations: chatMode
    ? [
        {
          id: conversationId,
          title: "Test Conversation",
          chat_mode: chatMode,
          created_at: "2025-01-01T00:00:00.000Z",
          updated_at: "2025-01-01T00:00:00.000Z",
        },
      ]
    : [],
  activeConversationAgents: agents,
  loading: {
    conversations: false,
    messages: false,
    agents: false,
    sending: false,
  },
  error: {},
});

describe("removeAgent with Message Refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConversationStore.setState(createMockState());
  });

  describe("when conversation service is not initialized", () => {
    // Don't initialize the service in this describe block
    it("should handle removal when no conversation service is initialized", async () => {
      // Setup: no conversation service - don't call initialize()
      const agents = [createMockAgent("agent-1", true)];
      useConversationStore.setState(createMockState("manual", agents));

      const store = useConversationStore.getState();

      // Mock refreshActiveConversation method
      const mockRefreshActiveConversation = jest
        .fn()
        .mockResolvedValue(undefined);
      store.refreshActiveConversation = mockRefreshActiveConversation;

      // Act: attempt to remove agent without initializing the service
      await store.removeAgent("conv-1", "agent-1");

      // Assert: early return - no service calls made
      expect(mockConversationService.removeAgent).not.toHaveBeenCalled();
      expect(mockRefreshActiveConversation).not.toHaveBeenCalled();

      // Assert: state unchanged
      const finalState = useConversationStore.getState();
      expect(finalState.activeConversationAgents).toHaveLength(1);
    });
  });

  describe("successful agent removal with message refresh", () => {
    it("should refresh conversation after successful agent deletion", async () => {
      // Setup: manual mode conversation with agents
      const agents = [
        createMockAgent("agent-1", true),
        createMockAgent("agent-2", false),
      ];

      useConversationStore.setState(createMockState("manual", agents));

      const store = useConversationStore.getState();
      store.initialize(mockConversationService as ConversationService);

      // Mock successful agent removal
      (mockConversationService.removeAgent as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Mock refreshActiveConversation method
      const mockRefreshActiveConversation = jest
        .fn()
        .mockResolvedValue(undefined);
      store.refreshActiveConversation = mockRefreshActiveConversation;

      // Act: remove agent
      await store.removeAgent("conv-1", "agent-1");

      // Assert: agent removal service called
      expect(mockConversationService.removeAgent).toHaveBeenCalledWith(
        "conv-1",
        "agent-1",
      );

      // Assert: conversation refresh called after successful removal
      expect(mockRefreshActiveConversation).toHaveBeenCalledTimes(1);

      // Assert: loading state cleared
      const finalState = useConversationStore.getState();
      expect(finalState.loading.agents).toBe(false);
    });

    it("should not refresh conversation when active conversation changes during deletion", async () => {
      // Setup: conversation with agents
      const agents = [createMockAgent("agent-1", true)];
      useConversationStore.setState(createMockState("manual", agents));

      const store = useConversationStore.getState();
      store.initialize(mockConversationService as ConversationService);

      // Mock successful agent removal
      (mockConversationService.removeAgent as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Mock refreshActiveConversation method
      const mockRefreshActiveConversation = jest
        .fn()
        .mockResolvedValue(undefined);
      store.refreshActiveConversation = mockRefreshActiveConversation;

      // Simulate conversation change during removal
      (mockConversationService.removeAgent as jest.Mock).mockImplementation(
        async () => {
          // Change active conversation during removal
          useConversationStore.setState({
            ...useConversationStore.getState(),
            activeConversationId: "conv-2",
          });
        },
      );

      // Act: remove agent from original conversation
      await store.removeAgent("conv-1", "agent-1");

      // Assert: agent removal service called
      expect(mockConversationService.removeAgent).toHaveBeenCalledWith(
        "conv-1",
        "agent-1",
      );

      // Assert: conversation refresh NOT called due to conversation change
      expect(mockRefreshActiveConversation).not.toHaveBeenCalled();
    });

    it("should handle message refresh error gracefully without affecting agent deletion", async () => {
      // Setup: conversation with agents
      const agents = [createMockAgent("agent-1", true)];
      useConversationStore.setState(createMockState("manual", agents));

      const store = useConversationStore.getState();
      store.initialize(mockConversationService as ConversationService);

      // Mock successful agent removal
      (mockConversationService.removeAgent as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Mock refreshActiveConversation to fail
      const refreshError = new Error("Refresh failed");
      const mockRefreshActiveConversation = jest
        .fn()
        .mockRejectedValue(refreshError);
      store.refreshActiveConversation = mockRefreshActiveConversation;

      // Act: remove agent
      await store.removeAgent("conv-1", "agent-1");

      // Assert: agent removal service called
      expect(mockConversationService.removeAgent).toHaveBeenCalledWith(
        "conv-1",
        "agent-1",
      );

      // Assert: conversation refresh attempted
      expect(mockRefreshActiveConversation).toHaveBeenCalledTimes(1);

      // Assert: no error state set for agent operation (refresh error is logged but doesn't affect main operation)
      const finalState = useConversationStore.getState();
      expect(finalState.error.agents).toBeUndefined();
      expect(finalState.loading.agents).toBe(false);
    });
  });

  describe("agent removal failure scenarios", () => {
    it("should not refresh conversation when agent removal fails", async () => {
      // Setup: conversation with agents
      const agents = [createMockAgent("agent-1", true)];
      useConversationStore.setState(createMockState("manual", agents));

      const store = useConversationStore.getState();
      store.initialize(mockConversationService as ConversationService);

      // Mock agent removal failure
      const removalError = new Error("Agent removal failed");
      (mockConversationService.removeAgent as jest.Mock).mockRejectedValue(
        removalError,
      );

      // Mock refreshActiveConversation method
      const mockRefreshActiveConversation = jest
        .fn()
        .mockResolvedValue(undefined);
      store.refreshActiveConversation = mockRefreshActiveConversation;

      // Act: attempt to remove agent
      await store.removeAgent("conv-1", "agent-1");

      // Assert: agent removal service called
      expect(mockConversationService.removeAgent).toHaveBeenCalledWith(
        "conv-1",
        "agent-1",
      );

      // Assert: conversation refresh NOT called on removal failure
      expect(mockRefreshActiveConversation).not.toHaveBeenCalled();

      // Assert: error state set for agent operation
      const finalState = useConversationStore.getState();
      expect(finalState.error.agents).toEqual({
        message: "Agent removal failed",
        operation: "save",
        isRetryable: true,
        retryCount: 0,
        timestamp: expect.any(String),
      });
    });
  });

  describe("edge cases", () => {
    it("should handle removal when no active conversation", async () => {
      // Setup: no active conversation
      useConversationStore.setState(createMockState(null, []));

      const store = useConversationStore.getState();
      store.initialize(mockConversationService as ConversationService);

      // Mock refreshActiveConversation method
      const mockRefreshActiveConversation = jest
        .fn()
        .mockResolvedValue(undefined);
      store.refreshActiveConversation = mockRefreshActiveConversation;

      // Act: attempt to remove agent
      await store.removeAgent("conv-1", "agent-1");

      // Assert: early return - no service calls made
      expect(mockConversationService.removeAgent).not.toHaveBeenCalled();
      expect(mockRefreshActiveConversation).not.toHaveBeenCalled();
    });

    it("should handle non-Error objects in refresh error handling", async () => {
      // Setup: conversation with agents
      const agents = [createMockAgent("agent-1", true)];
      useConversationStore.setState(createMockState("manual", agents));

      const store = useConversationStore.getState();
      store.initialize(mockConversationService as ConversationService);

      // Mock successful agent removal
      (mockConversationService.removeAgent as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Mock refreshActiveConversation to fail with non-Error
      const mockRefreshActiveConversation = jest
        .fn()
        .mockRejectedValue("String error");
      store.refreshActiveConversation = mockRefreshActiveConversation;

      // Act: remove agent (should not throw)
      await expect(
        store.removeAgent("conv-1", "agent-1"),
      ).resolves.toBeUndefined();
    });
  });

  describe("race condition protection", () => {
    it("should use conversation ID check to prevent stale refreshes", async () => {
      // Setup: conversation with agents
      const agents = [createMockAgent("agent-1", true)];
      useConversationStore.setState(
        createMockState("manual", agents, "conv-1"),
      );

      const store = useConversationStore.getState();
      store.initialize(mockConversationService as ConversationService);

      // Mock successful agent removal
      (mockConversationService.removeAgent as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Mock refreshActiveConversation method
      const mockRefreshActiveConversation = jest
        .fn()
        .mockResolvedValue(undefined);
      store.refreshActiveConversation = mockRefreshActiveConversation;

      // Act: remove agent from conversation conv-1 while active conversation is conv-1
      await store.removeAgent("conv-1", "agent-1");

      // Assert: refresh called since conversation IDs match
      expect(mockRefreshActiveConversation).toHaveBeenCalledTimes(1);

      // Reset mocks and change active conversation
      jest.clearAllMocks();
      useConversationStore.setState({
        ...useConversationStore.getState(),
        activeConversationId: "conv-2",
      });

      // Act: attempt to remove agent from different conversation
      await store.removeAgent("conv-1", "agent-1");

      // Assert: refresh NOT called due to conversation ID mismatch
      expect(mockRefreshActiveConversation).not.toHaveBeenCalled();
    });
  });
});

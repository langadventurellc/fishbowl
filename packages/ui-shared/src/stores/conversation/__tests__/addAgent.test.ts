/**
 * Tests for the enhanced addAgent method with chat mode integration.
 *
 * Tests cover manual and round-robin modes, error handling, race condition
 * protection, and integration with chat mode handlers.
 */

import type {
  ConversationAgent,
  ConversationService,
} from "@fishbowl-ai/shared";
import { createChatModeHandler } from "../../../chat-modes";
import type { ChatModeIntent } from "../../../types/chat-modes/ChatModeIntent";
import { useConversationStore } from "../useConversationStore";

// Mock the chat-modes module
jest.mock("../../../chat-modes", () => ({
  createChatModeHandler: jest.fn(),
}));

const mockCreateChatModeHandler = createChatModeHandler as jest.MockedFunction<
  typeof createChatModeHandler
>;

describe("addAgent with chat mode integration", () => {
  let mockConversationService: Partial<ConversationService>;
  let mockChatModeHandler: {
    name: string;
    handleAgentAdded: jest.MockedFunction<
      (agents: ConversationAgent[], newAgentId: string) => ChatModeIntent
    >;
    handleAgentToggle: jest.MockedFunction<
      (agents: ConversationAgent[], toggledAgentId: string) => ChatModeIntent
    >;
    handleConversationProgression: jest.MockedFunction<
      (agents: ConversationAgent[]) => ChatModeIntent
    >;
  };

  const mockConversationAgent: ConversationAgent = {
    id: "ca-new-agent",
    conversation_id: "conv-1",
    agent_id: "agent-1",
    enabled: true,
    is_active: true,
    color: "--agent-1",
    display_order: 2,
    added_at: "2025-09-03T10:00:00Z",
  };

  const mockExistingAgent: ConversationAgent = {
    id: "ca-existing-agent",
    conversation_id: "conv-1",
    agent_id: "agent-existing",
    enabled: true,
    is_active: true,
    display_order: 1,
    added_at: "2025-09-03T09:00:00Z",
    color: "",
  };

  beforeEach(() => {
    // Reset store state
    useConversationStore.setState({
      activeConversationId: "conv-1",
      conversations: [
        {
          id: "conv-1",
          title: "Test Conversation",
          created_at: "2025-09-03T08:00:00Z",
          updated_at: "2025-09-03T08:00:00Z",
          chat_mode: "manual",
        },
      ],
      activeConversationAgents: [mockExistingAgent],
      loading: {
        agents: false,
        conversations: false,
        messages: false,
        sending: false,
      },
      error: {
        agents: undefined,
        conversations: undefined,
        messages: undefined,
        sending: undefined,
      },
      activeRequestToken: null,
    });

    // Mock conversation service
    mockConversationService = {
      addAgent: jest.fn().mockResolvedValue(mockConversationAgent),
      updateConversationAgent: jest.fn(),
    };

    // Mock chat mode handler
    mockChatModeHandler = {
      name: "manual",
      handleAgentAdded: jest
        .fn()
        .mockReturnValue({ toEnable: [], toDisable: [] }),
      handleAgentToggle: jest.fn(),
      handleConversationProgression: jest.fn(),
    };

    mockCreateChatModeHandler.mockReturnValue(mockChatModeHandler);

    // Inject service using initialize method
    useConversationStore
      .getState()
      .initialize(mockConversationService as ConversationService);
  });

  describe("manual mode behavior", () => {
    it("should add agent and apply manual mode rules (no-op)", async () => {
      const store = useConversationStore.getState();

      await store.addAgent("conv-1", "agent-1");

      // Verify agent was added via service
      expect(mockConversationService.addAgent).toHaveBeenCalledWith(
        "conv-1",
        "agent-1",
        undefined,
      );

      // Verify agent was added to store
      const updatedStore = useConversationStore.getState();
      expect(updatedStore.activeConversationAgents).toContain(
        mockConversationAgent,
      );

      // Verify chat mode handler was called with manual mode
      expect(mockCreateChatModeHandler).toHaveBeenCalledWith("manual");
      expect(mockChatModeHandler.handleAgentAdded).toHaveBeenCalledWith(
        expect.arrayContaining([mockExistingAgent, mockConversationAgent]),
        "ca-new-agent",
      );

      // Verify loading state is cleared
      expect(updatedStore.loading.agents).toBe(false);
      expect(updatedStore.error.agents).toBeUndefined();
    });

    it("should handle null chat mode by defaulting to manual", async () => {
      // Set conversation with null chat mode
      useConversationStore.setState({
        conversations: [
          {
            id: "conv-1",
            title: "Test Conversation",
            created_at: "2025-09-03T08:00:00Z",
            updated_at: "2025-09-03T08:00:00Z",
            chat_mode: null as unknown as "manual", // Simulate null chat mode
          },
        ],
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      expect(mockCreateChatModeHandler).toHaveBeenCalledWith("manual");
    });
  });

  describe("round-robin mode behavior", () => {
    beforeEach(() => {
      useConversationStore.setState({
        conversations: [
          {
            id: "conv-1",
            title: "Test Conversation",
            created_at: "2025-09-03T08:00:00Z",
            updated_at: "2025-09-03T08:00:00Z",
            chat_mode: "round-robin",
          },
        ],
      });
    });

    it("should add first agent and enable it in round-robin mode", async () => {
      // Start with no agents
      useConversationStore.setState({ activeConversationAgents: [] });

      // Mock round-robin handler to enable first agent
      mockChatModeHandler.name = "round-robin";
      mockChatModeHandler.handleAgentAdded.mockReturnValue({
        toEnable: ["ca-new-agent"],
        toDisable: [],
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      expect(mockCreateChatModeHandler).toHaveBeenCalledWith("round-robin");
      expect(mockChatModeHandler.handleAgentAdded).toHaveBeenCalledWith(
        expect.arrayContaining([mockConversationAgent]),
        "ca-new-agent",
      );
    });

    it("should add subsequent agent and disable it while keeping existing enabled", async () => {
      // Mock round-robin handler to disable new agent
      mockChatModeHandler.name = "round-robin";
      mockChatModeHandler.handleAgentAdded.mockReturnValue({
        toEnable: [],
        toDisable: ["ca-new-agent"],
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      expect(mockChatModeHandler.handleAgentAdded).toHaveBeenCalledWith(
        expect.arrayContaining([mockExistingAgent, mockConversationAgent]),
        "ca-new-agent",
      );
    });
  });

  describe("error handling", () => {
    it("should handle service errors gracefully", async () => {
      const serviceError = new Error("Service failure");
      (mockConversationService.addAgent as jest.Mock).mockRejectedValue(
        serviceError,
      );

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      const updatedStore = useConversationStore.getState();
      expect(updatedStore.error.agents).toEqual({
        message: "Service failure",
        operation: "save",
        isRetryable: true,
        retryCount: 0,
        timestamp: expect.any(String),
      });
      expect(updatedStore.loading.agents).toBe(false);
    });

    it("should handle chat mode processing errors without affecting successful agent addition", async () => {
      const chatModeError = new Error("Chat mode processing failed");
      mockChatModeHandler.handleAgentAdded.mockImplementation(() => {
        throw chatModeError;
      });

      // Mock store to track calls to processAgentIntent
      const mockProcessAgentIntent = jest.fn().mockRejectedValue(chatModeError);
      useConversationStore.setState({
        processAgentIntent: mockProcessAgentIntent,
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      const updatedStore = useConversationStore.getState();

      // Agent should still be added
      expect(updatedStore.activeConversationAgents).toContain(
        mockConversationAgent,
      );

      // Error should indicate chat mode processing failure
      expect(updatedStore.error.agents).toEqual({
        message:
          "Agent added but chat mode processing failed: Chat mode processing failed",
        operation: "save",
        isRetryable: false,
        retryCount: 0,
        timestamp: expect.any(String),
      });

      // Loading should still be cleared
      expect(updatedStore.loading.agents).toBe(false);
    });

    it("should handle chat mode handler creation errors", async () => {
      mockCreateChatModeHandler.mockImplementation(() => {
        throw new Error("Handler creation failed");
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      const updatedStore = useConversationStore.getState();

      // Agent should still be added
      expect(updatedStore.activeConversationAgents).toContain(
        mockConversationAgent,
      );

      // Should have chat mode error
      expect(updatedStore.error.agents?.message).toContain(
        "chat mode processing failed",
      );
    });
  });

  describe("race condition protection", () => {
    it("should not update state if request token changes during processing", async () => {
      let resolveAddAgent: (value: ConversationAgent) => void;
      const addAgentPromise = new Promise<ConversationAgent>((resolve) => {
        resolveAddAgent = resolve;
      });
      (mockConversationService.addAgent as jest.Mock).mockReturnValue(
        addAgentPromise,
      );

      const store = useConversationStore.getState();
      const addAgentPromise1 = store.addAgent("conv-1", "agent-1");

      // Change request token while first request is pending
      useConversationStore.setState({ activeRequestToken: "different-token" });

      // Resolve the service call
      resolveAddAgent!(mockConversationAgent);
      await addAgentPromise1;

      // State should not be updated since request token changed
      const updatedStore = useConversationStore.getState();
      expect(updatedStore.activeConversationAgents).not.toContain(
        mockConversationAgent,
      );
    });

    it("should handle request token validation properly", async () => {
      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      // Should have successfully added agent when token is current
      const updatedStore = useConversationStore.getState();
      expect(updatedStore.activeConversationAgents).toContain(
        mockConversationAgent,
      );
    });
  });

  describe("integration with processAgentIntent", () => {
    it("should call processAgentIntent with handler intent", async () => {
      const mockIntent: ChatModeIntent = {
        toEnable: ["ca-new-agent"],
        toDisable: ["ca-existing-agent"],
      };
      mockChatModeHandler.handleAgentAdded.mockReturnValue(mockIntent);

      // Mock processAgentIntent
      const mockProcessAgentIntent = jest.fn().mockResolvedValue(undefined);
      useConversationStore.setState({
        processAgentIntent: mockProcessAgentIntent,
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      expect(mockProcessAgentIntent).toHaveBeenCalledWith(mockIntent);
    });

    it("should handle processAgentIntent rejection", async () => {
      const mockIntent: ChatModeIntent = { toEnable: [], toDisable: [] };
      mockChatModeHandler.handleAgentAdded.mockReturnValue(mockIntent);

      const processError = new Error("Process intent failed");
      const mockProcessAgentIntent = jest.fn().mockRejectedValue(processError);
      useConversationStore.setState({
        processAgentIntent: mockProcessAgentIntent,
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      const updatedStore = useConversationStore.getState();
      expect(updatedStore.error.agents?.message).toContain(
        "chat mode processing failed",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle missing active conversation", async () => {
      useConversationStore.setState({ activeConversationId: null });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      // Should not call service when no active conversation
      expect(mockConversationService.addAgent).not.toHaveBeenCalled();
    });

    it("should handle missing conversation service", async () => {
      useConversationStore
        .getState()
        .initialize(null as unknown as ConversationService);

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      // Should not call service when service is null
      expect(mockConversationService.addAgent).not.toHaveBeenCalled();
    });

    it("should handle conversation not found", async () => {
      useConversationStore.setState({
        conversations: [], // No conversations
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      // Should default to manual mode when conversation not found
      expect(mockCreateChatModeHandler).toHaveBeenCalledWith("manual");
    });
  });

  describe("loading state management", () => {
    it("should set loading state during operation", async () => {
      let resolveAddAgent: (value: ConversationAgent) => void;
      const addAgentPromise = new Promise<ConversationAgent>((resolve) => {
        resolveAddAgent = resolve;
      });
      (mockConversationService.addAgent as jest.Mock).mockReturnValue(
        addAgentPromise,
      );

      const store = useConversationStore.getState();
      const addAgentCall = store.addAgent("conv-1", "agent-1");

      // Loading should be true while operation is pending
      let currentStore = useConversationStore.getState();
      expect(currentStore.loading.agents).toBe(true);

      // Complete the operation
      resolveAddAgent!(mockConversationAgent);
      await addAgentCall;

      // Loading should be false after completion
      currentStore = useConversationStore.getState();
      expect(currentStore.loading.agents).toBe(false);
    });

    it("should clear loading state even when chat mode processing fails", async () => {
      mockChatModeHandler.handleAgentAdded.mockImplementation(() => {
        throw new Error("Chat mode error");
      });

      const store = useConversationStore.getState();
      await store.addAgent("conv-1", "agent-1");

      const updatedStore = useConversationStore.getState();
      expect(updatedStore.loading.agents).toBe(false);
    });
  });
});

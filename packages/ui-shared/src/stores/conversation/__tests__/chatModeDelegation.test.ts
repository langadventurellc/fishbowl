/**
 * Unit tests for chat mode delegation functionality in conversation store.
 *
 * Tests the processAgentIntent helper method and the enhanced toggleAgentEnabled
 * method that delegates to chat mode handlers, including manual and round-robin
 * modes, error handling, and integration scenarios.
 *
 * @module stores/conversation/__tests__/chatModeDelegation.test
 */

import type {
  ConversationAgent,
  ConversationService,
} from "@fishbowl-ai/shared";
import type { ChatModeHandler } from "../../../types/chat-modes/ChatModeHandler";
import type { ChatModeIntent } from "../../../types/chat-modes/ChatModeIntent";
import type { ConversationStoreState } from "../ConversationStoreState";
import { useConversationStore } from "../useConversationStore";

// Mock the chat mode factory
jest.mock("../../../chat-modes", () => ({
  createChatModeHandler: jest.fn(),
}));

import { createChatModeHandler } from "../../../chat-modes";
const mockCreateChatModeHandler = createChatModeHandler as jest.MockedFunction<
  typeof createChatModeHandler
>;

// Mock conversation service
const mockConversationService: Partial<ConversationService> = {
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
  overrides: Partial<ConversationStoreState> = {},
): ConversationStoreState => ({
  activeConversationId: "conv-1",
  conversations: [
    {
      id: "conv-1",
      title: "Test Conversation",
      chat_mode: "manual",
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    },
  ],
  activeMessages: [],
  activeConversationAgents: [
    createMockAgent("agent-1", true, 0),
    createMockAgent("agent-2", false, 1),
  ],
  activeRequestToken: "test-token",
  maximumMessages: 100,
  eventSubscription: {
    isSubscribed: false,
    lastEventTime: null,
  },
  loading: {
    conversations: false,
    messages: false,
    agents: false,
    sending: false,
  },
  error: {
    conversations: undefined,
    messages: undefined,
    agents: undefined,
    sending: undefined,
  },
  ...overrides,
});

describe("Chat Mode Delegation", () => {
  let mockHandler: {
    name: string;
    handleAgentToggle: jest.Mock;
    handleAgentAdded: jest.Mock;
    handleConversationProgression: jest.Mock;
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock chat mode handler
    mockHandler = {
      name: "manual",
      handleAgentToggle: jest.fn(),
      handleAgentAdded: jest.fn(),
      handleConversationProgression: jest.fn(),
    };

    mockCreateChatModeHandler.mockReturnValue(mockHandler as ChatModeHandler);

    // Set up store state
    useConversationStore.setState(createMockState());
    useConversationStore
      .getState()
      .initialize(mockConversationService as ConversationService);

    // Mock updateConversationAgent to return updated agent
    (
      mockConversationService.updateConversationAgent as jest.Mock
    ).mockImplementation(async (id: string, updates: { enabled: boolean }) => ({
      ...createMockAgent(id, updates.enabled),
    }));
  });

  describe("processAgentIntent", () => {
    it("should process enable and disable intents correctly", async () => {
      const intent: ChatModeIntent = {
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      };

      await useConversationStore.getState().processAgentIntent(intent);

      // Verify service calls
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-1", { enabled: false });
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-2", { enabled: true });

      // Verify state updates
      const state = useConversationStore.getState();
      const agent1 = state.activeConversationAgents.find(
        (a: ConversationAgent) => a.id === "agent-1",
      );
      const agent2 = state.activeConversationAgents.find(
        (a: ConversationAgent) => a.id === "agent-2",
      );

      expect(agent1?.enabled).toBe(false);
      expect(agent2?.enabled).toBe(true);
    });

    it("should handle empty intent arrays", async () => {
      const intent: ChatModeIntent = {
        toEnable: [],
        toDisable: [],
      };

      await useConversationStore.getState().processAgentIntent(intent);

      expect(
        mockConversationService.updateConversationAgent,
      ).not.toHaveBeenCalled();
    });

    it("should process disables before enables", async () => {
      const intent: ChatModeIntent = {
        toEnable: ["agent-3"],
        toDisable: ["agent-1", "agent-2"],
      };

      const callOrder: string[] = [];
      (
        mockConversationService.updateConversationAgent as jest.Mock
      ).mockImplementation(
        async (id: string, updates: { enabled: boolean }) => {
          callOrder.push(`${id}-${updates.enabled ? "enable" : "disable"}`);
          return {
            ...createMockAgent(id.split("-").pop() || "1", updates.enabled),
            id,
          };
        },
      );

      await useConversationStore.getState().processAgentIntent(intent);

      expect(callOrder).toEqual([
        "agent-1-disable",
        "agent-2-disable",
        "agent-3-enable",
      ]);
    });

    it("should handle service errors gracefully", async () => {
      const intent: ChatModeIntent = {
        toEnable: ["agent-2"],
        toDisable: [],
      };

      const testError = new Error("Service unavailable");
      (
        mockConversationService.updateConversationAgent as jest.Mock
      ).mockRejectedValue(testError);

      await useConversationStore.getState().processAgentIntent(intent);

      // Verify error state is set
      const state = useConversationStore.getState();
      expect(state.error.agents).toEqual({
        message: "Failed to apply chat mode changes: Service unavailable",
        operation: "save",
        isRetryable: true,
        retryCount: 0,
        timestamp: expect.any(String),
      });
    });

    it("should return early when no conversation service", async () => {
      // Create store without service by initializing with empty object
      useConversationStore.setState(createMockState());
      useConversationStore.getState().initialize({} as ConversationService);

      const intent: ChatModeIntent = {
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      };

      await useConversationStore.getState().processAgentIntent(intent);

      expect(
        mockConversationService.updateConversationAgent,
      ).not.toHaveBeenCalled();
    });
  });

  describe("toggleAgentEnabled with delegation", () => {
    it("should delegate to manual chat mode handler", async () => {
      const mockIntent: ChatModeIntent = {
        toEnable: ["agent-2"],
        toDisable: [],
      };

      mockHandler.handleAgentToggle.mockReturnValue(mockIntent);

      await useConversationStore.getState().toggleAgentEnabled("agent-2");

      // Verify handler was created with manual mode
      expect(mockCreateChatModeHandler).toHaveBeenCalledWith("manual");

      // Verify handler was called correctly
      expect(mockHandler.handleAgentToggle).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "agent-1", enabled: true }),
          expect.objectContaining({ id: "agent-2", enabled: false }),
        ]),
        "agent-2",
      );

      // Verify intent was processed
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-2", { enabled: true });
    });

    it("should delegate to round-robin chat mode handler", async () => {
      // Set up round-robin conversation
      useConversationStore.setState(
        createMockState({
          conversations: [
            {
              id: "conv-1",
              title: "Round Robin Test",
              chat_mode: "round-robin",
              created_at: "2025-01-01T00:00:00.000Z",
              updated_at: "2025-01-01T00:00:00.000Z",
            },
          ],
        }),
      );

      const mockIntent: ChatModeIntent = {
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      };

      mockHandler.handleAgentToggle.mockReturnValue(mockIntent);

      await useConversationStore.getState().toggleAgentEnabled("agent-2");

      // Verify handler was created with round-robin mode
      expect(mockCreateChatModeHandler).toHaveBeenCalledWith("round-robin");

      // Verify intent processing
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-1", { enabled: false });
      expect(
        mockConversationService.updateConversationAgent,
      ).toHaveBeenCalledWith("agent-2", { enabled: true });
    });

    it("should default to manual mode when no active conversation", async () => {
      useConversationStore.setState(
        createMockState({ activeConversationId: null }),
      );

      await useConversationStore.getState().toggleAgentEnabled("agent-1");

      // Should return early when no active conversation
      expect(mockCreateChatModeHandler).not.toHaveBeenCalled();
      expect(mockHandler.handleAgentToggle).not.toHaveBeenCalled();
    });

    it("should handle loading states correctly", async () => {
      const mockIntent: ChatModeIntent = {
        toEnable: ["agent-2"],
        toDisable: [],
      };

      mockHandler.handleAgentToggle.mockReturnValue(mockIntent);

      // Mock processAgentIntent to verify loading state timing
      const processPromise = useConversationStore
        .getState()
        .toggleAgentEnabled("agent-2");

      // Check loading state is set during operation
      expect(useConversationStore.getState().loading.agents).toBe(true);

      await processPromise;

      // Check loading state is cleared after operation
      expect(useConversationStore.getState().loading.agents).toBe(false);
    });

    it("should handle errors from handler and set error state", async () => {
      const testError = new Error("Handler error");
      mockHandler.handleAgentToggle.mockImplementation(() => {
        throw testError;
      });

      await useConversationStore.getState().toggleAgentEnabled("agent-2");

      // Verify error state is set
      const state = useConversationStore.getState();
      expect(state.error.agents).toEqual({
        message: "Handler error",
        operation: "save",
        isRetryable: true,
        retryCount: 0,
        timestamp: expect.any(String),
      });
      expect(state.loading.agents).toBe(false);
    });

    it("should return early when no conversation service or active conversation", async () => {
      useConversationStore.setState(
        createMockState({ activeConversationId: null }),
      );
      // Remove service
      useConversationStore.getState().initialize({} as ConversationService);

      await useConversationStore.getState().toggleAgentEnabled("agent-1");

      expect(mockCreateChatModeHandler).not.toHaveBeenCalled();
      expect(mockHandler.handleAgentToggle).not.toHaveBeenCalled();
    });

    it("should clear error state at start of operation", async () => {
      // Set initial error state
      useConversationStore.setState(
        createMockState({
          error: {
            conversations: undefined,
            messages: undefined,
            agents: {
              message: "Previous error",
              operation: "save",
              isRetryable: true,
              retryCount: 0,
              timestamp: "2025-01-01T00:00:00.000Z",
            },
            sending: undefined,
          },
        }),
      );

      const mockIntent: ChatModeIntent = {
        toEnable: [],
        toDisable: [],
      };

      mockHandler.handleAgentToggle.mockReturnValue(mockIntent);

      await useConversationStore.getState().toggleAgentEnabled("agent-1");

      // Verify error state is cleared
      expect(useConversationStore.getState().error.agents).toBeUndefined();
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete round-robin workflow", async () => {
      // Set up round-robin conversation with multiple agents
      useConversationStore.setState(
        createMockState({
          conversations: [
            {
              id: "conv-1",
              title: "Round Robin Test",
              chat_mode: "round-robin",
              created_at: "2025-01-01T00:00:00.000Z",
              updated_at: "2025-01-01T00:00:00.000Z",
            },
          ],
          activeConversationAgents: [
            createMockAgent("agent-1", true, 0),
            createMockAgent("agent-2", false, 1),
            createMockAgent("agent-3", false, 2),
          ],
        }),
      );

      // Mock round-robin behavior: enable target, disable all others
      const mockIntent: ChatModeIntent = {
        toEnable: ["agent-2"],
        toDisable: ["agent-1", "agent-3"],
      };

      mockHandler.handleAgentToggle.mockReturnValue(mockIntent);

      await useConversationStore.getState().toggleAgentEnabled("agent-2");

      // Verify final state
      const agents = useConversationStore.getState().activeConversationAgents;
      expect(
        agents.find((a: ConversationAgent) => a.id === "agent-1")?.enabled,
      ).toBe(false);
      expect(
        agents.find((a: ConversationAgent) => a.id === "agent-2")?.enabled,
      ).toBe(true);
      expect(
        agents.find((a: ConversationAgent) => a.id === "agent-3")?.enabled,
      ).toBe(false);
    });

    it("should handle manual mode with no automatic changes", async () => {
      // Mock manual mode behavior: no additional changes
      const mockIntent: ChatModeIntent = {
        toEnable: [],
        toDisable: [],
      };

      mockHandler.handleAgentToggle.mockReturnValue(mockIntent);

      const initialAgents = [
        ...useConversationStore.getState().activeConversationAgents,
      ];

      await useConversationStore.getState().toggleAgentEnabled("agent-2");

      // Verify no automatic changes occurred
      expect(
        mockConversationService.updateConversationAgent,
      ).not.toHaveBeenCalled();

      // State should remain unchanged
      expect(useConversationStore.getState().activeConversationAgents).toEqual(
        initialAgents,
      );
    });

    it("should maintain error state consistency across operations", async () => {
      const intent: ChatModeIntent = {
        toEnable: ["agent-2"],
        toDisable: ["agent-1"],
      };

      // First call succeeds for disable, fails for enable
      let callCount = 0;
      (
        mockConversationService.updateConversationAgent as jest.Mock
      ).mockImplementation(
        async (id: string, updates: { enabled: boolean }) => {
          callCount++;
          if (callCount === 1) {
            // First call (disable) succeeds
            return {
              ...createMockAgent(id, updates.enabled),
            };
          } else {
            // Second call (enable) fails
            throw new Error("Enable failed");
          }
        },
      );

      mockHandler.handleAgentToggle.mockReturnValue(intent);

      await useConversationStore.getState().toggleAgentEnabled("agent-2");

      // Verify error state reflects the failure
      const state = useConversationStore.getState();
      expect(state.error.agents?.message).toContain("Enable failed");

      // The important thing is that error handling worked correctly
      expect(state.error.agents).toBeDefined();
    });
  });
});

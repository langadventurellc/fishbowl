/**
 * Unit tests for conversation store selectors.
 *
 * Tests all basic state selectors, computed selectors, and edge cases to ensure
 * proper state access and transformation logic.
 *
 * @module stores/conversation/__tests__/selectors.test
 */

import type {
  Conversation,
  Message,
  ConversationAgent,
} from "@fishbowl-ai/shared";
import type { ErrorState } from "../../ErrorState";
import type { ConversationStoreState } from "../ConversationStoreState";
import {
  // Basic State Selectors
  selectActiveConversationId,
  selectConversations,
  selectActiveMessages,
  selectActiveConversationAgents,
  selectLoadingStates,
  selectErrorStates,
  // Computed Selectors
  selectActiveConversation,
  selectHasActiveConversation,
  selectMessageCount,
  selectEnabledAgents,
  selectIsLoading,
  // Specific Loading State Selectors
  selectIsLoadingConversations,
  selectIsLoadingMessages,
  selectIsLoadingAgents,
  selectIsSending,
  // Specific Error State Selectors
  selectConversationsError,
  selectMessagesError,
  selectAgentsError,
  selectSendingError,
  // Configuration Selectors
  selectMaximumMessages,
  selectActiveRequestToken,
} from "../selectors";

// Mock data factory functions
const createMockConversation = (id: string, title: string): Conversation => ({
  id,
  title,
  chat_mode: "manual",
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
});

const createMockMessage = (id: string, content: string): Message => ({
  id,
  conversation_id: "conv-1",
  conversation_agent_id: null,
  content,
  role: "user" as const,
  included: true,
  created_at: "2025-01-01T00:00:00.000Z",
});

const createMockConversationAgent = (
  id: string,
  agentId: string,
  enabled: boolean = true,
): ConversationAgent => ({
  id,
  conversation_id: "conv-1",
  agent_id: agentId,
  added_at: "2025-01-01T00:00:00.000Z",
  is_active: true,
  enabled,
  display_order: 0,
});

const createMockErrorState = (message: string): ErrorState => ({
  message,
  operation: "load",
  isRetryable: true,
  retryCount: 0,
  timestamp: "2025-01-01T00:00:00.000Z",
});

// Mock state factory function
const createMockState = (
  overrides: Partial<ConversationStoreState> = {},
): ConversationStoreState => ({
  activeConversationId: null,
  conversations: [],
  activeMessages: [],
  activeConversationAgents: [],
  activeRequestToken: null,
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

describe("Conversation Store Selectors", () => {
  describe("Basic State Selectors", () => {
    describe("selectActiveConversationId", () => {
      it("should return null when no conversation is active", () => {
        const state = createMockState();
        const result = selectActiveConversationId(state);
        expect(result).toBeNull();
      });

      it("should return active conversation ID when set", () => {
        const state = createMockState({ activeConversationId: "conv-123" });
        const result = selectActiveConversationId(state);
        expect(result).toBe("conv-123");
      });
    });

    describe("selectConversations", () => {
      it("should return empty array when no conversations exist", () => {
        const state = createMockState();
        const result = selectConversations(state);
        expect(result).toEqual([]);
      });

      it("should return all conversations", () => {
        const conversations = [
          createMockConversation("conv-1", "First Chat"),
          createMockConversation("conv-2", "Second Chat"),
        ];
        const state = createMockState({ conversations });
        const result = selectConversations(state);
        expect(result).toEqual(conversations);
      });
    });

    describe("selectActiveMessages", () => {
      it("should return empty array when no messages exist", () => {
        const state = createMockState();
        const result = selectActiveMessages(state);
        expect(result).toEqual([]);
      });

      it("should return all active messages", () => {
        const messages = [
          createMockMessage("msg-1", "Hello"),
          createMockMessage("msg-2", "How are you?"),
        ];
        const state = createMockState({ activeMessages: messages });
        const result = selectActiveMessages(state);
        expect(result).toEqual(messages);
      });
    });

    describe("selectActiveConversationAgents", () => {
      it("should return empty array when no agents exist", () => {
        const state = createMockState();
        const result = selectActiveConversationAgents(state);
        expect(result).toEqual([]);
      });

      it("should return all active conversation agents", () => {
        const agents = [
          createMockConversationAgent("ca-1", "agent-1", true),
          createMockConversationAgent("ca-2", "agent-2", false),
        ];
        const state = createMockState({ activeConversationAgents: agents });
        const result = selectActiveConversationAgents(state);
        expect(result).toEqual(agents);
      });
    });

    describe("selectLoadingStates", () => {
      it("should return loading states object", () => {
        const loading = {
          conversations: true,
          messages: false,
          agents: true,
          sending: false,
        };
        const state = createMockState({ loading });
        const result = selectLoadingStates(state);
        expect(result).toEqual(loading);
      });
    });

    describe("selectErrorStates", () => {
      it("should return error states object", () => {
        const error = {
          conversations: createMockErrorState("Failed to load conversations"),
          messages: undefined,
          agents: createMockErrorState("Failed to load agents"),
          sending: undefined,
        };
        const state = createMockState({ error });
        const result = selectErrorStates(state);
        expect(result).toEqual(error);
      });
    });
  });

  describe("Computed Selectors", () => {
    describe("selectActiveConversation", () => {
      it("should return undefined when no active conversation", () => {
        const conversations = [createMockConversation("conv-1", "First Chat")];
        const state = createMockState({
          conversations,
          activeConversationId: null,
        });
        const result = selectActiveConversation(state);
        expect(result).toBeUndefined();
      });

      it("should return undefined when active conversation not found in list", () => {
        const conversations = [createMockConversation("conv-1", "First Chat")];
        const state = createMockState({
          conversations,
          activeConversationId: "conv-missing",
        });
        const result = selectActiveConversation(state);
        expect(result).toBeUndefined();
      });

      it("should return active conversation when found", () => {
        const activeConv = createMockConversation("conv-2", "Active Chat");
        const conversations = [
          createMockConversation("conv-1", "First Chat"),
          activeConv,
          createMockConversation("conv-3", "Third Chat"),
        ];
        const state = createMockState({
          conversations,
          activeConversationId: "conv-2",
        });
        const result = selectActiveConversation(state);
        expect(result).toEqual(activeConv);
      });
    });

    describe("selectHasActiveConversation", () => {
      it("should return false when no active conversation", () => {
        const state = createMockState({ activeConversationId: null });
        const result = selectHasActiveConversation(state);
        expect(result).toBe(false);
      });

      it("should return true when active conversation exists", () => {
        const state = createMockState({ activeConversationId: "conv-1" });
        const result = selectHasActiveConversation(state);
        expect(result).toBe(true);
      });
    });

    describe("selectMessageCount", () => {
      it("should return 0 when no messages", () => {
        const state = createMockState({ activeMessages: [] });
        const result = selectMessageCount(state);
        expect(result).toBe(0);
      });

      it("should return correct message count", () => {
        const messages = [
          createMockMessage("msg-1", "Hello"),
          createMockMessage("msg-2", "How are you?"),
          createMockMessage("msg-3", "Good!"),
        ];
        const state = createMockState({ activeMessages: messages });
        const result = selectMessageCount(state);
        expect(result).toBe(3);
      });
    });

    describe("selectEnabledAgents", () => {
      it("should return empty array when no agents", () => {
        const state = createMockState({ activeConversationAgents: [] });
        const result = selectEnabledAgents(state);
        expect(result).toEqual([]);
      });

      it("should filter only enabled agents", () => {
        const enabledAgent1 = createMockConversationAgent(
          "ca-1",
          "agent-1",
          true,
        );
        const disabledAgent = createMockConversationAgent(
          "ca-2",
          "agent-2",
          false,
        );
        const enabledAgent2 = createMockConversationAgent(
          "ca-3",
          "agent-3",
          true,
        );

        const agents = [enabledAgent1, disabledAgent, enabledAgent2];
        const state = createMockState({ activeConversationAgents: agents });
        const result = selectEnabledAgents(state);

        expect(result).toEqual([enabledAgent1, enabledAgent2]);
        expect(result).not.toContain(disabledAgent);
      });

      it("should return empty array when all agents disabled", () => {
        const agents = [
          createMockConversationAgent("ca-1", "agent-1", false),
          createMockConversationAgent("ca-2", "agent-2", false),
        ];
        const state = createMockState({ activeConversationAgents: agents });
        const result = selectEnabledAgents(state);
        expect(result).toEqual([]);
      });
    });

    describe("selectIsLoading", () => {
      it("should return false when nothing is loading", () => {
        const loading = {
          conversations: false,
          messages: false,
          agents: false,
          sending: false,
        };
        const state = createMockState({ loading });
        const result = selectIsLoading(state);
        expect(result).toBe(false);
      });

      it("should return true when conversations loading", () => {
        const loading = {
          conversations: true,
          messages: false,
          agents: false,
          sending: false,
        };
        const state = createMockState({ loading });
        const result = selectIsLoading(state);
        expect(result).toBe(true);
      });

      it("should return true when messages loading", () => {
        const loading = {
          conversations: false,
          messages: true,
          agents: false,
          sending: false,
        };
        const state = createMockState({ loading });
        const result = selectIsLoading(state);
        expect(result).toBe(true);
      });

      it("should return true when agents loading", () => {
        const loading = {
          conversations: false,
          messages: false,
          agents: true,
          sending: false,
        };
        const state = createMockState({ loading });
        const result = selectIsLoading(state);
        expect(result).toBe(true);
      });

      it("should return true when sending message", () => {
        const loading = {
          conversations: false,
          messages: false,
          agents: false,
          sending: true,
        };
        const state = createMockState({ loading });
        const result = selectIsLoading(state);
        expect(result).toBe(true);
      });

      it("should return true when multiple operations loading", () => {
        const loading = {
          conversations: true,
          messages: true,
          agents: false,
          sending: true,
        };
        const state = createMockState({ loading });
        const result = selectIsLoading(state);
        expect(result).toBe(true);
      });
    });
  });

  describe("Specific Loading State Selectors", () => {
    const loading = {
      conversations: true,
      messages: false,
      agents: true,
      sending: false,
    };
    const state = createMockState({ loading });

    it("selectIsLoadingConversations should return conversations loading state", () => {
      expect(selectIsLoadingConversations(state)).toBe(true);
    });

    it("selectIsLoadingMessages should return messages loading state", () => {
      expect(selectIsLoadingMessages(state)).toBe(false);
    });

    it("selectIsLoadingAgents should return agents loading state", () => {
      expect(selectIsLoadingAgents(state)).toBe(true);
    });

    it("selectIsSending should return sending loading state", () => {
      expect(selectIsSending(state)).toBe(false);
    });
  });

  describe("Specific Error State Selectors", () => {
    const conversationsError = createMockErrorState("Conversations error");
    const agentsError = createMockErrorState("Agents error");
    const error = {
      conversations: conversationsError,
      messages: undefined,
      agents: agentsError,
      sending: undefined,
    };
    const state = createMockState({ error });

    it("selectConversationsError should return conversations error state", () => {
      expect(selectConversationsError(state)).toEqual(conversationsError);
    });

    it("selectMessagesError should return messages error state", () => {
      expect(selectMessagesError(state)).toBeUndefined();
    });

    it("selectAgentsError should return agents error state", () => {
      expect(selectAgentsError(state)).toEqual(agentsError);
    });

    it("selectSendingError should return sending error state", () => {
      expect(selectSendingError(state)).toBeUndefined();
    });
  });

  describe("Configuration Selectors", () => {
    describe("selectMaximumMessages", () => {
      it("should return maximum messages configuration", () => {
        const state = createMockState({ maximumMessages: 150 });
        const result = selectMaximumMessages(state);
        expect(result).toBe(150);
      });

      it("should return default maximum messages", () => {
        const state = createMockState();
        const result = selectMaximumMessages(state);
        expect(result).toBe(100);
      });
    });

    describe("selectActiveRequestToken", () => {
      it("should return null when no active request", () => {
        const state = createMockState({ activeRequestToken: null });
        const result = selectActiveRequestToken(state);
        expect(result).toBeNull();
      });

      it("should return active request token when set", () => {
        const token = "request-token-123";
        const state = createMockState({ activeRequestToken: token });
        const result = selectActiveRequestToken(state);
        expect(result).toBe(token);
      });
    });
  });

  describe("Edge Cases and Type Safety", () => {
    it("should handle empty state gracefully", () => {
      const state = createMockState();

      expect(selectActiveConversationId(state)).toBeNull();
      expect(selectConversations(state)).toEqual([]);
      expect(selectActiveMessages(state)).toEqual([]);
      expect(selectActiveConversationAgents(state)).toEqual([]);
      expect(selectActiveConversation(state)).toBeUndefined();
      expect(selectHasActiveConversation(state)).toBe(false);
      expect(selectMessageCount(state)).toBe(0);
      expect(selectEnabledAgents(state)).toEqual([]);
      expect(selectIsLoading(state)).toBe(false);
    });

    it("should maintain type safety for all selectors", () => {
      const state = createMockState({
        activeConversationId: "conv-1",
        conversations: [createMockConversation("conv-1", "Test")],
        activeMessages: [createMockMessage("msg-1", "Hello")],
        activeConversationAgents: [
          createMockConversationAgent("ca-1", "agent-1"),
        ],
      });

      // These should all compile with correct TypeScript types
      const activeId: string | null = selectActiveConversationId(state);
      const conversations: Conversation[] = selectConversations(state);
      const messages: Message[] = selectActiveMessages(state);
      const agents: ConversationAgent[] = selectActiveConversationAgents(state);
      const activeConv: Conversation | undefined =
        selectActiveConversation(state);
      const hasActive: boolean = selectHasActiveConversation(state);
      const count: number = selectMessageCount(state);
      const enabled: ConversationAgent[] = selectEnabledAgents(state);
      const loading: boolean = selectIsLoading(state);

      expect(typeof activeId === "string" || activeId === null).toBe(true);
      expect(Array.isArray(conversations)).toBe(true);
      expect(Array.isArray(messages)).toBe(true);
      expect(Array.isArray(agents)).toBe(true);
      expect(typeof activeConv === "object" || activeConv === undefined).toBe(
        true,
      );
      expect(typeof hasActive).toBe("boolean");
      expect(typeof count).toBe("number");
      expect(Array.isArray(enabled)).toBe(true);
      expect(typeof loading).toBe("boolean");
    });
  });
});

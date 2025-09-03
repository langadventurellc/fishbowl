/**
 * Unit tests for getActiveChatMode function in conversation store.
 *
 * Tests the chat mode derivation function that returns the chat mode of the
 * currently active conversation, including null safety, reactive behavior,
 * and performance requirements.
 *
 * @module stores/conversation/__tests__/getActiveChatMode.test
 */

import type { Conversation } from "@fishbowl-ai/shared";
import type { ConversationStoreState } from "../ConversationStoreState";
import { useConversationStore } from "../useConversationStore";

// Mock data factory function
const createMockConversation = (
  id: string,
  title: string,
  chatMode: "manual" | "round-robin" = "manual",
): Conversation => ({
  id,
  title,
  chat_mode: chatMode,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
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

describe("getActiveChatMode", () => {
  beforeEach(() => {
    // Reset store state before each test
    useConversationStore.setState(createMockState());
  });

  describe("Basic Functionality", () => {
    it("should return null when no conversation is selected", () => {
      const conversations = [
        createMockConversation("conv-1", "First Chat", "manual"),
        createMockConversation("conv-2", "Second Chat", "round-robin"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: null,
        }),
      );

      const result = useConversationStore.getState().getActiveChatMode();
      expect(result).toBeNull();
    });

    it("should return null when active conversation is not found in array", () => {
      const conversations = [
        createMockConversation("conv-1", "First Chat", "manual"),
        createMockConversation("conv-2", "Second Chat", "round-robin"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-missing",
        }),
      );

      const result = useConversationStore.getState().getActiveChatMode();
      expect(result).toBeNull();
    });

    it("should return 'manual' when active conversation has manual chat mode", () => {
      const conversations = [
        createMockConversation("conv-1", "First Chat", "manual"),
        createMockConversation("conv-2", "Second Chat", "round-robin"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-1",
        }),
      );

      const result = useConversationStore.getState().getActiveChatMode();
      expect(result).toBe("manual");
    });

    it("should return 'round-robin' when active conversation has round-robin chat mode", () => {
      const conversations = [
        createMockConversation("conv-1", "First Chat", "manual"),
        createMockConversation("conv-2", "Second Chat", "round-robin"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-2",
        }),
      );

      const result = useConversationStore.getState().getActiveChatMode();
      expect(result).toBe("round-robin");
    });
  });

  describe("Reactive Behavior", () => {
    it("should return updated chat mode when conversation selection changes", () => {
      const conversations = [
        createMockConversation("conv-1", "Manual Chat", "manual"),
        createMockConversation("conv-2", "Round Robin Chat", "round-robin"),
      ];

      // Initial state with first conversation selected
      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-1",
        }),
      );

      const firstResult = useConversationStore.getState().getActiveChatMode();
      expect(firstResult).toBe("manual");

      // Switch to second conversation
      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-2",
        }),
      );

      const secondResult = useConversationStore.getState().getActiveChatMode();
      expect(secondResult).toBe("round-robin");

      // Switch to null selection
      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: null,
        }),
      );

      const thirdResult = useConversationStore.getState().getActiveChatMode();
      expect(thirdResult).toBeNull();
    });

    it("should return updated chat mode when conversation list is updated", () => {
      // Initial state with manual mode conversation
      const initialConversations = [
        createMockConversation("conv-1", "Test Chat", "manual"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations: initialConversations,
          activeConversationId: "conv-1",
        }),
      );

      const initialResult = useConversationStore.getState().getActiveChatMode();
      expect(initialResult).toBe("manual");

      // Update conversation list with modified chat mode
      const updatedConversations = [
        createMockConversation("conv-1", "Test Chat", "round-robin"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations: updatedConversations,
          activeConversationId: "conv-1",
        }),
      );

      const updatedResult = useConversationStore.getState().getActiveChatMode();
      expect(updatedResult).toBe("round-robin");
    });
  });

  describe("Performance Requirements", () => {
    it("should execute in under 1ms for typical conversation arrays", () => {
      // Create a typical conversation array (10-20 conversations)
      const conversations = Array.from({ length: 15 }, (_, index) =>
        createMockConversation(
          `conv-${index}`,
          `Conversation ${index}`,
          index % 2 === 0 ? "manual" : "round-robin",
        ),
      );

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-7", // Middle of array
        }),
      );

      const startTime = performance.now();
      const result = useConversationStore.getState().getActiveChatMode();
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      expect(result).toBe("round-robin"); // conv-7 should have round-robin
      expect(executionTime).toBeLessThan(1); // Less than 1ms
    });

    it("should handle large conversation arrays efficiently", () => {
      // Create a large conversation array (100 conversations)
      const conversations = Array.from({ length: 100 }, (_, index) =>
        createMockConversation(
          `conv-${index}`,
          `Conversation ${index}`,
          index % 3 === 0 ? "round-robin" : "manual",
        ),
      );

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-99", // Last item (worst case)
        }),
      );

      const startTime = performance.now();
      const result = useConversationStore.getState().getActiveChatMode();
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      expect(result).toBe("round-robin"); // conv-99 should have round-robin (99 % 3 === 0)
      expect(executionTime).toBeLessThan(5); // Should still be very fast even for worst case
    });
  });

  describe("Type Safety", () => {
    it("should maintain proper return type constraints", () => {
      const conversations = [
        createMockConversation("conv-1", "Test Chat", "manual"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-1",
        }),
      );

      const result = useConversationStore.getState().getActiveChatMode();

      // TypeScript compile-time check: result should be "manual" | "round-robin" | null
      if (result !== null) {
        expect(result === "manual" || result === "round-robin").toBe(true);
      }

      // Runtime verification
      expect(typeof result === "string" || result === null).toBe(true);
      if (typeof result === "string") {
        expect(["manual", "round-robin"]).toContain(result);
      }
    });

    it("should work correctly with TypeScript strict null checks", () => {
      // Test null case
      useConversationStore.setState(
        createMockState({
          conversations: [],
          activeConversationId: null,
        }),
      );

      const nullResult = useConversationStore.getState().getActiveChatMode();
      expect(nullResult).toBeNull();

      // Test non-null case
      const conversations = [
        createMockConversation("conv-1", "Test", "round-robin"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-1",
        }),
      );

      const nonNullResult = useConversationStore.getState().getActiveChatMode();
      expect(nonNullResult).not.toBeNull();
      expect(nonNullResult).toBe("round-robin");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty conversations array", () => {
      useConversationStore.setState(
        createMockState({
          conversations: [],
          activeConversationId: "conv-1",
        }),
      );

      const result = useConversationStore.getState().getActiveChatMode();
      expect(result).toBeNull();
    });

    it("should handle multiple calls without side effects", () => {
      const conversations = [
        createMockConversation("conv-1", "Test Chat", "round-robin"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-1",
        }),
      );

      const result1 = useConversationStore.getState().getActiveChatMode();
      const result2 = useConversationStore.getState().getActiveChatMode();
      const result3 = useConversationStore.getState().getActiveChatMode();

      expect(result1).toBe("round-robin");
      expect(result2).toBe("round-robin");
      expect(result3).toBe("round-robin");

      // Ensure state wasn't modified by the calls
      const state = useConversationStore.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.activeConversationId).toBe("conv-1");
    });

    it("should handle conversation ID that exists but as different type", () => {
      const conversations = [
        createMockConversation("conv-1", "Test Chat", "manual"),
      ];

      useConversationStore.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-1", // string type is already correct
        }),
      );

      const result = useConversationStore.getState().getActiveChatMode();
      expect(result).toBe("manual");
    });

    it("should be immutable - function should not modify store state", () => {
      const originalConversations = [
        createMockConversation("conv-1", "Test Chat", "round-robin"),
      ];

      const originalState = createMockState({
        conversations: originalConversations,
        activeConversationId: "conv-1",
      });

      useConversationStore.setState(originalState);

      const stateBefore = useConversationStore.getState();
      const result = useConversationStore.getState().getActiveChatMode();
      const stateAfter = useConversationStore.getState();

      // Verify function result
      expect(result).toBe("round-robin");

      // Verify state wasn't modified
      expect(stateAfter).toEqual(stateBefore);
      expect(stateAfter.conversations).toEqual(originalConversations);
      expect(stateAfter.activeConversationId).toBe("conv-1");
    });
  });

  describe("Integration with Store", () => {
    it("should work consistently with store state changes", () => {
      const store = useConversationStore;

      // Test initial state
      expect(store.getState().getActiveChatMode()).toBeNull();

      // Add conversations and select one
      const conversations = [
        createMockConversation("conv-1", "Manual Chat", "manual"),
        createMockConversation("conv-2", "Round Robin Chat", "round-robin"),
      ];

      store.setState(
        createMockState({
          conversations,
          activeConversationId: "conv-1",
        }),
      );

      expect(store.getState().getActiveChatMode()).toBe("manual");

      // Change active conversation
      store.setState({
        ...store.getState(),
        activeConversationId: "conv-2",
      });

      expect(store.getState().getActiveChatMode()).toBe("round-robin");

      // Clear active conversation
      store.setState({
        ...store.getState(),
        activeConversationId: null,
      });

      expect(store.getState().getActiveChatMode()).toBeNull();
    });
  });
});

/**
 * Unit tests for the chat Zustand store.
 *
 * Tests store initialization, transient UI state management, agent-specific
 * state tracking, and state cleanup operations.
 *
 * @module stores/chat/__tests__/useChatStore.test
 */

import { useChatStore } from "../useChatStore";
import type { AgentError } from "../AgentError";

// Helper function to create test AgentError objects
const createTestError = (message: string, agentName?: string): AgentError => ({
  message,
  agentName,
  errorType: "unknown",
  retryable: false,
});

describe("useChatStore", () => {
  beforeEach(() => {
    // Reset store to clean state before each test
    useChatStore.setState({
      sendingMessage: false,
      agentThinking: {},
      lastError: {},
      processingConversationId: null,
    });
  });

  describe("store initialization", () => {
    it("should initialize with correct default values", () => {
      const state = useChatStore.getState();

      expect(state.sendingMessage).toBe(false);
      expect(state.agentThinking).toEqual({});
      expect(state.lastError).toEqual({});
      expect(state.processingConversationId).toBeNull();
    });

    it("should have all required action methods", () => {
      const store = useChatStore.getState();

      // Core actions
      expect(typeof store.setSending).toBe("function");
      expect(typeof store.setAgentThinking).toBe("function");
      expect(typeof store.setAgentError).toBe("function");
      expect(typeof store.setProcessingConversation).toBe("function");

      // Cleanup actions
      expect(typeof store.clearAgentState).toBe("function");
      expect(typeof store.clearAllThinking).toBe("function");
      expect(typeof store.clearConversationState).toBe("function");
    });
  });

  describe("setSending action", () => {
    it("should update sendingMessage to true", () => {
      const { setSending } = useChatStore.getState();

      setSending(true);

      expect(useChatStore.getState().sendingMessage).toBe(true);
    });

    it("should update sendingMessage to false", () => {
      // First set to true
      useChatStore.setState({ sendingMessage: true });

      const { setSending } = useChatStore.getState();
      setSending(false);

      expect(useChatStore.getState().sendingMessage).toBe(false);
    });
  });

  describe("setAgentThinking action", () => {
    it("should set thinking state for a single agent", () => {
      const { setAgentThinking } = useChatStore.getState();
      const agentId = "agent-123";

      setAgentThinking(agentId, true);

      const state = useChatStore.getState();
      expect(state.agentThinking[agentId]).toBe(true);
      expect(Object.keys(state.agentThinking)).toHaveLength(1);
    });

    it("should handle multiple agents with different thinking states", () => {
      const { setAgentThinking } = useChatStore.getState();

      setAgentThinking("agent-1", true);
      setAgentThinking("agent-2", false);
      setAgentThinking("agent-3", true);

      const state = useChatStore.getState();
      expect(state.agentThinking["agent-1"]).toBe(true);
      expect(state.agentThinking["agent-2"]).toBe(false);
      expect(state.agentThinking["agent-3"]).toBe(true);
      expect(Object.keys(state.agentThinking)).toHaveLength(3);
    });

    it("should update existing agent thinking state", () => {
      const { setAgentThinking } = useChatStore.getState();
      const agentId = "agent-123";

      // First set to true
      setAgentThinking(agentId, true);
      expect(useChatStore.getState().agentThinking[agentId]).toBe(true);

      // Then set to false
      setAgentThinking(agentId, false);
      expect(useChatStore.getState().agentThinking[agentId]).toBe(false);
    });

    it("should maintain state immutability", () => {
      const { setAgentThinking } = useChatStore.getState();
      const initialState = useChatStore.getState();
      const initialThinking = initialState.agentThinking;

      setAgentThinking("agent-123", true);

      const newState = useChatStore.getState();
      expect(newState.agentThinking).not.toBe(initialThinking);
      expect(initialThinking).toEqual({});
    });
  });

  describe("setAgentError action", () => {
    it("should set error message for an agent", () => {
      const { setAgentError } = useChatStore.getState();
      const agentId = "agent-123";
      const errorMessage = createTestError("API request failed");

      setAgentError(agentId, errorMessage);

      const state = useChatStore.getState();
      expect(state.lastError[agentId]).toEqual(errorMessage);
    });

    it("should clear error by setting null", () => {
      const { setAgentError } = useChatStore.getState();
      const agentId = "agent-123";

      // First set an error
      const testError = createTestError("Some error");
      setAgentError(agentId, testError);
      expect(useChatStore.getState().lastError[agentId]).toEqual(testError);

      // Then clear it
      setAgentError(agentId, null);
      expect(useChatStore.getState().lastError[agentId]).toBeNull();
    });

    it("should handle multiple agent errors independently", () => {
      const { setAgentError } = useChatStore.getState();

      const error1 = createTestError("Error 1");
      const error3 = createTestError("Error 3");
      setAgentError("agent-1", error1);
      setAgentError("agent-2", null);
      setAgentError("agent-3", error3);

      const state = useChatStore.getState();
      expect(state.lastError["agent-1"]).toEqual(error1);
      expect(state.lastError["agent-2"]).toBeNull();
      expect(state.lastError["agent-3"]).toEqual(error3);
      expect(Object.keys(state.lastError)).toHaveLength(3);
    });

    it("should maintain state immutability", () => {
      const { setAgentError } = useChatStore.getState();
      const initialState = useChatStore.getState();
      const initialErrors = initialState.lastError;

      const testError = createTestError("Test error");
      setAgentError("agent-123", testError);

      const newState = useChatStore.getState();
      expect(newState.lastError).not.toBe(initialErrors);
      expect(initialErrors).toEqual({});
    });
  });

  describe("setProcessingConversation action", () => {
    it("should set processing conversation ID", () => {
      const { setProcessingConversation } = useChatStore.getState();
      const conversationId = "conv-123";

      setProcessingConversation(conversationId);

      expect(useChatStore.getState().processingConversationId).toBe(
        conversationId,
      );
    });

    it("should clear processing conversation by setting null", () => {
      // First set a conversation ID
      useChatStore.setState({ processingConversationId: "conv-123" });

      const { setProcessingConversation } = useChatStore.getState();
      setProcessingConversation(null);

      expect(useChatStore.getState().processingConversationId).toBeNull();
    });
  });

  describe("clearAgentState action", () => {
    it("should clear both thinking and error state for specific agent", () => {
      const { setAgentThinking, setAgentError, clearAgentState } =
        useChatStore.getState();
      const agentId = "agent-123";

      // Set initial state
      setAgentThinking(agentId, true);
      const testError = createTestError("Some error");
      setAgentError(agentId, testError);

      // Verify state is set
      let state = useChatStore.getState();
      expect(state.agentThinking[agentId]).toBe(true);
      expect(state.lastError[agentId]).toEqual(testError);

      // Clear the agent state
      clearAgentState(agentId);

      // Verify state is cleared
      state = useChatStore.getState();
      expect(state.agentThinking[agentId]).toBeUndefined();
      expect(state.lastError[agentId]).toBeUndefined();
    });

    it("should only clear target agent without affecting others", () => {
      const { setAgentThinking, setAgentError, clearAgentState } =
        useChatStore.getState();

      // Set state for multiple agents
      setAgentThinking("agent-1", true);
      setAgentThinking("agent-2", false);
      const error1 = createTestError("Error 1");
      const error2 = createTestError("Error 2");
      setAgentError("agent-1", error1);
      setAgentError("agent-2", error2);

      // Clear only agent-1
      clearAgentState("agent-1");

      const state = useChatStore.getState();
      expect(state.agentThinking["agent-1"]).toBeUndefined();
      expect(state.lastError["agent-1"]).toBeUndefined();
      expect(state.agentThinking["agent-2"]).toBe(false);
      expect(state.lastError["agent-2"]).toEqual(error2);
    });

    it("should handle clearing non-existent agent gracefully", () => {
      const { clearAgentState } = useChatStore.getState();

      // Should not throw error
      expect(() => clearAgentState("non-existent-agent")).not.toThrow();

      const state = useChatStore.getState();
      expect(state.agentThinking).toEqual({});
      expect(state.lastError).toEqual({});
    });
  });

  describe("clearAllThinking action", () => {
    it("should clear all agent thinking states", () => {
      const { setAgentThinking, clearAllThinking } = useChatStore.getState();

      // Set thinking state for multiple agents
      setAgentThinking("agent-1", true);
      setAgentThinking("agent-2", false);
      setAgentThinking("agent-3", true);

      // Verify state is set
      let state = useChatStore.getState();
      expect(Object.keys(state.agentThinking)).toHaveLength(3);

      // Clear all thinking
      clearAllThinking();

      // Verify all thinking is cleared
      state = useChatStore.getState();
      expect(state.agentThinking).toEqual({});
    });

    it("should not affect error states", () => {
      const { setAgentThinking, setAgentError, clearAllThinking } =
        useChatStore.getState();

      // Set both thinking and error states
      setAgentThinking("agent-1", true);
      const testError = createTestError("Error message");
      setAgentError("agent-1", testError);

      clearAllThinking();

      const state = useChatStore.getState();
      expect(state.agentThinking).toEqual({});
      expect(state.lastError["agent-1"]).toEqual(testError);
    });
  });

  describe("clearConversationState action", () => {
    it("should reset all conversation-related state", () => {
      const {
        setAgentThinking,
        setAgentError,
        setProcessingConversation,
        clearConversationState,
      } = useChatStore.getState();

      // Set all types of state
      setAgentThinking("agent-1", true);
      const testError = createTestError("Error message");
      setAgentError("agent-1", testError);
      setProcessingConversation("conv-123");

      // Verify state is set
      let state = useChatStore.getState();
      expect(state.agentThinking["agent-1"]).toBe(true);
      expect(state.lastError["agent-1"]).toEqual(testError);
      expect(state.processingConversationId).toBe("conv-123");

      // Clear conversation state
      clearConversationState();

      // Verify all conversation state is cleared
      state = useChatStore.getState();
      expect(state.agentThinking).toEqual({});
      expect(state.lastError).toEqual({});
      expect(state.processingConversationId).toBeNull();
    });

    it("should not affect sendingMessage state", () => {
      const { setSending, setAgentThinking, clearConversationState } =
        useChatStore.getState();

      // Set both sending and agent state
      setSending(true);
      setAgentThinking("agent-1", true);

      clearConversationState();

      const state = useChatStore.getState();
      expect(state.sendingMessage).toBe(true); // Should remain unchanged
      expect(state.agentThinking).toEqual({}); // Should be cleared
    });
  });

  describe("concurrent state updates", () => {
    it("should handle rapid thinking state updates for same agent", () => {
      const { setAgentThinking } = useChatStore.getState();
      const agentId = "agent-123";

      // Simulate rapid updates
      setAgentThinking(agentId, true);
      setAgentThinking(agentId, false);
      setAgentThinking(agentId, true);

      const state = useChatStore.getState();
      expect(state.agentThinking[agentId]).toBe(true);
    });

    it("should handle simultaneous updates to multiple agents", () => {
      const { setAgentThinking, setAgentError } = useChatStore.getState();

      // Simulate concurrent agent updates
      const error1 = createTestError("Error 1");
      const error3 = createTestError("Error 3");
      setAgentThinking("agent-1", true);
      setAgentError("agent-1", error1);
      setAgentThinking("agent-2", false);
      setAgentError("agent-2", null);
      setAgentThinking("agent-3", true);
      setAgentError("agent-3", error3);

      const state = useChatStore.getState();
      expect(state.agentThinking["agent-1"]).toBe(true);
      expect(state.lastError["agent-1"]).toEqual(error1);
      expect(state.agentThinking["agent-2"]).toBe(false);
      expect(state.lastError["agent-2"]).toBeNull();
      expect(state.agentThinking["agent-3"]).toBe(true);
      expect(state.lastError["agent-3"]).toEqual(error3);
    });

    it("should maintain state consistency during mixed operations", () => {
      const {
        setSending,
        setAgentThinking,
        setAgentError,
        setProcessingConversation,
        clearAgentState,
      } = useChatStore.getState();

      // Mixed operations
      setSending(true);
      setAgentThinking("agent-1", true);
      setProcessingConversation("conv-123");
      const testError = createTestError("Error");
      setAgentError("agent-2", testError);
      clearAgentState("agent-1"); // Should clear agent-1 but not affect others

      const state = useChatStore.getState();
      expect(state.sendingMessage).toBe(true);
      expect(state.agentThinking["agent-1"]).toBeUndefined();
      expect(state.lastError["agent-1"]).toBeUndefined();
      expect(state.lastError["agent-2"]).toEqual(testError);
      expect(state.processingConversationId).toBe("conv-123");
    });
  });

  describe("state immutability", () => {
    it("should create new object references for agentThinking updates", () => {
      const initialState = useChatStore.getState();
      const initialThinking = initialState.agentThinking;

      const { setAgentThinking } = useChatStore.getState();
      setAgentThinking("agent-1", true);

      const newState = useChatStore.getState();
      expect(newState.agentThinking).not.toBe(initialThinking);
      expect(newState.agentThinking).not.toEqual(initialThinking);
    });

    it("should create new object references for lastError updates", () => {
      const initialState = useChatStore.getState();
      const initialErrors = initialState.lastError;

      const { setAgentError } = useChatStore.getState();
      const testError = createTestError("Test error");
      setAgentError("agent-1", testError);

      const newState = useChatStore.getState();
      expect(newState.lastError).not.toBe(initialErrors);
      expect(newState.lastError).not.toEqual(initialErrors);
    });

    it("should preserve unmodified properties during updates", () => {
      const { setSending, setAgentThinking } = useChatStore.getState();

      // Set initial state
      setSending(true);

      const stateBeforeAgentUpdate = useChatStore.getState();
      const sendingBefore = stateBeforeAgentUpdate.sendingMessage;
      const processingIdBefore =
        stateBeforeAgentUpdate.processingConversationId;

      // Update agent thinking
      setAgentThinking("agent-1", true);

      const stateAfterAgentUpdate = useChatStore.getState();
      expect(stateAfterAgentUpdate.sendingMessage).toBe(sendingBefore);
      expect(stateAfterAgentUpdate.processingConversationId).toBe(
        processingIdBefore,
      );
    });
  });
});

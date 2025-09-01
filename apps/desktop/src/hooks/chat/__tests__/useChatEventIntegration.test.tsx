/**
 * Unit tests for useChatEventIntegration hook.
 *
 * Tests IPC integration with chat store for agent status updates, including proper cleanup,
 * error handling, and graceful degradation in non-Electron environments.
 *
 * @module hooks/chat/__tests__/useChatEventIntegration.test
 */

import { useChatStore } from "@fishbowl-ai/ui-shared";
import type { AgentError } from "@fishbowl-ai/ui-shared";
import { renderHook, act } from "@testing-library/react";
import { useChatEventIntegration } from "../useChatEventIntegration";
import type { AgentUpdateEvent } from "../../../shared/ipc/chat";

// Mock the shared package store
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useChatStore: jest.fn(),
}));

const mockUseChatStore = useChatStore as jest.MockedFunction<
  typeof useChatStore
>;

// Mock store actions
const mockSetAgentThinking = jest.fn();
const mockSetAgentError = jest.fn();
const mockSetProcessingConversation = jest.fn();
const mockClearConversationState = jest.fn();

// Mock electron API
const mockOnAgentUpdate = jest.fn();
const mockUnsubscribe = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockOnAgentUpdate.mockClear();
  mockUnsubscribe.mockClear();
  mockSetAgentThinking.mockClear();
  mockSetAgentError.mockClear();
  mockSetProcessingConversation.mockClear();
  mockClearConversationState.mockClear();

  // Mock useChatStore return value
  mockUseChatStore.mockReturnValue({
    sendingMessage: false,
    agentThinking: {},
    lastError: {},
    processingConversationId: null,
    setSending: jest.fn(),
    setAgentThinking: mockSetAgentThinking,
    setAgentError: mockSetAgentError,
    setProcessingConversation: mockSetProcessingConversation,
    clearAgentState: jest.fn(),
    clearAllThinking: jest.fn(),
    clearConversationState: mockClearConversationState,
  });

  // Mock window.electronAPI.chat
  Object.defineProperty(window, "electronAPI", {
    value: {
      chat: {
        onAgentUpdate: mockOnAgentUpdate.mockReturnValue(mockUnsubscribe),
      },
    },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  delete (window as any).electronAPI;
});

describe("useChatEventIntegration", () => {
  describe("Electron Environment", () => {
    it("should render without errors", () => {
      expect(() => {
        renderHook(() =>
          useChatEventIntegration({ conversationId: "conversation-1" }),
        );
      }).not.toThrow();
    });

    it("should register IPC listener when conversationId is provided", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(mockOnAgentUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnAgentUpdate).toHaveBeenCalledWith(expect.any(Function));
      expect(mockClearConversationState).toHaveBeenCalledTimes(1);
      expect(mockSetProcessingConversation).toHaveBeenCalledWith(
        "conversation-1",
      );
    });

    it("should not register IPC listener when conversationId is null", () => {
      const { result } = renderHook(() =>
        useChatEventIntegration({ conversationId: null }),
      );

      expect(mockOnAgentUpdate).not.toHaveBeenCalled();
      expect(mockClearConversationState).toHaveBeenCalledTimes(1);
      expect(result.current.isConnected).toBe(false);
    });

    it("should call cleanup function on unmount", () => {
      const { unmount } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(mockUnsubscribe).not.toHaveBeenCalled();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it("should return connection status correctly", () => {
      const { result } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(result.current.isConnected).toBe(true);
      expect(result.current.lastEventTime).toBeNull();
    });

    it("should handle conversation switching", () => {
      const { rerender } = renderHook(
        ({ conversationId }) => useChatEventIntegration({ conversationId }),
        {
          initialProps: { conversationId: "conversation-1" },
        },
      );

      expect(mockOnAgentUpdate).toHaveBeenCalledTimes(1);
      expect(mockUnsubscribe).not.toHaveBeenCalled();

      // Switch to different conversation
      rerender({ conversationId: "conversation-2" });

      // Should cleanup old listener and register new one
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(mockOnAgentUpdate).toHaveBeenCalledTimes(2);
      expect(mockClearConversationState).toHaveBeenCalledTimes(2);
      expect(mockSetProcessingConversation).toHaveBeenCalledWith(
        "conversation-2",
      );
    });
  });

  describe("Event Handling", () => {
    it("should handle 'thinking' status events", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const event: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-1",
        status: "thinking",
      };

      act(() => {
        callback(event);
      });

      expect(mockSetAgentThinking).toHaveBeenCalledWith("agent-1", true);
    });

    it("should handle 'complete' status events", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const event: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-1",
        status: "complete",
        messageId: "message-1",
      };

      act(() => {
        callback(event);
      });

      expect(mockSetAgentThinking).toHaveBeenCalledWith("agent-1", false);
      expect(mockSetAgentError).toHaveBeenCalledWith("agent-1", null);
    });

    it("should handle 'error' status events with basic error message", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const event: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-1",
        status: "error",
        error: "Test error message",
      };

      act(() => {
        callback(event);
      });

      const expectedError: AgentError = {
        message: "Test error message",
        agentName: undefined,
        errorType: undefined,
        retryable: false,
      };

      expect(mockSetAgentThinking).toHaveBeenCalledWith("agent-1", false);
      expect(mockSetAgentError).toHaveBeenCalledWith("agent-1", expectedError);
    });

    it("should handle 'error' status events with no error message", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const event: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-1",
        status: "error",
      };

      act(() => {
        callback(event);
      });

      const expectedError: AgentError = {
        message: "An unknown error occurred",
        agentName: undefined,
        errorType: undefined,
        retryable: false,
      };

      expect(mockSetAgentThinking).toHaveBeenCalledWith("agent-1", false);
      expect(mockSetAgentError).toHaveBeenCalledWith("agent-1", expectedError);
    });

    it("should handle 'error' status events with full structured error information", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const event: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-1",
        status: "error",
        error: "Network connection failed",
        agentName: "Assistant Bot",
        errorType: "network",
        retryable: true,
      };

      act(() => {
        callback(event);
      });

      const expectedError: AgentError = {
        message: "Network connection failed",
        agentName: "Assistant Bot",
        errorType: "network",
        retryable: true,
      };

      expect(mockSetAgentThinking).toHaveBeenCalledWith("agent-1", false);
      expect(mockSetAgentError).toHaveBeenCalledWith("agent-1", expectedError);
    });

    it("should handle 'error' status events with different error types", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const errorTypes = [
        "network",
        "auth",
        "rate_limit",
        "validation",
        "provider",
        "timeout",
        "unknown",
      ] as const;

      errorTypes.forEach((errorType, index) => {
        const event: AgentUpdateEvent = {
          conversationId: "test-conv-id",
          conversationAgentId: `agent-${index}`,
          status: "error",
          error: `${errorType} error occurred`,
          agentName: `Agent ${index}`,
          errorType,
          retryable: errorType !== "auth", // Auth errors typically not retryable
        };

        act(() => {
          callback(event);
        });

        const expectedError: AgentError = {
          message: `${errorType} error occurred`,
          agentName: `Agent ${index}`,
          errorType,
          retryable: errorType !== "auth",
        };

        expect(mockSetAgentError).toHaveBeenCalledWith(
          `agent-${index}`,
          expectedError,
        );
      });
    });

    it("should handle 'error' status events with retryable flag variations", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];

      // Test explicit retryable: true
      const retryableEvent: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-retryable",
        status: "error",
        error: "Retryable error",
        retryable: true,
      };

      act(() => {
        callback(retryableEvent);
      });

      expect(mockSetAgentError).toHaveBeenCalledWith("agent-retryable", {
        message: "Retryable error",
        agentName: undefined,
        errorType: undefined,
        retryable: true,
      });

      // Test explicit retryable: false
      const nonRetryableEvent: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-non-retryable",
        status: "error",
        error: "Non-retryable error",
        retryable: false,
      };

      act(() => {
        callback(nonRetryableEvent);
      });

      expect(mockSetAgentError).toHaveBeenCalledWith("agent-non-retryable", {
        message: "Non-retryable error",
        agentName: undefined,
        errorType: undefined,
        retryable: false,
      });
    });

    it("should handle 'error' status events with missing optional fields gracefully", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const event: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-1",
        status: "error",
        error: "Error with minimal info",
        // agentName, errorType, retryable are undefined
      };

      act(() => {
        callback(event);
      });

      const expectedError: AgentError = {
        message: "Error with minimal info",
        agentName: undefined,
        errorType: undefined,
        retryable: false, // Should default to false when undefined
      };

      expect(mockSetAgentThinking).toHaveBeenCalledWith("agent-1", false);
      expect(mockSetAgentError).toHaveBeenCalledWith("agent-1", expectedError);
    });

    it("should update lastEventTime when events are received", () => {
      const { result } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(result.current.lastEventTime).toBeNull();

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const event: AgentUpdateEvent = {
        conversationId: "test-conv-id",
        conversationAgentId: "agent-1",
        status: "thinking",
      };

      act(() => {
        callback(event);
      });

      expect(result.current.lastEventTime).toBeTruthy();
      expect(typeof result.current.lastEventTime).toBe("string");
    });

    it("should handle unknown status gracefully", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];
      const event = {
        conversationAgentId: "agent-1",
        status: "unknown",
      } as any;

      act(() => {
        callback(event);
      });

      expect(consoleSpy).toHaveBeenCalledWith("Unknown agent status: unknown");

      consoleSpy.mockRestore();
    });

    it("should handle malformed events gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];

      // Test with malformed event that will throw during destructuring
      act(() => {
        callback(null as any);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error processing agent update event:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Non-Electron Environment", () => {
    beforeEach(() => {
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", () => {
      expect(() => {
        renderHook(() =>
          useChatEventIntegration({ conversationId: "conversation-1" }),
        );
      }).not.toThrow();

      expect(mockOnAgentUpdate).not.toHaveBeenCalled();
    });

    it("should return disconnected state when electronAPI is missing", () => {
      const { result } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(result.current.isConnected).toBe(false);
      expect(mockOnAgentUpdate).not.toHaveBeenCalled();
    });

    it("should handle unmount gracefully in non-Electron environment", () => {
      const { unmount } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(() => unmount()).not.toThrow();
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
  });

  describe("Window Object Edge Cases", () => {
    it("should handle electronAPI without chat property", () => {
      Object.defineProperty(window, "electronAPI", {
        value: {}, // Empty object without chat
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(result.current.isConnected).toBe(false);
      expect(mockOnAgentUpdate).not.toHaveBeenCalled();
    });

    it("should handle chat without onAgentUpdate method", () => {
      Object.defineProperty(window, "electronAPI", {
        value: { chat: {} },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(result.current.isConnected).toBe(false);
      expect(mockOnAgentUpdate).not.toHaveBeenCalled();
    });

    it("should handle onAgentUpdate that is not a function", () => {
      Object.defineProperty(window, "electronAPI", {
        value: { chat: { onAgentUpdate: "not a function" } },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle IPC setup errors gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockOnAgentUpdate.mockImplementation(() => {
        throw new Error("IPC setup error");
      });

      const { result } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(result.current.isConnected).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to set up IPC event listener:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle cleanup errors gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockUnsubscribe.mockImplementation(() => {
        throw new Error("Cleanup error");
      });

      const { unmount } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(() => unmount()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error during IPC cleanup:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Memory Management", () => {
    it("should properly manage cleanup function reference", () => {
      const { unmount } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(mockUnsubscribe).not.toHaveBeenCalled();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);

      // Second unmount should not call cleanup again (handled by React)
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it("should handle null cleanup function gracefully", () => {
      mockOnAgentUpdate.mockReturnValue(null as any);

      const { unmount } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(() => unmount()).not.toThrow();
    });

    it("should handle undefined cleanup function gracefully", () => {
      mockOnAgentUpdate.mockReturnValue(undefined as any);

      const { unmount } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Concurrent Events", () => {
    it("should handle multiple rapid events correctly", () => {
      renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      const callback = mockOnAgentUpdate.mock.calls[0][0];

      act(() => {
        // Simulate rapid events
        callback({
          conversationAgentId: "agent-1",
          status: "thinking",
        });
        callback({
          conversationAgentId: "agent-2",
          status: "thinking",
        });
        callback({
          conversationAgentId: "agent-1",
          status: "complete",
        });
      });

      expect(mockSetAgentThinking).toHaveBeenCalledTimes(3);
      expect(mockSetAgentThinking).toHaveBeenNthCalledWith(1, "agent-1", true);
      expect(mockSetAgentThinking).toHaveBeenNthCalledWith(2, "agent-2", true);
      expect(mockSetAgentThinking).toHaveBeenNthCalledWith(3, "agent-1", false);

      expect(mockSetAgentError).toHaveBeenCalledWith("agent-1", null);
    });
  });

  describe("Hook Dependencies", () => {
    it("should maintain stable callback reference with useCallback", () => {
      const { rerender } = renderHook(() =>
        useChatEventIntegration({ conversationId: "conversation-1" }),
      );

      // Trigger re-render without changing conversationId
      rerender();

      // Should not have called onAgentUpdate again if callback is stable
      expect(mockOnAgentUpdate).toHaveBeenCalledTimes(1);
    });
  });
});

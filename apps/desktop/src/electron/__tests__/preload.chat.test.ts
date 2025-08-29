/**
 * Unit tests for Electron preload script chat API.
 *
 * Tests the chat API exposure through contextBridge, including proper
 * IPC invocation, error handling, and event listener management.
 *
 * @module electron/__tests__/preload.chat.test
 */

import type {
  SendToAgentsRequest,
  AgentUpdateEvent,
} from "../../shared/ipc/chat";

// Create mocks first
const mockContextBridge = {
  exposeInMainWorld: jest.fn(),
};

const mockIpcRenderer = {
  invoke: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
};

const mockLogger = {
  error: jest.fn(),
};

// Mock electron
jest.mock("electron", () => ({
  contextBridge: mockContextBridge,
  ipcRenderer: mockIpcRenderer,
  IpcRendererEvent: {},
}));

// Mock logger
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => mockLogger),
}));

describe("Preload Chat API", () => {
  const mockAgentUpdateEvent: AgentUpdateEvent = {
    conversationAgentId: "test-agent-id",
    status: "thinking",
  };

  const mockAgentCompleteEvent: AgentUpdateEvent = {
    conversationAgentId: "test-agent-id",
    status: "complete",
    messageId: "test-message-id",
  };

  const mockAgentErrorEvent: AgentUpdateEvent = {
    conversationAgentId: "test-agent-id",
    status: "error",
    error: "Test error message",
  };

  let exposedAPI: any;
  let mockCallback: jest.Mock;

  beforeAll(() => {
    // Import preload to trigger setup
    require("../preload");

    // Get the exposed API
    const calls = mockContextBridge.exposeInMainWorld.mock.calls;
    const electronAPICall = calls.find((call) => call[0] === "electronAPI");
    if (electronAPICall) {
      exposedAPI = electronAPICall[1];
    }
  });

  beforeEach(() => {
    // Clear IPC mock calls but keep the exposed API
    mockIpcRenderer.invoke.mockClear();
    mockIpcRenderer.on.mockClear();
    mockIpcRenderer.removeListener.mockClear();
    mockLogger.error.mockClear();
    mockCallback = jest.fn();
  });

  describe("chat.sendToAgents", () => {
    const conversationId = "test-conversation-id";
    const userMessageId = "test-user-message-id";

    it("should invoke correct IPC channel with proper request structure", async () => {
      mockIpcRenderer.invoke.mockResolvedValue(undefined);

      await exposedAPI.chat.sendToAgents(conversationId, userMessageId);

      const expectedRequest: SendToAgentsRequest = {
        conversationId,
        userMessageId,
      };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "chat:sendToAgents",
        expectedRequest,
      );
    });

    it("should return void on successful invocation", async () => {
      mockIpcRenderer.invoke.mockResolvedValue(undefined);

      const result = await exposedAPI.chat.sendToAgents(
        conversationId,
        userMessageId,
      );

      expect(result).toBeUndefined();
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(
        exposedAPI.chat.sendToAgents(conversationId, userMessageId),
      ).rejects.toThrow("IPC error");
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(
        exposedAPI.chat.sendToAgents(conversationId, userMessageId),
      ).rejects.toThrow("Failed to communicate with main process");
    });

    it("should log errors when sendToAgents fails", async () => {
      const error = new Error("Send failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.chat.sendToAgents(conversationId, userMessageId);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error sending to agents:",
        error,
      );
    });

    it("should convert non-Error objects to Error for logging", async () => {
      const nonError = "string error";
      mockIpcRenderer.invoke.mockRejectedValue(nonError);

      try {
        await exposedAPI.chat.sendToAgents(conversationId, userMessageId);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error sending to agents:",
        expect.any(Error),
      );
    });
  });

  describe("chat.onAgentUpdate", () => {
    it("should register IPC listener for agent update events", () => {
      const cleanup = exposedAPI.chat.onAgentUpdate(mockCallback);

      expect(mockIpcRenderer.on).toHaveBeenCalledWith(
        "agent:update",
        expect.any(Function),
      );
      expect(typeof cleanup).toBe("function");
    });

    it("should invoke callback with event data when agent update received", () => {
      exposedAPI.chat.onAgentUpdate(mockCallback);

      // Get the registered callback from the mock
      const registeredCallback = mockIpcRenderer.on.mock.calls[0][1];

      // Simulate IPC event with mock IpcRendererEvent and event data
      registeredCallback({}, mockAgentUpdateEvent);

      expect(mockCallback).toHaveBeenCalledWith(mockAgentUpdateEvent);
    });

    it("should handle thinking status events", () => {
      exposedAPI.chat.onAgentUpdate(mockCallback);

      const registeredCallback = mockIpcRenderer.on.mock.calls[0][1];
      registeredCallback({}, mockAgentUpdateEvent);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationAgentId: "test-agent-id",
          status: "thinking",
        }),
      );
    });

    it("should handle complete status events with messageId", () => {
      exposedAPI.chat.onAgentUpdate(mockCallback);

      const registeredCallback = mockIpcRenderer.on.mock.calls[0][1];
      registeredCallback({}, mockAgentCompleteEvent);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationAgentId: "test-agent-id",
          status: "complete",
          messageId: "test-message-id",
        }),
      );
    });

    it("should handle error status events with error message", () => {
      exposedAPI.chat.onAgentUpdate(mockCallback);

      const registeredCallback = mockIpcRenderer.on.mock.calls[0][1];
      registeredCallback({}, mockAgentErrorEvent);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationAgentId: "test-agent-id",
          status: "error",
          error: "Test error message",
        }),
      );
    });

    it("should remove IPC listener when cleanup function is called", () => {
      const cleanup = exposedAPI.chat.onAgentUpdate(mockCallback);

      cleanup();

      expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
        "agent:update",
        expect.any(Function),
      );
    });

    it("should log errors when callback throws", () => {
      const callbackError = new Error("Callback error");
      mockCallback.mockImplementation(() => {
        throw callbackError;
      });

      exposedAPI.chat.onAgentUpdate(mockCallback);

      const registeredCallback = mockIpcRenderer.on.mock.calls[0][1];
      registeredCallback({}, mockAgentUpdateEvent);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error in agent update callback:",
        callbackError,
      );
    });

    it("should log errors when removeListener fails", () => {
      const removeError = new Error("Remove listener failed");
      mockIpcRenderer.removeListener.mockImplementation(() => {
        throw removeError;
      });

      const cleanup = exposedAPI.chat.onAgentUpdate(mockCallback);
      cleanup();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error removing agent update listener:",
        removeError,
      );
    });

    it("should return no-op cleanup function when setup fails", () => {
      const setupError = new Error("Setup failed");
      mockIpcRenderer.on.mockImplementation(() => {
        throw setupError;
      });

      const cleanup = exposedAPI.chat.onAgentUpdate(mockCallback);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error setting up agent update listener:",
        setupError,
      );
      expect(typeof cleanup).toBe("function");

      // Cleanup should not throw even if it's a no-op
      expect(() => cleanup()).not.toThrow();
    });

    it("should handle multiple concurrent listeners", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const cleanup1 = exposedAPI.chat.onAgentUpdate(callback1);
      const cleanup2 = exposedAPI.chat.onAgentUpdate(callback2);

      expect(mockIpcRenderer.on).toHaveBeenCalledTimes(2);
      expect(typeof cleanup1).toBe("function");
      expect(typeof cleanup2).toBe("function");
    });
  });

  describe("contextBridge integration", () => {
    it("should expose chat API through electronAPI", () => {
      expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
        "electronAPI",
        expect.objectContaining({
          chat: expect.objectContaining({
            sendToAgents: expect.any(Function),
            onAgentUpdate: expect.any(Function),
          }),
        }),
      );
    });

    it("should maintain existing API structure", () => {
      expect(exposedAPI).toHaveProperty("platform");
      expect(exposedAPI).toHaveProperty("versions");
      expect(exposedAPI).toHaveProperty("onOpenSettings");
      expect(exposedAPI).toHaveProperty("removeAllListeners");
      expect(exposedAPI).toHaveProperty("settings");
      expect(exposedAPI).toHaveProperty("llmConfig");
      expect(exposedAPI).toHaveProperty("conversations");
      expect(exposedAPI).toHaveProperty("messages");
      expect(exposedAPI).toHaveProperty("chat");
    });

    it("should have all required chat methods", () => {
      expect(exposedAPI.chat).toHaveProperty("sendToAgents");
      expect(exposedAPI.chat).toHaveProperty("onAgentUpdate");
      expect(typeof exposedAPI.chat.sendToAgents).toBe("function");
      expect(typeof exposedAPI.chat.onAgentUpdate).toBe("function");
    });
  });

  describe("security boundaries", () => {
    it("should not expose raw IPC event objects to callbacks", () => {
      const mockEvent = { sender: "mock-sender", channel: "mock-channel" };
      exposedAPI.chat.onAgentUpdate(mockCallback);

      const registeredCallback = mockIpcRenderer.on.mock.calls[0][1];
      registeredCallback(mockEvent, mockAgentUpdateEvent);

      // Callback should only receive the event data, not the IPC event object
      expect(mockCallback).toHaveBeenCalledWith(mockAgentUpdateEvent);
      expect(mockCallback).not.toHaveBeenCalledWith(
        mockEvent,
        expect.anything(),
      );
    });

    it("should wrap callbacks to prevent event object exposure", () => {
      exposedAPI.chat.onAgentUpdate(mockCallback);

      // Verify that the registered callback is a wrapper, not the original callback
      const registeredCallback = mockIpcRenderer.on.mock.calls[0][1];
      expect(registeredCallback).not.toBe(mockCallback);
      expect(typeof registeredCallback).toBe("function");
    });
  });
});

/**
 * Unit tests for Electron preload script messages API.
 *
 * Tests the messages API exposure through contextBridge, including proper
 * IPC invocation, error handling, and parameter validation.
 *
 * @module electron/__tests__/preload.messages.test
 */

import type {
  MessagesListRequest,
  MessagesListResponse,
  MessagesCreateRequest,
  MessagesCreateResponse,
  MessagesUpdateInclusionRequest,
  MessagesUpdateInclusionResponse,
} from "../../shared/ipc/index";
import type { Message, CreateMessageInput } from "@fishbowl-ai/shared";

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
}));

// Mock logger
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => mockLogger),
}));

describe("Preload Messages API", () => {
  const mockMessage: Message = {
    id: "test-message-id",
    conversation_id: "test-conversation-id",
    role: "user",
    content: "Test message content",
    included: true,
    conversation_agent_id: null,
    created_at: "2025-01-01T00:00:00.000Z",
  };

  const mockMessages: Message[] = [
    mockMessage,
    {
      id: "test-message-2",
      conversation_id: "test-conversation-id",
      role: "agent",
      content: "Test agent response",
      included: true,
      conversation_agent_id: "test-agent-id",
      created_at: "2025-01-01T01:00:00.000Z",
    },
  ];

  const mockCreateInput: CreateMessageInput = {
    conversation_id: "test-conversation-id",
    role: "user",
    content: "Test message content",
  };

  let exposedAPI: any;

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
    mockLogger.error.mockClear();
  });

  describe("messages.list", () => {
    const conversationId = "test-conversation-id";

    it("should invoke correct IPC channel and return data on success", async () => {
      const response: MessagesListResponse = {
        success: true,
        data: mockMessages,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.messages.list(conversationId);

      const expectedRequest: MessagesListRequest = { conversationId };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "messages:list",
        expectedRequest,
      );
      expect(result).toEqual(mockMessages);
    });

    it("should return empty array when data is null or undefined", async () => {
      const response: MessagesListResponse = {
        success: true,
        data: undefined,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.messages.list(conversationId);

      expect(result).toEqual([]);
    });

    it("should throw error when response indicates failure", async () => {
      const response: MessagesListResponse = {
        success: false,
        error: { message: "List failed", code: "LIST_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.messages.list(conversationId)).rejects.toThrow(
        "List failed",
      );
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: MessagesListResponse = {
        success: false,
        error: { message: "", code: "LIST_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.messages.list(conversationId)).rejects.toThrow(
        "Failed to list messages",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.messages.list(conversationId)).rejects.toThrow(
        "IPC error",
      );
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.messages.list(conversationId)).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("messages.create", () => {
    it("should invoke correct IPC channel and return data on success", async () => {
      const response: MessagesCreateResponse = {
        success: true,
        data: mockMessage,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.messages.create(mockCreateInput);

      const expectedRequest: MessagesCreateRequest = { input: mockCreateInput };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "messages:create",
        expectedRequest,
      );
      expect(result).toEqual(mockMessage);
    });

    it("should throw error when response indicates failure", async () => {
      const response: MessagesCreateResponse = {
        success: false,
        error: { message: "Create failed", code: "CREATE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.messages.create(mockCreateInput)).rejects.toThrow(
        "Create failed",
      );
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: MessagesCreateResponse = {
        success: false,
        error: { message: "", code: "CREATE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.messages.create(mockCreateInput)).rejects.toThrow(
        "Failed to create message",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.messages.create(mockCreateInput)).rejects.toThrow(
        "IPC error",
      );
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.messages.create(mockCreateInput)).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("messages.updateInclusion", () => {
    const messageId = "test-message-id";
    const included = false;
    const updatedMessage: Message = {
      ...mockMessage,
      included: false,
    };

    it("should invoke correct IPC channel and return updated data on success", async () => {
      const response: MessagesUpdateInclusionResponse = {
        success: true,
        data: updatedMessage,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.messages.updateInclusion(
        messageId,
        included,
      );

      const expectedRequest: MessagesUpdateInclusionRequest = {
        id: messageId,
        included,
      };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "messages:updateInclusion",
        expectedRequest,
      );
      expect(result).toEqual(updatedMessage);
    });

    it("should handle updating inclusion to true", async () => {
      const includedTrue = true;
      const updatedMessageTrue: Message = {
        ...mockMessage,
        included: true,
      };

      const response: MessagesUpdateInclusionResponse = {
        success: true,
        data: updatedMessageTrue,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.messages.updateInclusion(
        messageId,
        includedTrue,
      );

      const expectedRequest: MessagesUpdateInclusionRequest = {
        id: messageId,
        included: includedTrue,
      };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "messages:updateInclusion",
        expectedRequest,
      );
      expect(result).toEqual(updatedMessageTrue);
    });

    it("should throw error when response indicates failure", async () => {
      const response: MessagesUpdateInclusionResponse = {
        success: false,
        error: { message: "Update failed", code: "UPDATE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(
        exposedAPI.messages.updateInclusion(messageId, included),
      ).rejects.toThrow("Update failed");
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: MessagesUpdateInclusionResponse = {
        success: false,
        error: { message: "", code: "UPDATE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(
        exposedAPI.messages.updateInclusion(messageId, included),
      ).rejects.toThrow("Failed to update message inclusion");
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(
        exposedAPI.messages.updateInclusion(messageId, included),
      ).rejects.toThrow("IPC error");
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(
        exposedAPI.messages.updateInclusion(messageId, included),
      ).rejects.toThrow("Failed to communicate with main process");
    });
  });

  describe("contextBridge integration", () => {
    it("should expose messages API through electronAPI", () => {
      expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
        "electronAPI",
        expect.objectContaining({
          messages: expect.objectContaining({
            list: expect.any(Function),
            create: expect.any(Function),
            updateInclusion: expect.any(Function),
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
    });

    it("should have all required messages methods", () => {
      expect(exposedAPI.messages).toHaveProperty("list");
      expect(exposedAPI.messages).toHaveProperty("create");
      expect(exposedAPI.messages).toHaveProperty("updateInclusion");
      expect(typeof exposedAPI.messages.list).toBe("function");
      expect(typeof exposedAPI.messages.create).toBe("function");
      expect(typeof exposedAPI.messages.updateInclusion).toBe("function");
    });
  });

  describe("error logging", () => {
    it("should log errors when list fails", async () => {
      const error = new Error("List failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.messages.list("test-conversation-id");
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error listing messages:",
        error,
      );
    });

    it("should log errors when create fails", async () => {
      const error = new Error("Create failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.messages.create(mockCreateInput);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error creating message:",
        error,
      );
    });

    it("should log errors when updateInclusion fails", async () => {
      const error = new Error("Update failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.messages.updateInclusion("test-id", true);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error updating message inclusion:",
        error,
      );
    });

    it("should convert non-Error objects to Error for logging", async () => {
      const nonError = "string error";
      mockIpcRenderer.invoke.mockRejectedValue(nonError);

      try {
        await exposedAPI.messages.list("test-conversation-id");
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error listing messages:",
        expect.any(Error),
      );
    });
  });
});

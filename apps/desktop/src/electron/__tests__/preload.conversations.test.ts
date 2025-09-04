/**
 * Unit tests for Electron preload script conversations API.
 *
 * Tests the conversations API exposure through contextBridge, including proper
 * IPC invocation, error handling, and parameter validation.
 *
 * @module electron/__tests__/preload.conversations.test
 */

import type {
  ConversationsCreateRequest,
  ConversationsCreateResponse,
  ConversationsListResponse,
  ConversationsGetRequest,
  ConversationsGetResponse,
  ConversationsUpdateRequest,
  ConversationsUpdateResponse,
  ConversationsDeleteRequest,
  ConversationsDeleteResponse,
} from "../../shared/ipc/index";
import type {
  Conversation,
  UpdateConversationInput,
} from "@fishbowl-ai/shared";

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

describe("Preload Conversations API", () => {
  const mockConversation: Conversation = {
    id: "test-conversation-id",
    title: "Test Conversation",
    chat_mode: "manual",
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  };

  const mockConversations: Conversation[] = [
    mockConversation,
    {
      id: "test-conversation-2",
      title: "Another Conversation",
      chat_mode: "round-robin",
      created_at: "2025-01-01T01:00:00.000Z",
      updated_at: "2025-01-01T01:00:00.000Z",
    },
  ];

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

  describe("conversations.create", () => {
    it("should invoke correct IPC channel and return data on success", async () => {
      const response: ConversationsCreateResponse = {
        success: true,
        data: mockConversation,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.create("Test Title");

      const expectedRequest: ConversationsCreateRequest = {
        title: "Test Title",
      };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "conversations:create",
        expectedRequest,
      );
      expect(result).toEqual(mockConversation);
    });

    it("should handle create without title", async () => {
      const response: ConversationsCreateResponse = {
        success: true,
        data: mockConversation,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.create();

      const expectedRequest: ConversationsCreateRequest = { title: undefined };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "conversations:create",
        expectedRequest,
      );
      expect(result).toEqual(mockConversation);
    });

    it("should throw error when response indicates failure", async () => {
      const response: ConversationsCreateResponse = {
        success: false,
        error: { message: "Create failed", code: "CREATE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.conversations.create("Test")).rejects.toThrow(
        "Create failed",
      );
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: ConversationsCreateResponse = {
        success: false,
        error: { message: "", code: "CREATE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.conversations.create("Test")).rejects.toThrow(
        "Failed to create conversation",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.conversations.create("Test")).rejects.toThrow(
        "IPC error",
      );
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.conversations.create("Test")).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("conversations.list", () => {
    it("should invoke correct IPC channel and return data on success", async () => {
      const response: ConversationsListResponse = {
        success: true,
        data: mockConversations,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.list();

      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "conversations:list",
        {},
      );
      expect(result).toEqual(mockConversations);
    });

    it("should return empty array when data is null or undefined", async () => {
      const response: ConversationsListResponse = {
        success: true,
        data: undefined,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.list();

      expect(result).toEqual([]);
    });

    it("should throw error when response indicates failure", async () => {
      const response: ConversationsListResponse = {
        success: false,
        error: { message: "List failed", code: "LIST_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.conversations.list()).rejects.toThrow(
        "List failed",
      );
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: ConversationsListResponse = {
        success: false,
        error: { message: "", code: "LIST_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.conversations.list()).rejects.toThrow(
        "Failed to list conversations",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.conversations.list()).rejects.toThrow(
        "IPC error",
      );
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.conversations.list()).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("conversations.get", () => {
    const testId = "test-conversation-id";

    it("should invoke correct IPC channel and return data on success", async () => {
      const response: ConversationsGetResponse = {
        success: true,
        data: mockConversation,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.get(testId);

      const expectedRequest: ConversationsGetRequest = { id: testId };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "conversations:get",
        expectedRequest,
      );
      expect(result).toEqual(mockConversation);
    });

    it("should return null when conversation not found", async () => {
      const response: ConversationsGetResponse = {
        success: true,
        data: null,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.get(testId);

      expect(result).toBeNull();
    });

    it("should throw error when response indicates failure", async () => {
      const response: ConversationsGetResponse = {
        success: false,
        error: { message: "Get failed", code: "GET_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.conversations.get(testId)).rejects.toThrow(
        "Get failed",
      );
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: ConversationsGetResponse = {
        success: false,
        error: { message: "", code: "GET_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.conversations.get(testId)).rejects.toThrow(
        "Failed to get conversation",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.conversations.get(testId)).rejects.toThrow(
        "IPC error",
      );
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.conversations.get(testId)).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("conversations.update", () => {
    const testId = "test-conversation-id";
    const updateInput: UpdateConversationInput = { title: "Updated Title" };
    const updatedConversation: Conversation = {
      ...mockConversation,
      title: "Updated Title",
      updated_at: "2025-01-01T02:00:00.000Z",
    };

    it("should invoke correct IPC channel and return updated data on success", async () => {
      const response: ConversationsUpdateResponse = {
        success: true,
        data: updatedConversation,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.update(testId, updateInput);

      const expectedRequest: ConversationsUpdateRequest = {
        id: testId,
        updates: updateInput,
      };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "conversations:update",
        expectedRequest,
      );
      expect(result).toEqual(updatedConversation);
    });

    it("should throw error when response indicates failure", async () => {
      const response: ConversationsUpdateResponse = {
        success: false,
        error: { message: "Update failed", code: "UPDATE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(
        exposedAPI.conversations.update(testId, updateInput),
      ).rejects.toThrow("Update failed");
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: ConversationsUpdateResponse = {
        success: false,
        error: { message: "", code: "UPDATE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(
        exposedAPI.conversations.update(testId, updateInput),
      ).rejects.toThrow("Failed to update conversation");
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(
        exposedAPI.conversations.update(testId, updateInput),
      ).rejects.toThrow("IPC error");
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(
        exposedAPI.conversations.update(testId, updateInput),
      ).rejects.toThrow("Failed to communicate with main process");
    });
  });

  describe("conversations.delete", () => {
    const testId = "test-conversation-id";

    it("should invoke correct IPC channel and return true on success", async () => {
      const response: ConversationsDeleteResponse = {
        success: true,
        data: true,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.delete(testId);

      const expectedRequest: ConversationsDeleteRequest = { id: testId };
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "conversations:delete",
        expectedRequest,
      );
      expect(result).toBe(true);
    });

    it("should return false when data is undefined", async () => {
      const response: ConversationsDeleteResponse = {
        success: true,
        data: undefined,
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      const result = await exposedAPI.conversations.delete(testId);

      expect(result).toBe(false);
    });

    it("should throw error when response indicates failure", async () => {
      const response: ConversationsDeleteResponse = {
        success: false,
        error: { message: "Delete failed", code: "DELETE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.conversations.delete(testId)).rejects.toThrow(
        "Delete failed",
      );
    });

    it("should throw error with default message when no error message provided", async () => {
      const response: ConversationsDeleteResponse = {
        success: false,
        error: { message: "", code: "DELETE_ERROR" },
      };

      mockIpcRenderer.invoke.mockResolvedValue(response);

      await expect(exposedAPI.conversations.delete(testId)).rejects.toThrow(
        "Failed to delete conversation",
      );
    });

    it("should handle IPC communication errors", async () => {
      mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC error"));

      await expect(exposedAPI.conversations.delete(testId)).rejects.toThrow(
        "IPC error",
      );
    });

    it("should handle non-Error rejections", async () => {
      mockIpcRenderer.invoke.mockRejectedValue("string error");

      await expect(exposedAPI.conversations.delete(testId)).rejects.toThrow(
        "Failed to communicate with main process",
      );
    });
  });

  describe("contextBridge integration", () => {
    it("should expose conversations API through electronAPI", () => {
      expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
        "electronAPI",
        expect.objectContaining({
          conversations: expect.objectContaining({
            create: expect.any(Function),
            list: expect.any(Function),
            get: expect.any(Function),
            update: expect.any(Function),
            delete: expect.any(Function),
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
      expect(exposedAPI).toHaveProperty("roles");
      expect(exposedAPI).toHaveProperty("conversations");
    });

    it("should have all required conversations methods", () => {
      expect(exposedAPI.conversations).toHaveProperty("create");
      expect(exposedAPI.conversations).toHaveProperty("list");
      expect(exposedAPI.conversations).toHaveProperty("get");
      expect(exposedAPI.conversations).toHaveProperty("update");
      expect(exposedAPI.conversations).toHaveProperty("delete");
      expect(typeof exposedAPI.conversations.create).toBe("function");
      expect(typeof exposedAPI.conversations.list).toBe("function");
      expect(typeof exposedAPI.conversations.get).toBe("function");
      expect(typeof exposedAPI.conversations.update).toBe("function");
      expect(typeof exposedAPI.conversations.delete).toBe("function");
    });
  });

  describe("error logging", () => {
    it("should log errors when create fails", async () => {
      const error = new Error("Create failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.conversations.create("Test");
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error creating conversation:",
        error,
      );
    });

    it("should log errors when list fails", async () => {
      const error = new Error("List failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.conversations.list();
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error listing conversations:",
        error,
      );
    });

    it("should log errors when get fails", async () => {
      const error = new Error("Get failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.conversations.get("test-id");
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error getting conversation:",
        error,
      );
    });

    it("should log errors when update fails", async () => {
      const error = new Error("Update failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.conversations.update("test-id", {
          title: "New Title",
        });
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error updating conversation:",
        error,
      );
    });

    it("should log errors when delete fails", async () => {
      const error = new Error("Delete failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      try {
        await exposedAPI.conversations.delete("test-id");
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error deleting conversation:",
        error,
      );
    });

    it("should convert non-Error objects to Error for logging", async () => {
      const nonError = "string error";
      mockIpcRenderer.invoke.mockRejectedValue(nonError);

      try {
        await exposedAPI.conversations.create("Test");
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error creating conversation:",
        expect.any(Error),
      );
    });
  });
});

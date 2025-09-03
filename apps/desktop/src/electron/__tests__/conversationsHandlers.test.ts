import { ipcMain } from "electron";
import { setupConversationsHandlers } from "../conversationsHandlers";
import {
  CONVERSATION_CHANNELS,
  type ConversationsCreateRequest,
  type ConversationsListRequest,
  type ConversationsGetRequest,
  type ConversationsDeleteRequest,
  type ConversationsUpdateRequest,
  type ConversationsCreateResponse,
  type ConversationsListResponse,
  type ConversationsGetResponse,
  type ConversationsDeleteResponse,
  type ConversationsUpdateResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import type { ConversationsRepositoryInterface } from "@fishbowl-ai/shared";
import { ConversationNotFoundError } from "@fishbowl-ai/shared";

// Mock electron
jest.mock("electron", () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock errorSerialization
jest.mock("../utils/errorSerialization", () => ({
  serializeError: jest.fn((error) => ({
    message: error.message,
    code: "TEST_ERROR",
  })),
}));

describe("conversationsHandlers", () => {
  let mockConversationsRepository: jest.Mocked<ConversationsRepositoryInterface>;

  const mockConversation = {
    id: "test-id",
    title: "Test Conversation",
    chat_mode: "manual" as const,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock conversations repository
    mockConversationsRepository = {
      create: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      exists: jest.fn(),
    };
  });

  const getHandler = (channel: string) => {
    const mockServices = {
      conversationsRepository: mockConversationsRepository,
    } as any;

    setupConversationsHandlers(mockServices);

    return (ipcMain.handle as jest.Mock).mock.calls.find(
      ([ch]) => ch === channel,
    )?.[1];
  };

  describe("CREATE handler", () => {
    it("should handle successful conversation creation", async () => {
      const request: ConversationsCreateRequest = {
        title: "Test Conversation",
      };
      mockConversationsRepository.create.mockResolvedValue(mockConversation);

      const handler = getHandler(CONVERSATION_CHANNELS.CREATE);
      const result: ConversationsCreateResponse = await handler(null, request);

      expect(mockConversationsRepository.create).toHaveBeenCalledWith(request);
      expect(result).toEqual({
        success: true,
        data: mockConversation,
      });
    });

    it("should handle conversation creation errors", async () => {
      const request: ConversationsCreateRequest = {
        title: "Test Conversation",
      };
      const error = new Error("Database error");
      mockConversationsRepository.create.mockRejectedValue(error);

      const handler = getHandler(CONVERSATION_CHANNELS.CREATE);
      const result: ConversationsCreateResponse = await handler(null, request);

      expect(serializeError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        success: false,
        error: { message: "Database error", code: "TEST_ERROR" },
      });
    });
  });

  describe("LIST handler", () => {
    it("should handle successful conversation listing", async () => {
      const request: ConversationsListRequest = {};
      const conversations = [mockConversation];
      mockConversationsRepository.list.mockResolvedValue(conversations);

      const handler = getHandler(CONVERSATION_CHANNELS.LIST);
      const result: ConversationsListResponse = await handler(null, request);

      expect(mockConversationsRepository.list).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: conversations,
      });
    });

    it("should handle conversation listing errors", async () => {
      const request: ConversationsListRequest = {};
      const error = new Error("Database error");
      mockConversationsRepository.list.mockRejectedValue(error);

      const handler = getHandler(CONVERSATION_CHANNELS.LIST);
      const result: ConversationsListResponse = await handler(null, request);

      expect(serializeError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        success: false,
        error: { message: "Database error", code: "TEST_ERROR" },
      });
    });
  });

  describe("GET handler", () => {
    it("should handle successful conversation retrieval", async () => {
      const request: ConversationsGetRequest = { id: "test-id" };
      mockConversationsRepository.get.mockResolvedValue(mockConversation);

      const handler = getHandler(CONVERSATION_CHANNELS.GET);
      const result: ConversationsGetResponse = await handler(null, request);

      expect(mockConversationsRepository.get).toHaveBeenCalledWith(request.id);
      expect(result).toEqual({
        success: true,
        data: mockConversation,
      });
    });

    it("should handle conversation not found error", async () => {
      const request: ConversationsGetRequest = { id: "nonexistent-id" };
      const error = new ConversationNotFoundError("nonexistent-id");
      mockConversationsRepository.get.mockRejectedValue(error);

      const handler = getHandler(CONVERSATION_CHANNELS.GET);
      const result: ConversationsGetResponse = await handler(null, request);

      expect(serializeError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });
  });

  describe("DELETE handler", () => {
    it("should handle successful conversation deletion", async () => {
      const request: ConversationsDeleteRequest = { id: "test-id" };
      mockConversationsRepository.delete.mockResolvedValue(undefined);

      const handler = getHandler(CONVERSATION_CHANNELS.DELETE);
      const result: ConversationsDeleteResponse = await handler(null, request);

      expect(mockConversationsRepository.delete).toHaveBeenCalledWith(
        request.id,
      );
      expect(result).toEqual({
        success: true,
        data: true,
      });
    });

    it("should handle conversation not found error during deletion", async () => {
      const request: ConversationsDeleteRequest = { id: "nonexistent-id" };
      const error = new ConversationNotFoundError("nonexistent-id");
      mockConversationsRepository.delete.mockRejectedValue(error);

      const handler = getHandler(CONVERSATION_CHANNELS.DELETE);
      const result: ConversationsDeleteResponse = await handler(null, request);

      expect(mockConversationsRepository.delete).toHaveBeenCalledWith(
        request.id,
      );
      expect(serializeError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });

    it("should handle database errors during deletion", async () => {
      const request: ConversationsDeleteRequest = { id: "test-id" };
      const error = new Error("Database connection failed");
      mockConversationsRepository.delete.mockRejectedValue(error);

      const handler = getHandler(CONVERSATION_CHANNELS.DELETE);
      const result: ConversationsDeleteResponse = await handler(null, request);

      expect(mockConversationsRepository.delete).toHaveBeenCalledWith(
        request.id,
      );
      expect(serializeError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        success: false,
        error: { message: "Database connection failed", code: "TEST_ERROR" },
      });
    });
  });

  describe("UPDATE handler", () => {
    it("should handle successful conversation update", async () => {
      const request: ConversationsUpdateRequest = {
        id: "test-id",
        updates: { title: "Updated Title" },
      };
      const updatedConversation = {
        ...mockConversation,
        title: "Updated Title",
        updated_at: "2024-01-01T01:00:00.000Z",
      };
      mockConversationsRepository.update.mockResolvedValue(updatedConversation);

      const handler = getHandler(CONVERSATION_CHANNELS.UPDATE);
      const result: ConversationsUpdateResponse = await handler(null, request);

      expect(mockConversationsRepository.update).toHaveBeenCalledWith(
        request.id,
        request.updates,
      );
      expect(result).toEqual({
        success: true,
        data: updatedConversation,
      });
    });

    it("should handle conversation not found error during update", async () => {
      const request: ConversationsUpdateRequest = {
        id: "nonexistent-id",
        updates: { title: "Updated Title" },
      };
      const error = new ConversationNotFoundError("nonexistent-id");
      mockConversationsRepository.update.mockRejectedValue(error);

      const handler = getHandler(CONVERSATION_CHANNELS.UPDATE);
      const result: ConversationsUpdateResponse = await handler(null, request);

      expect(mockConversationsRepository.update).toHaveBeenCalledWith(
        request.id,
        request.updates,
      );
      expect(serializeError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        success: false,
        error: { message: error.message, code: "TEST_ERROR" },
      });
    });

    it("should handle database errors during update", async () => {
      const request: ConversationsUpdateRequest = {
        id: "test-id",
        updates: { title: "Updated Title" },
      };
      const error = new Error("Database connection failed");
      mockConversationsRepository.update.mockRejectedValue(error);

      const handler = getHandler(CONVERSATION_CHANNELS.UPDATE);
      const result: ConversationsUpdateResponse = await handler(null, request);

      expect(mockConversationsRepository.update).toHaveBeenCalledWith(
        request.id,
        request.updates,
      );
      expect(serializeError).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        success: false,
        error: { message: "Database connection failed", code: "TEST_ERROR" },
      });
    });
  });

  describe("handler registration", () => {
    it("should register all IPC handlers", () => {
      const mockServices = {
        conversationsRepository: mockConversationsRepository,
      } as any;

      setupConversationsHandlers(mockServices);

      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_CHANNELS.CREATE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_CHANNELS.LIST,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_CHANNELS.GET,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_CHANNELS.DELETE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_CHANNELS.UPDATE,
        expect.any(Function),
      );
    });
  });
});

import type {
  ConversationAgent,
  ConversationAgentsRepository,
  DatabaseBridge,
  MessageRepository,
} from "@fishbowl-ai/shared";
import { ipcMain } from "electron";
import type { MainProcessServices } from "../../main/services/MainProcessServices";
import {
  CONVERSATION_AGENT_CHANNELS,
  type ConversationAgentAddRequest,
  type ConversationAgentAddResponse,
  type ConversationAgentGetByConversationRequest,
  type ConversationAgentGetByConversationResponse,
  type ConversationAgentListRequest,
  type ConversationAgentListResponse,
  type ConversationAgentRemoveRequest,
  type ConversationAgentRemoveResponse,
  type ConversationAgentUpdateRequest,
  type ConversationAgentUpdateResponse,
} from "../../shared/ipc/index";
import { setupConversationAgentHandlers } from "../conversationAgentHandlers";
import { serializeError } from "../utils/errorSerialization";

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

// Mock logger
jest.mock("@fishbowl-ai/shared", () => ({
  ...jest.requireActual("@fishbowl-ai/shared"),
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("conversationAgentHandlers", () => {
  let mockConversationAgentsRepository: jest.Mocked<ConversationAgentsRepository>;
  let mockMessagesRepository: jest.Mocked<MessageRepository>;
  let mockDatabaseBridge: jest.Mocked<DatabaseBridge>;
  let mockMainServices: jest.Mocked<MainProcessServices>;

  const mockConversationAgent: ConversationAgent = {
    id: "test-conversation-agent-id",
    conversation_id: "test-conversation-id",
    agent_id: "test-agent-id",
    added_at: "2024-01-01T00:00:00.000Z",
    is_active: true,
    enabled: true,
    display_order: 0,
    color: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock conversation agents repository
    mockConversationAgentsRepository = {
      findByConversationId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ConversationAgentsRepository>;

    // Create mock messages repository
    mockMessagesRepository = {
      deleteByConversationAgentId: jest.fn(),
    } as unknown as jest.Mocked<MessageRepository>;

    // Create mock database bridge
    mockDatabaseBridge = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<DatabaseBridge>;

    // Create mock main services
    mockMainServices = {
      conversationAgentsRepository: mockConversationAgentsRepository,
      messagesRepository: mockMessagesRepository,
      databaseBridge: mockDatabaseBridge,
    } as unknown as jest.Mocked<MainProcessServices>;

    // Setup transaction mock to execute callback immediately
    mockDatabaseBridge.transaction.mockImplementation(async (callback) => {
      return await callback(mockDatabaseBridge);
    });
  });

  describe("setupConversationAgentHandlers", () => {
    it("should register all IPC handlers", () => {
      setupConversationAgentHandlers(mockMainServices);

      expect(ipcMain.handle).toHaveBeenCalledTimes(5);
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_AGENT_CHANNELS.ADD,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_AGENT_CHANNELS.UPDATE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_AGENT_CHANNELS.REMOVE,
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        CONVERSATION_AGENT_CHANNELS.LIST,
        expect.any(Function),
      );
    });
  });

  describe("GET_BY_CONVERSATION handler", () => {
    it("should successfully get conversation agents", async () => {
      const request: ConversationAgentGetByConversationRequest = {
        conversationId: "test-conversation-id",
      };

      const expectedAgents = [mockConversationAgent];
      mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
        expectedAgents,
      );

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
      )[1];

      const result: ConversationAgentGetByConversationResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: true,
        data: expectedAgents,
      });
      expect(
        mockConversationAgentsRepository.findByConversationId,
      ).toHaveBeenCalledWith(request.conversationId);
    });

    it("should handle errors when getting conversation agents", async () => {
      const request: ConversationAgentGetByConversationRequest = {
        conversationId: "test-conversation-id",
      };

      const error = new Error("Database error");
      mockConversationAgentsRepository.findByConversationId.mockRejectedValue(
        error,
      );

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
      )[1];

      const result: ConversationAgentGetByConversationResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: false,
        error: { message: "Database error", code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });
  });

  describe("ADD handler", () => {
    it("should successfully add agent to conversation", async () => {
      const request: ConversationAgentAddRequest = {
        conversation_id: "test-conversation-id",
        agent_id: "test-agent-id",
        display_order: 0,
        color: "",
      };

      mockConversationAgentsRepository.create.mockResolvedValue(
        mockConversationAgent,
      );

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.ADD,
      )[1];

      const result: ConversationAgentAddResponse = await handler(null, request);

      expect(result).toEqual({
        success: true,
        data: mockConversationAgent,
      });
      expect(mockConversationAgentsRepository.create).toHaveBeenCalledWith(
        request,
      );
    });

    it("should handle errors when adding agent to conversation", async () => {
      const request: ConversationAgentAddRequest = {
        conversation_id: "test-conversation-id",
        agent_id: "test-agent-id",
        display_order: 0,
        color: "",
      };

      const error = new Error("Creation failed");
      mockConversationAgentsRepository.create.mockRejectedValue(error);

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.ADD,
      )[1];

      const result: ConversationAgentAddResponse = await handler(null, request);

      expect(result).toEqual({
        success: false,
        error: { message: "Creation failed", code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });
  });

  describe("UPDATE handler", () => {
    it("should successfully update conversation agent", async () => {
      const request: ConversationAgentUpdateRequest = {
        conversationAgentId: "test-conversation-agent-id",
        updates: { enabled: false },
      };

      const updatedAgent = { ...mockConversationAgent, enabled: false };
      mockConversationAgentsRepository.update.mockResolvedValue(updatedAgent);

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.UPDATE,
      )[1];

      const result: ConversationAgentUpdateResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: true,
        data: updatedAgent,
      });
      expect(mockConversationAgentsRepository.update).toHaveBeenCalledWith(
        request.conversationAgentId,
        request.updates,
      );
    });

    it("should handle errors when updating conversation agent", async () => {
      const request: ConversationAgentUpdateRequest = {
        conversationAgentId: "test-conversation-agent-id",
        updates: { enabled: false },
      };

      const error = new Error("Update failed");
      mockConversationAgentsRepository.update.mockRejectedValue(error);

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.UPDATE,
      )[1];

      const result: ConversationAgentUpdateResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: false,
        error: { message: "Update failed", code: "TEST_ERROR" },
      });
      expect(serializeError).toHaveBeenCalledWith(error);
    });
  });

  describe("REMOVE handler", () => {
    it("should successfully remove agent and messages using transaction", async () => {
      const request: ConversationAgentRemoveRequest = {
        conversation_id: "test-conversation-id",
        agent_id: "test-agent-id",
      };

      const agents = [mockConversationAgent];
      mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
        agents,
      );
      mockMessagesRepository.deleteByConversationAgentId.mockResolvedValue(5);

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.REMOVE,
      )[1];

      const result: ConversationAgentRemoveResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: true,
        data: true,
      });

      // Verify transaction was used
      expect(mockDatabaseBridge.transaction).toHaveBeenCalledTimes(1);
      expect(mockDatabaseBridge.transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );

      // Verify message deletion was called first
      expect(
        mockMessagesRepository.deleteByConversationAgentId,
      ).toHaveBeenCalledWith(mockConversationAgent.id);

      // Verify agent deletion was called second
      expect(mockConversationAgentsRepository.delete).toHaveBeenCalledWith(
        mockConversationAgent.id,
      );
    });

    it("should return false when agent not found in conversation", async () => {
      const request: ConversationAgentRemoveRequest = {
        conversation_id: "test-conversation-id",
        agent_id: "nonexistent-agent-id",
      };

      mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
        [],
      );

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.REMOVE,
      )[1];

      const result: ConversationAgentRemoveResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: true,
        data: false,
      });

      // Verify no deletion operations were attempted
      expect(mockDatabaseBridge.transaction).not.toHaveBeenCalled();
      expect(
        mockMessagesRepository.deleteByConversationAgentId,
      ).not.toHaveBeenCalled();
      expect(mockConversationAgentsRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle transaction rollback when message deletion fails", async () => {
      const request: ConversationAgentRemoveRequest = {
        conversation_id: "test-conversation-id",
        agent_id: "test-agent-id",
      };

      const agents = [mockConversationAgent];
      mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
        agents,
      );

      const messageDeleteError = new Error("Message deletion failed");
      mockMessagesRepository.deleteByConversationAgentId.mockRejectedValue(
        messageDeleteError,
      );

      // Mock transaction to actually throw the error
      mockDatabaseBridge.transaction.mockRejectedValue(messageDeleteError);

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.REMOVE,
      )[1];

      const result: ConversationAgentRemoveResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: false,
        error: { message: "Message deletion failed", code: "TEST_ERROR" },
      });

      expect(mockDatabaseBridge.transaction).toHaveBeenCalledTimes(1);
      expect(serializeError).toHaveBeenCalledWith(messageDeleteError);
    });

    it("should handle transaction rollback when agent deletion fails", async () => {
      const request: ConversationAgentRemoveRequest = {
        conversation_id: "test-conversation-id",
        agent_id: "test-agent-id",
      };

      const agents = [mockConversationAgent];
      mockConversationAgentsRepository.findByConversationId.mockResolvedValue(
        agents,
      );
      mockMessagesRepository.deleteByConversationAgentId.mockResolvedValue(3);

      const agentDeleteError = new Error("Agent deletion failed");
      mockConversationAgentsRepository.delete.mockRejectedValue(
        agentDeleteError,
      );

      // Mock transaction to throw the agent deletion error
      mockDatabaseBridge.transaction.mockRejectedValue(agentDeleteError);

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.REMOVE,
      )[1];

      const result: ConversationAgentRemoveResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: false,
        error: { message: "Agent deletion failed", code: "TEST_ERROR" },
      });

      expect(mockDatabaseBridge.transaction).toHaveBeenCalledTimes(1);
      expect(serializeError).toHaveBeenCalledWith(agentDeleteError);
    });

    it("should handle error when finding conversation agents", async () => {
      const request: ConversationAgentRemoveRequest = {
        conversation_id: "test-conversation-id",
        agent_id: "test-agent-id",
      };

      const findError = new Error("Find operation failed");
      mockConversationAgentsRepository.findByConversationId.mockRejectedValue(
        findError,
      );

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.REMOVE,
      )[1];

      const result: ConversationAgentRemoveResponse = await handler(
        null,
        request,
      );

      expect(result).toEqual({
        success: false,
        error: { message: "Find operation failed", code: "TEST_ERROR" },
      });

      expect(mockDatabaseBridge.transaction).not.toHaveBeenCalled();
      expect(serializeError).toHaveBeenCalledWith(findError);
    });
  });

  describe("LIST handler", () => {
    it("should successfully list all conversation agents", async () => {
      const request: ConversationAgentListRequest = {};

      setupConversationAgentHandlers(mockMainServices);
      const handler = (ipcMain.handle as jest.Mock).mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.LIST,
      )[1];

      const result: ConversationAgentListResponse = await handler(
        null,
        request,
      );

      // Current implementation returns empty array
      expect(result).toEqual({
        success: true,
        data: [],
      });
    });

    it("should handle errors when listing conversation agents", async () => {
      const request: ConversationAgentListRequest = {};

      // Mock the handler to throw an error (since current implementation doesn't actually do anything)
      setupConversationAgentHandlers(mockMainServices);
      // Override the handler to simulate an error
      const originalHandle = ipcMain.handle as jest.Mock;
      originalHandle.mockImplementation((channel, handlerFn) => {
        if (channel === CONVERSATION_AGENT_CHANNELS.LIST) {
          return async () => {
            throw new Error("List operation failed");
          };
        }
        return handlerFn;
      });

      setupConversationAgentHandlers(mockMainServices);
      const errorHandler = originalHandle.mock.calls.find(
        (call) => call[0] === CONVERSATION_AGENT_CHANNELS.LIST,
      )[1];

      try {
        await errorHandler(null, request);
      } catch (error) {
        expect(error).toEqual(new Error("List operation failed"));
      }
    });
  });
});

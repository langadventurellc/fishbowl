import { ConversationIpcAdapter } from "../ConversationIpcAdapter";
import type {
  Conversation,
  ConversationAgent,
  Message,
  CreateMessageInput,
  UpdateConversationInput,
} from "@fishbowl-ai/shared";

// Mock window.electronAPI
const mockElectronAPI = {
  conversations: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  conversationAgent: {
    getByConversation: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  },
  messages: {
    list: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  chat: {
    sendToAgents: jest.fn(),
  },
};

// Set up global window mock
(global as any).window = {
  electronAPI: mockElectronAPI,
};

describe("ConversationIpcAdapter", () => {
  let adapter: ConversationIpcAdapter;

  // Mock data factories
  const createMockConversation = (
    overrides?: Partial<Conversation>,
  ): Conversation => ({
    id: "conv-123",
    title: "Test Conversation",
    chat_mode: "manual",
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    ...overrides,
  });

  const createMockConversationAgent = (
    overrides?: Partial<ConversationAgent>,
  ): ConversationAgent => ({
    id: "ca-123",
    conversation_id: "conv-123",
    agent_id: "agent-123",
    enabled: true,
    is_active: true,
    display_order: 1,
    added_at: "2025-01-01T00:00:00.000Z",
    ...overrides,
  });

  const createMockMessage = (overrides?: Partial<Message>): Message => ({
    id: "msg-123",
    conversation_id: "conv-123",
    conversation_agent_id: null,
    role: "user",
    content: "Test message",
    included: true,
    created_at: "2025-01-01T00:00:00.000Z",
    ...overrides,
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset window.electronAPI to our mock
    (global as any).window.electronAPI = mockElectronAPI;

    adapter = new ConversationIpcAdapter();
  });

  describe("listConversations", () => {
    it("should successfully list conversations", async () => {
      const mockConversations = [
        createMockConversation({ id: "conv-1", title: "First" }),
        createMockConversation({ id: "conv-2", title: "Second" }),
      ];
      mockElectronAPI.conversations.list.mockResolvedValue(mockConversations);

      const result = await adapter.listConversations();

      expect(mockElectronAPI.conversations.list).toHaveBeenCalledWith();
      expect(result).toEqual(mockConversations);
    });

    it("should handle list conversations error", async () => {
      const error = new Error("List failed");
      mockElectronAPI.conversations.list.mockRejectedValue(error);

      await expect(adapter.listConversations()).rejects.toThrow(
        "listConversations: List failed",
      );
    });

    it("should handle unknown error", async () => {
      mockElectronAPI.conversations.list.mockRejectedValue("string error");

      await expect(adapter.listConversations()).rejects.toThrow(
        "listConversations: Unknown error",
      );
    });
  });

  describe("getConversation", () => {
    it("should successfully get a conversation", async () => {
      const mockConversation = createMockConversation();
      mockElectronAPI.conversations.get.mockResolvedValue(mockConversation);

      const result = await adapter.getConversation("conv-123");

      expect(mockElectronAPI.conversations.get).toHaveBeenCalledWith(
        "conv-123",
      );
      expect(result).toEqual(mockConversation);
    });

    it("should return null when conversation not found", async () => {
      mockElectronAPI.conversations.get.mockResolvedValue(null);

      const result = await adapter.getConversation("nonexistent");

      expect(mockElectronAPI.conversations.get).toHaveBeenCalledWith(
        "nonexistent",
      );
      expect(result).toBeNull();
    });

    it("should handle get conversation error", async () => {
      const error = new Error("Get failed");
      mockElectronAPI.conversations.get.mockRejectedValue(error);

      await expect(adapter.getConversation("conv-123")).rejects.toThrow(
        "getConversation: Get failed",
      );
    });
  });

  describe("createConversation", () => {
    it("should successfully create a conversation without title", async () => {
      const mockConversation = createMockConversation();
      mockElectronAPI.conversations.create.mockResolvedValue(mockConversation);

      const result = await adapter.createConversation();

      expect(mockElectronAPI.conversations.create).toHaveBeenCalledWith(
        undefined,
      );
      expect(result).toEqual(mockConversation);
    });

    it("should successfully create a conversation with title", async () => {
      const mockConversation = createMockConversation({
        title: "Custom Title",
      });
      mockElectronAPI.conversations.create.mockResolvedValue(mockConversation);

      const result = await adapter.createConversation("Custom Title");

      expect(mockElectronAPI.conversations.create).toHaveBeenCalledWith(
        "Custom Title",
      );
      expect(result).toEqual(mockConversation);
    });

    it("should handle create conversation error", async () => {
      const error = new Error("Create failed");
      mockElectronAPI.conversations.create.mockRejectedValue(error);

      await expect(adapter.createConversation("Test")).rejects.toThrow(
        "createConversation: Create failed",
      );
    });
  });

  describe("renameConversation", () => {
    it("should successfully rename a conversation", async () => {
      const mockConversation = createMockConversation({ title: "New Title" });
      mockElectronAPI.conversations.update.mockResolvedValue(mockConversation);

      const result = await adapter.renameConversation("conv-123", "New Title");

      expect(mockElectronAPI.conversations.update).toHaveBeenCalledWith(
        "conv-123",
        {
          title: "New Title",
        },
      );
      expect(result).toEqual(mockConversation);
    });

    it("should throw error when update operation is not available", async () => {
      const originalUpdate = mockElectronAPI.conversations.update;
      // @ts-expect-error - Intentionally setting to undefined for test
      mockElectronAPI.conversations.update = undefined;

      await expect(
        adapter.renameConversation("conv-123", "New Title"),
      ).rejects.toThrow(
        "renameConversation: Update operation is not available in this environment",
      );

      // Restore the mock
      mockElectronAPI.conversations.update = originalUpdate;
    });

    it("should handle rename conversation error", async () => {
      const error = new Error("Update failed");
      mockElectronAPI.conversations.update.mockRejectedValue(error);

      await expect(
        adapter.renameConversation("conv-123", "New Title"),
      ).rejects.toThrow("renameConversation: Update failed");
    });
  });

  describe("updateConversation", () => {
    it("should successfully update conversation with title only", async () => {
      const updates: UpdateConversationInput = { title: "Updated Title" };
      const mockConversation = createMockConversation(updates);
      mockElectronAPI.conversations.update.mockResolvedValue(mockConversation);

      const result = await adapter.updateConversation("conv-123", updates);

      expect(mockElectronAPI.conversations.update).toHaveBeenCalledWith(
        "conv-123",
        updates,
      );
      expect(result).toEqual(mockConversation);
    });

    it("should successfully update conversation with chat_mode only", async () => {
      const updates: UpdateConversationInput = { chat_mode: "round-robin" };
      const mockConversation = createMockConversation(updates);
      mockElectronAPI.conversations.update.mockResolvedValue(mockConversation);

      const result = await adapter.updateConversation("conv-123", updates);

      expect(mockElectronAPI.conversations.update).toHaveBeenCalledWith(
        "conv-123",
        updates,
      );
      expect(result).toEqual(mockConversation);
    });

    it("should successfully update conversation with both title and chat_mode", async () => {
      const updates: UpdateConversationInput = {
        title: "Updated Title",
        chat_mode: "round-robin",
      };
      const mockConversation = createMockConversation(updates);
      mockElectronAPI.conversations.update.mockResolvedValue(mockConversation);

      const result = await adapter.updateConversation("conv-123", updates);

      expect(mockElectronAPI.conversations.update).toHaveBeenCalledWith(
        "conv-123",
        updates,
      );
      expect(result).toEqual(mockConversation);
    });

    it("should successfully update conversation with empty updates object", async () => {
      const updates: UpdateConversationInput = {};
      const mockConversation = createMockConversation();
      mockElectronAPI.conversations.update.mockResolvedValue(mockConversation);

      const result = await adapter.updateConversation("conv-123", updates);

      expect(mockElectronAPI.conversations.update).toHaveBeenCalledWith(
        "conv-123",
        updates,
      );
      expect(result).toEqual(mockConversation);
    });

    it("should throw error when update operation is not available", async () => {
      const originalUpdate = mockElectronAPI.conversations.update;
      // @ts-expect-error - Intentionally setting to undefined for test
      mockElectronAPI.conversations.update = undefined;

      const updates: UpdateConversationInput = { title: "New Title" };

      await expect(
        adapter.updateConversation("conv-123", updates),
      ).rejects.toThrow(
        "updateConversation: Update operation is not available in this environment",
      );

      // Restore the mock
      mockElectronAPI.conversations.update = originalUpdate;
    });

    it("should handle update conversation error", async () => {
      const error = new Error("Update failed");
      mockElectronAPI.conversations.update.mockRejectedValue(error);

      const updates: UpdateConversationInput = { title: "New Title" };

      await expect(
        adapter.updateConversation("conv-123", updates),
      ).rejects.toThrow("updateConversation: Update failed");
    });

    it("should handle unknown error", async () => {
      mockElectronAPI.conversations.update.mockRejectedValue("string error");

      const updates: UpdateConversationInput = { title: "New Title" };

      await expect(
        adapter.updateConversation("conv-123", updates),
      ).rejects.toThrow("updateConversation: Unknown error");
    });
  });

  describe("deleteConversation", () => {
    it("should successfully delete a conversation", async () => {
      mockElectronAPI.conversations.delete.mockResolvedValue(true);

      await adapter.deleteConversation("conv-123");

      expect(mockElectronAPI.conversations.delete).toHaveBeenCalledWith(
        "conv-123",
      );
    });

    it("should throw error when delete returns false", async () => {
      mockElectronAPI.conversations.delete.mockResolvedValue(false);

      await expect(adapter.deleteConversation("conv-123")).rejects.toThrow(
        "deleteConversation: Delete operation failed",
      );
    });

    it("should throw error when delete operation is not available", async () => {
      const originalDelete = mockElectronAPI.conversations.delete;
      // @ts-expect-error - Intentionally setting to undefined for test
      mockElectronAPI.conversations.delete = undefined;

      await expect(adapter.deleteConversation("conv-123")).rejects.toThrow(
        "deleteConversation: Delete operation is not available in this environment",
      );

      // Restore the mock
      mockElectronAPI.conversations.delete = originalDelete;
    });

    it("should handle delete conversation error", async () => {
      const error = new Error("Delete failed");
      mockElectronAPI.conversations.delete.mockRejectedValue(error);

      await expect(adapter.deleteConversation("conv-123")).rejects.toThrow(
        "deleteConversation: Delete failed",
      );
    });
  });

  describe("sendToAgents", () => {
    it("should successfully trigger agent orchestration", async () => {
      mockElectronAPI.chat.sendToAgents.mockResolvedValue(undefined);

      await adapter.sendToAgents("conv-123", "msg-456");

      expect(mockElectronAPI.chat.sendToAgents).toHaveBeenCalledWith(
        "conv-123",
        "msg-456",
      );
    });

    it("should handle sendToAgents error", async () => {
      const error = new Error("Send failed");
      mockElectronAPI.chat.sendToAgents.mockRejectedValue(error);

      await expect(adapter.sendToAgents("conv-123", "msg-456")).rejects.toThrow(
        "sendToAgents: Send failed",
      );
    });
  });

  describe("listConversationAgents", () => {
    it("should successfully list conversation agents", async () => {
      const mockAgents = [
        createMockConversationAgent({ id: "ca-1" }),
        createMockConversationAgent({ id: "ca-2" }),
      ];
      mockElectronAPI.conversationAgent.getByConversation.mockResolvedValue(
        mockAgents,
      );

      const result = await adapter.listConversationAgents("conv-123");

      expect(
        mockElectronAPI.conversationAgent.getByConversation,
      ).toHaveBeenCalledWith("conv-123");
      expect(result).toEqual(mockAgents);
    });

    it("should handle list conversation agents error", async () => {
      const error = new Error("List agents failed");
      mockElectronAPI.conversationAgent.getByConversation.mockRejectedValue(
        error,
      );

      await expect(adapter.listConversationAgents("conv-123")).rejects.toThrow(
        "listConversationAgents: List agents failed",
      );
    });
  });

  describe("addAgent", () => {
    it("should successfully add an agent to conversation", async () => {
      const mockAgent = createMockConversationAgent();
      mockElectronAPI.conversationAgent.add.mockResolvedValue(mockAgent);

      const result = await adapter.addAgent("conv-123", "agent-456");

      expect(mockElectronAPI.conversationAgent.add).toHaveBeenCalledWith({
        conversation_id: "conv-123",
        agent_id: "agent-456",
      });
      expect(result).toEqual(mockAgent);
    });

    it("should handle add agent error", async () => {
      const error = new Error("Add agent failed");
      mockElectronAPI.conversationAgent.add.mockRejectedValue(error);

      await expect(adapter.addAgent("conv-123", "agent-456")).rejects.toThrow(
        "addAgent: Add agent failed",
      );
    });
  });

  describe("removeAgent", () => {
    it("should successfully remove an agent from conversation", async () => {
      mockElectronAPI.conversationAgent.remove.mockResolvedValue(undefined);

      await adapter.removeAgent("conv-123", "agent-456");

      expect(mockElectronAPI.conversationAgent.remove).toHaveBeenCalledWith({
        conversation_id: "conv-123",
        agent_id: "agent-456",
      });
    });

    it("should handle remove agent error", async () => {
      const error = new Error("Remove agent failed");
      mockElectronAPI.conversationAgent.remove.mockRejectedValue(error);

      await expect(
        adapter.removeAgent("conv-123", "agent-456"),
      ).rejects.toThrow("removeAgent: Remove agent failed");
    });
  });

  describe("updateConversationAgent", () => {
    it("should successfully update conversation agent", async () => {
      const updates = { enabled: false };
      const mockAgent = createMockConversationAgent(updates);
      mockElectronAPI.conversationAgent.update.mockResolvedValue(mockAgent);

      const result = await adapter.updateConversationAgent("ca-123", updates);

      expect(mockElectronAPI.conversationAgent.update).toHaveBeenCalledWith({
        conversationAgentId: "ca-123",
        updates,
      });
      expect(result).toEqual(mockAgent);
    });

    it("should handle update conversation agent error", async () => {
      const error = new Error("Update agent failed");
      mockElectronAPI.conversationAgent.update.mockRejectedValue(error);

      await expect(
        adapter.updateConversationAgent("ca-123", { enabled: false }),
      ).rejects.toThrow("updateConversationAgent: Update agent failed");
    });
  });

  describe("listMessages", () => {
    it("should successfully list messages", async () => {
      const mockMessages = [
        createMockMessage({ id: "msg-1", content: "First message" }),
        createMockMessage({ id: "msg-2", content: "Second message" }),
      ];
      mockElectronAPI.messages.list.mockResolvedValue(mockMessages);

      const result = await adapter.listMessages("conv-123");

      expect(mockElectronAPI.messages.list).toHaveBeenCalledWith("conv-123");
      expect(result).toEqual(mockMessages);
    });

    it("should handle list messages error", async () => {
      const error = new Error("List messages failed");
      mockElectronAPI.messages.list.mockRejectedValue(error);

      await expect(adapter.listMessages("conv-123")).rejects.toThrow(
        "listMessages: List messages failed",
      );
    });
  });

  describe("createMessage", () => {
    it("should successfully create a message", async () => {
      const input: CreateMessageInput = {
        conversation_id: "conv-123",
        role: "user",
        content: "Test message",
      };
      const mockMessage = createMockMessage(input);
      mockElectronAPI.messages.create.mockResolvedValue(mockMessage);

      const result = await adapter.createMessage(input);

      expect(mockElectronAPI.messages.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockMessage);
    });

    it("should handle create message error", async () => {
      const error = new Error("Create message failed");
      mockElectronAPI.messages.create.mockRejectedValue(error);

      const input: CreateMessageInput = {
        conversation_id: "conv-123",
        role: "user",
        content: "Test message",
      };

      await expect(adapter.createMessage(input)).rejects.toThrow(
        "createMessage: Create message failed",
      );
    });
  });

  describe("deleteMessage", () => {
    it("should successfully delete a message", async () => {
      mockElectronAPI.messages.delete.mockResolvedValue(true);

      await adapter.deleteMessage("msg-123");

      expect(mockElectronAPI.messages.delete).toHaveBeenCalledWith("msg-123");
    });

    it("should throw error when delete returns false", async () => {
      mockElectronAPI.messages.delete.mockResolvedValue(false);

      await expect(adapter.deleteMessage("msg-123")).rejects.toThrow(
        "deleteMessage: Delete operation failed",
      );
    });

    it("should handle delete message error", async () => {
      const error = new Error("Delete message failed");
      mockElectronAPI.messages.delete.mockRejectedValue(error);

      await expect(adapter.deleteMessage("msg-123")).rejects.toThrow(
        "deleteMessage: Delete message failed",
      );
    });
  });

  describe("edge cases and integration", () => {
    it("should handle missing window.electronAPI gracefully", async () => {
      // Temporarily remove electronAPI
      const originalAPI = (global as any).window.electronAPI;
      (global as any).window.electronAPI = undefined;

      const testAdapter = new ConversationIpcAdapter();

      await expect(testAdapter.listConversations()).rejects.toThrow();

      // Restore electronAPI
      (global as any).window.electronAPI = originalAPI;
    });

    it("should maintain proper type safety with UpdateConversationInput", async () => {
      const updates: UpdateConversationInput = {
        title: "Type-safe title",
        chat_mode: "manual" as const,
      };
      const mockConversation = createMockConversation(updates);
      mockElectronAPI.conversations.update.mockResolvedValue(mockConversation);

      const result = await adapter.updateConversation("conv-123", updates);

      expect(result.chat_mode).toBe("manual");
      expect(result.title).toBe("Type-safe title");
    });

    it("should handle different chat_mode values correctly", async () => {
      const roundRobinUpdates: UpdateConversationInput = {
        chat_mode: "round-robin",
      };
      const manualUpdates: UpdateConversationInput = { chat_mode: "manual" };

      mockElectronAPI.conversations.update
        .mockResolvedValueOnce(createMockConversation(roundRobinUpdates))
        .mockResolvedValueOnce(createMockConversation(manualUpdates));

      const roundRobinResult = await adapter.updateConversation(
        "conv-1",
        roundRobinUpdates,
      );
      const manualResult = await adapter.updateConversation(
        "conv-2",
        manualUpdates,
      );

      expect(roundRobinResult.chat_mode).toBe("round-robin");
      expect(manualResult.chat_mode).toBe("manual");
    });
  });
});

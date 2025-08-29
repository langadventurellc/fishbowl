import { MessageRepository } from "../MessageRepository";
import type { DatabaseBridge } from "../../../services/database";
import type { CryptoUtilsInterface } from "../../../utils/CryptoUtilsInterface";
import {
  MessageValidationError,
  MessageNotFoundError,
  type Message,
  type CreateMessageInput,
  MessageRole,
} from "../../../types/messages";
import { ConnectionError } from "../../../services/database";

// Mock dependencies
const mockDatabaseBridge = {
  query: jest.fn(),
  execute: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
  isConnected: jest.fn(),
  backup: jest.fn(),
  vacuum: jest.fn(),
  getSize: jest.fn(),
} as jest.Mocked<DatabaseBridge>;

const mockCryptoUtils = {
  randomBytes: jest.fn(),
  generateId: jest.fn(),
  getByteLength: jest.fn(),
} as jest.Mocked<CryptoUtilsInterface>;

// Mock logger
jest.mock("../../../logging/createLoggerSync", () => ({
  createLoggerSync: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe("MessageRepository", () => {
  let repository: MessageRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MessageRepository(mockDatabaseBridge, mockCryptoUtils);
  });

  describe("constructor", () => {
    it("should initialize with required dependencies", () => {
      expect(repository).toBeInstanceOf(MessageRepository);
    });

    it("should expose all required methods", () => {
      expect(typeof repository.create).toBe("function");
      expect(typeof repository.get).toBe("function");
      expect(typeof repository.getByConversation).toBe("function");
      expect(typeof repository.updateInclusion).toBe("function");
      expect(typeof repository.exists).toBe("function");
    });
  });

  describe("create", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
    const mockConversationId = "111e1111-e89b-12d3-a456-426614174000";
    const mockAgentId = "222e2222-e89b-12d3-a456-426614174000";
    const mockTimestamp = "2023-01-01T00:00:00.000Z";

    beforeEach(() => {
      mockCryptoUtils.generateId.mockReturnValue(mockUUID);
      jest.spyOn(Date.prototype, "toISOString").mockReturnValue(mockTimestamp);
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create user message with all required fields", async () => {
      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        role: MessageRole.USER,
        content: "Hello, world!",
      };

      const result = await repository.create(input);

      expect(result).toEqual({
        id: mockUUID,
        conversation_id: mockConversationId,
        conversation_agent_id: null,
        role: MessageRole.USER,
        content: "Hello, world!",
        included: true,
        created_at: mockTimestamp,
      });

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO messages"),
        [
          mockUUID,
          mockConversationId,
          null,
          MessageRole.USER,
          "Hello, world!",
          true,
          mockTimestamp,
        ],
      );
    });

    it("should create agent message with conversation_agent_id", async () => {
      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        conversation_agent_id: mockAgentId,
        role: MessageRole.AGENT,
        content: "Hello, I'm an AI assistant!",
        included: true,
      };

      const result = await repository.create(input);

      expect(result.conversation_agent_id).toBe(mockAgentId);
      expect(result.role).toBe(MessageRole.AGENT);
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO messages"),
        [
          mockUUID,
          mockConversationId,
          mockAgentId,
          MessageRole.AGENT,
          "Hello, I'm an AI assistant!",
          true,
          mockTimestamp,
        ],
      );
    });

    it("should create system message without conversation_agent_id", async () => {
      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        role: MessageRole.SYSTEM,
        content: "System prompt here",
      };

      const result = await repository.create(input);

      expect(result.conversation_agent_id).toBeNull();
      expect(result.role).toBe(MessageRole.SYSTEM);
      expect(result.included).toBe(true); // Default value
    });

    it("should respect included: false option", async () => {
      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        role: MessageRole.USER,
        content: "This message should be excluded",
        included: false,
      };

      const result = await repository.create(input);

      expect(result.included).toBe(false);
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO messages"),
        expect.arrayContaining([false]),
      );
    });

    it("should generate UUID for ID", async () => {
      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        role: MessageRole.USER,
        content: "Test message",
      };

      const result = await repository.create(input);

      expect(result.id).toBe(mockUUID);
      expect(mockCryptoUtils.generateId).toHaveBeenCalled();
    });

    it("should set created_at timestamp", async () => {
      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        role: MessageRole.USER,
        content: "Test message",
      };

      const result = await repository.create(input);

      expect(result.created_at).toBe(mockTimestamp);
    });

    it("should throw MessageValidationError for invalid input", async () => {
      const invalidInput = {
        role: "invalid_role", // Invalid role
        content: "Test message",
      } as unknown as CreateMessageInput;

      await expect(repository.create(invalidInput)).rejects.toThrow(
        MessageValidationError,
      );
    });

    it("should handle database errors", async () => {
      mockDatabaseBridge.execute.mockRejectedValue(
        new ConnectionError("Database connection failed"),
      );

      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        role: MessageRole.USER,
        content: "Test message",
      };

      await expect(repository.create(input)).rejects.toThrow();
    });
  });

  describe("get", () => {
    const mockMessageId = "123e4567-e89b-12d3-a456-426614174000";
    const mockMessage: Message = {
      id: mockMessageId,
      conversation_id: "111e1111-e89b-12d3-a456-426614174000",
      conversation_agent_id: null,
      role: MessageRole.USER,
      content: "Hello, world!",
      included: true,
      created_at: "2023-01-01T00:00:00.000Z",
    };

    it("should retrieve message by ID", async () => {
      mockDatabaseBridge.query.mockResolvedValue([mockMessage]);

      const result = await repository.get(mockMessageId);

      expect(result).toEqual(mockMessage);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [mockMessageId],
      );
    });

    it("should throw MessageNotFoundError when message does not exist", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      await expect(repository.get(mockMessageId)).rejects.toThrow(
        MessageNotFoundError,
      );
    });

    it("should throw MessageNotFoundError for invalid ID format", async () => {
      const invalidId = "not-a-uuid";

      await expect(repository.get(invalidId)).rejects.toThrow(
        MessageNotFoundError,
      );
    });

    it("should handle database errors", async () => {
      mockDatabaseBridge.query.mockRejectedValue(
        new ConnectionError("Database connection failed"),
      );

      await expect(repository.get(mockMessageId)).rejects.toThrow();
    });
  });

  describe("getByConversation", () => {
    const mockConversationId = "111e1111-e89b-12d3-a456-426614174000";
    const mockMessages: Message[] = [
      {
        id: "123e4567-e89b-12d3-a456-426614174001",
        conversation_id: mockConversationId,
        conversation_agent_id: null,
        role: MessageRole.USER,
        content: "First message",
        included: true,
        created_at: "2023-01-01T00:00:00.000Z",
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174002",
        conversation_id: mockConversationId,
        conversation_agent_id: "222e2222-e89b-12d3-a456-426614174000",
        role: MessageRole.AGENT,
        content: "Second message",
        included: true,
        created_at: "2023-01-01T00:01:00.000Z",
      },
    ];

    it("should retrieve messages by conversation ID ordered by created_at and id", async () => {
      mockDatabaseBridge.query.mockResolvedValue(mockMessages);

      const result = await repository.getByConversation(mockConversationId);

      expect(result).toEqual(mockMessages);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY created_at ASC, id ASC"),
        [mockConversationId],
      );
    });

    it("should handle stable ordering with identical timestamps", async () => {
      // Create messages with same timestamp but different IDs
      const messagesWithSameTimestamp: Message[] = [
        {
          id: "123e4567-e89b-12d3-a456-426614174003", // Lower ID (should come first)
          conversation_id: mockConversationId,
          conversation_agent_id: null,
          role: MessageRole.USER,
          content: "Message with same timestamp - first",
          included: true,
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174005", // Higher ID (should come second)
          conversation_id: mockConversationId,
          conversation_agent_id: null,
          role: MessageRole.USER,
          content: "Message with same timestamp - second",
          included: true,
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      mockDatabaseBridge.query.mockResolvedValue(messagesWithSameTimestamp);

      const result = await repository.getByConversation(mockConversationId);

      expect(result).toEqual(messagesWithSameTimestamp);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY created_at ASC, id ASC"),
        [mockConversationId],
      );
    });

    it("should return empty array for conversation with no messages", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await repository.getByConversation(mockConversationId);

      expect(result).toEqual([]);
    });

    it("should validate conversation ID format", async () => {
      const invalidId = "not-a-uuid";

      await expect(repository.getByConversation(invalidId)).rejects.toThrow(
        MessageValidationError,
      );
    });

    it("should handle database errors", async () => {
      mockDatabaseBridge.query.mockRejectedValue(
        new ConnectionError("Database connection failed"),
      );

      await expect(
        repository.getByConversation(mockConversationId),
      ).rejects.toThrow();
    });
  });

  describe("updateInclusion", () => {
    const mockMessageId = "123e4567-e89b-12d3-a456-426614174000";
    const mockMessage: Message = {
      id: mockMessageId,
      conversation_id: "111e1111-e89b-12d3-a456-426614174000",
      conversation_agent_id: null,
      role: MessageRole.USER,
      content: "Hello, world!",
      included: true,
      created_at: "2023-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      // Mock exists to return true
      mockDatabaseBridge.query.mockImplementation((sql: string) => {
        if (sql.includes("SELECT 1")) {
          return Promise.resolve([{ 1: 1 }]);
        }
        // Mock get method call
        return Promise.resolve([mockMessage]);
      });

      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });
    });

    it("should update message inclusion to false", async () => {
      const updatedMessage = { ...mockMessage, included: false };
      mockDatabaseBridge.query
        .mockResolvedValueOnce([{ 1: 1 }]) // exists call
        .mockResolvedValueOnce([updatedMessage]); // get call

      const result = await repository.updateInclusion(mockMessageId, false);

      expect(result.included).toBe(false);
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE messages"),
        [false, mockMessageId],
      );
    });

    it("should update message inclusion to true", async () => {
      const result = await repository.updateInclusion(mockMessageId, true);

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE messages"),
        [true, mockMessageId],
      );
    });

    it("should throw MessageNotFoundError when message does not exist", async () => {
      // Mock exists to return false
      mockDatabaseBridge.query.mockResolvedValueOnce([]);

      await expect(
        repository.updateInclusion(mockMessageId, false),
      ).rejects.toThrow(MessageNotFoundError);
    });

    it("should validate ID format", async () => {
      const invalidId = "not-a-uuid";

      await expect(repository.updateInclusion(invalidId, true)).rejects.toThrow(
        MessageNotFoundError,
      );
    });

    it("should validate included parameter", async () => {
      await expect(
        repository.updateInclusion(
          mockMessageId,
          "invalid" as unknown as boolean,
        ),
      ).rejects.toThrow(MessageValidationError);
    });

    it("should return updated message", async () => {
      const updatedMessage = { ...mockMessage, included: false };
      mockDatabaseBridge.query
        .mockResolvedValueOnce([{ 1: 1 }]) // exists call
        .mockResolvedValueOnce([updatedMessage]); // get call

      const result = await repository.updateInclusion(mockMessageId, false);

      expect(result).toEqual(updatedMessage);
    });
  });

  describe("exists", () => {
    const mockMessageId = "123e4567-e89b-12d3-a456-426614174000";

    it("should return true when message exists", async () => {
      mockDatabaseBridge.query.mockResolvedValue([{ 1: 1 }]);

      const result = await repository.exists(mockMessageId);

      expect(result).toBe(true);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT 1"),
        [mockMessageId],
      );
    });

    it("should return false when message does not exist", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await repository.exists(mockMessageId);

      expect(result).toBe(false);
    });

    it("should return false for invalid ID format", async () => {
      const invalidId = "not-a-uuid";

      const result = await repository.exists(invalidId);

      expect(result).toBe(false);
    });

    it("should return false on database error", async () => {
      mockDatabaseBridge.query.mockRejectedValue(
        new ConnectionError("Database connection failed"),
      );

      const result = await repository.exists(mockMessageId);

      expect(result).toBe(false);
    });
  });
});

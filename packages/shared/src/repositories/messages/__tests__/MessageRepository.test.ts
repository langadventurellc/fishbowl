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
import { ConstraintViolationError } from "../../../services/database/types/ConstraintViolationError";
import { DatabaseErrorCode } from "../../../services/database/types/DatabaseErrorCode";

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
          1, // boolean true converted to 1
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
          1, // boolean true converted to 1
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
        expect.arrayContaining([0]), // boolean false converted to 0
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

    it("should throw specific error for foreign key constraint violation on conversation_id", async () => {
      const fkError = new ConstraintViolationError(
        "FOREIGN KEY constraint failed: messages.conversation_id",
        "foreign_key",
        "messages",
        "conversation_id",
      );
      mockDatabaseBridge.execute.mockRejectedValue(fkError);

      const input: CreateMessageInput = {
        conversation_id: "999e9999-e89b-12d3-a456-426614174999", // Valid UUID format but non-existent
        role: MessageRole.USER,
        content: "Test message",
      };

      await expect(repository.create(input)).rejects.toThrow(
        MessageValidationError,
      );

      try {
        await repository.create(input);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect((error as MessageValidationError).validationErrors).toEqual([
          "conversation_id: Referenced conversation does not exist",
        ]);
      }
    });

    it("should throw specific error for foreign key constraint violation on conversation_agent_id", async () => {
      const fkError = new ConstraintViolationError(
        "FOREIGN KEY constraint failed: messages.conversation_agent_id",
        "foreign_key",
        "messages",
        "conversation_agent_id",
      );
      mockDatabaseBridge.execute.mockRejectedValue(fkError);

      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        conversation_agent_id: "888e8888-e89b-12d3-a456-426614174888", // Valid UUID format but non-existent
        role: MessageRole.AGENT,
        content: "Test message",
      };

      try {
        await repository.create(input);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect((error as MessageValidationError).validationErrors).toEqual([
          "conversation_agent_id: Referenced conversation agent does not exist",
        ]);
      }
    });

    it("should handle unique constraint violations", async () => {
      const uniqueError = new ConstraintViolationError(
        "UNIQUE constraint failed: messages.id",
        "unique",
        "messages",
        "id",
      );
      mockDatabaseBridge.execute.mockRejectedValue(uniqueError);

      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        role: MessageRole.USER,
        content: "Test message",
      };

      try {
        await repository.create(input);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect((error as MessageValidationError).validationErrors[0]).toContain(
          "unique_constraint",
        );
      }
    });

    it("should handle not null constraint violations", async () => {
      const notNullError = new ConstraintViolationError(
        "NOT NULL constraint failed: messages.content",
        "not_null",
        "messages",
        "content",
      );
      mockDatabaseBridge.execute.mockRejectedValue(notNullError);

      const input: CreateMessageInput = {
        conversation_id: mockConversationId,
        role: MessageRole.USER,
        content: "Test message",
      };

      try {
        await repository.create(input);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect((error as MessageValidationError).validationErrors[0]).toContain(
          "required_field",
        );
      }
    });
  });

  describe("get", () => {
    const mockMessageId = "123e4567-e89b-12d3-a456-426614174000";

    // Mock database row (SQLite returns integers for included field)
    const mockDatabaseRow = {
      id: mockMessageId,
      conversation_id: "111e1111-e89b-12d3-a456-426614174000",
      conversation_agent_id: null,
      role: MessageRole.USER,
      content: "Hello, world!",
      included: 1, // SQLite stores boolean as integer
      created_at: "2023-01-01T00:00:00.000Z",
    };

    // Expected result after conversion
    const expectedMessage: Message = {
      id: mockMessageId,
      conversation_id: "111e1111-e89b-12d3-a456-426614174000",
      conversation_agent_id: null,
      role: MessageRole.USER,
      content: "Hello, world!",
      included: true, // Converted to boolean
      created_at: "2023-01-01T00:00:00.000Z",
    };

    it("should retrieve message by ID", async () => {
      mockDatabaseBridge.query.mockResolvedValue([mockDatabaseRow]);

      const result = await repository.get(mockMessageId);

      expect(result).toEqual(expectedMessage);
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

    it("should handle malformed UUID gracefully", async () => {
      const malformedIds = [
        "", // empty string
        "not-a-uuid", // invalid format
        "123", // too short
        "123e4567-e89b-12d3-a456-42661417400", // too short
        "123e4567-e89b-12d3-a456-426614174000-extra", // too long
        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // invalid characters
      ];

      for (const id of malformedIds) {
        await expect(repository.get(id)).rejects.toThrow(MessageNotFoundError);
      }
    });

    it("should handle null/undefined ID", async () => {
      await expect(repository.get(null as unknown as string)).rejects.toThrow(
        MessageNotFoundError,
      );
      await expect(
        repository.get(undefined as unknown as string),
      ).rejects.toThrow(MessageNotFoundError);
    });
  });

  describe("getByConversation", () => {
    const mockConversationId = "111e1111-e89b-12d3-a456-426614174000";

    // Mock database rows (SQLite returns integers for included field)
    const mockDatabaseRows = [
      {
        id: "123e4567-e89b-12d3-a456-426614174001",
        conversation_id: mockConversationId,
        conversation_agent_id: null,
        role: MessageRole.USER,
        content: "First message",
        included: 1, // SQLite stores boolean as integer
        created_at: "2023-01-01T00:00:00.000Z",
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174002",
        conversation_id: mockConversationId,
        conversation_agent_id: "222e2222-e89b-12d3-a456-426614174000",
        role: MessageRole.AGENT,
        content: "Second message",
        included: 1, // SQLite stores boolean as integer
        created_at: "2023-01-01T00:01:00.000Z",
      },
    ];

    // Expected results after conversion
    const expectedMessages: Message[] = [
      {
        id: "123e4567-e89b-12d3-a456-426614174001",
        conversation_id: mockConversationId,
        conversation_agent_id: null,
        role: MessageRole.USER,
        content: "First message",
        included: true, // Converted to boolean
        created_at: "2023-01-01T00:00:00.000Z",
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174002",
        conversation_id: mockConversationId,
        conversation_agent_id: "222e2222-e89b-12d3-a456-426614174000",
        role: MessageRole.AGENT,
        content: "Second message",
        included: true, // Converted to boolean
        created_at: "2023-01-01T00:01:00.000Z",
      },
    ];

    it("should retrieve messages by conversation ID ordered by created_at and id", async () => {
      mockDatabaseBridge.query.mockResolvedValue(mockDatabaseRows);

      const result = await repository.getByConversation(mockConversationId);

      expect(result).toEqual(expectedMessages);
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

    it("should handle malformed conversation ID", async () => {
      const malformedIds = ["", "not-a-uuid", "123", "invalid-format"];

      for (const id of malformedIds) {
        await expect(repository.getByConversation(id)).rejects.toThrow(
          MessageValidationError,
        );
      }
    });

    it("should handle null/undefined conversation ID", async () => {
      await expect(
        repository.getByConversation(null as unknown as string),
      ).rejects.toThrow(MessageValidationError);
      await expect(
        repository.getByConversation(undefined as unknown as string),
      ).rejects.toThrow(MessageValidationError);
    });

    it("should handle large result sets efficiently", async () => {
      // Create a large array of messages (simulating 1000+ messages)
      const largeMessageSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `123e4567-e89b-12d3-a456-42661417${i.toString().padStart(4, "0")}`,
        conversation_id: mockConversationId,
        conversation_agent_id: null,
        role: MessageRole.USER,
        content: `Message ${i}`,
        included: true,
        created_at: new Date(Date.now() + i * 1000).toISOString(),
      }));

      mockDatabaseBridge.query.mockResolvedValue(largeMessageSet);

      const result = await repository.getByConversation(mockConversationId);

      expect(result).toHaveLength(1000);
      expect(result[0]?.content).toBe("Message 0");
      expect(result[999]?.content).toBe("Message 999");
    });
  });

  describe("updateInclusion", () => {
    const mockMessageId = "123e4567-e89b-12d3-a456-426614174000";

    // Mock database row (SQLite returns integers for included field)
    const mockDatabaseRow = {
      id: mockMessageId,
      conversation_id: "111e1111-e89b-12d3-a456-426614174000",
      conversation_agent_id: null,
      role: MessageRole.USER,
      content: "Hello, world!",
      included: 1, // SQLite stores boolean as integer
      created_at: "2023-01-01T00:00:00.000Z",
    };

    // Expected message after conversion
    const expectedMessage: Message = {
      id: mockMessageId,
      conversation_id: "111e1111-e89b-12d3-a456-426614174000",
      conversation_agent_id: null,
      role: MessageRole.USER,
      content: "Hello, world!",
      included: true, // Converted to boolean
      created_at: "2023-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      // Mock exists to return true
      mockDatabaseBridge.query.mockImplementation((sql: string) => {
        if (sql.includes("SELECT 1")) {
          return Promise.resolve([{ 1: 1 }]);
        }
        // Mock get method call - return database row with integer included field
        return Promise.resolve([mockDatabaseRow]);
      });

      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });
    });

    it("should update message inclusion to false", async () => {
      const updatedDatabaseRow = { ...mockDatabaseRow, included: 0 }; // SQLite stores false as 0
      const updatedMessage = { ...expectedMessage, included: false }; // Expected result
      mockDatabaseBridge.query
        .mockResolvedValueOnce([{ 1: 1 }]) // exists call
        .mockResolvedValueOnce([updatedDatabaseRow]); // get call - returns database row with integer

      const result = await repository.updateInclusion(mockMessageId, false);

      expect(result.included).toBe(false);
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE messages"),
        [0, mockMessageId], // boolean false converted to 0
      );
    });

    it("should update message inclusion to true", async () => {
      const result = await repository.updateInclusion(mockMessageId, true);

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE messages"),
        [1, mockMessageId], // boolean true converted to 1
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
      const updatedDatabaseRow = { ...mockDatabaseRow, included: 0 }; // SQLite stores false as 0
      const updatedMessage = { ...expectedMessage, included: false }; // Expected result
      mockDatabaseBridge.query
        .mockResolvedValueOnce([{ 1: 1 }]) // exists call
        .mockResolvedValueOnce([updatedDatabaseRow]); // get call - returns database row with integer

      const result = await repository.updateInclusion(mockMessageId, false);

      expect(result).toEqual(updatedMessage);
    });

    it("should handle concurrent update conflicts", async () => {
      // Simulate a case where message exists check passes but update fails due to concurrent deletion
      mockDatabaseBridge.query
        .mockResolvedValueOnce([{ 1: 1 }]) // exists call succeeds
        .mockResolvedValueOnce([]); // get call after update fails - message was deleted

      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      await expect(
        repository.updateInclusion(mockMessageId, false),
      ).rejects.toThrow(MessageNotFoundError);
    });

    it("should handle database constraint violations during update", async () => {
      const constraintError = new ConstraintViolationError(
        "CHECK constraint failed: messages.included",
        "check",
        "messages",
        "included",
      );

      mockDatabaseBridge.query.mockResolvedValueOnce([{ 1: 1 }]); // exists check
      mockDatabaseBridge.execute.mockRejectedValue(constraintError);

      try {
        await repository.updateInclusion(mockMessageId, false);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect((error as MessageValidationError).validationErrors[0]).toContain(
          "constraint",
        );
      }
    });

    it("should validate included parameter types", async () => {
      // Test with invalid boolean values
      const invalidValues = [
        "true", // string instead of boolean
        1, // number instead of boolean
        null,
        undefined,
        {},
        [],
      ];

      for (const invalidValue of invalidValues) {
        await expect(
          repository.updateInclusion(
            mockMessageId,
            invalidValue as unknown as boolean,
          ),
        ).rejects.toThrow(MessageValidationError);
      }
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

    it("should handle various database error types gracefully", async () => {
      const errors = [
        new ConnectionError("Connection failed"),
        new ConstraintViolationError("Constraint failed", "unique"),
        new Error("Generic database error"),
      ];

      for (const error of errors) {
        mockDatabaseBridge.query.mockRejectedValue(error);

        const result = await repository.exists(mockMessageId);
        expect(result).toBe(false);
      }
    });

    it("should handle edge case inputs", async () => {
      const edgeCases = [
        "", // empty string
        " ", // whitespace
        "\n", // newline
        "\t", // tab
        "null", // string 'null'
        "undefined", // string 'undefined'
      ];

      for (const input of edgeCases) {
        const result = await repository.exists(input);
        expect(result).toBe(false);
      }
    });
  });
});

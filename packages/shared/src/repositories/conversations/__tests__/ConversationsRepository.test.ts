import { ConversationsRepository } from "../ConversationsRepository";
import type { DatabaseBridge } from "../../../services/database";
import type { CryptoUtilsInterface } from "../../../utils/CryptoUtilsInterface";
import {
  ConversationValidationError,
  ConversationNotFoundError,
  type Conversation,
  type UpdateConversationInput,
} from "../../../types/conversations";
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

describe("ConversationsRepository", () => {
  let repository: ConversationsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ConversationsRepository(
      mockDatabaseBridge,
      mockCryptoUtils,
    );
  });

  describe("constructor", () => {
    it("should initialize with required dependencies", () => {
      expect(repository).toBeInstanceOf(ConversationsRepository);
    });

    it("should implement ConversationsRepositoryInterface", () => {
      expect(typeof repository.create).toBe("function");
      expect(typeof repository.get).toBe("function");
      expect(typeof repository.list).toBe("function");
      expect(typeof repository.update).toBe("function");
      expect(typeof repository.delete).toBe("function");
      expect(typeof repository.exists).toBe("function");
    });
  });

  describe("initialization", () => {
    it("should initialize with database bridge dependency", () => {
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(ConversationsRepository);
    });

    it("should initialize with crypto utils dependency", () => {
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(ConversationsRepository);
    });
  });

  describe("create", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
    const mockTimestamp = "2023-01-01T00:00:00.000Z";

    beforeEach(() => {
      mockCryptoUtils.generateId.mockReturnValue(mockUUID);
      jest.spyOn(Date.prototype, "toISOString").mockReturnValue(mockTimestamp);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create conversation with provided title", async () => {
      const input = { title: "Test Conversation" };
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      const result = await repository.create(input);

      expect(result).toEqual({
        id: mockUUID,
        title: "Test Conversation",
        created_at: mockTimestamp,
        updated_at: mockTimestamp,
      });

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO conversations"),
        [mockUUID, "Test Conversation", mockTimestamp, mockTimestamp],
      );
      expect(mockCryptoUtils.generateId).toHaveBeenCalled();
    });

    it("should create conversation with default title when not provided", async () => {
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      const result = await repository.create({});

      expect(result.title).toBe("New Conversation");
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO conversations"),
        [mockUUID, "New Conversation", mockTimestamp, mockTimestamp],
      );
    });

    it("should generate UUID for ID", async () => {
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      const result = await repository.create({});

      expect(result.id).toBe(mockUUID);
      expect(mockCryptoUtils.generateId).toHaveBeenCalled();
    });

    it("should set timestamps", async () => {
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      const result = await repository.create({});

      expect(result.created_at).toBe(mockTimestamp);
      expect(result.updated_at).toBe(mockTimestamp);
      expect(result.created_at).toBe(result.updated_at);
    });

    it("should validate input and throw ConversationValidationError for invalid title", async () => {
      const input = { title: "" };

      await expect(repository.create(input)).rejects.toThrow(
        ConversationValidationError,
      );
    });

    it("should handle database errors", async () => {
      const dbError = new ConnectionError("Connection failed");
      mockDatabaseBridge.execute.mockRejectedValue(dbError);

      await expect(repository.create({})).rejects.toThrow(
        ConversationValidationError,
      );
    });
  });

  describe("get", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
    const mockConversation: Conversation = {
      id: mockUUID,
      title: "Test Conversation",
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
    };

    it("should retrieve existing conversation", async () => {
      mockDatabaseBridge.query.mockResolvedValue([mockConversation]);

      const result = await repository.get(mockUUID);

      expect(result).toEqual(mockConversation);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, title, created_at, updated_at"),
        [mockUUID],
      );
    });

    it("should throw ConversationNotFoundError for missing conversation", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      await expect(repository.get(mockUUID)).rejects.toThrow(
        ConversationNotFoundError,
      );
      await expect(repository.get(mockUUID)).rejects.toThrow(
        `Conversation not found: ${mockUUID}`,
      );
    });

    it("should throw ConversationNotFoundError for invalid ID format", async () => {
      const invalidId = "not-a-uuid";

      await expect(repository.get(invalidId)).rejects.toThrow(
        ConversationNotFoundError,
      );
      expect(mockDatabaseBridge.query).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      const dbError = new ConnectionError("Connection failed");
      mockDatabaseBridge.query.mockRejectedValue(dbError);

      await expect(repository.get(mockUUID)).rejects.toThrow();
    });
  });

  describe("exists", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";

    it("should return true for existing conversation", async () => {
      mockDatabaseBridge.query.mockResolvedValue([{ 1: 1 }]);

      const result = await repository.exists(mockUUID);

      expect(result).toBe(true);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT 1"),
        [mockUUID],
      );
    });

    it("should return false for non-existing conversation", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await repository.exists(mockUUID);

      expect(result).toBe(false);
    });

    it("should return false for invalid ID format", async () => {
      const invalidId = "not-a-uuid";

      const result = await repository.exists(invalidId);

      expect(result).toBe(false);
      expect(mockDatabaseBridge.query).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database connection failed");
      mockDatabaseBridge.query.mockRejectedValue(dbError);

      const result = await repository.exists(mockUUID);

      expect(result).toBe(false);
    });
  });

  describe("list", () => {
    it("should return all conversations", async () => {
      const mockConversations = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          title: "Conversation 1",
          created_at: "2023-01-01T00:00:00.000Z",
          updated_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          title: "Conversation 2",
          created_at: "2023-01-02T00:00:00.000Z",
          updated_at: "2023-01-02T00:00:00.000Z",
        },
      ];

      mockDatabaseBridge.query.mockResolvedValue(mockConversations);

      const result = await repository.list();

      expect(result).toEqual(mockConversations);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, title, created_at, updated_at"),
      );
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY created_at DESC"),
      );
    });

    it("should return empty array when no conversations exist", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      const result = await repository.list();

      expect(result).toEqual([]);
      expect(mockDatabaseBridge.query).toHaveBeenCalled();
    });

    it("should validate each conversation", async () => {
      const mockConversations = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          title: "Valid Conversation",
          created_at: "2023-01-01T00:00:00.000Z",
          updated_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      mockDatabaseBridge.query.mockResolvedValue(mockConversations);

      const result = await repository.list();

      expect(result).toEqual(mockConversations);
    });

    it("should handle database errors", async () => {
      const dbError = new ConnectionError("Database connection failed");
      mockDatabaseBridge.query.mockRejectedValue(dbError);

      await expect(repository.list()).rejects.toThrow();
    });
  });

  describe("update", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
    const mockTimestamp = "2023-01-01T00:00:00.000Z";

    beforeEach(() => {
      jest.spyOn(Date.prototype, "toISOString").mockReturnValue(mockTimestamp);
      mockDatabaseBridge.query.mockResolvedValue([{ 1: 1 }]); // exists check
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should update title", async () => {
      const input: UpdateConversationInput = { title: "Updated Title" };
      const updatedConversation = {
        id: mockUUID,
        title: "Updated Title",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: mockTimestamp,
      };

      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      // Mock the get call that happens after update
      mockDatabaseBridge.query
        .mockResolvedValueOnce([{ 1: 1 }]) // exists check
        .mockResolvedValueOnce([updatedConversation]); // get call

      const result = await repository.update(mockUUID, input);

      expect(result).toEqual(updatedConversation);
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE conversations"),
        ["Updated Title", mockTimestamp, mockUUID],
      );
    });

    it("should update updated_at timestamp", async () => {
      const input: UpdateConversationInput = { title: "Test" };
      const updatedConversation = {
        id: mockUUID,
        title: "Test",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: mockTimestamp,
      };

      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      mockDatabaseBridge.query
        .mockResolvedValueOnce([{ 1: 1 }]) // exists check
        .mockResolvedValueOnce([updatedConversation]); // get call

      await repository.update(mockUUID, input);

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("updated_at = ?"),
        expect.arrayContaining([mockTimestamp]),
      );
    });

    it("should handle partial updates", async () => {
      const input: UpdateConversationInput = { title: "Partial Update" };
      const updatedConversation = {
        id: mockUUID,
        title: "Partial Update",
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: mockTimestamp,
      };

      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      mockDatabaseBridge.query
        .mockResolvedValueOnce([{ 1: 1 }]) // exists check
        .mockResolvedValueOnce([updatedConversation]); // get call

      const result = await repository.update(mockUUID, input);

      expect(result).toEqual(updatedConversation);
    });

    it("should throw ConversationNotFoundError if conversation does not exist", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]); // exists returns false

      const input: UpdateConversationInput = { title: "Test" };

      await expect(repository.update(mockUUID, input)).rejects.toThrow(
        ConversationNotFoundError,
      );
    });

    it("should validate input", async () => {
      const invalidInput = { title: "" }; // Assuming empty title is invalid

      await expect(repository.update(mockUUID, invalidInput)).rejects.toThrow();
    });

    it("should handle database errors", async () => {
      mockDatabaseBridge.query.mockResolvedValue([{ 1: 1 }]); // exists check passes
      const dbError = new ConnectionError("Database connection failed");
      mockDatabaseBridge.execute.mockRejectedValue(dbError);

      const input: UpdateConversationInput = { title: "Test" };

      await expect(repository.update(mockUUID, input)).rejects.toThrow();
    });
  });

  describe("delete", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";

    beforeEach(() => {
      mockDatabaseBridge.query.mockResolvedValue([{ 1: 1 }]); // exists check
    });

    it("should delete existing conversation", async () => {
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      await repository.delete(mockUUID);

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM conversations"),
        [mockUUID],
      );
    });

    it("should throw ConversationNotFoundError if conversation does not exist", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]); // exists returns false

      await expect(repository.delete(mockUUID)).rejects.toThrow(
        ConversationNotFoundError,
      );
    });

    it("should validate ID format", async () => {
      const invalidId = "invalid-uuid";

      await expect(repository.delete(invalidId)).rejects.toThrow(
        ConversationNotFoundError,
      );
    });

    it("should throw error if delete operation affects no rows", async () => {
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 0,
        affectedRows: 0,
        lastInsertRowid: 0,
      });

      await expect(repository.delete(mockUUID)).rejects.toThrow(
        ConversationNotFoundError,
      );
    });

    it("should handle database errors", async () => {
      const dbError = new ConnectionError("Database connection failed");
      mockDatabaseBridge.execute.mockRejectedValue(dbError);

      await expect(repository.delete(mockUUID)).rejects.toThrow();
    });
  });
});

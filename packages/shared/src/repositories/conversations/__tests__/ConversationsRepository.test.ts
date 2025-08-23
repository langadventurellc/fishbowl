import { ConversationsRepository } from "../ConversationsRepository";
import type { DatabaseBridge } from "../../../services/database";
import type { CryptoUtilsInterface } from "../../../utils/CryptoUtilsInterface";
import {
  ConversationValidationError,
  ConversationNotFoundError,
  type Conversation,
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

  describe("placeholder methods", () => {
    it("should throw 'Method not implemented' for list", async () => {
      await expect(repository.list()).rejects.toThrow("Method not implemented");
    });

    it("should throw 'Method not implemented' for update", async () => {
      await expect(repository.update("test-id", {})).rejects.toThrow(
        "Method not implemented",
      );
    });

    it("should throw 'Method not implemented' for delete", async () => {
      await expect(repository.delete("test-id")).rejects.toThrow(
        "Method not implemented",
      );
    });
  });
});

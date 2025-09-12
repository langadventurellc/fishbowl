import type { DatabaseBridge } from "../../../services/database";
import {
  ConversationAgentNotFoundError,
  ConversationAgentValidationError,
  DuplicateAgentError,
  type AddAgentToConversationInput,
} from "../../../types/conversationAgents";
import type { CryptoUtilsInterface } from "../../../utils/CryptoUtilsInterface";
import { ConversationAgentsRepository } from "../ConversationAgentsRepository";

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

describe("ConversationAgentsRepository", () => {
  let repository: ConversationAgentsRepository;

  // Valid UUIDs for testing
  const validConversationId = "123e4567-e89b-12d3-a456-426614174001";
  const validAgentId = "223e4567-e89b-12d3-a456-426614174002";
  const validId = "323e4567-e89b-12d3-a456-426614174003";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockDatabaseBridge.query.mockClear();
    mockDatabaseBridge.execute.mockClear();
    mockCryptoUtils.generateId.mockClear();
    repository = new ConversationAgentsRepository(
      mockDatabaseBridge,
      mockCryptoUtils,
    );
  });

  describe("constructor", () => {
    it("should initialize with required dependencies", () => {
      expect(repository).toBeInstanceOf(ConversationAgentsRepository);
    });

    it("should have all required methods", () => {
      expect(typeof repository.create).toBe("function");
      expect(typeof repository.get).toBe("function");
      expect(typeof repository.update).toBe("function");
      expect(typeof repository.delete).toBe("function");
      expect(typeof repository.exists).toBe("function");
      expect(typeof repository.findByConversationId).toBe("function");
      expect(typeof repository.findByAgentId).toBe("function");
      expect(typeof repository.existsAssociation).toBe("function");
      expect(typeof repository.getOrderedAgents).toBe("function");
      expect(typeof repository.deleteByConversationId).toBe("function");
      expect(typeof repository.getAgentCountByConversation).toBe("function");
    });
  });

  describe("create", () => {
    const mockTimestamp = "2023-01-01T00:00:00.000Z";

    beforeEach(() => {
      mockCryptoUtils.generateId.mockReturnValue(validId);
      jest.spyOn(Date.prototype, "toISOString").mockReturnValue(mockTimestamp);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create a new conversation agent successfully", async () => {
      const input: AddAgentToConversationInput = {
        conversation_id: validConversationId,
        agent_id: validAgentId,
        display_order: 1,
        color: "--agent-1",
      };

      // Mock existsAssociation to return false (no duplicate)
      mockDatabaseBridge.query.mockResolvedValueOnce([]);
      // Mock execute for insertion
      mockDatabaseBridge.execute.mockResolvedValueOnce({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });

      const result = await repository.create(input);

      expect(result).toEqual({
        id: validId,
        conversation_id: input.conversation_id,
        agent_id: input.agent_id,
        added_at: mockTimestamp,
        is_active: true,
        enabled: true,
        color: "--agent-1",
        display_order: 1,
      });

      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO conversation_agents"),
        [
          validId,
          input.conversation_id,
          input.agent_id,
          mockTimestamp,
          1,
          1,
          "--agent-1",
          1,
        ],
      );
    });

    it("should throw DuplicateAgentError when agent already exists in conversation", async () => {
      const input: AddAgentToConversationInput = {
        conversation_id: validConversationId,
        agent_id: validAgentId,
        color: "--agent-1",
      };

      // Mock existsAssociation to return true (duplicate found)
      mockDatabaseBridge.query.mockResolvedValueOnce([{ 1: 1 }]);

      await expect(repository.create(input)).rejects.toThrow(
        DuplicateAgentError,
      );
    });

    it("should throw ConversationAgentValidationError for invalid input", async () => {
      const invalidInput = {
        conversation_id: "invalid-uuid",
        agent_id: validAgentId,
      } as AddAgentToConversationInput;

      await expect(repository.create(invalidInput)).rejects.toThrow(
        ConversationAgentValidationError,
      );
    });
  });

  describe("get", () => {
    it("should retrieve conversation agent by id", async () => {
      const mockRow = {
        id: validId,
        conversation_id: validConversationId,
        agent_id: validAgentId,
        added_at: "2023-01-01T00:00:00.000Z",
        is_active: 1,
        enabled: 0,
        color: "--agent-1",
        display_order: 0,
      };

      mockDatabaseBridge.query.mockResolvedValueOnce([mockRow]);

      const result = await repository.get(validId);

      expect(result).toEqual({
        ...mockRow,
        is_active: true, // Converted from 1 to boolean
        enabled: false, // Converted from 0 to boolean
      });

      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [validId],
      );
    });

    it("should throw ConversationAgentNotFoundError when not found", async () => {
      mockDatabaseBridge.query.mockResolvedValueOnce([]);

      await expect(repository.get(validId)).rejects.toThrow(
        ConversationAgentNotFoundError,
      );
    });
  });

  describe("exists", () => {
    it("should return true when conversation agent exists", async () => {
      mockDatabaseBridge.query.mockResolvedValueOnce([{ 1: 1 }]);

      const result = await repository.exists(validId);

      expect(result).toBe(true);
    });

    it("should return false when conversation agent does not exist", async () => {
      mockDatabaseBridge.query.mockResolvedValueOnce([]);

      const result = await repository.exists(validId);

      expect(result).toBe(false);
    });
  });

  describe("findByConversationId", () => {
    it("should return agents for conversation ordered by display_order", async () => {
      const mockRows = [
        {
          id: "423e4567-e89b-12d3-a456-426614174004",
          conversation_id: validConversationId,
          agent_id: "523e4567-e89b-12d3-a456-426614174005",
          added_at: "2023-01-01T00:00:00.000Z",
          is_active: 1,
          enabled: 1,
          color: "--agent-1",
          display_order: 0,
        },
        {
          id: "623e4567-e89b-12d3-a456-426614174006",
          conversation_id: validConversationId,
          agent_id: "723e4567-e89b-12d3-a456-426614174007",
          added_at: "2023-01-02T00:00:00.000Z",
          is_active: 1,
          enabled: 1,
          color: "--agent-2",
          display_order: 1,
        },
      ];

      mockDatabaseBridge.query.mockResolvedValueOnce(mockRows);

      const result = await repository.findByConversationId(validConversationId);

      expect(result).toHaveLength(2);
      expect(result[0]!.display_order).toBe(0);
      expect(result[1]!.display_order).toBe(1);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY display_order ASC, added_at ASC"),
        [validConversationId],
      );
    });

    it("should return empty array for conversation with no agents", async () => {
      mockDatabaseBridge.query.mockResolvedValueOnce([]);

      const result = await repository.findByConversationId(validConversationId);

      expect(result).toEqual([]);
    });
  });

  describe("existsAssociation", () => {
    it("should return true when association exists", async () => {
      mockDatabaseBridge.query.mockResolvedValueOnce([{ 1: 1 }]);

      const result = await repository.existsAssociation(
        validConversationId,
        validAgentId,
      );

      expect(result).toBe(true);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE conversation_id = ? AND agent_id = ?"),
        [validConversationId, validAgentId],
      );
    });

    it("should return false when association does not exist", async () => {
      mockDatabaseBridge.query.mockResolvedValueOnce([]);

      const result = await repository.existsAssociation(
        validConversationId,
        validAgentId,
      );

      expect(result).toBe(false);
    });
  });

  describe("deleteByConversationId", () => {
    it("should delete all agents for conversation", async () => {
      mockDatabaseBridge.execute.mockResolvedValueOnce({
        changes: 3,
        affectedRows: 3,
        lastInsertRowid: 1,
      });

      const result =
        await repository.deleteByConversationId(validConversationId);

      expect(result).toBe(3);
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM conversation_agents"),
        [validConversationId],
      );
    });
  });

  describe("getAgentCountByConversation", () => {
    it("should return correct count of agents", async () => {
      mockDatabaseBridge.query.mockResolvedValueOnce([{ count: 5 }]);

      const result =
        await repository.getAgentCountByConversation(validConversationId);

      expect(result).toBe(5);
      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT COUNT(*) as count"),
        [validConversationId],
      );
    });
  });

  describe("error handling", () => {
    it("should handle database errors in exists gracefully", async () => {
      mockDatabaseBridge.query.mockRejectedValueOnce(
        new Error("Database error"),
      );

      const result = await repository.exists(validId);

      expect(result).toBe(false);
    });

    it("should handle database errors in existsAssociation gracefully", async () => {
      mockDatabaseBridge.query.mockRejectedValueOnce(
        new Error("Database error"),
      );

      const result = await repository.existsAssociation(
        validConversationId,
        validAgentId,
      );

      expect(result).toBe(false);
    });
  });
});

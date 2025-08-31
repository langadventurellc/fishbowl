import { MessageActionsService } from "../MessageActionsService";
import type { ClipboardBridge } from "../../clipboard/ClipboardBridge";
import type { DatabaseBridge } from "../../database/DatabaseBridge";
import { MessageNotFoundError } from "../../../types/messages";
import { ConnectionError } from "../../database";

// Mock dependencies
const mockClipboardBridge = {
  writeText: jest.fn(),
  readText: jest.fn(),
} as jest.Mocked<ClipboardBridge>;

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

describe("MessageActionsService", () => {
  let service: MessageActionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MessageActionsService(
      mockClipboardBridge,
      mockDatabaseBridge,
    );
  });

  describe("copyMessageContent", () => {
    it("should copy plain text message content", async () => {
      const content = "Hello, world!";
      mockClipboardBridge.writeText.mockResolvedValue();

      await service.copyMessageContent(content);

      expect(mockClipboardBridge.writeText).toHaveBeenCalledWith(content);
    });

    it("should sanitize markdown formatting before copying", async () => {
      const content = "**Bold text** with *italic* and `code`";
      const expectedSanitized = "Bold text with italic and code";
      mockClipboardBridge.writeText.mockResolvedValue();

      await service.copyMessageContent(content);

      expect(mockClipboardBridge.writeText).toHaveBeenCalledWith(
        expectedSanitized,
      );
    });

    it("should throw error for non-string content", async () => {
      await expect(
        service.copyMessageContent(123 as unknown as string),
      ).rejects.toThrow("Message content must be a string");
    });

    it("should throw error for empty content", async () => {
      await expect(service.copyMessageContent("")).rejects.toThrow(
        "Cannot copy empty message content",
      );
      await expect(service.copyMessageContent("   ")).rejects.toThrow(
        "Cannot copy empty message content",
      );
    });

    it("should handle clipboard operation failures", async () => {
      const clipboardError = new Error("Clipboard access denied");
      mockClipboardBridge.writeText.mockRejectedValue(clipboardError);

      await expect(service.copyMessageContent("test content")).rejects.toThrow(
        "Failed to copy message content: Clipboard access denied",
      );
    });
  });

  describe("deleteMessage", () => {
    const mockMessageId = "123e4567-e89b-12d3-a456-426614174000";

    beforeEach(() => {
      // Mock message exists by default
      mockDatabaseBridge.query.mockResolvedValue([{ 1: 1 }]);
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 1,
        affectedRows: 1,
        lastInsertRowid: 1,
      });
    });

    it("should delete message successfully", async () => {
      await service.deleteMessage(mockMessageId);

      expect(mockDatabaseBridge.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT 1"),
        [mockMessageId],
      );
      expect(mockDatabaseBridge.execute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM messages"),
        [mockMessageId],
      );
    });

    it("should throw MessageNotFoundError when message does not exist", async () => {
      // Mock message does not exist
      mockDatabaseBridge.query.mockResolvedValue([]);

      await expect(service.deleteMessage(mockMessageId)).rejects.toThrow(
        MessageNotFoundError,
      );
      expect(mockDatabaseBridge.execute).not.toHaveBeenCalled();
    });

    it("should throw MessageNotFoundError when deletion affects zero rows", async () => {
      // Mock execute returns 0 changes (concurrent deletion)
      mockDatabaseBridge.execute.mockResolvedValue({
        changes: 0,
        affectedRows: 0,
        lastInsertRowid: 0,
      });

      await expect(service.deleteMessage(mockMessageId)).rejects.toThrow(
        MessageNotFoundError,
      );
    });

    it("should validate message ID input", async () => {
      // Test non-string inputs
      const nonStringInputs = [
        null as unknown as string,
        undefined as unknown as string,
        123 as unknown as string, // number
        {} as unknown as string, // object
        [] as unknown as string, // array
      ];

      for (const invalidInput of nonStringInputs) {
        await expect(service.deleteMessage(invalidInput)).rejects.toThrow(
          "Message ID must be a string",
        );
        expect(mockDatabaseBridge.query).not.toHaveBeenCalled();
        expect(mockDatabaseBridge.execute).not.toHaveBeenCalled();
      }

      // Test empty string inputs
      const emptyStringInputs = [
        "", // empty string
        "   ", // whitespace only
      ];

      for (const invalidInput of emptyStringInputs) {
        await expect(service.deleteMessage(invalidInput)).rejects.toThrow(
          "Message ID cannot be empty",
        );
        expect(mockDatabaseBridge.query).not.toHaveBeenCalled();
        expect(mockDatabaseBridge.execute).not.toHaveBeenCalled();
      }
    });

    it("should handle database connection errors during existence check", async () => {
      const connectionError = new ConnectionError("Database connection failed");
      mockDatabaseBridge.query.mockRejectedValue(connectionError);

      await expect(service.deleteMessage(mockMessageId)).rejects.toThrow(
        "Failed to delete message: Database connection failed",
      );
      expect(mockDatabaseBridge.execute).not.toHaveBeenCalled();
    });

    it("should handle database errors during deletion", async () => {
      const databaseError = new Error("SQL execution failed");
      mockDatabaseBridge.execute.mockRejectedValue(databaseError);

      await expect(service.deleteMessage(mockMessageId)).rejects.toThrow(
        "Failed to delete message: SQL execution failed",
      );
    });

    it("should preserve MessageNotFoundError from existence check", async () => {
      mockDatabaseBridge.query.mockResolvedValue([]);

      await expect(service.deleteMessage(mockMessageId)).rejects.toThrow(
        MessageNotFoundError,
      );
    });

    it("should handle unknown error types", async () => {
      const unknownError = "string error";
      mockDatabaseBridge.execute.mockRejectedValue(unknownError);

      await expect(service.deleteMessage(mockMessageId)).rejects.toThrow(
        "Failed to delete message: Unknown error",
      );
    });

    it("should handle invalid UUID format by attempting deletion (no special UUID validation)", async () => {
      const invalidId = "not-a-uuid";
      // Mock message does not exist (which will happen for invalid UUIDs)
      mockDatabaseBridge.query.mockResolvedValue([]);

      await expect(service.deleteMessage(invalidId)).rejects.toThrow(
        MessageNotFoundError,
      );
      expect(mockDatabaseBridge.execute).not.toHaveBeenCalled();
    });
  });
});

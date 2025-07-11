/**
 * Unit tests for updateMessageActiveState query function
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { updateMessageActiveState } from '../../../../../../src/main/database/queries/messages/updateMessageActiveState';
import type { DatabaseMessage } from '../../../../../../src/main/database/schema/DatabaseMessage';

// Mock dependencies
vi.mock('../../../../../../src/main/database/connection', () => ({
  getDatabase: vi.fn(),
}));

vi.mock('../../../../../../src/main/database/queries/messages/getMessageById', () => ({
  getMessageById: vi.fn(),
}));

describe('updateMessageActiveState', () => {
  let mockDb: {
    prepare: ReturnType<typeof vi.fn>;
  };
  let mockStatement: {
    run: ReturnType<typeof vi.fn>;
  };
  let mockGetMessageById: ReturnType<typeof vi.fn>;

  const mockMessage: DatabaseMessage = {
    id: 'test-message-id',
    conversation_id: 'test-conversation-id',
    agent_id: 'test-agent-id',
    is_active: true,
    content: 'Test message content',
    type: 'text',
    metadata: '{}',
    timestamp: Date.now(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockStatement = {
      run: vi.fn(),
    };

    mockDb = {
      prepare: vi.fn(() => mockStatement),
    };

    const { getDatabase } = vi.mocked(
      await import('../../../../../../src/main/database/connection'),
    );
    getDatabase.mockReturnValue(mockDb as unknown as Database.Database);

    const { getMessageById } = vi.mocked(
      await import('../../../../../../src/main/database/queries/messages/getMessageById'),
    );
    mockGetMessageById = getMessageById;
  });

  describe('successful updates', () => {
    it('should update message to active state (true)', () => {
      // Arrange
      const mockResult = { changes: 1 };
      mockStatement.run.mockReturnValue(mockResult);
      mockGetMessageById.mockReturnValue({ ...mockMessage, is_active: true });

      // Act
      const result = updateMessageActiveState('test-message-id', true);

      // Assert
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE messages\s+SET is_active = \?\s+WHERE id = \?/),
      );
      expect(mockStatement.run).toHaveBeenCalledWith(1, 'test-message-id');
      expect(mockGetMessageById).toHaveBeenCalledWith('test-message-id');
      expect(result).toEqual({ ...mockMessage, is_active: true });
    });

    it('should update message to inactive state (false)', () => {
      // Arrange
      const mockResult = { changes: 1 };
      mockStatement.run.mockReturnValue(mockResult);
      mockGetMessageById.mockReturnValue({ ...mockMessage, is_active: false });

      // Act
      const result = updateMessageActiveState('test-message-id', false);

      // Assert
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE messages\s+SET is_active = \?\s+WHERE id = \?/),
      );
      expect(mockStatement.run).toHaveBeenCalledWith(0, 'test-message-id');
      expect(mockGetMessageById).toHaveBeenCalledWith('test-message-id');
      expect(result).toEqual({ ...mockMessage, is_active: false });
    });
  });

  describe('edge cases', () => {
    it('should return null when message is not found', () => {
      // Arrange
      const mockResult = { changes: 0 };
      mockStatement.run.mockReturnValue(mockResult);

      // Act
      const result = updateMessageActiveState('nonexistent-id', true);

      // Assert
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE messages\s+SET is_active = \?\s+WHERE id = \?/),
      );
      expect(mockStatement.run).toHaveBeenCalledWith(1, 'nonexistent-id');
      expect(mockGetMessageById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      mockStatement.run.mockImplementation(() => {
        throw databaseError;
      });

      // Act & Assert
      expect(() => updateMessageActiveState('test-message-id', true)).toThrow(
        'Database connection failed',
      );
    });
  });

  describe('SQL query verification', () => {
    it('should generate correct SQL query', () => {
      // Arrange
      const mockResult = { changes: 1 };
      mockStatement.run.mockReturnValue(mockResult);
      mockGetMessageById.mockReturnValue(mockMessage);

      // Act
      updateMessageActiveState('test-message-id', true);

      // Assert
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE messages\s+SET is_active = \?\s+WHERE id = \?/),
      );
    });

    it('should convert boolean true to integer 1 for SQLite', () => {
      // Arrange
      const mockResult = { changes: 1 };
      mockStatement.run.mockReturnValue(mockResult);
      mockGetMessageById.mockReturnValue(mockMessage);

      // Act
      updateMessageActiveState('test-message-id', true);

      // Assert
      expect(mockStatement.run).toHaveBeenCalledWith(1, 'test-message-id');
    });

    it('should convert boolean false to integer 0 for SQLite', () => {
      // Arrange
      const mockResult = { changes: 1 };
      mockStatement.run.mockReturnValue(mockResult);
      mockGetMessageById.mockReturnValue(mockMessage);

      // Act
      updateMessageActiveState('test-message-id', false);

      // Assert
      expect(mockStatement.run).toHaveBeenCalledWith(0, 'test-message-id');
    });
  });

  describe('integration with getMessageById', () => {
    it('should call getMessageById with correct ID after successful update', () => {
      // Arrange
      const mockResult = { changes: 1 };
      mockStatement.run.mockReturnValue(mockResult);
      mockGetMessageById.mockReturnValue(mockMessage);

      // Act
      updateMessageActiveState('test-message-id', true);

      // Assert
      expect(mockGetMessageById).toHaveBeenCalledWith('test-message-id');
      expect(mockGetMessageById).toHaveBeenCalledTimes(1);
    });

    it('should not call getMessageById when no rows are updated', () => {
      // Arrange
      const mockResult = { changes: 0 };
      mockStatement.run.mockReturnValue(mockResult);

      // Act
      updateMessageActiveState('nonexistent-id', true);

      // Assert
      expect(mockGetMessageById).not.toHaveBeenCalled();
    });
  });
});

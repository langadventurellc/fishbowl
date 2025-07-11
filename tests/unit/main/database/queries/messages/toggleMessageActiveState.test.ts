/**
 * Unit tests for toggleMessageActiveState query function
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleMessageActiveState } from '../../../../../../src/main/database/queries/messages/toggleMessageActiveState';
import type { DatabaseMessage } from '../../../../../../src/main/database/schema/DatabaseMessage';

// Mock dependencies
vi.mock('../../../../../../src/main/database/queries/messages/getMessageById', () => ({
  getMessageById: vi.fn(),
}));

vi.mock('../../../../../../src/main/database/queries/messages/updateMessageActiveState', () => ({
  updateMessageActiveState: vi.fn(),
}));

describe('toggleMessageActiveState', () => {
  let mockGetMessageById: ReturnType<typeof vi.fn>;
  let mockUpdateMessageActiveState: ReturnType<typeof vi.fn>;

  const mockActiveMessage: DatabaseMessage = {
    id: 'test-message-id',
    conversation_id: 'test-conversation-id',
    agent_id: 'test-agent-id',
    is_active: true,
    content: 'Test message content',
    type: 'text',
    metadata: '{}',
    timestamp: Date.now(),
  };

  const mockInactiveMessage: DatabaseMessage = {
    ...mockActiveMessage,
    is_active: false,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const { getMessageById } = vi.mocked(
      await import('../../../../../../src/main/database/queries/messages/getMessageById'),
    );
    mockGetMessageById = getMessageById;

    const { updateMessageActiveState } = vi.mocked(
      await import('../../../../../../src/main/database/queries/messages/updateMessageActiveState'),
    );
    mockUpdateMessageActiveState = updateMessageActiveState;
  });

  describe('successful toggle operations', () => {
    it('should toggle active message to inactive (true -> false)', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(mockActiveMessage);
      mockUpdateMessageActiveState.mockReturnValue(mockInactiveMessage);

      // Act
      const result = toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockGetMessageById).toHaveBeenCalledWith('test-message-id');
      expect(mockUpdateMessageActiveState).toHaveBeenCalledWith('test-message-id', false);
      expect(result).toEqual(mockInactiveMessage);
    });

    it('should toggle inactive message to active (false -> true)', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(mockInactiveMessage);
      mockUpdateMessageActiveState.mockReturnValue(mockActiveMessage);

      // Act
      const result = toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockGetMessageById).toHaveBeenCalledWith('test-message-id');
      expect(mockUpdateMessageActiveState).toHaveBeenCalledWith('test-message-id', true);
      expect(result).toEqual(mockActiveMessage);
    });
  });

  describe('edge cases', () => {
    it('should return null when message is not found', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(null);

      // Act
      const result = toggleMessageActiveState('nonexistent-id');

      // Assert
      expect(mockGetMessageById).toHaveBeenCalledWith('nonexistent-id');
      expect(mockUpdateMessageActiveState).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle update failure gracefully', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(mockActiveMessage);
      mockUpdateMessageActiveState.mockReturnValue(null);

      // Act
      const result = toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockGetMessageById).toHaveBeenCalledWith('test-message-id');
      expect(mockUpdateMessageActiveState).toHaveBeenCalledWith('test-message-id', false);
      expect(result).toBeNull();
    });

    it('should handle database errors from getMessageById', () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      mockGetMessageById.mockImplementation(() => {
        throw databaseError;
      });

      // Act & Assert
      expect(() => toggleMessageActiveState('test-message-id')).toThrow(
        'Database connection failed',
      );
      expect(mockUpdateMessageActiveState).not.toHaveBeenCalled();
    });

    it('should handle database errors from updateMessageActiveState', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(mockActiveMessage);
      const databaseError = new Error('Update operation failed');
      mockUpdateMessageActiveState.mockImplementation(() => {
        throw databaseError;
      });

      // Act & Assert
      expect(() => toggleMessageActiveState('test-message-id')).toThrow('Update operation failed');
      expect(mockGetMessageById).toHaveBeenCalledWith('test-message-id');
    });
  });

  describe('boolean logic verification', () => {
    it('should correctly toggle true to false', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(mockActiveMessage);
      mockUpdateMessageActiveState.mockReturnValue(mockInactiveMessage);

      // Act
      toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockUpdateMessageActiveState).toHaveBeenCalledWith('test-message-id', false);
    });

    it('should correctly toggle false to true', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(mockInactiveMessage);
      mockUpdateMessageActiveState.mockReturnValue(mockActiveMessage);

      // Act
      toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockUpdateMessageActiveState).toHaveBeenCalledWith('test-message-id', true);
    });
  });

  describe('integration with existing functions', () => {
    it('should call getMessageById before updateMessageActiveState', () => {
      // Arrange
      const callOrder: string[] = [];
      mockGetMessageById.mockImplementation(() => {
        callOrder.push('getMessageById');
        return mockActiveMessage;
      });
      mockUpdateMessageActiveState.mockImplementation(() => {
        callOrder.push('updateMessageActiveState');
        return mockInactiveMessage;
      });

      // Act
      toggleMessageActiveState('test-message-id');

      // Assert
      expect(callOrder).toEqual(['getMessageById', 'updateMessageActiveState']);
    });

    it('should use the exact boolean opposite from current state', () => {
      // Arrange
      const customMessage = { ...mockActiveMessage, is_active: true };
      mockGetMessageById.mockReturnValue(customMessage);
      mockUpdateMessageActiveState.mockReturnValue(mockInactiveMessage);

      // Act
      toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockUpdateMessageActiveState).toHaveBeenCalledWith('test-message-id', false);
    });

    it('should return the result from updateMessageActiveState', () => {
      // Arrange
      const updatedMessage = { ...mockActiveMessage, is_active: false };
      mockGetMessageById.mockReturnValue(mockActiveMessage);
      mockUpdateMessageActiveState.mockReturnValue(updatedMessage);

      // Act
      const result = toggleMessageActiveState('test-message-id');

      // Assert
      expect(result).toBe(updatedMessage);
    });
  });

  describe('function call verification', () => {
    it('should call each function exactly once for successful toggle', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(mockActiveMessage);
      mockUpdateMessageActiveState.mockReturnValue(mockInactiveMessage);

      // Act
      toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockGetMessageById).toHaveBeenCalledTimes(1);
      expect(mockUpdateMessageActiveState).toHaveBeenCalledTimes(1);
    });

    it('should not call updateMessageActiveState when message not found', () => {
      // Arrange
      mockGetMessageById.mockReturnValue(null);

      // Act
      toggleMessageActiveState('nonexistent-id');

      // Assert
      expect(mockGetMessageById).toHaveBeenCalledTimes(1);
      expect(mockUpdateMessageActiveState).toHaveBeenCalledTimes(0);
    });
  });
});

/**
 * Unit tests for dbMessagesToggleActiveStateHandler
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IpcMainInvokeEvent } from 'electron';
import { v4 as uuidv4 } from 'uuid';

import { DatabaseError } from '../../../../../src/shared/types/errors';
import type { Message } from '../../../../../src/shared/types';
import type { DatabaseMessage } from '../../../../../src/main/database/schema';
import { dbMessagesToggleActiveStateHandler } from '../../../../../src/main/ipc/handlers/dbMessagesToggleActiveStateHandler';

// Mock dependencies
vi.mock('../../../../../src/main/database/queries', () => ({
  toggleMessageActiveState: vi.fn(),
}));

vi.mock('../../../../../src/shared/types/validation', () => ({
  UuidSchema: {
    parse: vi.fn(),
  },
}));

describe('dbMessagesToggleActiveStateHandler', () => {
  const mockEvent = {} as IpcMainInvokeEvent;
  const mockMessageId = uuidv4();

  const mockDatabaseMessage: DatabaseMessage = {
    id: mockMessageId,
    conversation_id: uuidv4(),
    agent_id: uuidv4(),
    is_active: false,
    content: 'Test message content',
    type: 'text',
    metadata: '{}',
    timestamp: Date.now(),
  };

  const expectedMessage: Message = {
    id: mockDatabaseMessage.id,
    conversationId: mockDatabaseMessage.conversation_id,
    agentId: mockDatabaseMessage.agent_id,
    isActive: mockDatabaseMessage.is_active,
    content: mockDatabaseMessage.content,
    type: mockDatabaseMessage.type,
    metadata: mockDatabaseMessage.metadata,
    timestamp: mockDatabaseMessage.timestamp,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful operations', () => {
    it('should toggle active state from false to true', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const toggledMessage = { ...mockDatabaseMessage, is_active: true };
      const expectedResult = { ...expectedMessage, isActive: true };
      vi.mocked(UuidSchema.parse).mockReturnValue(mockMessageId);
      vi.mocked(toggleMessageActiveState).mockResolvedValue(toggledMessage);

      // Act
      const result = await dbMessagesToggleActiveStateHandler(mockEvent, mockMessageId);

      // Assert
      expect(UuidSchema.parse).toHaveBeenCalledWith(mockMessageId);
      expect(toggleMessageActiveState).toHaveBeenCalledWith(mockMessageId);
      expect(result).toEqual(expectedResult);
    });

    it('should toggle active state from true to false', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const toggledMessage = { ...mockDatabaseMessage, is_active: false };
      const expectedResult = { ...expectedMessage, isActive: false };
      vi.mocked(UuidSchema.parse).mockReturnValue(mockMessageId);
      vi.mocked(toggleMessageActiveState).mockResolvedValue(toggledMessage);

      // Act
      const result = await dbMessagesToggleActiveStateHandler(mockEvent, mockMessageId);

      // Assert
      expect(UuidSchema.parse).toHaveBeenCalledWith(mockMessageId);
      expect(toggleMessageActiveState).toHaveBeenCalledWith(mockMessageId);
      expect(result).toEqual(expectedResult);
    });

    it('should return null when message is not found', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      vi.mocked(UuidSchema.parse).mockReturnValue(mockMessageId);
      vi.mocked(toggleMessageActiveState).mockResolvedValue(null);

      // Act
      const result = await dbMessagesToggleActiveStateHandler(mockEvent, mockMessageId);

      // Assert
      expect(UuidSchema.parse).toHaveBeenCalledWith(mockMessageId);
      expect(toggleMessageActiveState).toHaveBeenCalledWith(mockMessageId);
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should throw DatabaseError for invalid UUID', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const invalidId = 'invalid-uuid';
      const validationError = new Error('Invalid UUID format');
      vi.mocked(UuidSchema.parse).mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(dbMessagesToggleActiveStateHandler(mockEvent, invalidId)).rejects.toThrow(
        DatabaseError,
      );
      expect(UuidSchema.parse).toHaveBeenCalledWith(invalidId);
      expect(toggleMessageActiveState).not.toHaveBeenCalled();
    });

    it('should re-throw DatabaseError from database function', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const dbError = new DatabaseError(
        'Database connection failed',
        'toggle-active-state',
        'messages',
        undefined,
        new Error('Connection timeout'),
      );
      vi.mocked(UuidSchema.parse).mockReturnValue(mockMessageId);
      vi.mocked(toggleMessageActiveState).mockRejectedValue(dbError);

      // Act & Assert
      await expect(dbMessagesToggleActiveStateHandler(mockEvent, mockMessageId)).rejects.toThrow(
        dbError,
      );
      expect(UuidSchema.parse).toHaveBeenCalledWith(mockMessageId);
      expect(toggleMessageActiveState).toHaveBeenCalledWith(mockMessageId);
    });

    it('should wrap generic errors in DatabaseError', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const genericError = new Error('Something went wrong');
      vi.mocked(UuidSchema.parse).mockReturnValue(mockMessageId);
      vi.mocked(toggleMessageActiveState).mockRejectedValue(genericError);

      // Act & Assert
      await expect(dbMessagesToggleActiveStateHandler(mockEvent, mockMessageId)).rejects.toThrow(
        DatabaseError,
      );

      try {
        await dbMessagesToggleActiveStateHandler(mockEvent, mockMessageId);
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError);
        expect((error as DatabaseError).message).toBe(
          `Failed to toggle message active state with ID ${mockMessageId}`,
        );
        expect((error as DatabaseError).operation).toBe('toggle-active-state');
        expect((error as DatabaseError).table).toBe('messages');
      }
    });
  });

  describe('data transformation', () => {
    it('should correctly transform DatabaseMessage to Message format', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const dbMessage: DatabaseMessage = {
        id: 'test-id',
        conversation_id: 'conv-id',
        agent_id: 'agent-id',
        is_active: true,
        content: 'Test content',
        type: 'text',
        metadata: '{"key": "value"}',
        timestamp: 1234567890,
      };

      const expectedTransformed: Message = {
        id: 'test-id',
        conversationId: 'conv-id',
        agentId: 'agent-id',
        isActive: true,
        content: 'Test content',
        type: 'text',
        metadata: '{"key": "value"}',
        timestamp: 1234567890,
      };

      vi.mocked(UuidSchema.parse).mockReturnValue('test-id');
      vi.mocked(toggleMessageActiveState).mockResolvedValue(dbMessage);

      // Act
      const result = await dbMessagesToggleActiveStateHandler(mockEvent, 'test-id');

      // Assert
      expect(result).toEqual(expectedTransformed);
    });

    it('should handle different message types correctly', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const dbMessage: DatabaseMessage = {
        id: mockMessageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        is_active: false,
        content: 'Test media content',
        type: 'image',
        metadata: '{"url": "https://example.com/image.jpg"}',
        timestamp: Date.now(),
      };

      vi.mocked(UuidSchema.parse).mockReturnValue(mockMessageId);
      vi.mocked(toggleMessageActiveState).mockResolvedValue(dbMessage);

      // Act
      const result = await dbMessagesToggleActiveStateHandler(mockEvent, mockMessageId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.type).toBe('image');
      expect(result?.isActive).toBe(false);
      expect(result?.content).toBe('Test media content');
    });
  });

  describe('input validation', () => {
    it('should validate ID parameter before processing', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const testId = 'valid-uuid';
      vi.mocked(UuidSchema.parse).mockReturnValue(testId);
      vi.mocked(toggleMessageActiveState).mockResolvedValue(null);

      // Act
      await dbMessagesToggleActiveStateHandler(mockEvent, testId);

      // Assert
      expect(UuidSchema.parse).toHaveBeenCalledWith(testId);
      expect(UuidSchema.parse).toHaveBeenCalledTimes(1);
    });

    it('should fail when ID validation fails', async () => {
      // Get mocked functions
      const { toggleMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { UuidSchema } = await import('../../../../../src/shared/types/validation');

      // Arrange
      const invalidId = 'not-a-uuid';
      vi.mocked(UuidSchema.parse).mockImplementation(() => {
        throw new Error('Invalid UUID');
      });

      // Act & Assert
      await expect(dbMessagesToggleActiveStateHandler(mockEvent, invalidId)).rejects.toThrow(
        DatabaseError,
      );
      expect(toggleMessageActiveState).not.toHaveBeenCalled();
    });
  });
});

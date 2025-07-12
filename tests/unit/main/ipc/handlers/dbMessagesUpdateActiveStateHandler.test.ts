/**
 * Unit tests for dbMessagesUpdateActiveStateHandler
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IpcMainInvokeEvent } from 'electron';
import { v4 as uuidv4 } from 'uuid';

import { DatabaseError } from '../../../../../src/shared/types/errors';
import type { Message, UpdateMessageActiveStateData } from '../../../../../src/shared/types';
import type { DatabaseMessage } from '../../../../../src/main/database/schema';
import { dbMessagesUpdateActiveStateHandler } from '../../../../../src/main/ipc/handlers/dbMessagesUpdateActiveStateHandler';

// Mock dependencies
vi.mock('../../../../../src/main/database/queries', () => ({
  updateMessageActiveState: vi.fn(),
}));

vi.mock('../../../../../src/shared/types/validation', () => ({
  SanitizedUpdateMessageActiveStateSchema: {
    parse: vi.fn(),
  },
}));

describe('dbMessagesUpdateActiveStateHandler', () => {
  const mockEvent = {} as IpcMainInvokeEvent;
  const mockMessageId = uuidv4();
  const mockUpdates: UpdateMessageActiveStateData = {
    isActive: false,
  };

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

  describe('Success Cases', () => {
    it('should successfully update message active state to false', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue({
        id: mockMessageId,
        isActive: false,
      });
      vi.mocked(updateMessageActiveState).mockResolvedValue(mockDatabaseMessage);

      const result = await dbMessagesUpdateActiveStateHandler(
        mockEvent,
        mockMessageId,
        mockUpdates,
      );

      expect(SanitizedUpdateMessageActiveStateSchema.parse).toHaveBeenCalledWith({
        id: mockMessageId,
        ...mockUpdates,
      });
      expect(updateMessageActiveState).toHaveBeenCalledWith(mockMessageId, false);
      expect(result).toEqual(expectedMessage);
    });

    it('should successfully update message active state to true', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      const activeUpdates: UpdateMessageActiveStateData = { isActive: true };
      const activeDatabaseMessage: DatabaseMessage = { ...mockDatabaseMessage, is_active: true };
      const activeExpectedMessage: Message = {
        ...expectedMessage,
        isActive: true,
        metadata: activeDatabaseMessage.metadata,
        timestamp: activeDatabaseMessage.timestamp,
      };

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue({
        id: mockMessageId,
        isActive: true,
      });
      vi.mocked(updateMessageActiveState).mockResolvedValue(activeDatabaseMessage);

      const result = await dbMessagesUpdateActiveStateHandler(
        mockEvent,
        mockMessageId,
        activeUpdates,
      );

      expect(SanitizedUpdateMessageActiveStateSchema.parse).toHaveBeenCalledWith({
        id: mockMessageId,
        ...activeUpdates,
      });
      expect(updateMessageActiveState).toHaveBeenCalledWith(mockMessageId, true);
      expect(result).toEqual(activeExpectedMessage);
    });

    it('should handle successful validation with different UUID formats', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      const differentUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const validatedData = { id: differentUuid, isActive: false };

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue(validatedData);
      vi.mocked(updateMessageActiveState).mockResolvedValue({
        ...mockDatabaseMessage,
        id: differentUuid,
      });

      const result = await dbMessagesUpdateActiveStateHandler(
        mockEvent,
        differentUuid,
        mockUpdates,
      );

      expect(SanitizedUpdateMessageActiveStateSchema.parse).toHaveBeenCalledWith({
        id: differentUuid,
        ...mockUpdates,
      });
      expect(updateMessageActiveState).toHaveBeenCalledWith(differentUuid, false);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(differentUuid);
    });
  });

  describe('Error Cases', () => {
    it('should handle validation errors', async () => {
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      const validationError = new Error('Invalid UUID format');
      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockImplementation(() => {
        throw validationError;
      });

      await expect(
        dbMessagesUpdateActiveStateHandler(mockEvent, 'invalid-uuid', mockUpdates),
      ).rejects.toThrow(DatabaseError);
    });

    it('should handle message not found', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue({
        id: mockMessageId,
        isActive: false,
      });
      vi.mocked(updateMessageActiveState).mockResolvedValue(null);

      await expect(
        dbMessagesUpdateActiveStateHandler(mockEvent, mockMessageId, mockUpdates),
      ).rejects.toThrow(DatabaseError);
      await expect(
        dbMessagesUpdateActiveStateHandler(mockEvent, mockMessageId, mockUpdates),
      ).rejects.toThrow(`Message with ID ${mockMessageId} not found`);
    });

    it('should handle database errors', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue({
        id: mockMessageId,
        isActive: false,
      });

      const databaseError = new Error('Database connection lost');
      vi.mocked(updateMessageActiveState).mockRejectedValue(databaseError);

      await expect(
        dbMessagesUpdateActiveStateHandler(mockEvent, mockMessageId, mockUpdates),
      ).rejects.toThrow(DatabaseError);
      await expect(
        dbMessagesUpdateActiveStateHandler(mockEvent, mockMessageId, mockUpdates),
      ).rejects.toThrow(`Failed to update message active state with ID ${mockMessageId}`);
    });

    it('should preserve existing DatabaseError instances', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue({
        id: mockMessageId,
        isActive: false,
      });

      const originalDatabaseError = new DatabaseError(
        'Connection timeout',
        'update',
        'messages',
        mockMessageId,
      );
      vi.mocked(updateMessageActiveState).mockRejectedValue(originalDatabaseError);

      await expect(
        dbMessagesUpdateActiveStateHandler(mockEvent, mockMessageId, mockUpdates),
      ).rejects.toThrow(originalDatabaseError);
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform database format to API format', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      const databaseMessage: DatabaseMessage = {
        id: mockMessageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        is_active: true,
        content: 'Test transformation',
        type: 'text',
        metadata: '{"test":"data"}',
        timestamp: 1672531200000,
      };

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue({
        id: mockMessageId,
        isActive: true,
      });
      vi.mocked(updateMessageActiveState).mockResolvedValue(databaseMessage);

      const result = await dbMessagesUpdateActiveStateHandler(mockEvent, mockMessageId, {
        isActive: true,
      });

      expect(result).toEqual({
        id: databaseMessage.id,
        conversationId: databaseMessage.conversation_id,
        agentId: databaseMessage.agent_id,
        isActive: databaseMessage.is_active,
        content: databaseMessage.content,
        type: databaseMessage.type,
        metadata: databaseMessage.metadata,
        timestamp: databaseMessage.timestamp,
      });
    });

    it('should handle empty metadata correctly', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      const databaseMessage: DatabaseMessage = {
        ...mockDatabaseMessage,
        metadata: '{}',
      };

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue({
        id: mockMessageId,
        isActive: false,
      });
      vi.mocked(updateMessageActiveState).mockResolvedValue(databaseMessage);

      const result = await dbMessagesUpdateActiveStateHandler(
        mockEvent,
        mockMessageId,
        mockUpdates,
      );

      expect(result?.metadata).toEqual('{}');
    });
  });

  describe('Function Behavior', () => {
    it('should call validation before database operation', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      let validationCalled = false;
      let databaseCalled = false;

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockImplementation(_data => {
        validationCalled = true;
        expect(databaseCalled).toBe(false); // Validation should happen before database call
        return { id: mockMessageId, isActive: false };
      });

      vi.mocked(updateMessageActiveState).mockImplementation((_id, _isActive) => {
        databaseCalled = true;
        expect(validationCalled).toBe(true); // Database call should happen after validation
        return Promise.resolve(mockDatabaseMessage);
      });

      await dbMessagesUpdateActiveStateHandler(mockEvent, mockMessageId, mockUpdates);

      expect(validationCalled).toBe(true);
      expect(databaseCalled).toBe(true);
    });

    it('should return null when database operation returns null', async () => {
      const { updateMessageActiveState } = await import('../../../../../src/main/database/queries');
      const { SanitizedUpdateMessageActiveStateSchema } = await import(
        '../../../../../src/shared/types/validation'
      );

      vi.mocked(SanitizedUpdateMessageActiveStateSchema.parse).mockReturnValue({
        id: mockMessageId,
        isActive: false,
      });
      vi.mocked(updateMessageActiveState).mockResolvedValue(null);

      // Should throw error for null result (message not found)
      await expect(
        dbMessagesUpdateActiveStateHandler(mockEvent, mockMessageId, mockUpdates),
      ).rejects.toThrow(DatabaseError);
    });
  });
});

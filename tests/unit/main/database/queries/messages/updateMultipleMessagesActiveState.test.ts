import { describe, it, expect, beforeEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

// Mock the transaction manager before importing the function
vi.mock('../../../../../../src/main/database/transactions/transactionManagerInstance', () => ({
  transactionManager: {
    executeTransaction: vi.fn(),
  },
}));

// Mock getMessageById
vi.mock('../../../../../../src/main/database/queries/messages/getMessageById', () => ({
  getMessageById: vi.fn(),
}));

describe('updateMultipleMessagesActiveState', () => {
  let updateMultipleMessagesActiveState: any;
  let mockTransactionManager: any;
  let mockGetMessageById: any;
  let mockDb: any;
  let mockUpdateStmt: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the function after mocks are set up
    const module = await import(
      '../../../../../../src/main/database/queries/messages/updateMultipleMessagesActiveState'
    );
    updateMultipleMessagesActiveState = module.updateMultipleMessagesActiveState;

    // Get mock instances
    const { transactionManager } = await import(
      '../../../../../../src/main/database/transactions/transactionManagerInstance'
    );
    mockTransactionManager = transactionManager;

    const { getMessageById } = await import(
      '../../../../../../src/main/database/queries/messages/getMessageById'
    );
    mockGetMessageById = getMessageById;

    // Mock database and prepared statement
    mockUpdateStmt = {
      run: vi.fn(),
    };

    mockDb = {
      prepare: vi.fn().mockReturnValue(mockUpdateStmt),
    };

    // Set up default transaction manager behavior
    mockTransactionManager.executeTransaction.mockImplementation((callback: any) => {
      return callback(mockDb);
    });
  });

  describe('successful operations', () => {
    it('should update multiple messages active state successfully', () => {
      const messageId1 = uuidv4();
      const messageId2 = uuidv4();
      const updates = [
        { messageId: messageId1, isActive: true },
        { messageId: messageId2, isActive: false },
      ];

      const mockMessage1 = {
        id: messageId1,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Test message 1',
        type: 'text',
        is_active: true,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      const mockMessage2 = {
        id: messageId2,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Test message 2',
        type: 'text',
        is_active: false,
        timestamp: '2025-07-12T10:01:00Z',
        metadata: {},
      };

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });
      mockGetMessageById.mockReturnValueOnce(mockMessage1).mockReturnValueOnce(mockMessage2);

      const result = updateMultipleMessagesActiveState(updates);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockMessage1);
      expect(result[1]).toEqual(mockMessage2);

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      expect(mockUpdateStmt.run).toHaveBeenCalledTimes(2);
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId1); // true -> 1
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId2); // false -> 0
    });

    it('should deduplicate message IDs and use last update', () => {
      const messageId = uuidv4();
      const updates = [
        { messageId, isActive: true },
        { messageId, isActive: false }, // This should win
        { messageId, isActive: true },
      ];

      const mockMessage = {
        id: messageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Test message',
        type: 'text',
        is_active: true,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });
      mockGetMessageById.mockReturnValue(mockMessage);

      updateMultipleMessagesActiveState(updates);

      // Should only call update once with the last value (true)
      expect(mockUpdateStmt.run).toHaveBeenCalledOnce();
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId); // true -> 1
    });

    it('should handle empty updates array', () => {
      const result = updateMultipleMessagesActiveState([]);

      expect(result).toEqual([]);
      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      expect(mockUpdateStmt.run).not.toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('should throw error for invalid UUID format', () => {
      const updates = [{ messageId: 'invalid-uuid', isActive: true }];

      expect(() => updateMultipleMessagesActiveState(updates)).toThrow('Invalid UUID format');

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });

    it('should throw error for invalid isActive type', () => {
      const messageId = uuidv4();
      const updates = [
        { messageId, isActive: 'true' as any }, // String instead of boolean
      ];

      expect(() => updateMultipleMessagesActiveState(updates)).toThrow(
        `Invalid isActive value for message ${messageId}: must be boolean`,
      );

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });

    it('should validate all messages before starting transaction', () => {
      const validMessageId = uuidv4();
      const invalidMessageId = 'invalid-uuid';
      const updates = [
        { messageId: validMessageId, isActive: true },
        { messageId: invalidMessageId, isActive: false },
      ];

      expect(() => updateMultipleMessagesActiveState(updates)).toThrow('Invalid UUID format');

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });
  });

  describe('database errors and rollback', () => {
    it('should throw error when message not found', () => {
      const messageId = uuidv4();
      const updates = [{ messageId, isActive: true }];

      mockUpdateStmt.run.mockReturnValue({ changes: 0 }); // No rows updated

      expect(() => updateMultipleMessagesActiveState(updates)).toThrow(
        `Message not found: ${messageId}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should throw error when updated message cannot be retrieved', () => {
      const messageId = uuidv4();
      const updates = [{ messageId, isActive: true }];

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });
      mockGetMessageById.mockReturnValue(null); // Message not found after update

      expect(() => updateMultipleMessagesActiveState(updates)).toThrow(
        `Failed to retrieve updated message: ${messageId}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should rollback transaction when any message update fails', () => {
      const messageId1 = uuidv4();
      const messageId2 = uuidv4();
      const updates = [
        { messageId: messageId1, isActive: true },
        { messageId: messageId2, isActive: false },
      ];

      const mockMessage1 = {
        id: messageId1,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Test message 1',
        type: 'text',
        is_active: true,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      mockUpdateStmt.run
        .mockReturnValueOnce({ changes: 1 }) // First update succeeds
        .mockReturnValueOnce({ changes: 0 }); // Second update fails

      mockGetMessageById.mockReturnValue(mockMessage1);

      expect(() => updateMultipleMessagesActiveState(updates)).toThrow(
        `Message not found: ${messageId2}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      // Transaction should rollback, undoing the first successful update
    });

    it('should handle database transaction errors', () => {
      const messageId = uuidv4();
      const updates = [{ messageId, isActive: true }];

      const dbError = new Error('Database connection failed');
      mockTransactionManager.executeTransaction.mockImplementation(() => {
        throw dbError;
      });

      expect(() => updateMultipleMessagesActiveState(updates)).toThrow(
        'Database connection failed',
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });
  });

  describe('boolean conversion', () => {
    it('should convert boolean true to integer 1', () => {
      const messageId = uuidv4();
      const updates = [{ messageId, isActive: true }];

      const mockMessage = {
        id: messageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Test message',
        type: 'text',
        is_active: true,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });
      mockGetMessageById.mockReturnValue(mockMessage);

      updateMultipleMessagesActiveState(updates);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId);
    });

    it('should convert boolean false to integer 0', () => {
      const messageId = uuidv4();
      const updates = [{ messageId, isActive: false }];

      const mockMessage = {
        id: messageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Test message',
        type: 'text',
        is_active: false,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });
      mockGetMessageById.mockReturnValue(mockMessage);

      updateMultipleMessagesActiveState(updates);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId);
    });
  });
});

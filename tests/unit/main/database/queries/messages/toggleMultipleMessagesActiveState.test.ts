import { describe, it, expect, beforeEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

// Mock the transaction manager before importing the function
vi.mock('../../../../../../src/main/database/transactions/transactionManagerInstance', () => ({
  transactionManager: {
    executeTransaction: vi.fn(),
  },
}));

describe('toggleMultipleMessagesActiveState', () => {
  let toggleMultipleMessagesActiveState: any;
  let mockTransactionManager: any;
  let mockDb: any;
  let mockSelectStmt: any;
  let mockUpdateStmt: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the function after mocks are set up
    const module = await import(
      '../../../../../../src/main/database/queries/messages/toggleMultipleMessagesActiveState'
    );
    toggleMultipleMessagesActiveState = module.toggleMultipleMessagesActiveState;

    // Get mock instances
    const { transactionManager } = await import(
      '../../../../../../src/main/database/transactions/transactionManagerInstance'
    );
    mockTransactionManager = transactionManager;

    // Mock database and prepared statements
    mockSelectStmt = {
      get: vi.fn(),
    };

    mockUpdateStmt = {
      run: vi.fn(),
    };

    mockDb = {
      prepare: vi.fn().mockImplementation((sql: string) => {
        if (sql.includes('SELECT')) {
          return mockSelectStmt;
        }
        if (sql.includes('UPDATE')) {
          return mockUpdateStmt;
        }
        throw new Error(`Unexpected SQL: ${sql}`);
      }),
    };

    // Set up default transaction manager behavior
    mockTransactionManager.executeTransaction.mockImplementation((callback: any) => {
      return callback(mockDb);
    });
  });

  describe('successful operations', () => {
    it('should toggle multiple messages active state successfully', () => {
      const messageId1 = uuidv4();
      const messageId2 = uuidv4();
      const messageIds = [messageId1, messageId2];

      const mockMessage1 = {
        id: messageId1,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Test message 1',
        type: 'text',
        is_active: true, // Will be toggled to false
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      const mockMessage2 = {
        id: messageId2,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Test message 2',
        type: 'text',
        is_active: false, // Will be toggled to true
        timestamp: '2025-07-12T10:01:00Z',
        metadata: {},
      };

      mockSelectStmt.get.mockReturnValueOnce(mockMessage1).mockReturnValueOnce(mockMessage2);

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = toggleMultipleMessagesActiveState(messageIds);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ ...mockMessage1, is_active: false }); // Toggled
      expect(result[1]).toEqual({ ...mockMessage2, is_active: true }); // Toggled

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      expect(mockSelectStmt.get).toHaveBeenCalledTimes(2);
      expect(mockUpdateStmt.run).toHaveBeenCalledTimes(2);
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId1); // true -> false (0)
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId2); // false -> true (1)
    });

    it('should deduplicate message IDs', () => {
      const messageId = uuidv4();
      const messageIds = [messageId, messageId, messageId]; // Duplicates

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

      mockSelectStmt.get.mockReturnValue(mockMessage);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = toggleMultipleMessagesActiveState(messageIds);

      expect(result).toHaveLength(1); // Only one unique message
      expect(mockSelectStmt.get).toHaveBeenCalledOnce();
      expect(mockUpdateStmt.run).toHaveBeenCalledOnce();
    });

    it('should handle empty message IDs array', () => {
      const result = toggleMultipleMessagesActiveState([]);

      expect(result).toEqual([]);
      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      expect(mockSelectStmt.get).not.toHaveBeenCalled();
      expect(mockUpdateStmt.run).not.toHaveBeenCalled();
    });

    it('should toggle active message to inactive', () => {
      const messageId = uuidv4();
      const mockMessage = {
        id: messageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Active message',
        type: 'text',
        is_active: true,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      mockSelectStmt.get.mockReturnValue(mockMessage);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = toggleMultipleMessagesActiveState([messageId]);

      expect(result[0].is_active).toBe(false);
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId); // false = 0
    });

    it('should toggle inactive message to active', () => {
      const messageId = uuidv4();
      const mockMessage = {
        id: messageId,
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Inactive message',
        type: 'text',
        is_active: false,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      mockSelectStmt.get.mockReturnValue(mockMessage);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = toggleMultipleMessagesActiveState([messageId]);

      expect(result[0].is_active).toBe(true);
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId); // true = 1
    });
  });

  describe('validation errors', () => {
    it('should throw error for invalid UUID format', () => {
      const messageIds = ['invalid-uuid'];

      expect(() => toggleMultipleMessagesActiveState(messageIds)).toThrow('Invalid UUID format');

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });

    it('should validate all message IDs before starting transaction', () => {
      const validMessageId = uuidv4();
      const invalidMessageId = 'invalid-uuid';
      const messageIds = [validMessageId, invalidMessageId];

      expect(() => toggleMultipleMessagesActiveState(messageIds)).toThrow('Invalid UUID format');

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });

    it('should handle mixed valid and invalid UUIDs', () => {
      const messageIds = [uuidv4(), 'not-a-uuid', uuidv4()];

      expect(() => toggleMultipleMessagesActiveState(messageIds)).toThrow('Invalid UUID format');

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });
  });

  describe('database errors and rollback', () => {
    it('should throw error when message not found', () => {
      const messageId = uuidv4();

      mockSelectStmt.get.mockReturnValue(undefined); // Message not found

      expect(() => toggleMultipleMessagesActiveState([messageId])).toThrow(
        `Message not found: ${messageId}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      expect(mockSelectStmt.get).toHaveBeenCalledWith(messageId);
    });

    it('should throw error when update fails', () => {
      const messageId = uuidv4();
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

      mockSelectStmt.get.mockReturnValue(mockMessage);
      mockUpdateStmt.run.mockReturnValue({ changes: 0 }); // Update failed

      expect(() => toggleMultipleMessagesActiveState([messageId])).toThrow(
        `Failed to update message: ${messageId}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should rollback transaction when any message toggle fails', () => {
      const messageId1 = uuidv4();
      const messageId2 = uuidv4();
      const messageIds = [messageId1, messageId2];

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

      mockSelectStmt.get
        .mockReturnValueOnce(mockMessage1) // First message found
        .mockReturnValueOnce(undefined); // Second message not found

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      expect(() => toggleMultipleMessagesActiveState(messageIds)).toThrow(
        `Message not found: ${messageId2}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      // Transaction should rollback, undoing the first successful toggle
    });

    it('should handle database transaction errors', () => {
      const messageId = uuidv4();

      const dbError = new Error('Database connection failed');
      mockTransactionManager.executeTransaction.mockImplementation(() => {
        throw dbError;
      });

      expect(() => toggleMultipleMessagesActiveState([messageId])).toThrow(
        'Database connection failed',
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should handle partial failure in large batch', () => {
      const messageIds = Array.from({ length: 5 }, () => uuidv4());

      // Mock first 3 messages found, 4th not found
      for (let i = 0; i < 3; i++) {
        mockSelectStmt.get.mockReturnValueOnce({
          id: messageIds[i],
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: `Test message ${i + 1}`,
          type: 'text',
          is_active: i % 2 === 0, // Alternate true/false
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        });
      }
      mockSelectStmt.get.mockReturnValueOnce(undefined); // 4th message not found

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      expect(() => toggleMultipleMessagesActiveState(messageIds)).toThrow(
        `Message not found: ${messageIds[3]}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      // All successful toggles should be rolled back
    });
  });

  describe('transaction atomicity', () => {
    it('should execute all operations within single transaction', () => {
      const messageIds = [uuidv4(), uuidv4(), uuidv4()];

      // Mock all messages found
      messageIds.forEach((id, index) => {
        mockSelectStmt.get.mockReturnValueOnce({
          id,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: `Test message ${index + 1}`,
          type: 'text',
          is_active: index % 2 === 0,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        });
      });

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      toggleMultipleMessagesActiveState(messageIds);

      // Should execute in exactly one transaction
      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();

      // All operations should happen within that transaction
      expect(mockSelectStmt.get).toHaveBeenCalledTimes(3);
      expect(mockUpdateStmt.run).toHaveBeenCalledTimes(3);
    });
  });
});

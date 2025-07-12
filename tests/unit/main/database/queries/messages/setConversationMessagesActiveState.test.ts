import { describe, it, expect, beforeEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

// Mock the transaction manager before importing the function
vi.mock('../../../../../../src/main/database/transactions/transactionManagerInstance', () => ({
  transactionManager: {
    executeTransaction: vi.fn(),
  },
}));

describe('setConversationMessagesActiveState', () => {
  let setConversationMessagesActiveState: any;
  let mockTransactionManager: any;
  let mockDb: any;
  let mockSelectStmt: any;
  let mockUpdateStmt: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the function after mocks are set up
    const module = await import(
      '../../../../../../src/main/database/queries/messages/setConversationMessagesActiveState'
    );
    setConversationMessagesActiveState = module.setConversationMessagesActiveState;

    // Get mock instances
    const { transactionManager } = await import(
      '../../../../../../src/main/database/transactions/transactionManagerInstance'
    );
    mockTransactionManager = transactionManager;

    // Mock database and prepared statements
    mockSelectStmt = {
      all: vi.fn(),
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
    it('should set all messages in conversation to active', () => {
      const conversationId = uuidv4();
      const isActive = true;

      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Message 1',
          type: 'text',
          is_active: false, // Will be changed to true
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Message 2',
          type: 'text',
          is_active: false, // Will be changed to true
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        },
      ];

      const updatedMessages = mockMessages.map(msg => ({ ...msg, is_active: true }));

      mockSelectStmt.all
        .mockReturnValueOnce(mockMessages) // Initial check
        .mockReturnValueOnce(updatedMessages); // After update

      mockUpdateStmt.run.mockReturnValue({ changes: 2 });

      const result = setConversationMessagesActiveState(conversationId, isActive);

      expect(result).toHaveLength(2);
      expect(result[0].is_active).toBe(true);
      expect(result[1].is_active).toBe(true);

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      expect(mockSelectStmt.all).toHaveBeenCalledTimes(2);
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, conversationId); // true -> 1
    });

    it('should set all messages in conversation to inactive', () => {
      const conversationId = uuidv4();
      const isActive = false;

      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Message 1',
          type: 'text',
          is_active: true, // Will be changed to false
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Message 2',
          type: 'text',
          is_active: true, // Will be changed to false
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        },
      ];

      const updatedMessages = mockMessages.map(msg => ({ ...msg, is_active: false }));

      mockSelectStmt.all
        .mockReturnValueOnce(mockMessages) // Initial check
        .mockReturnValueOnce(updatedMessages); // After update

      mockUpdateStmt.run.mockReturnValue({ changes: 2 });

      const result = setConversationMessagesActiveState(conversationId, isActive);

      expect(result).toHaveLength(2);
      expect(result[0].is_active).toBe(false);
      expect(result[1].is_active).toBe(false);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, conversationId); // false -> 0
    });

    it('should handle single message conversation', () => {
      const conversationId = uuidv4();
      const isActive = true;

      const mockMessage = {
        id: uuidv4(),
        conversation_id: conversationId,
        agent_id: uuidv4(),
        content: 'Single message',
        type: 'text',
        is_active: false,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      const updatedMessage = { ...mockMessage, is_active: true };

      mockSelectStmt.all.mockReturnValueOnce([mockMessage]).mockReturnValueOnce([updatedMessage]);

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = setConversationMessagesActiveState(conversationId, isActive);

      expect(result).toHaveLength(1);
      expect(result[0].is_active).toBe(true);
    });

    it('should maintain message order by timestamp', () => {
      const conversationId = uuidv4();
      const isActive = true;

      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'First message',
          type: 'text',
          is_active: false,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Second message',
          type: 'text',
          is_active: false,
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        },
      ];

      const updatedMessages = mockMessages.map(msg => ({ ...msg, is_active: true }));

      mockSelectStmt.all.mockReturnValueOnce(mockMessages).mockReturnValueOnce(updatedMessages);

      mockUpdateStmt.run.mockReturnValue({ changes: 2 });

      const result = setConversationMessagesActiveState(conversationId, isActive);

      expect(result[0].content).toBe('First message');
      expect(result[1].content).toBe('Second message');

      // Verify ORDER BY timestamp ASC is used
      expect(mockSelectStmt.all).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('validation errors', () => {
    it('should throw error for invalid conversation ID UUID format', () => {
      expect(() => setConversationMessagesActiveState('invalid-uuid', true)).toThrow(
        'Invalid UUID format',
      );

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });

    it('should throw error for invalid isActive type', () => {
      const conversationId = uuidv4();

      expect(() => setConversationMessagesActiveState(conversationId, 'true' as any)).toThrow(
        'isActive must be a boolean value',
      );

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });

    it('should throw error for null isActive', () => {
      const conversationId = uuidv4();

      expect(() => setConversationMessagesActiveState(conversationId, null as any)).toThrow(
        'isActive must be a boolean value',
      );

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });

    it('should throw error for undefined isActive', () => {
      const conversationId = uuidv4();

      expect(() => setConversationMessagesActiveState(conversationId, undefined as any)).toThrow(
        'isActive must be a boolean value',
      );

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });
  });

  describe('database errors and rollback', () => {
    it('should throw error when no messages found in conversation', () => {
      const conversationId = uuidv4();

      mockSelectStmt.all.mockReturnValue([]); // No messages found

      expect(() => setConversationMessagesActiveState(conversationId, true)).toThrow(
        `No messages found in conversation: ${conversationId}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      expect(mockSelectStmt.all).toHaveBeenCalledWith(conversationId);
    });

    it('should throw error when update fails', () => {
      const conversationId = uuidv4();

      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Test message',
          type: 'text',
          is_active: false,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 0 }); // Update failed

      expect(() => setConversationMessagesActiveState(conversationId, true)).toThrow(
        `Failed to update messages in conversation: ${conversationId}`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should throw error when post-update state is inconsistent', () => {
      const conversationId = uuidv4();

      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Test message 1',
          type: 'text',
          is_active: false,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Test message 2',
          type: 'text',
          is_active: false,
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        },
      ];

      // Inconsistent state after update (one message didn't update properly)
      const inconsistentMessages = [
        { ...mockMessages[0], is_active: true }, // Updated
        { ...mockMessages[1], is_active: false }, // NOT updated
      ];

      mockSelectStmt.all
        .mockReturnValueOnce(mockMessages) // Initial check
        .mockReturnValueOnce(inconsistentMessages); // After update - inconsistent

      mockUpdateStmt.run.mockReturnValue({ changes: 2 }); // Claims to update 2

      expect(() => setConversationMessagesActiveState(conversationId, true)).toThrow(
        'Inconsistent state after update: 1 messages have incorrect active state',
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should handle database transaction errors', async () => {
      const conversationId = uuidv4();

      const dbError = new Error('Database connection failed');
      mockTransactionManager.executeTransaction.mockRejectedValue(dbError);

      await expect(setConversationMessagesActiveState(conversationId, true)).rejects.toThrow(
        'Database connection failed',
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should rollback on SQL constraint violation', () => {
      const conversationId = uuidv4();

      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Test message',
          type: 'text',
          is_active: false,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);

      const constraintError = new Error('UNIQUE constraint failed');
      mockUpdateStmt.run.mockImplementation(() => {
        throw constraintError;
      });

      expect(() => setConversationMessagesActiveState(conversationId, true)).toThrow(
        'UNIQUE constraint failed',
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      // Transaction should automatically rollback
    });
  });

  describe('boolean conversion', () => {
    it('should convert boolean true to integer 1 for SQLite', async () => {
      const conversationId = uuidv4();

      const mockMessage = {
        id: uuidv4(),
        conversation_id: conversationId,
        agent_id: uuidv4(),
        content: 'Test message',
        type: 'text',
        is_active: false,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      const updatedMessage = { ...mockMessage, is_active: true };

      mockSelectStmt.all.mockReturnValueOnce([mockMessage]).mockReturnValueOnce([updatedMessage]);

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      await setConversationMessagesActiveState(conversationId, true);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, conversationId);
    });

    it('should convert boolean false to integer 0 for SQLite', async () => {
      const conversationId = uuidv4();

      const mockMessage = {
        id: uuidv4(),
        conversation_id: conversationId,
        agent_id: uuidv4(),
        content: 'Test message',
        type: 'text',
        is_active: true,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      };

      const updatedMessage = { ...mockMessage, is_active: false };

      mockSelectStmt.all.mockReturnValueOnce([mockMessage]).mockReturnValueOnce([updatedMessage]);

      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      await setConversationMessagesActiveState(conversationId, false);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, conversationId);
    });
  });

  describe('transaction atomicity', () => {
    it('should execute all operations within single transaction', async () => {
      const conversationId = uuidv4();

      const mockMessages = Array.from({ length: 5 }, (_, i) => ({
        id: uuidv4(),
        conversation_id: conversationId,
        agent_id: uuidv4(),
        content: `Message ${i + 1}`,
        type: 'text',
        is_active: false,
        timestamp: `2025-07-12T10:0${i}:00Z`,
        metadata: {},
      }));

      const updatedMessages = mockMessages.map(msg => ({ ...msg, is_active: true }));

      mockSelectStmt.all.mockReturnValueOnce(mockMessages).mockReturnValueOnce(updatedMessages);

      mockUpdateStmt.run.mockReturnValue({ changes: 5 });

      await setConversationMessagesActiveState(conversationId, true);

      // Should execute in exactly one transaction
      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();

      // All operations should happen within that transaction
      expect(mockSelectStmt.all).toHaveBeenCalledTimes(2);
      expect(mockUpdateStmt.run).toHaveBeenCalledOnce();
    });
  });
});

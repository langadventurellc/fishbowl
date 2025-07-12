import { describe, it, expect, beforeEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

// Mock the transaction manager before importing the function
vi.mock('../../../../../../src/main/database/transactions/transactionManagerInstance', () => ({
  transactionManager: {
    executeTransaction: vi.fn(),
  },
}));

describe('recoverMessageActiveStateConsistency', () => {
  let recoverMessageActiveStateConsistency: any;
  let mockTransactionManager: any;
  let mockDb: any;
  let mockSelectStmt: any;
  let mockUpdateStmt: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the function after mocks are set up
    const module = await import(
      '../../../../../../src/main/database/queries/messages/recoverMessageActiveStateConsistency'
    );
    recoverMessageActiveStateConsistency = module.recoverMessageActiveStateConsistency;

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

  describe('successful recovery operations', () => {
    it('should return empty results when no inconsistent messages found', async () => {
      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message 1',
          type: 'text',
          is_active: true, // Valid boolean
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
        {
          id: uuidv4(),
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message 2',
          type: 'text',
          is_active: false, // Valid boolean
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);

      const result = await recoverMessageActiveStateConsistency();

      expect(result.fixed).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      expect(mockUpdateStmt.run).not.toHaveBeenCalled();
    });

    it('should fix messages with null active state', async () => {
      const messageId = uuidv4();
      const mockMessages = [
        {
          id: messageId,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message with null state',
          type: 'text',
          is_active: null, // Invalid: null
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = await recoverMessageActiveStateConsistency({
        defaultActiveState: true,
      });

      expect(result.fixed).toHaveLength(1);
      expect(result.fixed[0].is_active).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain(`Message ${messageId}: null/undefined active state`);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId);
    });

    it('should fix messages with undefined active state', async () => {
      const messageId = uuidv4();
      const mockMessages = [
        {
          id: messageId,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message with undefined state',
          type: 'text',
          is_active: undefined, // Invalid: undefined
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = await recoverMessageActiveStateConsistency({
        defaultActiveState: false,
      });

      expect(result.fixed).toHaveLength(1);
      expect(result.fixed[0].is_active).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain(`Message ${messageId}: null/undefined active state`);

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId);
    });

    it('should fix messages with non-boolean active state', async () => {
      const messageId = uuidv4();
      const mockMessages = [
        {
          id: messageId,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message with string state',
          type: 'text',
          is_active: 'true', // Invalid: string instead of boolean
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = await recoverMessageActiveStateConsistency();

      expect(result.fixed).toHaveLength(1);
      expect(result.fixed[0].is_active).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain(
        `Message ${messageId}: invalid active state type 'string'`,
      );

      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId);
    });

    it('should fix multiple inconsistent messages', async () => {
      const messageId1 = uuidv4();
      const messageId2 = uuidv4();
      const messageId3 = uuidv4();

      const mockMessages = [
        {
          id: messageId1,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Valid message',
          type: 'text',
          is_active: true, // Valid
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
        {
          id: messageId2,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Null message',
          type: 'text',
          is_active: null, // Invalid
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        },
        {
          id: messageId3,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'String message',
          type: 'text',
          is_active: 1, // Invalid: number
          timestamp: '2025-07-12T10:02:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = await recoverMessageActiveStateConsistency({
        defaultActiveState: false,
      });

      expect(result.fixed).toHaveLength(2); // Two messages need repair
      expect(result.errors).toHaveLength(2);

      expect(mockUpdateStmt.run).toHaveBeenCalledTimes(2);
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId2); // false -> 0
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId3); // false -> 0
    });

    it('should handle conversation-specific recovery', async () => {
      const conversationId = uuidv4();
      const messageId = uuidv4();

      const mockMessages = [
        {
          id: messageId,
          conversation_id: conversationId,
          agent_id: uuidv4(),
          content: 'Message in specific conversation',
          type: 'text',
          is_active: null,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = await recoverMessageActiveStateConsistency({
        conversationId,
      });

      expect(result.fixed).toHaveLength(1);
      expect(mockSelectStmt.all).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('dry run mode', () => {
    it('should return what would be fixed without making changes', async () => {
      const messageId = uuidv4();
      const mockMessages = [
        {
          id: messageId,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message with null state',
          type: 'text',
          is_active: null,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);

      const result = await recoverMessageActiveStateConsistency({
        dryRun: true,
      });

      expect(result.fixed).toHaveLength(1);
      expect(result.errors).toHaveLength(1);

      // Should not make any database changes
      expect(mockUpdateStmt.run).not.toHaveBeenCalled();
    });

    it('should show all potential repairs in dry run', async () => {
      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Null message',
          type: 'text',
          is_active: null,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
        {
          id: uuidv4(),
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'String message',
          type: 'text',
          is_active: 'false',
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        },
        {
          id: uuidv4(),
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Valid message',
          type: 'text',
          is_active: true,
          timestamp: '2025-07-12T10:02:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);

      const result = await recoverMessageActiveStateConsistency({
        dryRun: true,
      });

      expect(result.fixed).toHaveLength(2); // Two need repairs
      expect(result.errors).toHaveLength(2);
      expect(mockUpdateStmt.run).not.toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('should throw error for invalid conversation ID UUID format', () => {
      expect(() =>
        recoverMessageActiveStateConsistency({
          conversationId: 'invalid-uuid',
        }),
      ).toThrow('Invalid UUID format');

      expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
    });

    it('should handle valid conversation ID format', async () => {
      const conversationId = uuidv4();

      mockSelectStmt.all.mockReturnValue([]);

      const result = await recoverMessageActiveStateConsistency({
        conversationId,
      });

      expect(result.fixed).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });
  });

  describe('database errors and rollback', () => {
    it('should throw error when repair update fails', () => {
      const messageId = uuidv4();
      const mockMessages = [
        {
          id: messageId,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message with null state',
          type: 'text',
          is_active: null,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 0 }); // Update failed

      expect(() => recoverMessageActiveStateConsistency()).toThrow(
        `Failed to repair message ${messageId}: no rows updated`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should handle database transaction errors', async () => {
      const dbError = new Error('Database connection failed');
      mockTransactionManager.executeTransaction.mockRejectedValue(dbError);

      await expect(recoverMessageActiveStateConsistency()).rejects.toThrow(
        'Database connection failed',
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
    });

    it('should rollback when some repairs fail', () => {
      const messageId1 = uuidv4();
      const messageId2 = uuidv4();

      const mockMessages = [
        {
          id: messageId1,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'First null message',
          type: 'text',
          is_active: null,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
        {
          id: messageId2,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Second null message',
          type: 'text',
          is_active: null,
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run
        .mockReturnValueOnce({ changes: 1 }) // First repair succeeds
        .mockReturnValueOnce({ changes: 0 }); // Second repair fails

      expect(() => recoverMessageActiveStateConsistency()).toThrow(
        `Failed to repair message ${messageId2}: no rows updated`,
      );

      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      // Transaction should rollback, undoing the first successful repair
    });
  });

  describe('default options', () => {
    it('should use default options when none provided', async () => {
      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message with null state',
          type: 'text',
          is_active: null,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      const result = await recoverMessageActiveStateConsistency();

      // Should use default active state of true
      expect(result.fixed[0].is_active).toBe(true);
      expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, mockMessages[0].id);
    });

    it('should handle empty options object', async () => {
      const mockMessages = [
        {
          id: uuidv4(),
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Valid message',
          type: 'text',
          is_active: true,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        },
      ];

      mockSelectStmt.all.mockReturnValue(mockMessages);

      const result = await recoverMessageActiveStateConsistency({});

      expect(result.fixed).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  describe('transaction atomicity', () => {
    it('should execute all repairs within single transaction', async () => {
      const mockMessages = Array.from({ length: 3 }, () => ({
        id: uuidv4(),
        conversation_id: uuidv4(),
        agent_id: uuidv4(),
        content: 'Message with null state',
        type: 'text',
        is_active: null,
        timestamp: '2025-07-12T10:00:00Z',
        metadata: {},
      }));

      mockSelectStmt.all.mockReturnValue(mockMessages);
      mockUpdateStmt.run.mockReturnValue({ changes: 1 });

      await recoverMessageActiveStateConsistency();

      // Should execute in exactly one transaction
      expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();

      // All repairs should happen within that transaction
      expect(mockUpdateStmt.run).toHaveBeenCalledTimes(3);
    });
  });
});

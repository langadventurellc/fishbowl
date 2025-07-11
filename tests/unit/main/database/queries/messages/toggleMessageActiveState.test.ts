/**
 * Unit tests for toggleMessageActiveState query function
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { toggleMessageActiveState } from '../../../../../../src/main/database/queries/messages/toggleMessageActiveState';
import type { DatabaseMessage } from '../../../../../../src/main/database/schema/DatabaseMessage';

// Mock dependencies
vi.mock('../../../../../../src/main/database/transactions/transactionManagerInstance', () => ({
  transactionManager: {
    executeTransaction: vi.fn(),
  },
}));

vi.mock('../../../../../../src/main/ipc/error-handler', () => ({
  DatabaseErrorHandler: {
    executeWithRetry: vi.fn(),
  },
}));

vi.mock('../../../../../../src/shared/types/errors', () => ({
  DatabaseError: class {
    message: string;
    operation: string;
    table: string;
    query: string | undefined;
    details: any;

    constructor(
      message: string,
      operation: string,
      table: string,
      query: string | undefined,
      details: any,
    ) {
      this.message = message;
      this.operation = operation;
      this.table = table;
      this.query = query;
      this.details = details;
    }
  },
}));

vi.mock('../../../../../../src/shared/types/validation', () => ({
  UuidSchema: {
    parse: vi.fn((value: string) => value),
  },
}));

describe('toggleMessageActiveState', () => {
  let mockDb: {
    prepare: ReturnType<typeof vi.fn>;
  };
  let mockSelectStatement: {
    get: ReturnType<typeof vi.fn>;
  };
  let mockUpdateStatement: {
    run: ReturnType<typeof vi.fn>;
  };
  let mockTransactionManager: ReturnType<typeof vi.fn>;
  let mockExecuteWithRetry: ReturnType<typeof vi.fn>;

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

    mockSelectStatement = {
      get: vi.fn(),
    };

    mockUpdateStatement = {
      run: vi.fn(),
    };

    mockDb = {
      prepare: vi.fn((sql: string) => {
        if (sql.includes('SELECT')) {
          return mockSelectStatement;
        } else if (sql.includes('UPDATE')) {
          return mockUpdateStatement;
        }
        return mockSelectStatement;
      }),
    };

    const { transactionManager } = vi.mocked(
      await import('../../../../../../src/main/database/transactions/transactionManagerInstance'),
    );
    mockTransactionManager = transactionManager.executeTransaction as any;
    // Mock executeTransaction to call the operation function with the mock db
    mockTransactionManager.mockImplementation(operation => {
      return operation(mockDb as unknown as Database.Database);
    });

    const { DatabaseErrorHandler } = vi.mocked(
      await import('../../../../../../src/main/ipc/error-handler'),
    );
    mockExecuteWithRetry = DatabaseErrorHandler.executeWithRetry as any;
    // Mock executeWithRetry to call the operation function directly
    mockExecuteWithRetry.mockImplementation(operation => {
      return Promise.resolve(operation());
    });
  });

  describe('successful toggle operations', () => {
    it('should toggle active message to inactive (true -> false)', async () => {
      // Arrange
      mockSelectStatement.get
        .mockReturnValueOnce(mockActiveMessage) // First call: get current state
        .mockReturnValueOnce(mockInactiveMessage); // Second call: get updated state
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act
      const result = await toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM messages WHERE id = ?');
      expect(mockSelectStatement.get).toHaveBeenCalledWith('test-message-id');
      expect(mockUpdateStatement.run).toHaveBeenCalledWith(0, 'test-message-id'); // false -> 0
      expect(result).toEqual(mockInactiveMessage);
    });

    it('should toggle inactive message to active (false -> true)', async () => {
      // Arrange
      mockSelectStatement.get
        .mockReturnValueOnce(mockInactiveMessage) // First call: get current state
        .mockReturnValueOnce(mockActiveMessage); // Second call: get updated state
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act
      const result = await toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockSelectStatement.get).toHaveBeenCalledWith('test-message-id');
      expect(mockUpdateStatement.run).toHaveBeenCalledWith(1, 'test-message-id'); // true -> 1
      expect(result).toEqual(mockActiveMessage);
    });
  });

  describe('edge cases', () => {
    it('should return null when message is not found', async () => {
      // Arrange
      mockSelectStatement.get.mockReturnValue(undefined);

      // Act
      const result = await toggleMessageActiveState('nonexistent-id');

      // Assert
      expect(mockSelectStatement.get).toHaveBeenCalledWith('nonexistent-id');
      expect(mockUpdateStatement.run).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      mockExecuteWithRetry.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(toggleMessageActiveState('test-message-id')).rejects.toThrow(
        'Failed to toggle message active state',
      );
    });

    it('should handle update failure (no changes)', async () => {
      // Arrange
      mockSelectStatement.get.mockReturnValue(mockActiveMessage);
      mockUpdateStatement.run.mockReturnValue({ changes: 0 });

      // Act & Assert
      await expect(toggleMessageActiveState('test-message-id')).rejects.toThrow(
        'Failed to toggle message active state - no changes made',
      );
    });

    it('should handle retrieval failure after successful update', async () => {
      // Arrange
      mockSelectStatement.get
        .mockReturnValueOnce(mockActiveMessage) // First call: get current state
        .mockReturnValueOnce(undefined); // Second call: retrieval fails
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act & Assert
      await expect(toggleMessageActiveState('test-message-id')).rejects.toThrow(
        'Message toggle succeeded but message retrieval failed',
      );
    });
  });

  describe('transaction verification', () => {
    it('should use transaction for atomic operations', async () => {
      // Arrange
      mockSelectStatement.get
        .mockReturnValueOnce(mockActiveMessage)
        .mockReturnValueOnce(mockInactiveMessage);
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act
      await toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockTransactionManager).toHaveBeenCalledTimes(1);
      expect(mockTransactionManager).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should use same db instance throughout transaction', async () => {
      // Arrange
      mockSelectStatement.get
        .mockReturnValueOnce(mockActiveMessage)
        .mockReturnValueOnce(mockInactiveMessage);
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act
      await toggleMessageActiveState('test-message-id');

      // Assert
      // Both SELECT and UPDATE operations should use the same db.prepare calls
      expect(mockDb.prepare).toHaveBeenCalledTimes(2);
      expect(mockDb.prepare).toHaveBeenNthCalledWith(1, 'SELECT * FROM messages WHERE id = ?');
      expect(mockDb.prepare).toHaveBeenNthCalledWith(2, expect.stringMatching(/UPDATE messages/));
    });
  });

  describe('SQL query verification', () => {
    it('should generate correct UPDATE SQL query', async () => {
      // Arrange
      mockSelectStatement.get
        .mockReturnValueOnce(mockActiveMessage)
        .mockReturnValueOnce(mockInactiveMessage);
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act
      await toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE messages\s+SET is_active = \?\s+WHERE id = \?/),
      );
    });

    it('should convert boolean true to integer 0 when toggling from active', async () => {
      // Arrange - message is currently active (true)
      mockSelectStatement.get
        .mockReturnValueOnce(mockActiveMessage)
        .mockReturnValueOnce(mockInactiveMessage);
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act
      await toggleMessageActiveState('test-message-id');

      // Assert - should set to false (0)
      expect(mockUpdateStatement.run).toHaveBeenCalledWith(0, 'test-message-id');
    });

    it('should convert boolean false to integer 1 when toggling from inactive', async () => {
      // Arrange - message is currently inactive (false)
      mockSelectStatement.get
        .mockReturnValueOnce(mockInactiveMessage)
        .mockReturnValueOnce(mockActiveMessage);
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act
      await toggleMessageActiveState('test-message-id');

      // Assert - should set to true (1)
      expect(mockUpdateStatement.run).toHaveBeenCalledWith(1, 'test-message-id');
    });
  });

  describe('error handling integration', () => {
    it('should use DatabaseErrorHandler.executeWithRetry', async () => {
      // Arrange
      mockSelectStatement.get
        .mockReturnValueOnce(mockActiveMessage)
        .mockReturnValueOnce(mockInactiveMessage);
      mockUpdateStatement.run.mockReturnValue({ changes: 1 });

      // Act
      await toggleMessageActiveState('test-message-id');

      // Assert
      expect(mockExecuteWithRetry).toHaveBeenCalledTimes(1);
      expect(mockExecuteWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          operation: 'toggle-active-state',
          table: 'messages',
          timestamp: expect.any(Number),
        }),
      );
    });
  });
});

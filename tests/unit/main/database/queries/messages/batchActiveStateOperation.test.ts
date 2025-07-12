import { describe, it, expect, beforeEach, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

// Mock the transaction manager before importing the function
vi.mock('../../../../../../src/main/database/transactions/transactionManagerInstance', () => ({
  transactionManager: {
    executeTransaction: vi.fn(),
  },
}));

describe('batchActiveStateOperation', () => {
  let batchActiveStateOperation: any;
  let batchMessageActiveStateOperation: any;
  let mockTransactionManager: any;
  let mockDb: any;
  let mockSelectStmt: any;
  let mockUpdateStmt: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Import the functions after mocks are set up
    const module1 = await import(
      '../../../../../../src/main/database/queries/messages/batchActiveStateOperation'
    );
    batchActiveStateOperation = module1.batchActiveStateOperation;

    const module2 = await import(
      '../../../../../../src/main/database/queries/messages/batchMessageActiveStateOperation'
    );
    batchMessageActiveStateOperation = module2.batchMessageActiveStateOperation;

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

  describe('batchActiveStateOperation - generic batch handler', () => {
    describe('successful operations', () => {
      it('should execute all operations successfully', () => {
        const operations = [
          (_db: any) => 'result1',
          (_db: any) => 'result2',
          (_db: any) => 'result3',
        ];

        const result = batchActiveStateOperation(operations);

        expect(result).toEqual(['result1', 'result2', 'result3']);
        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });

      it('should handle empty operations array when validation disabled', () => {
        const result = batchActiveStateOperation([], {
          validateBeforeTransaction: false,
        });

        expect(result).toEqual([]);
        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });

      it('should pass database instance to operations', () => {
        const dbCapture = vi.fn((db: any) => {
          expect(db).toBe(mockDb);
          return 'success';
        });

        batchActiveStateOperation([dbCapture]);

        expect(dbCapture).toHaveBeenCalledWith(mockDb);
      });
    });

    describe('validation and options', () => {
      it('should validate empty operations when validateBeforeTransaction is true', () => {
        expect(() =>
          batchActiveStateOperation([], {
            validateBeforeTransaction: true,
          }),
        ).toThrow('No operations provided for batch execution');

        expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
      });

      it('should skip validation when validateBeforeTransaction is false', () => {
        const result = batchActiveStateOperation([], {
          validateBeforeTransaction: false,
        });

        expect(result).toEqual([]);
        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });

      it('should use default options when none provided', () => {
        const operations = [(_db: any) => 'success'];

        const result = batchActiveStateOperation(operations);

        expect(result).toEqual(['success']);
        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });
    });

    describe('error handling', () => {
      it('should fail fast and rollback on first error when continueOnError is false', () => {
        const operations = [
          (_db: any) => 'success1',
          (_db: any) => {
            throw new Error('Operation 2 failed');
          },
          (_db: any) => 'success3', // Should not be reached
        ];

        expect(() =>
          batchActiveStateOperation(operations, {
            continueOnError: false,
          }),
        ).toThrow('Batch operation failed at step 2: Operation 2 failed: Operation 2 failed');

        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });

      it('should continue on errors when continueOnError is true', () => {
        const operations = [
          (_db: any) => 'success1',
          (_db: any) => {
            throw new Error('Operation 2 failed');
          },
          (_db: any) => 'success3',
        ];

        const result = batchActiveStateOperation(operations, {
          continueOnError: true,
        });

        expect(result).toEqual(['success1', 'success3']);
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Batch operation completed with 1 errors'),
          expect.arrayContaining([expect.stringContaining('Operation 2 failed')]),
        );
      });

      it('should handle non-Error exceptions', () => {
        const operations = [
          (_db: any) => {
            throw new Error('String error');
          },
          (_db: any) => {
            throw new Error('Object error');
          },
        ];

        expect(() => batchActiveStateOperation(operations)).toThrow(
          'Batch operation failed at step 1: Operation 1 failed: String error',
        );
      });

      it('should handle database transaction errors', () => {
        const operations = [(_db: any) => 'success'];
        const dbError = new Error('Database connection failed');

        mockTransactionManager.executeTransaction.mockImplementation(() => {
          throw dbError;
        });

        expect(() => batchActiveStateOperation(operations)).toThrow('Database connection failed');
      });
    });
  });

  describe('batchMessageActiveStateOperation - specialized message handler', () => {
    describe('successful update operations', () => {
      it('should update multiple messages successfully', () => {
        const messageId1 = uuidv4();
        const messageId2 = uuidv4();

        const operations = [
          { type: 'update' as const, messageId: messageId1, isActive: true },
          { type: 'update' as const, messageId: messageId2, isActive: false },
        ];

        const mockMessage1 = {
          id: messageId1,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message 1',
          type: 'text',
          is_active: true,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        };

        const mockMessage2 = {
          id: messageId2,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message 2',
          type: 'text',
          is_active: false,
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        };

        mockUpdateStmt.run.mockReturnValue({ changes: 1 });
        mockSelectStmt.get.mockReturnValueOnce(mockMessage1).mockReturnValueOnce(mockMessage2);

        const result = batchMessageActiveStateOperation(operations);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(mockMessage1);
        expect(result[1]).toEqual(mockMessage2);

        expect(mockUpdateStmt.run).toHaveBeenCalledTimes(2);
        expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId1); // true -> 1
        expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId2); // false -> 0
      });
    });

    describe('successful toggle operations', () => {
      it('should toggle multiple messages successfully', () => {
        const messageId1 = uuidv4();
        const messageId2 = uuidv4();

        const operations = [
          { type: 'toggle' as const, messageId: messageId1 },
          { type: 'toggle' as const, messageId: messageId2 },
        ];

        const mockMessage1 = {
          id: messageId1,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message 1',
          type: 'text',
          is_active: true, // Will be toggled to false
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        };

        const mockMessage2 = {
          id: messageId2,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message 2',
          type: 'text',
          is_active: false, // Will be toggled to true
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        };

        mockSelectStmt.get
          .mockReturnValueOnce(mockMessage1) // For toggle read
          .mockReturnValueOnce(mockMessage2); // For toggle read

        mockUpdateStmt.run.mockReturnValue({ changes: 1 });

        const result = batchMessageActiveStateOperation(operations);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ ...mockMessage1, is_active: false }); // Toggled
        expect(result[1]).toEqual({ ...mockMessage2, is_active: true }); // Toggled

        expect(mockUpdateStmt.run).toHaveBeenCalledTimes(2);
        expect(mockUpdateStmt.run).toHaveBeenCalledWith(0, messageId1); // true -> false (0)
        expect(mockUpdateStmt.run).toHaveBeenCalledWith(1, messageId2); // false -> true (1)
      });
    });

    describe('mixed operations', () => {
      it('should handle mixed update and toggle operations', () => {
        const messageId1 = uuidv4();
        const messageId2 = uuidv4();

        const operations = [
          { type: 'update' as const, messageId: messageId1, isActive: true },
          { type: 'toggle' as const, messageId: messageId2 },
        ];

        const mockMessage1 = {
          id: messageId1,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Updated message',
          type: 'text',
          is_active: true,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        };

        const mockMessage2 = {
          id: messageId2,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Toggled message',
          type: 'text',
          is_active: false,
          timestamp: '2025-07-12T10:01:00Z',
          metadata: {},
        };

        mockUpdateStmt.run.mockReturnValue({ changes: 1 });
        mockSelectStmt.get
          .mockReturnValueOnce(mockMessage1) // For update result
          .mockReturnValueOnce(mockMessage2); // For toggle read

        const result = batchMessageActiveStateOperation(operations);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(mockMessage1);
        expect(result[1]).toEqual({ ...mockMessage2, is_active: true }); // Toggled
      });
    });

    describe('validation errors', () => {
      it('should throw error for update operation missing isActive', () => {
        const operations = [
          { type: 'update' as const, messageId: uuidv4() }, // Missing isActive
        ];

        expect(() => batchMessageActiveStateOperation(operations)).toThrow(
          'Batch operation failed at step 1: Operation 1 failed: isActive is required for update operation on message',
        );

        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });

      it('should throw error for invalid operation type', () => {
        const operations = [{ type: 'invalid' as any, messageId: uuidv4() }];

        expect(() => batchMessageActiveStateOperation(operations)).toThrow(
          'Batch operation failed at step 1: Operation 1 failed: Invalid operation type: invalid',
        );

        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });
    });

    describe('database errors and rollback', () => {
      it('should throw error when message not found for update', () => {
        const messageId = uuidv4();
        const operations = [{ type: 'update' as const, messageId, isActive: true }];

        mockUpdateStmt.run.mockReturnValue({ changes: 0 }); // No rows updated

        expect(() => batchMessageActiveStateOperation(operations)).toThrow(
          `Batch operation failed at step 1: Operation 1 failed: Message not found: ${messageId}`,
        );

        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });

      it('should throw error when message not found for toggle', () => {
        const messageId = uuidv4();
        const operations = [{ type: 'toggle' as const, messageId }];

        mockSelectStmt.get.mockReturnValue(undefined); // Message not found

        expect(() => batchMessageActiveStateOperation(operations)).toThrow(
          `Batch operation failed at step 1: Operation 1 failed: Message not found: ${messageId}`,
        );

        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });

      it('should throw error when toggle update fails', () => {
        const messageId = uuidv4();
        const operations = [{ type: 'toggle' as const, messageId }];

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

        expect(() => batchMessageActiveStateOperation(operations)).toThrow(
          `Batch operation failed at step 1: Operation 1 failed: Failed to update message: ${messageId}`,
        );

        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });

      it('should rollback when any operation fails', () => {
        const messageId1 = uuidv4();
        const messageId2 = uuidv4();

        const operations = [
          { type: 'update' as const, messageId: messageId1, isActive: true },
          { type: 'update' as const, messageId: messageId2, isActive: false },
        ];

        const mockMessage1 = {
          id: messageId1,
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Message 1',
          type: 'text',
          is_active: true,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        };

        mockUpdateStmt.run
          .mockReturnValueOnce({ changes: 1 }) // First operation succeeds
          .mockReturnValueOnce({ changes: 0 }); // Second operation fails

        mockSelectStmt.get.mockReturnValue(mockMessage1);

        expect(() => batchMessageActiveStateOperation(operations)).toThrow(
          `Batch operation failed at step 2: Operation 2 failed: Message not found: ${messageId2}`,
        );

        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
        // Transaction should rollback, undoing the first successful operation
      });

      it('should throw error when updated message cannot be retrieved', () => {
        const messageId = uuidv4();
        const operations = [{ type: 'update' as const, messageId, isActive: true }];

        mockUpdateStmt.run.mockReturnValue({ changes: 1 });
        mockSelectStmt.get.mockReturnValue(null); // Message not found after update

        expect(() => batchMessageActiveStateOperation(operations)).toThrow(
          `Batch operation failed at step 1: Operation 1 failed: Failed to retrieve updated message: ${messageId}`,
        );

        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();
      });
    });

    describe('transaction atomicity', () => {
      it('should execute all operations within single transaction', () => {
        const operations = [
          { type: 'update' as const, messageId: uuidv4(), isActive: true },
          { type: 'toggle' as const, messageId: uuidv4() },
          { type: 'update' as const, messageId: uuidv4(), isActive: false },
        ];

        // Mock all required database responses
        const mockMessage = {
          id: uuidv4(),
          conversation_id: uuidv4(),
          agent_id: uuidv4(),
          content: 'Test message',
          type: 'text',
          is_active: true,
          timestamp: '2025-07-12T10:00:00Z',
          metadata: {},
        };

        mockUpdateStmt.run.mockReturnValue({ changes: 1 });
        mockSelectStmt.get.mockReturnValue(mockMessage);

        batchMessageActiveStateOperation(operations);

        // Should execute in exactly one transaction
        expect(mockTransactionManager.executeTransaction).toHaveBeenCalledOnce();

        // All operations should happen within that transaction
        expect(mockUpdateStmt.run).toHaveBeenCalledTimes(3);
      });
    });

    describe('empty operations', () => {
      it('should validate empty operations array', () => {
        expect(() => batchMessageActiveStateOperation([])).toThrow(
          'No operations provided for batch execution',
        );

        expect(mockTransactionManager.executeTransaction).not.toHaveBeenCalled();
        expect(mockUpdateStmt.run).not.toHaveBeenCalled();
        expect(mockSelectStmt.get).not.toHaveBeenCalled();
      });
    });
  });
});

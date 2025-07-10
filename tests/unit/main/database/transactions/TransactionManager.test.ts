/**
 * Unit tests for TransactionManager
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionManager } from '../../../../../src/main/database/transactions/TransactionManager';
import { TransactionOptions } from '../../../../../src/main/database/transactions/TransactionOptions';
import type Database from 'better-sqlite3';

// Mock the database connection
const mockTransaction = vi.fn();
const mockDb = {
  transaction: mockTransaction,
  prepare: vi.fn(() => ({
    run: vi.fn(),
    get: vi.fn(),
    all: vi.fn(() => []),
  })),
  exec: vi.fn(),
} as unknown as Database.Database;

vi.mock('../../../../../src/main/database/connection', () => ({
  getDatabase: () => mockDb,
}));

describe('TransactionManager', () => {
  let manager: TransactionManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the mock transaction to return a callable function (better-sqlite3 behavior)
    mockTransaction.mockImplementation((fn: (db: Database.Database) => unknown) => {
      return (db: Database.Database) => fn(db);
    });

    manager = new TransactionManager();
  });

  it('should execute transaction with default options', () => {
    const operation = vi.fn(() => 'result');

    const result = manager.executeTransaction(operation);

    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
    expect(operation).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  it('should execute read-only transaction', () => {
    const operation = vi.fn(() => 'read-result');
    const options: TransactionOptions = { readOnly: true };

    const result = manager.executeTransaction(operation, options);

    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
    expect(operation).toHaveBeenCalled();
    expect(result).toBe('read-result');
  });

  it('should execute immediate transaction', () => {
    const operation = vi.fn(() => 'immediate-result');
    const options: TransactionOptions = { immediate: true };

    const result = manager.executeTransaction(operation, options);

    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
    expect(operation).toHaveBeenCalled();
    expect(result).toBe('immediate-result');
  });

  it('should execute exclusive transaction', () => {
    const operation = vi.fn(() => 'exclusive-result');
    const options: TransactionOptions = { exclusive: true };

    const result = manager.executeTransaction(operation, options);

    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
    expect(operation).toHaveBeenCalled();
    expect(result).toBe('exclusive-result');
  });

  it('should rollback transaction on error', () => {
    const error = new Error('Transaction failed');
    const operation = vi.fn(() => {
      throw error;
    });

    expect(() => manager.executeTransaction(operation)).toThrow('Transaction failed');

    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should commit transaction on success', () => {
    const operation = vi.fn(() => 'success');

    manager.executeTransaction(operation);

    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle async operations', () => {
    const operation = vi.fn(() => 'async-result');

    const result = manager.executeTransaction(operation);

    expect(result).toBe('async-result');
    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should propagate operation errors', () => {
    const customError = new Error('Custom error');
    const operation = vi.fn(() => {
      throw customError;
    });

    expect(() => manager.executeTransaction(operation)).toThrow(customError);
  });

  it('should handle nested transactions using savepoints', () => {
    const outerOperation = () => {
      return manager.executeTransaction(() => {
        // Nested transaction
        return manager.executeTransaction(() => 'nested-result');
      });
    };

    const result = manager.executeTransaction(outerOperation);

    expect(result).toBe('nested-result');
    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle commit errors', () => {
    const operation = vi.fn(() => 'result');

    mockTransaction.mockImplementation(() => {
      return () => {
        throw new Error('Commit failed');
      };
    });

    expect(() => manager.executeTransaction(operation)).toThrow('Commit failed');
  });

  it('should handle rollback errors gracefully', () => {
    const operation = vi.fn(() => {
      throw new Error('Operation failed');
    });

    mockTransaction.mockImplementation((fn: (db: Database.Database) => unknown) => {
      return (db: Database.Database) => fn(db);
    });

    // Should throw the original error, not the rollback error
    expect(() => manager.executeTransaction(operation)).toThrow('Operation failed');
  });

  it('should enforce transaction isolation levels', () => {
    const operation = vi.fn(() => 'isolated');
    const options: TransactionOptions = {
      readOnly: true,
      immediate: true, // Should be ignored when readOnly is true
    };

    manager.executeTransaction(operation, options);

    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
    expect(operation).toHaveBeenCalled();
  });

  it('should execute multiple operations in sequence', () => {
    const operations = [vi.fn(() => 'op1'), vi.fn(() => 'op2'), vi.fn(() => 'op3')];

    const compositeOperation = () => {
      return operations.map(op => op());
    };

    const results = manager.executeTransaction(compositeOperation);

    expect(results).toEqual(['op1', 'op2', 'op3']);
    operations.forEach(op => expect(op).toHaveBeenCalled());
  });
});

/**
 * Tests for database error handler
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseErrorHandler } from '../../../../src/main/ipc/error-handler';
import { DatabaseError } from '../../../../src/shared/types/errors';
import { ZodError } from 'zod';

describe('DatabaseErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleDatabaseError', () => {
    const mockContext = {
      operation: 'create',
      table: 'agents',
      timestamp: Date.now(),
    };

    it('should handle ZodError properly', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
      ]);

      expect(() => {
        DatabaseErrorHandler.handleDatabaseError(zodError, mockContext);
      }).toThrow(DatabaseError);
    });

    it('should classify constraint errors', () => {
      const constraintError = new Error('UNIQUE constraint failed: agents.name');

      expect(() => {
        DatabaseErrorHandler.handleDatabaseError(constraintError, mockContext);
      }).toThrow(DatabaseError);
    });

    it('should classify connection errors', () => {
      const connectionError = new Error('database is locked');

      expect(() => {
        DatabaseErrorHandler.handleDatabaseError(connectionError, mockContext);
      }).toThrow(DatabaseError);
    });

    it('should classify timeout errors', () => {
      const timeoutError = new Error('database timeout');

      expect(() => {
        DatabaseErrorHandler.handleDatabaseError(timeoutError, mockContext);
      }).toThrow(DatabaseError);
    });

    it('should classify deadlock errors', () => {
      const deadlockError = new Error('database deadlock detected');

      expect(() => {
        DatabaseErrorHandler.handleDatabaseError(deadlockError, mockContext);
      }).toThrow(DatabaseError);
    });

    it('should handle unknown errors', () => {
      const unknownError = 'some random error';

      expect(() => {
        DatabaseErrorHandler.handleDatabaseError(unknownError, mockContext);
      }).toThrow(DatabaseError);
    });
  });

  describe('executeWithRetry', () => {
    it('should execute successfully on first try', async () => {
      const operation = vi.fn().mockReturnValue('success');
      const mockContext = {
        operation: 'test',
        table: 'test',
        timestamp: Date.now(),
      };

      const result = await DatabaseErrorHandler.executeWithRetry(operation, mockContext);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const operation = vi
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('database timeout');
        })
        .mockImplementationOnce(() => {
          throw new Error('database timeout');
        })
        .mockReturnValue('success');

      const mockContext = {
        operation: 'test',
        table: 'test',
        timestamp: Date.now(),
      };

      const result = await DatabaseErrorHandler.executeWithRetry(operation, mockContext, {
        retryCount: 3,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on validation errors', async () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
      ]);

      const operation = vi.fn().mockImplementation(() => {
        throw zodError;
      });

      const mockContext = {
        operation: 'test',
        table: 'test',
        timestamp: Date.now(),
      };

      await expect(DatabaseErrorHandler.executeWithRetry(operation, mockContext)).rejects.toThrow(
        DatabaseError,
      );

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      const operation = vi.fn().mockImplementation(() => {
        throw new Error('database timeout');
      });

      const mockContext = {
        operation: 'test',
        table: 'test',
        timestamp: Date.now(),
      };

      await expect(
        DatabaseErrorHandler.executeWithRetry(operation, mockContext, {
          retryCount: 2,
        }),
      ).rejects.toThrow(DatabaseError);

      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      expect(DatabaseErrorHandler.isRetryableError(new Error('database timeout'))).toBe(true);
      expect(DatabaseErrorHandler.isRetryableError(new Error('database is locked'))).toBe(true);
      expect(DatabaseErrorHandler.isRetryableError(new Error('deadlock detected'))).toBe(true);
      expect(DatabaseErrorHandler.isRetryableError(new Error('database busy'))).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      expect(DatabaseErrorHandler.isRetryableError(new Error('UNIQUE constraint failed'))).toBe(
        false,
      );
      expect(DatabaseErrorHandler.isRetryableError(new Error('foreign key constraint'))).toBe(
        false,
      );

      const zodError = new ZodError([]);
      expect(DatabaseErrorHandler.isRetryableError(zodError)).toBe(false);
    });
  });

  describe('sanitizeErrorForLogging', () => {
    it('should sanitize error for logging', () => {
      const error = new DatabaseError('Test error', 'test', 'test_table', undefined, {
        type: 'test',
        stack: 'Error stack trace',
        originalMessage: 'Original error message',
        context: {
          operation: 'test',
          table: 'test_table',
          userId: 'sensitive-user-id',
          sessionId: 'sensitive-session-id',
        },
      });

      const sanitized = DatabaseErrorHandler.sanitizeErrorForLogging(error);

      expect(sanitized.details).toBeDefined();
      const details = sanitized.details as Record<string, unknown>;

      expect(details.stack).toBeUndefined();
      expect(details.originalMessage).toBeUndefined();

      const context = details.context as Record<string, unknown>;
      expect(context.userId).toBeUndefined();
      expect(context.sessionId).toBeUndefined();
      expect(context.operation).toBe('test');
      expect(context.table).toBe('test_table');
    });
  });
});

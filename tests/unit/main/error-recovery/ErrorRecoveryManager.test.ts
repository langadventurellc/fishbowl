import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorRecoveryManager } from '@main/error-recovery/ErrorRecoveryManager';
import type { ErrorRecoveryConfig } from '@main/error-recovery/ErrorRecoveryConfig';

describe('ErrorRecoveryManager', () => {
  let manager: ErrorRecoveryManager;
  let config: ErrorRecoveryConfig;

  beforeEach(() => {
    config = {
      circuitBreakerEnabled: true,
      circuitBreakerFailureThreshold: 3,
      circuitBreakerTimeout: 1000,
      retryEnabled: true,
      defaultMaxRetries: 2,
      defaultRetryDelay: 100,
      healthCheckInterval: 5000,
      gracefulDegradation: true,
    };

    manager = new ErrorRecoveryManager(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Recovery Strategy Registration', () => {
    it('should register and find recovery strategies', () => {
      const testStrategy = {
        name: 'test-strategy',
        canRecover: (error: Error) => error.message.includes('test'),
        recover: () => Promise.resolve({ success: true, message: 'recovered' }),
        maxRetries: 1,
        retryDelay: 100,
      };

      manager.addStrategy('test', testStrategy);

      const stats = manager.getRecoveryStats();
      expect(stats.strategies).toContain('test');
    });

    it('should remove recovery strategies', () => {
      const testStrategy = {
        name: 'test-strategy',
        canRecover: () => true,
        recover: () => Promise.resolve({ success: true, message: 'recovered' }),
        maxRetries: 1,
        retryDelay: 100,
      };

      manager.addStrategy('test', testStrategy);
      manager.removeStrategy('test');

      const stats = manager.getRecoveryStats();
      expect(stats.strategies).not.toContain('test');
    });
  });

  describe('Error Recovery', () => {
    it('should successfully recover from database errors', async () => {
      const databaseError = new Error('database connection failed');

      const result = await manager.recoverFromError(databaseError, {
        channel: 'db:agents:create',
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('database-connection');
      expect(result.retryAttempts).toBe(1);
    });

    it('should handle keytar/secure storage errors', async () => {
      const keytarError = new Error('keytar operation failed');

      const result = await manager.recoverFromError(keytarError, {
        channel: 'secure:credentials:set',
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('secure-storage');
      expect(result.fallback).toBe(true);
    });

    it('should handle network errors with retries', async () => {
      const networkError = new Error('network timeout');

      const result = await manager.recoverFromError(networkError, {
        channel: 'external:api:call',
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('network');
    });

    it('should fail when no recovery strategy is available', async () => {
      const unknownError = new Error('unknown system failure');

      const result = await manager.recoverFromError(unknownError, {
        channel: 'unknown:operation',
      });

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('none');
      expect(result.message).toBe('No recovery strategy available');
    });

    it('should respect max retry limits', async () => {
      const persistentError = new Error('database connection failed');

      // First recovery attempt
      const result1 = await manager.recoverFromError(persistentError, {
        channel: 'db:test:operation',
      });
      expect(result1.success).toBe(true);
      expect(result1.retryAttempts).toBe(1);

      // Second recovery attempt
      const result2 = await manager.recoverFromError(persistentError, {
        channel: 'db:test:operation',
      });
      expect(result2.success).toBe(true);
      expect(result2.retryAttempts).toBe(2);

      // Third recovery attempt
      const result3 = await manager.recoverFromError(persistentError, {
        channel: 'db:test:operation',
      });
      expect(result3.success).toBe(true);
      expect(result3.retryAttempts).toBe(3);

      // Fourth attempt should fail (max 3 retries for database-connection)
      const result4 = await manager.recoverFromError(persistentError, {
        channel: 'db:test:operation',
      });
      expect(result4.success).toBe(false);
      expect(result4.message).toContain('Max retry attempts');
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit breaker after threshold failures', async () => {
      const persistentError = new Error('persistent failure');
      const channel = 'test:circuit:breaker';

      // Add a test strategy that always fails
      manager.addStrategy('always-fail', {
        name: 'always-fail',
        canRecover: () => true,
        recover: () => Promise.resolve({ success: false, message: 'always fails' }),
        maxRetries: 1,
        retryDelay: 10,
      });

      // Cause failures to exceed threshold
      for (let i = 0; i < config.circuitBreakerFailureThreshold; i++) {
        await manager.recoverFromError(persistentError, { channel });
      }

      // Next attempt should be blocked by circuit breaker
      const result = await manager.recoverFromError(persistentError, { channel });
      expect(result.success).toBe(false);
      expect(result.strategy).toBe('circuit-breaker');
      expect(result.message).toContain('Circuit breaker is open');
    });

    it('should reset circuit breaker after timeout', async () => {
      const error = new Error('test error');
      const channel = 'test:circuit:reset';

      // Add a test strategy
      let shouldFail = true;
      manager.addStrategy('conditional-fail', {
        name: 'conditional-fail',
        canRecover: () => true,
        recover: () =>
          Promise.resolve({
            success: !shouldFail,
            message: shouldFail ? 'failing' : 'success',
          }),
        maxRetries: 1,
        retryDelay: 10,
      });

      // Trigger circuit breaker
      for (let i = 0; i < config.circuitBreakerFailureThreshold; i++) {
        await manager.recoverFromError(error, { channel });
      }

      // Wait for circuit breaker timeout
      await new Promise(resolve => setTimeout(resolve, config.circuitBreakerTimeout + 100));

      // Strategy should now succeed
      shouldFail = false;
      const result = await manager.recoverFromError(error, { channel });
      expect(result.success).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('should reset retry attempts', () => {
      manager.resetRetryAttempts('database-connection', 'db:test');
      const stats = manager.getRecoveryStats();
      expect(stats.activeRetries['database-connection:db:test']).toBeUndefined();
    });

    it('should reset circuit breakers', () => {
      manager.resetCircuitBreaker('test:channel');
      const stats = manager.getRecoveryStats();
      expect(stats.circuitBreakers['test:channel']).toBeUndefined();
    });

    it('should provide recovery statistics', () => {
      const stats = manager.getRecoveryStats();
      expect(stats).toHaveProperty('strategies');
      expect(stats).toHaveProperty('activeRetries');
      expect(stats).toHaveProperty('circuitBreakers');
      expect(Array.isArray(stats.strategies)).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should perform comprehensive health check', async () => {
      const healthStatus = await manager.performHealthCheck();

      expect(healthStatus).toHaveProperty('database');
      expect(healthStatus).toHaveProperty('secureStorage');
      expect(healthStatus).toHaveProperty('filesystem');
      expect(healthStatus).toHaveProperty('memory');

      // Health check results should be boolean
      Object.values(healthStatus).forEach(status => {
        expect(typeof status).toBe('boolean');
      });
    });
  });

  describe('File System Recovery', () => {
    it('should handle file not found errors', async () => {
      const fileError = new Error('ENOENT: no such file or directory');

      const result = await manager.recoverFromError(fileError, {
        channel: 'config:save',
        filePath: '/test/path/config.json',
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('filesystem');
    });
  });

  describe('Memory Pressure Recovery', () => {
    it('should handle memory errors', async () => {
      const memoryError = new Error('heap out of memory');

      const result = await manager.recoverFromError(memoryError, {
        channel: 'data:process',
      });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('memory');
      expect(result.message).toContain('Memory cleanup performed');
    });
  });
});

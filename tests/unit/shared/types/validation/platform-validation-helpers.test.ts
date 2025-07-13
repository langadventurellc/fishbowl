/**
 * Test Suite: Platform Validation Helper Functions
 *
 * Tests for validation environment detection functions that control schema behavior
 * in different test scenarios (validation tests vs cache TTL tests).
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { isValidationTestEnvironment } from '../../../../../src/shared/types/validation/platformSchema/isValidationTestEnvironment';
import { isCacheTTLTestEnvironment } from '../../../../../src/shared/types/validation/platformSchema/isCacheTTLTestEnvironment';

describe('Platform Validation Helper Functions', () => {
  // Store original values for cleanup
  let originalGlobal: typeof globalThis;
  let originalProcess: typeof process;

  beforeEach(() => {
    // Store original values
    originalGlobal = globalThis;
    originalProcess = process;
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(globalThis, 'global', {
      value: originalGlobal,
      writable: true,
      configurable: true,
    });

    // Restore process if it was modified
    if (originalProcess) {
      Object.defineProperty(globalThis, 'process', {
        value: originalProcess,
        writable: true,
        configurable: true,
      });
    }

    // Clean up any global test flags
    if (global && '__VITEST_VALIDATION_TEST__' in global) {
      delete (global as any).__VITEST_VALIDATION_TEST__;
    }
  });

  describe('isValidationTestEnvironment()', () => {
    test('should return false when global is undefined', () => {
      // Mock global as undefined
      Object.defineProperty(globalThis, 'global', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const result = isValidationTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when global exists but __VITEST_VALIDATION_TEST__ is undefined', () => {
      // Ensure __VITEST_VALIDATION_TEST__ is not set
      if (global && '__VITEST_VALIDATION_TEST__' in global) {
        delete (global as any).__VITEST_VALIDATION_TEST__;
      }

      const result = isValidationTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when __VITEST_VALIDATION_TEST__ is false', () => {
      (global as any).__VITEST_VALIDATION_TEST__ = false;

      const result = isValidationTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return true when __VITEST_VALIDATION_TEST__ is true', () => {
      (global as any).__VITEST_VALIDATION_TEST__ = true;

      const result = isValidationTestEnvironment();
      expect(result).toBe(true);
    });

    test('should return true when __VITEST_VALIDATION_TEST__ is truthy non-boolean', () => {
      (global as any).__VITEST_VALIDATION_TEST__ = 'test';

      const result = isValidationTestEnvironment();
      expect(result).toBe(true);
    });

    test('should return false when __VITEST_VALIDATION_TEST__ is falsy non-boolean', () => {
      (global as any).__VITEST_VALIDATION_TEST__ = '';

      const result = isValidationTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when __VITEST_VALIDATION_TEST__ is null', () => {
      (global as any).__VITEST_VALIDATION_TEST__ = null;

      const result = isValidationTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when __VITEST_VALIDATION_TEST__ is zero', () => {
      (global as any).__VITEST_VALIDATION_TEST__ = 0;

      const result = isValidationTestEnvironment();
      expect(result).toBe(false);
    });
  });

  describe('isCacheTTLTestEnvironment()', () => {
    test('should return false when process is undefined', () => {
      // Mock process as undefined
      Object.defineProperty(globalThis, 'process', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when process.env is undefined', () => {
      const mockProcess = {} as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when NODE_ENV is not test', () => {
      const mockProcess = {
        env: { NODE_ENV: 'development' },
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when NODE_ENV is production', () => {
      const mockProcess = {
        env: { NODE_ENV: 'production' },
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return true when NODE_ENV is test and not in validation test mode', () => {
      const mockProcess = {
        env: { NODE_ENV: 'test' },
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      // Ensure validation test flag is not set
      if (global && '__VITEST_VALIDATION_TEST__' in global) {
        delete (global as any).__VITEST_VALIDATION_TEST__;
      }

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(true);
    });

    test('should return false when NODE_ENV is test but in validation test mode', () => {
      const mockProcess = {
        env: { NODE_ENV: 'test' },
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      // Set validation test flag
      (global as any).__VITEST_VALIDATION_TEST__ = true;

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when NODE_ENV is undefined', () => {
      const mockProcess = {
        env: {},
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(false);
    });

    test('should return false when NODE_ENV is empty string', () => {
      const mockProcess = {
        env: { NODE_ENV: '' },
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(false);
    });

    test('should handle case-sensitive NODE_ENV comparison', () => {
      const mockProcess = {
        env: { NODE_ENV: 'TEST' }, // uppercase
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      const result = isCacheTTLTestEnvironment();
      expect(result).toBe(false); // Should be false because 'TEST' !== 'test'
    });
  });

  describe('Integration Tests', () => {
    test('should correctly differentiate between validation and cache TTL test environments', () => {
      const mockProcess = {
        env: { NODE_ENV: 'test' },
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      // Test cache TTL environment (validation flag not set)
      if (global && '__VITEST_VALIDATION_TEST__' in global) {
        delete (global as any).__VITEST_VALIDATION_TEST__;
      }

      expect(isValidationTestEnvironment()).toBe(false);
      expect(isCacheTTLTestEnvironment()).toBe(true);

      // Test validation environment (validation flag set)
      (global as any).__VITEST_VALIDATION_TEST__ = true;

      expect(isValidationTestEnvironment()).toBe(true);
      expect(isCacheTTLTestEnvironment()).toBe(false);
    });

    test('should handle edge case where both environments are false', () => {
      const mockProcess = {
        env: { NODE_ENV: 'development' },
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      // Ensure validation test flag is not set
      if (global && '__VITEST_VALIDATION_TEST__' in global) {
        delete (global as any).__VITEST_VALIDATION_TEST__;
      }

      expect(isValidationTestEnvironment()).toBe(false);
      expect(isCacheTTLTestEnvironment()).toBe(false);
    });

    test('should maintain consistent behavior across multiple calls', () => {
      (global as any).__VITEST_VALIDATION_TEST__ = true;

      // Multiple calls should return consistent results
      expect(isValidationTestEnvironment()).toBe(true);
      expect(isValidationTestEnvironment()).toBe(true);
      expect(isValidationTestEnvironment()).toBe(true);

      const mockProcess = {
        env: { NODE_ENV: 'test' },
      } as unknown as typeof process;
      Object.defineProperty(globalThis, 'process', {
        value: mockProcess,
        writable: true,
        configurable: true,
      });

      // Should still be false because validation flag is set
      expect(isCacheTTLTestEnvironment()).toBe(false);
      expect(isCacheTTLTestEnvironment()).toBe(false);
      expect(isCacheTTLTestEnvironment()).toBe(false);
    });
  });
});

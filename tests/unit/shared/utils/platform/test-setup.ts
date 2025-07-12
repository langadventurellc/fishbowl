import { vi, beforeEach, afterEach } from 'vitest';
import { webEnvironment } from './mock-environments';

/**
 * Platform detection test setup configuration
 * Provides standardized test environment setup for platform detection testing
 * with security validation and performance monitoring
 */

/**
 * Global test setup for platform detection tests
 * Sets up default web environment and common mocks
 */
export const setupPlatformTests = (): void => {
  // Store original console methods for restoration

  beforeEach(() => {
    // Setup default web environment (clean slate)
    webEnvironment.setup();

    // Mock performance API for platform detection timing tests
    if (!globalThis.performance) {
      Object.defineProperty(globalThis, 'performance', {
        value: {
          now: vi.fn(() => Date.now()),
          mark: vi.fn(),
          measure: vi.fn(),
          getEntriesByName: vi.fn(() => []),
          getEntriesByType: vi.fn(() => []),
          clearMarks: vi.fn(),
          clearMeasures: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    }

    // Mock global timing functions for cache testing
    if (!globalThis.setTimeout) {
      const mockSetTimeout = vi.fn((fn: () => void, _delay: number) => {
        // For testing, execute immediately
        fn();
        return 1 as unknown as ReturnType<typeof setTimeout>;
      });
      // Add missing __promisify__ property for TypeScript compatibility
      (mockSetTimeout as any).__promisify__ = vi.fn();
      globalThis.setTimeout = mockSetTimeout as unknown as typeof setTimeout;
    }

    if (!globalThis.clearTimeout) {
      globalThis.clearTimeout = vi.fn();
    }

    // Mock localStorage for platform cache testing
    if (!globalThis.localStorage) {
      const storage: Record<string, string> = {};
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: vi.fn((key: string) => storage[key] || null),
          setItem: vi.fn((key: string, value: string) => {
            storage[key] = value;
          }),
          removeItem: vi.fn((key: string) => {
            delete storage[key];
          }),
          clear: vi.fn(() => {
            Object.keys(storage).forEach(key => delete storage[key]);
          }),
          key: vi.fn((index: number) => Object.keys(storage)[index] || null),
          get length() {
            return Object.keys(storage).length;
          },
        },
        writable: true,
        configurable: true,
      });
    }

    // Mock sessionStorage for temporary platform cache
    if (!globalThis.sessionStorage) {
      const storage: Record<string, string> = {};
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: {
          getItem: vi.fn((key: string) => storage[key] || null),
          setItem: vi.fn((key: string, value: string) => {
            storage[key] = value;
          }),
          removeItem: vi.fn((key: string) => {
            delete storage[key];
          }),
          clear: vi.fn(() => {
            Object.keys(storage).forEach(key => delete storage[key]);
          }),
          key: vi.fn((index: number) => Object.keys(storage)[index] || null),
          get length() {
            return Object.keys(storage).length;
          },
        },
        writable: true,
        configurable: true,
      });
    }
  });

  afterEach(() => {
    // Cleanup mock environment
    webEnvironment.cleanup();

    // Reset all mocks
    vi.clearAllMocks();

    // Clear localStorage mock
    if (globalThis.localStorage && 'clear' in globalThis.localStorage) {
      globalThis.localStorage.clear();
    }

    // Clear sessionStorage mock
    if (globalThis.sessionStorage && 'clear' in globalThis.sessionStorage) {
      globalThis.sessionStorage.clear();
    }
  });
};

/**
 * Security validation helpers for platform detection testing
 */
export const securityTestHelpers = {
  /**
   * Test that global object access is safe and doesn't throw errors
   * @param globalName - Name of the global object to test
   * @returns Object with safety check results
   */
  testSafeGlobalAccess: (globalName: string): { safe: boolean; value: unknown; error?: Error } => {
    try {
      const value = (globalThis as any)[globalName];
      return { safe: true, value };
    } catch (error) {
      return { safe: false, value: undefined, error: error as Error };
    }
  },

  /**
   * Test that window object access is safe and doesn't throw errors
   * @param propertyName - Name of the window property to test
   * @returns Object with safety check results
   */
  testSafeWindowAccess: (
    propertyName: string,
  ): { safe: boolean; value: unknown; error?: Error } => {
    try {
      if (typeof window === 'undefined') {
        return { safe: true, value: undefined };
      }
      const value = (window as any)[propertyName];
      return { safe: true, value };
    } catch (error) {
      return { safe: false, value: undefined, error: error as Error };
    }
  },

  /**
   * Validate that platform detection doesn't expose sensitive information
   * @param detectionResult - Platform detection result to validate
   * @returns Validation result
   */
  validateNoSensitiveData: (detectionResult: unknown): { valid: boolean; issues?: string[] } => {
    const issues: string[] = [];
    const resultStr = JSON.stringify(detectionResult);

    // Check for common sensitive patterns
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /api[_-]?key/i,
      /private[_-]?key/i,
      /auth/i,
      /credential/i,
    ];

    sensitivePatterns.forEach(pattern => {
      if (pattern.test(resultStr)) {
        issues.push(`Potential sensitive data pattern detected: ${pattern}`);
      }
    });

    return {
      valid: issues.length === 0,
      ...(issues.length > 0 && { issues }),
    };
  },
};

/**
 * Performance testing helpers for platform detection
 */
export const performanceTestHelpers = {
  /**
   * Measure the execution time of a platform detection function
   * @param fn - Function to measure
   * @returns Execution time in milliseconds
   */
  measureExecutionTime: async <T>(
    fn: () => Promise<T> | T,
  ): Promise<{ result: T; time: number }> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return { result, time: end - start };
  },

  /**
   * Test that platform detection meets performance requirements
   * @param fn - Function to test
   * @param maxTimeMs - Maximum allowed execution time in milliseconds
   * @returns Performance test result
   */
  testPerformanceRequirement: async <T>(
    fn: () => Promise<T> | T,
    maxTimeMs: number,
  ): Promise<{ passed: boolean; time: number; result: T }> => {
    const { result, time } = await performanceTestHelpers.measureExecutionTime(fn);
    return {
      passed: time <= maxTimeMs,
      time,
      result,
    };
  },

  /**
   * Test memory usage during platform detection
   * @param fn - Function to test memory usage for
   * @returns Memory usage information (limited in browser environment)
   */
  testMemoryUsage: async <T>(
    fn: () => Promise<T> | T,
  ): Promise<{ result: T; memoryInfo?: any }> => {
    let memoryBefore: any;
    let memoryAfter: any;

    // Check if memory monitoring is available (performance.memory is Chrome-specific)
    if ('memory' in performance) {
      memoryBefore = { ...(performance as any).memory };
    }

    const result = await fn();

    if ('memory' in performance) {
      memoryAfter = { ...(performance as any).memory };
    }

    return {
      result,
      memoryInfo: memoryBefore &&
        memoryAfter && {
          before: memoryBefore,
          after: memoryAfter,
          delta: {
            usedJSHeapSize: memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize,
            totalJSHeapSize: memoryAfter.totalJSHeapSize - memoryBefore.totalJSHeapSize,
          },
        },
    };
  },
};

/**
 * Platform detection test utilities
 */
export const platformTestUtils = {
  /**
   * Create a standardized test context for platform detection
   * @returns Test context object with common utilities
   */
  createTestContext: () => ({
    security: securityTestHelpers,
    performance: performanceTestHelpers,

    /**
     * Validate that a platform detection result has expected structure
     * @param result - Platform detection result
     * @param expectedType - Expected platform type
     * @returns Validation result
     */
    validateResult: (
      result: unknown,
      expectedType: string,
    ): { valid: boolean; message?: string } => {
      if (typeof result !== 'boolean' && typeof result !== 'string' && typeof result !== 'object') {
        return {
          valid: false,
          message: 'Platform detection result must be boolean, string, or object',
        };
      }

      if (typeof result === 'string' && result !== expectedType) {
        return {
          valid: false,
          message: `Expected platform type '${expectedType}', got '${result}'`,
        };
      }

      return { valid: true };
    },

    /**
     * Test platform detection consistency across multiple calls
     * @param fn - Platform detection function to test
     * @param iterations - Number of test iterations
     * @returns Consistency test result
     */
    testConsistency: async <T>(
      fn: () => Promise<T> | T,
      iterations: number = 5,
    ): Promise<{ consistent: boolean; results: T[]; variations?: string }> => {
      const results: T[] = [];

      for (let i = 0; i < iterations; i++) {
        results.push(await fn());
      }

      const firstResult = JSON.stringify(results[0]);
      const consistent = results.every(result => JSON.stringify(result) === firstResult);

      return {
        consistent,
        results,
        ...(!consistent && {
          variations: results.map((r, i) => `Iteration ${i}: ${JSON.stringify(r)}`).join(', '),
        }),
      };
    },
  }),
};

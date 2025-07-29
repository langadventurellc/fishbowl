/**
 * @fileoverview Test Setup Configuration
 *
 * Global test setup for integration tests with custom matchers and cleanup.
 */

// Global test setup
beforeEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Custom matchers for better assertions
expect.extend({
  toBeWithinTimeLimit(received: number, limit: number) {
    const pass = received <= limit;
    return {
      message: () =>
        `Expected execution time ${received}ms to be within ${limit}ms`,
      pass,
    };
  },
});

// Declare custom matcher types for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinTimeLimit(limit: number): R;
    }
  }
}

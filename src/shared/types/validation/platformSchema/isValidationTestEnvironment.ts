/**
 * Validation Test Environment Detection
 *
 * Safely checks if the current test environment is running validation schema tests.
 */

// Global type extension for test environment flag
declare global {
  var __VITEST_VALIDATION_TEST__: boolean | undefined;
}

/**
 * Safely checks if the current test environment is running validation schema tests
 * This allows validation schemas to behave differently for dedicated validation tests
 * vs cache TTL tests that use fake timers.
 *
 * @returns true if running in validation schema test mode, false otherwise
 */
export function isValidationTestEnvironment(): boolean {
  return typeof global !== 'undefined' && Boolean(global.__VITEST_VALIDATION_TEST__);
}

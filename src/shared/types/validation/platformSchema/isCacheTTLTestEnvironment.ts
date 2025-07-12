/**
 * Cache TTL Test Environment Detection
 *
 * Checks if the current environment is a test environment but not a validation test.
 */

import { isValidationTestEnvironment } from './isValidationTestEnvironment';

/**
 * Checks if the current environment is a test environment but not a validation test
 * This is used to enable relaxed validation for cache TTL tests while maintaining
 * strict validation for validation schema tests.
 *
 * @returns true if in test environment but not validation tests, false otherwise
 */
export function isCacheTTLTestEnvironment(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.env?.NODE_ENV === 'test' &&
    !isValidationTestEnvironment()
  );
}

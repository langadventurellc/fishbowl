/**
 * Web Environment Type Guard
 *
 * Type guard function that checks if the current runtime environment is Web
 * and provides TypeScript type narrowing for Web-specific code blocks.
 * Integrates with the existing platform detection system for consistent behavior.
 */

import { isWebPlatform } from './isWebPlatform';
import type { WebEnvironment } from '../../types/platform/WebEnvironment';

/**
 * Type guard that checks if the current environment is Web
 *
 * This function serves as a TypeScript type guard, allowing for safe type narrowing
 * in conditional blocks. It integrates with the existing `isWebPlatform()`
 * function to maintain consistency across the platform detection system.
 *
 * @param _context - Runtime environment context (can be undefined for global detection)
 * @returns True if running in Web browser with type narrowing to WebEnvironment
 *
 * @example
 * ```typescript
 * // Global environment check
 * if (isWebEnvironment()) {
 *   // TypeScript knows this is Web environment
 *   console.log('Running in web browser');
 * }
 *
 * // With context object
 * const context = getRuntimeContext();
 * if (isWebEnvironment(context)) {
 *   // context is narrowed to WebEnvironment
 *   console.log(`Platform: ${context.platform}, Browser: ${context.isBrowser}`);
 * }
 * ```
 *
 * @throws Never throws - uses safe fallback for any detection errors
 */
export function isWebEnvironment(_context?: unknown): _context is WebEnvironment {
  try {
    return isWebPlatform();
  } catch {
    // Safe fallback for any detection errors
    return false;
  }
}

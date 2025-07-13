/**
 * Capacitor Environment Type Guard
 *
 * Type guard function that checks if the current runtime environment is Capacitor
 * and provides TypeScript type narrowing for Capacitor-specific code blocks.
 * Integrates with the existing platform detection system for consistent behavior.
 */

import { isCapacitorPlatform } from './isCapacitorPlatform';
import type { CapacitorEnvironment } from '../../types/platform/CapacitorEnvironment';

/**
 * Type guard that checks if the current environment is Capacitor
 *
 * This function serves as a TypeScript type guard, allowing for safe type narrowing
 * in conditional blocks. It integrates with the existing `isCapacitorPlatform()`
 * function to maintain consistency across the platform detection system.
 *
 * @param _context - Runtime environment context (can be undefined for global detection)
 * @returns True if running in Capacitor with type narrowing to CapacitorEnvironment
 *
 * @example
 * ```typescript
 * // Global environment check
 * if (isCapacitorEnvironment()) {
 *   // TypeScript knows this is Capacitor environment
 *   console.log('Running in Capacitor mobile app');
 * }
 *
 * // With context object
 * const context = getRuntimeContext();
 * if (isCapacitorEnvironment(context)) {
 *   // context is narrowed to CapacitorEnvironment
 *   console.log(`Platform: ${context.platform}, Mobile: ${context.isMobile}`);
 * }
 * ```
 *
 * @throws Never throws - uses safe fallback for any detection errors
 */
export function isCapacitorEnvironment(_context?: unknown): _context is CapacitorEnvironment {
  try {
    return isCapacitorPlatform();
  } catch {
    // Safe fallback for any detection errors
    return false;
  }
}

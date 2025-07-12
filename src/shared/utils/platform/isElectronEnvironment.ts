/**
 * Electron Environment Type Guard
 *
 * Type guard function that checks if the current runtime environment is Electron
 * and provides TypeScript type narrowing for Electron-specific code blocks.
 * Integrates with the existing platform detection system for consistent behavior.
 */

import { isElectronPlatform } from './isElectronPlatform';
import type { ElectronEnvironment } from '../../types/platform/ElectronEnvironment';

/**
 * Type guard that checks if the current environment is Electron
 *
 * This function serves as a TypeScript type guard, allowing for safe type narrowing
 * in conditional blocks. It integrates with the existing `isElectronPlatform()`
 * function to maintain consistency across the platform detection system.
 *
 * @param _context - Runtime environment context (can be undefined for global detection)
 * @returns True if running in Electron with type narrowing to ElectronEnvironment
 *
 * @example
 * ```typescript
 * // Global environment check
 * if (isElectronEnvironment()) {
 *   // TypeScript knows this is Electron environment
 *   console.log('Running in Electron desktop app');
 * }
 *
 * // With context object
 * const context = getRuntimeContext();
 * if (isElectronEnvironment(context)) {
 *   // context is narrowed to ElectronEnvironment
 *   console.log(`Platform: ${context.platform}`);
 * }
 * ```
 *
 * @throws Never throws - uses safe fallback for any detection errors
 */
export function isElectronEnvironment(_context?: unknown): _context is ElectronEnvironment {
  try {
    return isElectronPlatform();
  } catch {
    // Safe fallback for any detection errors
    return false;
  }
}

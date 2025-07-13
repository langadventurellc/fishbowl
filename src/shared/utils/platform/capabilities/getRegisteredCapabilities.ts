/**
 * Get Registered Capabilities Utility
 *
 * Provides a function for retrieving all capabilities supported
 * by registered detectors.
 */

import { getGlobalCapabilityManager } from './capabilityManager/index';

/**
 * Gets all capability IDs supported by registered detectors
 *
 * This function provides a way to discover what capabilities
 * are available for detection in the current environment.
 *
 * @returns Array of supported capability IDs
 *
 * @example
 * ```typescript
 * import { getRegisteredCapabilities } from '@/shared/utils/platform';
 *
 * const capabilities = getRegisteredCapabilities();
 * console.log('Supported capabilities:', capabilities);
 * // Output: ['secure-storage', 'file-system', 'notifications', ...]
 * ```
 */
export function getRegisteredCapabilities(): string[] {
  try {
    const manager = getGlobalCapabilityManager();
    return manager.getSupportedCapabilities();
  } catch (error: unknown) {
    // If manager creation fails, return empty array
    // Log error for debugging but don't throw
    console.error('Failed to get registered capabilities:', error);
    return [];
  }
}

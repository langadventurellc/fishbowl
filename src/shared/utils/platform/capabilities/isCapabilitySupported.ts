/**
 * Capability Support Check Utility
 *
 * Provides a convenient function for checking if a capability is supported
 * by any registered detector.
 */

import { getGlobalCapabilityManager } from './capabilityManager/index';

/**
 * Checks if a capability is supported by any registered detector
 *
 * This function provides a quick way to check if a capability
 * can be detected without actually performing the detection.
 *
 * @param capabilityId - The ID of the capability to check
 * @returns True if the capability is supported by a registered detector
 *
 * @example
 * ```typescript
 * import { isCapabilitySupported } from '@/shared/utils/platform';
 *
 * if (isCapabilitySupported('secure-storage')) {
 *   // Secure storage capability can be detected
 *   console.log('Secure storage detection is available');
 * }
 * ```
 */
export function isCapabilitySupported(capabilityId: string): boolean {
  try {
    const manager = getGlobalCapabilityManager();
    return manager.isCapabilitySupported(capabilityId);
  } catch (error: unknown) {
    // If manager creation fails, assume capability is not supported
    // Log error for debugging but don't throw
    console.error('Failed to check capability support:', error);
    return false;
  }
}

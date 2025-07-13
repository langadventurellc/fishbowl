/**
 * Register Capability Detector Utility
 *
 * Provides a convenient function for registering capability detectors
 * with the global capability manager instance.
 */

import { CapabilityDetector } from './CapabilityDetector';
import { getGlobalCapabilityManager } from './capabilityManager/index';

/**
 * Registers a capability detector with the global capability manager
 *
 * This function provides a convenient way to register new capability
 * detectors without needing to manage CapabilityManager instances directly.
 *
 * @param detector - The capability detector to register
 * @throws Error if detector is invalid or already registered
 *
 * @example
 * ```typescript
 * import { registerCapabilityDetector } from '@/shared/utils/platform';
 * import { SecureStorageDetector } from './SecureStorageDetector';
 *
 * // Register a new capability detector
 * registerCapabilityDetector(new SecureStorageDetector());
 * ```
 */
export function registerCapabilityDetector(detector: CapabilityDetector): void {
  try {
    const manager = getGlobalCapabilityManager();
    manager.registerDetector(detector);
  } catch (error: unknown) {
    // Re-throw registration errors as they indicate a serious problem
    const message =
      error instanceof Error ? error.message : 'Unknown error during detector registration';
    throw new Error(`Failed to register capability detector: ${message}`);
  }
}

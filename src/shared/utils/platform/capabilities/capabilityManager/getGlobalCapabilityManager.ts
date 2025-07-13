/**
 * Global Capability Manager Singleton
 *
 * Provides access to a global CapabilityManager instance.
 * Ensures single instance across the application for consistent capability detection.
 */

import { CapabilityManager } from '../CapabilityManager';
import { CapabilityDetectionConfig } from '../capabilityConfig/CapabilityDetectionConfig';
import { getCurrentGlobalCapabilityManager } from './getCurrentGlobalCapabilityManager';
import { setGlobalCapabilityManager } from './setGlobalCapabilityManager';

/**
 * Gets the global capability manager instance
 *
 * Creates a new instance if none exists, or returns the existing instance.
 * Ensures singleton behavior for consistent capability detection across the application.
 *
 * @param config - Optional configuration for the manager (only used on first creation)
 * @returns The global CapabilityManager instance
 *
 * @example
 * ```typescript
 * import { getGlobalCapabilityManager } from '@/shared/utils/platform';
 *
 * const manager = getGlobalCapabilityManager();
 * const result = await manager.detectCapability(capability);
 * ```
 */
export function getGlobalCapabilityManager(
  config?: Partial<CapabilityDetectionConfig>,
): CapabilityManager {
  let globalCapabilityManager = getCurrentGlobalCapabilityManager();
  if (!globalCapabilityManager) {
    globalCapabilityManager = new CapabilityManager(config);
    setGlobalCapabilityManager(globalCapabilityManager);
  }
  return globalCapabilityManager;
}

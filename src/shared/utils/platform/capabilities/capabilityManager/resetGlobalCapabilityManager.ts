/**
 * Reset Global Capability Manager Function
 *
 * Resets the global capability manager instance.
 */

import { CapabilityManager } from '..';
import { CapabilityDetectionConfig } from '../capabilityConfig/CapabilityDetectionConfig';
import { setGlobalCapabilityManager } from './setGlobalCapabilityManager';

/**
 * Resets the global capability manager instance
 *
 * Creates a new manager instance, discarding the existing one.
 * Useful for testing or when configuration needs to change.
 *
 * @param config - Optional configuration for the new manager
 * @returns The new CapabilityManager instance
 */
export function resetGlobalCapabilityManager(
  config?: Partial<CapabilityDetectionConfig>,
): CapabilityManager {
  const newManager = new CapabilityManager(config);
  setGlobalCapabilityManager(newManager);
  return newManager;
}

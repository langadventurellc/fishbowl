/**
 * Internal Global Capability Manager Setter
 *
 * Internal function for setting the global capability manager instance.
 */

import { CapabilityManager } from '..';

/**
 * Global capability manager instance storage
 */
let globalCapabilityManager: CapabilityManager | null = null;

/**
 * Sets the global capability manager instance (internal use)
 */
// eslint-disable-next-line multiple-exports/no-multiple-exports
export function setGlobalCapabilityManagerInternal(manager: CapabilityManager): void {
  globalCapabilityManager = manager;
}

/**
 * Gets the current global capability manager state (for internal access only)
 */
export function getCurrentGlobalCapabilityManagerState(): CapabilityManager | null {
  return globalCapabilityManager;
}

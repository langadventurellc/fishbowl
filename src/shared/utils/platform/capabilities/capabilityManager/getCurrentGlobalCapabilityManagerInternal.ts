/**
 * Internal Global Capability Manager Getter
 *
 * Internal function for getting the global capability manager instance.
 */

import { getCurrentGlobalCapabilityManagerState } from './setGlobalCapabilityManagerInternal';
import { CapabilityManager } from '..';

/**
 * Gets the current global capability manager instance (internal use)
 */
export function getCurrentGlobalCapabilityManagerInternal(): CapabilityManager | null {
  return getCurrentGlobalCapabilityManagerState();
}

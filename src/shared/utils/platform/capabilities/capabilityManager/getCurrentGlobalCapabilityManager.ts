/**
 * Get Current Global Capability Manager Function
 *
 * Gets the current global capability manager instance.
 */

import { getCurrentGlobalCapabilityManagerInternal } from './getCurrentGlobalCapabilityManagerInternal';

/**
 * Gets the current global capability manager instance
 */
export function getCurrentGlobalCapabilityManager() {
  return getCurrentGlobalCapabilityManagerInternal();
}

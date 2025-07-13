/**
 * Check Global Capability Manager Existence
 *
 * Checks if a global capability manager instance exists.
 */

import { getCurrentGlobalCapabilityManager } from './getCurrentGlobalCapabilityManager';

/**
 * Checks if a global capability manager instance exists
 *
 * @returns True if a global manager instance exists
 */
export function hasGlobalCapabilityManager(): boolean {
  return getCurrentGlobalCapabilityManager() !== null;
}

/**
 * Set Global Capability Manager Function
 *
 * Sets the global capability manager instance.
 */

import { CapabilityManager } from '..';
import { setGlobalCapabilityManagerInternal } from './setGlobalCapabilityManagerInternal';

/**
 * Sets the global capability manager instance
 */
export function setGlobalCapabilityManager(manager: CapabilityManager): void {
  setGlobalCapabilityManagerInternal(manager);
}

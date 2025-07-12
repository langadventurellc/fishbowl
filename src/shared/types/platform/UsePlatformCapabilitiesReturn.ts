/**
 * Use Platform Capabilities Hook Return Interface
 *
 * Complete return type for the usePlatformCapabilities React hook.
 * Combines capabilities state and actions following the established pattern.
 */

import { UsePlatformCapabilitiesState } from './UsePlatformCapabilitiesState';
import { UsePlatformCapabilitiesActions } from './UsePlatformCapabilitiesActions';

/**
 * Complete return type for the usePlatformCapabilities hook
 */
export interface UsePlatformCapabilitiesReturn
  extends UsePlatformCapabilitiesState,
    UsePlatformCapabilitiesActions {}

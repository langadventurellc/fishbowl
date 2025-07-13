/**
 * Use Platform Hook Return Interface
 *
 * Main return type for the usePlatform React hook.
 * Combines state and actions following the established hook pattern.
 */

import { UsePlatformState } from './UsePlatformState';
import { UsePlatformActions } from './UsePlatformActions';

/**
 * Complete return type for the usePlatform hook
 */
export interface UsePlatformReturn extends UsePlatformState, UsePlatformActions {}

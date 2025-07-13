/**
 * Use Platform Hook Actions Interface
 *
 * Defines the action methods for the usePlatform React hook.
 * Follows the established hook actions pattern used throughout the application.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Action methods for the usePlatform hook
 */
export interface UsePlatformActions {
  /**
   * Refresh platform detection information
   * @returns Promise resolving when detection is complete
   */
  refreshPlatform: () => Promise<void>;

  /**
   * Check if running on a specific platform type
   * @param platformType - Platform type to check
   * @returns Boolean indicating if current platform matches
   */
  isPlatform: (platformType: PlatformType) => boolean;

  /**
   * Get detailed platform information
   * @returns Promise resolving to platform information
   */
  getPlatformDetails: () => Promise<void>;

  /**
   * Clear any platform detection errors
   */
  clearError: () => void;

  /**
   * Force re-detection of platform (bypass cache)
   * @returns Promise resolving when re-detection is complete
   */
  forceRedetection: () => Promise<void>;
}

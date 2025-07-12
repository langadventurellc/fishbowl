/**
 * Use Platform Capabilities Hook Actions Interface
 *
 * Action methods for the usePlatformCapabilities React hook.
 * Provides methods to check and manage platform-specific capabilities.
 */

/**
 * Action methods for the usePlatformCapabilities hook
 */
export interface UsePlatformCapabilitiesActions {
  /**
   * Check if a specific capability is available
   * @param capability - Capability name to check
   * @returns Boolean indicating if capability is available
   */
  hasCapability: (capability: string) => boolean;

  /**
   * Check multiple capabilities at once
   * @param capabilities - Array of capability names to check
   * @returns Record mapping capability names to availability
   */
  checkCapabilities: (capabilities: string[]) => Record<string, boolean>;

  /**
   * Refresh capability detection
   * @returns Promise resolving when capabilities are updated
   */
  refreshCapabilities: () => Promise<void>;

  /**
   * Get detailed capability information
   * @param capability - Specific capability to get details for
   * @returns Promise resolving to capability details
   */
  getCapabilityDetails: (capability: string) => Promise<unknown>;

  /**
   * Clear capability detection errors
   */
  clearError: () => void;
}

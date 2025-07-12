/**
 * Use Platform Capabilities Hook State Interface
 *
 * State properties for the usePlatformCapabilities React hook.
 * Tracks platform-specific feature availability and capability information.
 */

/**
 * State properties for the usePlatformCapabilities hook
 */
export interface UsePlatformCapabilitiesState {
  /** Available platform capabilities */
  capabilities: Record<string, boolean>;
  /** Whether capability detection is in progress */
  loading: boolean;
  /** Error message if capability detection failed */
  error: string | null;
  /** Whether capabilities have been loaded */
  initialized: boolean;
  /** Last time capabilities were checked */
  lastCheckTime: number | null;
  /** Supported feature flags for current platform */
  supportedFeatures: string[];
  /** Unsupported or disabled features */
  unsupportedFeatures: string[];
}

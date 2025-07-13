/**
 * Capability Detection Configuration Interface
 *
 * Configuration options for capability detection operations.
 * Supports timeout control, caching, and fallback strategies.
 */

/**
 * Configuration for capability detection operations
 */
export interface CapabilityDetectionConfig {
  /** Maximum time in milliseconds to wait for detection */
  timeoutMs: number;

  /** Whether to cache detection results */
  enableCaching: boolean;

  /** Cache TTL in milliseconds */
  cacheTtlMs: number;

  /** Whether to retry failed detections */
  enableRetry: boolean;

  /** Maximum number of retry attempts */
  maxRetryAttempts: number;

  /** Retry delay in milliseconds */
  retryDelayMs: number;

  /** Whether to use fallback detection methods */
  enableFallback: boolean;

  /** Whether to validate capability definitions before detection */
  validateCapability: boolean;

  /** Whether to include detailed evidence in results */
  includeEvidence: boolean;

  /** Whether to check permissions during detection */
  checkPermissions: boolean;

  /** Whether to perform security validation */
  enableSecurityValidation: boolean;
}

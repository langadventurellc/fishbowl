/**
 * Default Capability Detection Configuration
 *
 * Provides default configuration values for capability detection operations.
 */

import { CapabilityDetectionConfig } from './CapabilityDetectionConfig';

/**
 * Default configuration for capability detection
 */
export const DEFAULT_CAPABILITY_DETECTION_CONFIG: CapabilityDetectionConfig = {
  timeoutMs: 5000,
  enableCaching: true,
  cacheTtlMs: 60000, // 1 minute
  enableRetry: true,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  enableFallback: true,
  validateCapability: true,
  includeEvidence: true,
  checkPermissions: true,
  enableSecurityValidation: true,
};

/**
 * Capability Detection Error Types
 *
 * Enumeration of error types for capability detection operations.
 */

/**
 * Error types for capability detection operations
 */
export enum CapabilityDetectionErrorType {
  /** Capability is not supported by any detector */
  UNSUPPORTED_CAPABILITY = 'UNSUPPORTED_CAPABILITY',
  /** Detector is not available or not registered */
  DETECTOR_NOT_FOUND = 'DETECTOR_NOT_FOUND',
  /** Detection operation timed out */
  DETECTION_TIMEOUT = 'DETECTION_TIMEOUT',
  /** Invalid capability definition */
  INVALID_CAPABILITY = 'INVALID_CAPABILITY',
  /** Permission denied for capability detection */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** Platform does not support the capability */
  PLATFORM_UNSUPPORTED = 'PLATFORM_UNSUPPORTED',
  /** Network or connectivity error during detection */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Configuration error */
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  /** Unknown or unexpected error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Platform Error Type Enumeration
 *
 * Categorizes different types of errors that can occur during platform detection.
 * Provides structured error classification for better error handling.
 */

/**
 * Types of errors that can occur in platform detection
 */
export enum PlatformErrorType {
  /** Platform detection failed due to missing global objects */
  DETECTION_FAILED = 'detection_failed',
  /** Platform API is not available */
  API_UNAVAILABLE = 'api_unavailable',
  /** Invalid platform configuration */
  INVALID_CONFIGURATION = 'invalid_configuration',
  /** Platform capability detection failed */
  CAPABILITY_DETECTION_FAILED = 'capability_detection_failed',
  /** Permission denied for platform feature access */
  PERMISSION_DENIED = 'permission_denied',
  /** Platform detection timeout */
  TIMEOUT = 'timeout',
  /** Unsupported platform environment */
  UNSUPPORTED_PLATFORM = 'unsupported_platform',
  /** Cache operation failed */
  CACHE_ERROR = 'cache_error',
  /** Validation error for platform data */
  VALIDATION_ERROR = 'validation_error',
  /** Network error during platform detection */
  NETWORK_ERROR = 'network_error',
  /** Unknown or unexpected error */
  UNKNOWN = 'unknown',
}

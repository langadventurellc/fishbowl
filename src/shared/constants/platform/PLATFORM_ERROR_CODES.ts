/**
 * Platform-specific error codes for detection failures
 */
export const PLATFORM_ERROR_CODES = {
  /** Generic platform detection error */
  DETECTION_FAILED: 'PLATFORM_DETECTION_FAILED',
  /** Global object access error */
  GLOBAL_ACCESS_ERROR: 'PLATFORM_GLOBAL_ACCESS_ERROR',
  /** Cache initialization error */
  CACHE_INIT_ERROR: 'PLATFORM_CACHE_INIT_ERROR',
  /** Performance threshold exceeded */
  PERFORMANCE_THRESHOLD_EXCEEDED: 'PLATFORM_PERFORMANCE_THRESHOLD_EXCEEDED',
  /** Security validation failed */
  SECURITY_VALIDATION_FAILED: 'PLATFORM_SECURITY_VALIDATION_FAILED',
} as const;

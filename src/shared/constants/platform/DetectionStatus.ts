/**
 * Platform Capability Detection Status Enumeration
 *
 * Defines possible states for platform capability detection results.
 * Used for capability availability tracking and error handling.
 */

/**
 * Platform capability detection status values
 */
export enum DetectionStatus {
  /** Capability is available and functional */
  AVAILABLE = 'AVAILABLE',
  /** Capability is not available on this platform */
  UNAVAILABLE = 'UNAVAILABLE',
  /** Capability exists but permission is denied */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** Capability is not supported by the platform */
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  /** Error occurred during capability detection */
  ERROR = 'ERROR',
  /** Capability detection status is unknown */
  UNKNOWN = 'UNKNOWN',
}

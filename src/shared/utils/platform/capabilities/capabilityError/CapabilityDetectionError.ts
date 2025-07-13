/**
 * Capability Detection Error Class
 *
 * Custom error class for capability detection operations.
 * Provides structured error information for debugging and error handling.
 */

import { CapabilityDetectionErrorType } from './CapabilityDetectionErrorType';

/**
 * Custom error class for capability detection operations
 *
 * Provides structured error information including error type,
 * capability context, and recovery suggestions.
 */
export class CapabilityDetectionError extends Error {
  /** The type of error that occurred */
  public readonly errorType: CapabilityDetectionErrorType;

  /** The capability ID that was being detected */
  public readonly capabilityId?: string;

  /** The detector ID that was being used */
  public readonly detectorId?: string;

  /** Additional context information */
  public readonly context?: Record<string, unknown>;

  /** Suggested recovery actions */
  public readonly recoverySuggestions: string[];

  /** The original error that caused this error */
  public readonly originalError?: Error;

  /**
   * Creates a new CapabilityDetectionError
   *
   * @param message - The error message
   * @param errorType - The type of error
   * @param options - Additional error options
   */
  constructor(
    message: string,
    errorType: CapabilityDetectionErrorType,
    options: {
      capabilityId?: string;
      detectorId?: string;
      context?: Record<string, unknown>;
      recoverySuggestions?: string[];
      originalError?: Error;
    } = {},
  ) {
    super(message);

    this.name = 'CapabilityDetectionError';
    this.errorType = errorType;
    this.capabilityId = options.capabilityId;
    this.detectorId = options.detectorId;
    this.context = options.context;
    this.recoverySuggestions = options.recoverySuggestions ?? [];
    this.originalError = options.originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CapabilityDetectionError);
    }
  }

  /**
   * Creates an error for unsupported capabilities
   *
   * @param capabilityId - The unsupported capability ID
   * @returns CapabilityDetectionError instance
   */
  static unsupportedCapability(capabilityId: string): CapabilityDetectionError {
    return new CapabilityDetectionError(
      `Capability '${capabilityId}' is not supported by any registered detector`,
      CapabilityDetectionErrorType.UNSUPPORTED_CAPABILITY,
      {
        capabilityId,
        recoverySuggestions: [
          'Register an appropriate detector for this capability',
          'Check if the capability ID is correct',
          'Verify that required detectors are loaded',
        ],
      },
    );
  }

  /**
   * Creates an error for detector not found
   *
   * @param detectorId - The missing detector ID
   * @param capabilityId - The capability ID that needed the detector
   * @returns CapabilityDetectionError instance
   */
  static detectorNotFound(detectorId: string, capabilityId?: string): CapabilityDetectionError {
    return new CapabilityDetectionError(
      `Detector '${detectorId}' not found`,
      CapabilityDetectionErrorType.DETECTOR_NOT_FOUND,
      {
        detectorId,
        capabilityId,
        recoverySuggestions: [
          'Register the required detector',
          'Check detector initialization',
          'Verify detector dependencies',
        ],
      },
    );
  }

  /**
   * Creates an error for detection timeout
   *
   * @param timeoutMs - The timeout value in milliseconds
   * @param capabilityId - The capability being detected
   * @param detectorId - The detector that timed out
   * @returns CapabilityDetectionError instance
   */
  static detectionTimeout(
    timeoutMs: number,
    capabilityId?: string,
    detectorId?: string,
  ): CapabilityDetectionError {
    return new CapabilityDetectionError(
      `Capability detection timed out after ${timeoutMs}ms`,
      CapabilityDetectionErrorType.DETECTION_TIMEOUT,
      {
        capabilityId,
        detectorId,
        context: { timeoutMs },
        recoverySuggestions: [
          'Increase detection timeout',
          'Check network connectivity',
          'Verify detector implementation',
          'Try detection again',
        ],
      },
    );
  }

  /**
   * Creates an error for invalid capability definitions
   *
   * @param message - The validation error message
   * @param capabilityId - The invalid capability ID
   * @returns CapabilityDetectionError instance
   */
  static invalidCapability(message: string, capabilityId?: string): CapabilityDetectionError {
    return new CapabilityDetectionError(
      `Invalid capability: ${message}`,
      CapabilityDetectionErrorType.INVALID_CAPABILITY,
      {
        capabilityId,
        recoverySuggestions: [
          'Check capability definition format',
          'Validate required fields',
          'Verify capability schema',
        ],
      },
    );
  }

  /**
   * Creates an error for permission denied
   *
   * @param capabilityId - The capability that requires permissions
   * @param permission - The specific permission that was denied
   * @returns CapabilityDetectionError instance
   */
  static permissionDenied(capabilityId: string, permission?: string): CapabilityDetectionError {
    const permissionText = permission ? ` (${permission})` : '';
    return new CapabilityDetectionError(
      `Permission denied for capability '${capabilityId}'${permissionText}`,
      CapabilityDetectionErrorType.PERMISSION_DENIED,
      {
        capabilityId,
        context: { permission },
        recoverySuggestions: [
          'Request required permissions',
          'Check permission configuration',
          'Verify user consent',
        ],
      },
    );
  }

  /**
   * Converts the error to a plain object for serialization
   *
   * @returns Plain object representation of the error
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      errorType: this.errorType,
      capabilityId: this.capabilityId,
      detectorId: this.detectorId,
      context: this.context,
      recoverySuggestions: this.recoverySuggestions,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }
}

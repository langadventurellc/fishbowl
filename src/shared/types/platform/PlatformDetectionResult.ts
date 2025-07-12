/**
 * Platform Detection Result Interface
 *
 * Defines the standardized return type for platform detection operations.
 * Used by core detection functions to provide consistent result structure.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Result of a platform detection operation
 */
export interface PlatformDetectionResult {
  /** Detected platform type */
  platformType: PlatformType;
  /** Whether the detection was successful */
  success: boolean;
  /** Confidence level of the detection (0-100) */
  confidence: number;
  /** Timestamp when detection was performed */
  timestamp: number;
  /** Method used for detection */
  detectionMethod: string;
  /** Additional context or metadata from detection */
  metadata?: Record<string, unknown>;
}

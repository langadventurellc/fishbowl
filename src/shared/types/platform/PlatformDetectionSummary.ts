/**
 * Platform Detection Summary Interface
 *
 * Comprehensive summary of all platform detection operations and their results.
 * Provides detailed breakdown of detection methods and overall assessment.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { OperatingSystem } from '../../constants/platform/OperatingSystem';
import { RuntimeEnvironment } from '../../constants/platform/RuntimeEnvironment';
import { PlatformMethodResult } from './PlatformMethodResult';
import { PlatformDetectionContext } from './PlatformDetectionContext';

/**
 * Comprehensive summary of platform detection operations
 */
export interface PlatformDetectionSummary {
  /** Final determined platform type */
  finalPlatform: PlatformType;
  /** Detected operating system */
  operatingSystem: OperatingSystem;
  /** Runtime environment */
  runtimeEnvironment: RuntimeEnvironment;
  /** Results from individual detection methods */
  methodResults: {
    electron: PlatformMethodResult;
    capacitor: PlatformMethodResult;
    web: PlatformMethodResult;
  };
  /** Environmental context during detection */
  context: PlatformDetectionContext;
  /** Overall confidence in the detection (0-100) */
  overallConfidence: number;
  /** Total time taken for all detections in milliseconds */
  totalDetectionTimeMs: number;
  /** Timestamp when detection was completed */
  completedAt: number;
  /** Any issues or inconsistencies found during detection */
  inconsistencies?: string[];
}

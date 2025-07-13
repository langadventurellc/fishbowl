/**
 * Platform Capability Assessment Interface
 *
 * Comprehensive assessment of all platform capabilities.
 * Provides overview of feature availability and platform-specific limitations.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { CapabilityDetectionResult } from './CapabilityDetectionResult';

/**
 * Comprehensive assessment of platform capabilities
 */
export interface PlatformCapabilityAssessment {
  /** Platform this assessment was performed on */
  platform: PlatformType;
  /** Total number of capabilities tested */
  totalCapabilities: number;
  /** Number of available capabilities */
  availableCapabilities: number;
  /** Number of unavailable capabilities */
  unavailableCapabilities: number;
  /** Percentage of capabilities available (0-100) */
  availabilityPercentage: number;
  /** Detailed results for each capability tested */
  capabilityResults: CapabilityDetectionResult[];
  /** Capabilities that require additional permissions */
  permissionRequiredCapabilities: string[];
  /** Platform-specific limitations found */
  platformLimitations: string[];
  /** Recommended feature flags for this platform */
  recommendedFeatureFlags: Record<string, boolean>;
  /** Total time taken for capability assessment */
  totalAssessmentTimeMs: number;
  /** When this assessment was completed */
  completedAt: number;
  /** Assessment version for tracking changes */
  assessmentVersion: string;
}

/**
 * Capability Detection Result Interface
 *
 * Result of a platform capability detection operation.
 * Provides detailed information about capability availability and context.
 */

import { PlatformCapability } from './PlatformCapability';

/**
 * Result of a capability detection operation
 */
export interface CapabilityDetectionResult {
  /** The capability that was tested */
  capability: PlatformCapability;
  /** Whether the capability is available */
  available: boolean;
  /** Time taken to detect capability in milliseconds */
  detectionTimeMs: number;
  /** Method used to detect the capability */
  detectionMethod: string;
  /** Evidence gathered during detection */
  evidence: string[];
  /** Any warnings about the capability */
  warnings?: string[];
  /** Permissions required for this capability */
  requiredPermissions: string[];
  /** Whether permissions are currently granted */
  permissionsGranted: boolean;
  /** Fallback options if capability is not available */
  fallbackOptions?: string[];
  /** When this detection was performed */
  timestamp: number;
}

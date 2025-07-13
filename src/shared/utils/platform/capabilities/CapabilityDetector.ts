/**
 * Capability Detector Interface
 *
 * Defines the contract for platform capability detection strategies.
 * Enables extensible capability checking through a unified interface.
 */

import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';
import { PlatformCapability } from '../../../types/platform/PlatformCapability';

/**
 * Interface for capability detection strategies
 *
 * Each platform capability implements this interface to provide
 * standardized detection with rich results and error handling.
 *
 * @example
 * ```typescript
 * class SecureStorageDetector implements CapabilityDetector {
 *   async detect(capability: PlatformCapability): Promise<CapabilityDetectionResult> {
 *     // Implementation for secure storage detection
 *   }
 * }
 * ```
 */
export interface CapabilityDetector {
  /**
   * Detects whether a capability is available in the current environment
   *
   * @param capability - The capability definition to detect
   * @returns Promise resolving to detailed detection result
   */
  detect(capability: PlatformCapability): Promise<CapabilityDetectionResult>;

  /**
   * Gets the unique identifier for this detector
   *
   * @returns String identifier for the detector
   */
  getId(): string;

  /**
   * Gets the capabilities this detector can handle
   *
   * @returns Array of capability category names this detector supports
   */
  getSupportedCapabilities(): string[];

  /**
   * Validates whether this detector can handle a specific capability
   *
   * @param capability - The capability to validate
   * @returns True if this detector can handle the capability
   */
  canDetect(capability: PlatformCapability): boolean;
}

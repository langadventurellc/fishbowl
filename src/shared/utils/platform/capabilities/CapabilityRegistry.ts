/**
 * Capability Registry
 *
 * Central registry for managing capability detectors.
 * Provides registration, retrieval, and validation of detector strategies.
 */

import { PlatformCapability } from '../../../types/platform/PlatformCapability';
import { CapabilityDetector } from './CapabilityDetector';

/**
 * Registry for managing capability detectors
 *
 * Maintains a collection of registered detectors and provides
 * methods for finding appropriate detectors for capabilities.
 */
export class CapabilityRegistry {
  private readonly detectors = new Map<string, CapabilityDetector>();
  private readonly capabilityToDetector = new Map<string, string>();

  /**
   * Registers a capability detector
   *
   * @param detector - The detector to register
   * @throws Error if detector ID is already registered
   */
  register(detector: CapabilityDetector): void {
    const detectorId = detector.getId();

    if (this.detectors.has(detectorId)) {
      throw new Error(`Detector '${detectorId}' is already registered`);
    }

    // Validate detector implementation
    this.validateDetector(detector);

    // Register the detector
    this.detectors.set(detectorId, detector);

    // Map supported capabilities to this detector
    for (const capabilityId of detector.getSupportedCapabilities()) {
      if (this.capabilityToDetector.has(capabilityId)) {
        throw new Error(
          `Capability '${capabilityId}' is already handled by detector '${this.capabilityToDetector.get(capabilityId)}'`,
        );
      }
      this.capabilityToDetector.set(capabilityId, detectorId);
    }
  }

  /**
   * Unregisters a capability detector
   *
   * @param detectorId - The ID of the detector to unregister
   * @returns True if detector was found and removed
   */
  unregister(detectorId: string): boolean {
    const detector = this.detectors.get(detectorId);
    if (!detector) {
      return false;
    }

    // Remove capability mappings
    for (const capabilityId of detector.getSupportedCapabilities()) {
      this.capabilityToDetector.delete(capabilityId);
    }

    // Remove the detector
    this.detectors.delete(detectorId);
    return true;
  }

  /**
   * Gets a detector by ID
   *
   * @param detectorId - The detector ID to retrieve
   * @returns The detector or undefined if not found
   */
  getDetector(detectorId: string): CapabilityDetector | undefined {
    return this.detectors.get(detectorId);
  }

  /**
   * Gets the appropriate detector for a capability
   *
   * @param capability - The capability to find a detector for
   * @returns The detector or undefined if none found
   */
  getDetectorForCapability(capability: PlatformCapability): CapabilityDetector | undefined {
    const detectorId = this.capabilityToDetector.get(capability.id);
    return detectorId ? this.detectors.get(detectorId) : undefined;
  }

  /**
   * Gets all registered detectors
   *
   * @returns Array of all registered detectors
   */
  getAllDetectors(): CapabilityDetector[] {
    return Array.from(this.detectors.values());
  }

  /**
   * Gets all supported capability IDs
   *
   * @returns Array of all supported capability IDs
   */
  getSupportedCapabilities(): string[] {
    return Array.from(this.capabilityToDetector.keys());
  }

  /**
   * Checks if a capability is supported
   *
   * @param capabilityId - The capability ID to check
   * @returns True if the capability is supported
   */
  isCapabilitySupported(capabilityId: string): boolean {
    return this.capabilityToDetector.has(capabilityId);
  }

  /**
   * Gets the detector ID for a capability
   *
   * @param capabilityId - The capability ID
   * @returns The detector ID or undefined if not found
   */
  getDetectorIdForCapability(capabilityId: string): string | undefined {
    return this.capabilityToDetector.get(capabilityId);
  }

  /**
   * Clears all registered detectors
   */
  clear(): void {
    this.detectors.clear();
    this.capabilityToDetector.clear();
  }

  /**
   * Gets registry statistics
   *
   * @returns Object with registry statistics
   */
  getStats(): {
    totalDetectors: number;
    totalCapabilities: number;
    detectorIds: string[];
    capabilityIds: string[];
  } {
    return {
      totalDetectors: this.detectors.size,
      totalCapabilities: this.capabilityToDetector.size,
      detectorIds: Array.from(this.detectors.keys()),
      capabilityIds: Array.from(this.capabilityToDetector.keys()),
    };
  }

  /**
   * Validates a detector implementation
   *
   * @param detector - The detector to validate
   * @throws Error if detector is invalid
   */
  private validateDetector(detector: CapabilityDetector): void {
    if (!detector || typeof detector !== 'object') {
      throw new Error('Detector must be an object');
    }

    if (typeof detector.getId !== 'function') {
      throw new Error('Detector must implement getId() method');
    }

    if (typeof detector.getSupportedCapabilities !== 'function') {
      throw new Error('Detector must implement getSupportedCapabilities() method');
    }

    if (typeof detector.canDetect !== 'function') {
      throw new Error('Detector must implement canDetect() method');
    }

    if (typeof detector.detect !== 'function') {
      throw new Error('Detector must implement detect() method');
    }

    const detectorId = detector.getId();
    if (!detectorId || typeof detectorId !== 'string') {
      throw new Error('Detector ID must be a non-empty string');
    }

    const supportedCapabilities = detector.getSupportedCapabilities();
    if (!Array.isArray(supportedCapabilities)) {
      throw new Error('Supported capabilities must be an array');
    }

    if (supportedCapabilities.length === 0) {
      throw new Error('Detector must support at least one capability');
    }

    for (const capabilityId of supportedCapabilities) {
      if (!capabilityId || typeof capabilityId !== 'string') {
        throw new Error('All capability IDs must be non-empty strings');
      }
    }
  }
}

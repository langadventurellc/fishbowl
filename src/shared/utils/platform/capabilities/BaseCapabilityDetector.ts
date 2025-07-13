/**
 * Base Capability Detector Abstract Class
 *
 * Provides common functionality for capability detection implementations.
 * Handles validation, error handling, and result formatting.
 */

import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';
import { PlatformCapability } from '../../../types/platform/PlatformCapability';
import { CapabilityDetector } from './CapabilityDetector';

/**
 * Abstract base class for capability detectors
 *
 * Provides common functionality and enforces the detection contract.
 * Handles validation, timing, and error standardization.
 */
export abstract class BaseCapabilityDetector implements CapabilityDetector {
  protected readonly detectorId: string;
  protected readonly supportedCapabilities: string[];

  constructor(detectorId: string, supportedCapabilities: string[]) {
    this.detectorId = detectorId;
    this.supportedCapabilities = supportedCapabilities;
  }

  /**
   * Gets the unique identifier for this detector
   */
  getId(): string {
    return this.detectorId;
  }

  /**
   * Gets the capabilities this detector can handle
   */
  getSupportedCapabilities(): string[] {
    return [...this.supportedCapabilities];
  }

  /**
   * Validates whether this detector can handle a specific capability
   */
  canDetect(capability: PlatformCapability): boolean {
    return this.supportedCapabilities.includes(capability.id);
  }

  /**
   * Detects whether a capability is available
   */
  async detect(capability: PlatformCapability): Promise<CapabilityDetectionResult> {
    const startTime = performance.now();

    try {
      // Validate the capability before detection
      this.validateCapability(capability);

      // Perform the actual detection
      const result = await this.performDetection(capability);

      // Add timing information
      const detectionTimeMs = performance.now() - startTime;

      return {
        ...result,
        detectionTimeMs,
        timestamp: Date.now(),
      };
    } catch (error) {
      // Handle detection errors gracefully
      return this.handleDetectionError(error, capability, startTime);
    }
  }

  /**
   * Abstract method for performing capability-specific detection
   * Must be implemented by concrete detector classes
   */
  protected abstract performDetection(
    capability: PlatformCapability,
  ): Promise<Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'>>;

  /**
   * Validates a capability definition before detection
   */
  protected validateCapability(capability: PlatformCapability): void {
    if (!capability || typeof capability !== 'object') {
      throw new Error('Invalid capability: must be an object');
    }

    if (!capability.id || typeof capability.id !== 'string') {
      throw new Error('Invalid capability: id must be a non-empty string');
    }

    if (!this.canDetect(capability)) {
      throw new Error(
        `Capability '${capability.id}' is not supported by detector '${this.detectorId}'`,
      );
    }
  }

  /**
   * Handles detection errors and returns a standardized error result
   */
  protected handleDetectionError(
    error: unknown,
    capability: PlatformCapability,
    startTime: number,
  ): CapabilityDetectionResult {
    const detectionTimeMs = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown detection error';

    return {
      capability,
      available: false,
      detectionTimeMs,
      detectionMethod: this.detectorId,
      evidence: [`Error during detection: ${errorMessage}`],
      warnings: ['Detection failed due to an error'],
      requiredPermissions: [],
      permissionsGranted: false,
      fallbackOptions: ['Assume capability is unavailable'],
      timestamp: Date.now(),
    };
  }

  /**
   * Creates a successful detection result
   */
  protected createSuccessResult(
    capability: PlatformCapability,
    evidence: string[],
    additionalData: Partial<CapabilityDetectionResult> = {},
  ): Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'> {
    return {
      capability,
      available: true,
      detectionMethod: this.detectorId,
      evidence,
      warnings: [],
      requiredPermissions: [],
      permissionsGranted: true,
      fallbackOptions: [],
      ...additionalData,
    };
  }

  /**
   * Creates a failure detection result
   */
  protected createFailureResult(
    capability: PlatformCapability,
    reason: string,
    fallbackOptions: string[] = [],
  ): Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'> {
    return {
      capability,
      available: false,
      detectionMethod: this.detectorId,
      evidence: [reason],
      warnings: [],
      requiredPermissions: [],
      permissionsGranted: false,
      fallbackOptions,
    };
  }
}

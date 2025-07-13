/**
 * Capability Manager
 *
 * Central manager for platform capability detection operations.
 * Orchestrates detector registration, capability checking, and result caching.
 */

import { RuntimeEnvironment } from '../../../constants/platform/RuntimeEnvironment';
import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';
import { PlatformCapability } from '../../../types/platform/PlatformCapability';
import { detectPlatformType } from '../detectPlatformType';
import { hasDocument } from '../hasDocument';
import { hasWebNavigator } from '../hasWebNavigator';
import { hasWindow } from '../hasWindow';
import { isCapacitorPlatform } from '../isCapacitorPlatform';
import { isElectronPlatform } from '../isElectronPlatform';
import { CapabilityDetectionConfig, DEFAULT_CAPABILITY_DETECTION_CONFIG } from './capabilityConfig';
import { CapabilityDetectionContext } from './CapabilityDetectionContext';
import { CapabilityDetector } from './CapabilityDetector';
import { CapabilityRegistry } from './CapabilityRegistry';

/**
 * Manager class for capability detection operations
 *
 * Provides centralized capability detection with caching, error handling,
 * and extensible detector registration following the Manager pattern.
 */
export class CapabilityManager {
  private readonly registry: CapabilityRegistry;
  private readonly config: CapabilityDetectionConfig;
  private readonly cache = new Map<string, CapabilityDetectionResult>();
  private readonly detectionContext: CapabilityDetectionContext;

  /**
   * Creates a new CapabilityManager instance
   *
   * @param config - Configuration for detection operations
   */
  constructor(config: Partial<CapabilityDetectionConfig> = {}) {
    this.registry = new CapabilityRegistry();
    this.config = { ...DEFAULT_CAPABILITY_DETECTION_CONFIG, ...config };
    this.detectionContext = this.createDetectionContext();
  }

  /**
   * Registers a capability detector
   *
   * @param detector - The detector to register
   */
  registerDetector(detector: CapabilityDetector): void {
    this.registry.register(detector);
  }

  /**
   * Unregisters a capability detector
   *
   * @param detectorId - The ID of the detector to unregister
   * @returns True if detector was removed
   */
  unregisterDetector(detectorId: string): boolean {
    return this.registry.unregister(detectorId);
  }

  /**
   * Detects whether a capability is available
   *
   * @param capability - The capability to detect
   * @returns Promise resolving to detection result
   */
  async detectCapability(capability: PlatformCapability): Promise<CapabilityDetectionResult> {
    try {
      // Validate capability if configured
      if (this.config.validateCapability) {
        this.validateCapability(capability);
      }

      // Check cache first if enabled
      if (this.config.enableCaching) {
        const cached = this.getCachedResult(capability.id);
        if (cached) {
          return cached;
        }
      }

      // Find appropriate detector
      const detector = this.registry.getDetectorForCapability(capability);
      if (!detector) {
        return this.createUnsupportedResult(capability);
      }

      // Perform detection with timeout and retry
      const result = await this.executeDetectionWithRetry(detector, capability);

      // Cache result if enabled
      if (this.config.enableCaching) {
        this.setCachedResult(capability.id, result);
      }

      return result;
    } catch (error) {
      return this.handleDetectionError(error, capability);
    }
  }

  /**
   * Detects multiple capabilities concurrently
   *
   * @param capabilities - Array of capabilities to detect
   * @returns Promise resolving to map of capability ID to detection result
   */
  async detectMultipleCapabilities(
    capabilities: PlatformCapability[],
  ): Promise<Map<string, CapabilityDetectionResult>> {
    const detectionPromises = capabilities.map(async capability => {
      const result = await this.detectCapability(capability);
      return [capability.id, result] as const;
    });

    const results = await Promise.all(detectionPromises);
    return new Map(results);
  }

  /**
   * Gets all supported capability IDs
   *
   * @returns Array of supported capability IDs
   */
  getSupportedCapabilities(): string[] {
    return this.registry.getSupportedCapabilities();
  }

  /**
   * Checks if a capability is supported
   *
   * @param capabilityId - The capability ID to check
   * @returns True if the capability is supported
   */
  isCapabilitySupported(capabilityId: string): boolean {
    return this.registry.isCapabilitySupported(capabilityId);
  }

  /**
   * Clears the detection cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics
   *
   * @returns Object with cache statistics
   */
  getCacheStats(): {
    totalCached: number;
    cacheHitRate: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(entry => entry.timestamp);

    return {
      totalCached: this.cache.size,
      cacheHitRate: 0, // TODO: Implement hit rate tracking
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
    };
  }

  /**
   * Gets manager statistics
   *
   * @returns Object with manager statistics
   */
  getStats(): {
    registry: ReturnType<CapabilityRegistry['getStats']>;
    cache: ReturnType<CapabilityManager['getCacheStats']>;
    config: CapabilityDetectionConfig;
  } {
    return {
      registry: this.registry.getStats(),
      cache: this.getCacheStats(),
      config: this.config,
    };
  }

  /**
   * Creates the detection context for capability operations
   */
  private createDetectionContext(): CapabilityDetectionContext {
    const startTime = performance.now();

    return {
      platformType: detectPlatformType(),
      runtimeEnvironment: this.detectRuntimeEnvironment(),
      platformDetectedAt: Date.now(),
      isPlatformCached: false, // TODO: Integrate with platform cache
      availableGlobals: {
        hasWindow: hasWindow(),
        hasDocument: hasDocument(),
        hasNavigator: hasWebNavigator(),
        hasElectronAPI: isElectronPlatform(),
        hasCapacitorAPI: isCapacitorPlatform(),
      },
      userAgent: this.getUserAgent(),
      environmentProperties: {},
      securityContext: {
        isSecureContext: this.isSecureContext(),
        hasPermissionsAPI: this.hasPermissionsAPI(),
        supportsCredentials: this.supportsCredentials(),
      },
      performanceContext: {
        detectStartTime: startTime,
        maxDetectionTime: this.config.timeoutMs,
        enableProfiling: false,
      },
    };
  }

  /**
   * Validates a capability definition
   */
  private validateCapability(capability: PlatformCapability): void {
    if (!capability || typeof capability !== 'object') {
      throw new Error('Capability must be an object');
    }

    if (!capability.id || typeof capability.id !== 'string') {
      throw new Error('Capability must have a valid ID');
    }
  }

  /**
   * Gets cached detection result if available and not expired
   */
  private getCachedResult(capabilityId: string): CapabilityDetectionResult | undefined {
    const cached = this.cache.get(capabilityId);
    if (!cached) {
      return undefined;
    }

    const now = Date.now();
    const age = now - cached.timestamp;

    if (age > this.config.cacheTtlMs) {
      this.cache.delete(capabilityId);
      return undefined;
    }

    return cached;
  }

  /**
   * Caches a detection result
   */
  private setCachedResult(capabilityId: string, result: CapabilityDetectionResult): void {
    this.cache.set(capabilityId, result);
  }

  /**
   * Executes capability detection with retry logic
   */
  private async executeDetectionWithRetry(
    detector: CapabilityDetector,
    capability: PlatformCapability,
  ): Promise<CapabilityDetectionResult> {
    let lastError: unknown;
    let attempt = 0;

    while (attempt <= this.config.maxRetryAttempts) {
      try {
        // Create promise with timeout
        const detectionPromise = detector.detect(capability);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Detection timeout')), this.config.timeoutMs);
        });

        return await Promise.race([detectionPromise, timeoutPromise]);
      } catch (error) {
        lastError = error;
        attempt++;

        if (attempt <= this.config.maxRetryAttempts && this.config.enableRetry) {
          await this.delay(this.config.retryDelayMs);
        }
      }
    }

    throw lastError;
  }

  /**
   * Creates result for unsupported capabilities
   */
  private createUnsupportedResult(capability: PlatformCapability): CapabilityDetectionResult {
    return {
      capability,
      available: false,
      detectionTimeMs: 0,
      detectionMethod: 'capability-manager',
      evidence: [`No detector registered for capability: ${capability.id}`],
      warnings: ['Capability is not supported by any registered detector'],
      requiredPermissions: [],
      permissionsGranted: false,
      fallbackOptions: ['Register an appropriate detector for this capability'],
      timestamp: Date.now(),
    };
  }

  /**
   * Handles detection errors
   */
  private handleDetectionError(
    error: unknown,
    capability: PlatformCapability,
  ): CapabilityDetectionResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      capability,
      available: false,
      detectionTimeMs: 0,
      detectionMethod: 'capability-manager',
      evidence: [`Detection failed: ${errorMessage}`],
      warnings: ['Capability detection encountered an error'],
      requiredPermissions: [],
      permissionsGranted: false,
      fallbackOptions: ['Retry detection', 'Check capability configuration'],
      timestamp: Date.now(),
    };
  }

  /**
   * Utility method for async delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper methods for context detection
   */
  private detectRuntimeEnvironment(): RuntimeEnvironment {
    // TODO: Implement runtime environment detection
    return RuntimeEnvironment.UNKNOWN as RuntimeEnvironment;
  }

  private getUserAgent(): string | undefined {
    try {
      return hasWebNavigator() &&
        typeof (globalThis as unknown as { navigator: { userAgent: string } }).navigator !==
          'undefined'
        ? (globalThis as unknown as { navigator: { userAgent: string } }).navigator.userAgent
        : undefined;
    } catch {
      return undefined;
    }
  }

  private isSecureContext(): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      return hasWindow() && typeof (globalThis as any).window !== 'undefined'
        ? (globalThis as unknown as { window: { isSecureContext: boolean } }).window
            .isSecureContext === true
        : false;
    } catch {
      return false;
    }
  }

  private hasPermissionsAPI(): boolean {
    try {
      return (
        hasWebNavigator() &&
        typeof (globalThis as unknown as { navigator: { permissions: unknown } }).navigator !==
          'undefined' &&
        'permissions' in
          (globalThis as unknown as { navigator: { permissions: unknown } }).navigator
      );
    } catch {
      return false;
    }
  }

  private supportsCredentials(): boolean {
    try {
      return (
        hasWindow() &&
        typeof (globalThis as unknown as { window: { isSecureContext: boolean } }).window !==
          'undefined' &&
        (globalThis as unknown as { window: { isSecureContext: boolean } }).window
          .isSecureContext === true
      );
    } catch {
      return false;
    }
  }
}

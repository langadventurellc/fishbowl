import { PlatformType } from '../../../../constants/platform/PlatformType';
import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import { FallbackApplicationContext } from './FallbackApplicationContext';
import { FallbackApplicationResult } from './FallbackApplicationResult';
import { FallbackPriority } from './FallbackPriority';

/**
 * Interface defining the contract for capability fallback strategies.
 *
 * Fallback strategies provide alternative approaches when capability detection
 * fails or capabilities are unavailable. They follow a priority-based execution
 * model with performance monitoring and contextual decision making.
 *
 * @example
 * ```typescript
 * class MyFallbackStrategy implements FallbackStrategy {
 *   readonly id = 'my-strategy';
 *   readonly name = 'My Custom Strategy';
 *   readonly priority = FallbackPriority.HIGH;
 *
 *   canApply(context: FallbackApplicationContext): boolean {
 *     return context.platformType === PlatformType.WEB;
 *   }
 *
 *   async apply(context: FallbackApplicationContext): Promise<FallbackApplicationResult> {
 *     const startTime = performance.now();
 *     // ... strategy implementation
 *     return {
 *       success: true,
 *       message: 'Applied custom fallback',
 *       recommendations: ['Use alternative approach'],
 *       executionTimeMs: performance.now() - startTime,
 *       cacheable: true
 *     };
 *   }
 * }
 * ```
 */
export interface FallbackStrategy {
  /** Unique identifier for this fallback strategy */
  readonly id: string;

  /** Human-readable name for this strategy */
  readonly name: string;

  /** Brief description of what this strategy accomplishes */
  readonly description: string;

  /** Priority level determining execution order (higher = earlier) */
  readonly priority: FallbackPriority;

  /** Capabilities this strategy can handle (empty array = all capabilities) */
  readonly supportedCapabilities: PlatformCapabilityId[];

  /** Platform types where this strategy is applicable */
  readonly supportedPlatforms: PlatformType[];

  /**
   * Determines if this strategy can be applied to the given context.
   *
   * @param context - The fallback application context
   * @returns true if this strategy is applicable, false otherwise
   */
  canApply(context: FallbackApplicationContext): boolean;

  /**
   * Applies the fallback strategy to handle the failed capability detection.
   *
   * Must complete within 5ms to meet performance requirements.
   * Should provide actionable recommendations and alternatives.
   *
   * @param context - The fallback application context
   * @returns Promise resolving to the fallback application result
   * @throws {Error} If strategy application fails critically
   */
  apply(context: FallbackApplicationContext): Promise<FallbackApplicationResult>;

  /**
   * Validates the strategy configuration and prerequisites.
   * Called during strategy registration to ensure proper setup.
   *
   * @returns Promise resolving to true if strategy is valid, false otherwise
   */
  validate?(): Promise<boolean>;

  /**
   * Cleans up any resources used by this strategy.
   * Called when strategy is unregistered or system is shutting down.
   */
  cleanup?(): Promise<void>;
}

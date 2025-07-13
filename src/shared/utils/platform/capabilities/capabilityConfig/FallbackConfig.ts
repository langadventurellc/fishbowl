import { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';

/**
 * Configuration interface for fallback behavior and strategy selection.
 *
 * This configuration controls how the system handles capability detection
 * failures and what fallback strategies should be applied when capabilities
 * are unavailable or restricted.
 *
 * @example
 * ```typescript
 * const config: FallbackConfig = {
 *   enabled: true,
 *   maxFallbackTimeMs: 5000,
 *   enableGracefulDegradation: true,
 *   enableAlternativeCapabilities: true,
 *   enableCapabilityComposition: true,
 *   maxFallbackAttempts: 3,
 *   fallbackPriority: ['alternative', 'degradation', 'composition'],
 *   excludedCapabilities: ['STORAGE_SECURE_WRITE'],
 *   cacheFallbackResults: true,
 *   customFallbackStrategies: new Map([['custom-strategy', customHandler]])
 * };
 * ```
 *
 * @see {@link FallbackStrategy} for available fallback strategies
 * @see {@link FallbackExecutor} for fallback execution logic
 */
export interface FallbackConfig {
  /**
   * Whether fallback execution is enabled.
   * When disabled, fallback strategies are not applied on detection failures.
   *
   * @default true
   */
  enabled: boolean;

  /**
   * Maximum time allowed for fallback execution in milliseconds.
   * Fallback execution will be terminated if this limit is exceeded.
   *
   * @minimum 100
   * @maximum 30000
   * @default 5000
   */
  maxFallbackTimeMs: number;

  /**
   * Whether to enable graceful degradation fallback strategy.
   * Automatically reduces feature complexity when capabilities are unavailable.
   *
   * @default true
   */
  enableGracefulDegradation: boolean;

  /**
   * Whether to enable alternative capability fallback strategy.
   * Suggests equivalent alternative capabilities when primary ones fail.
   *
   * @default true
   */
  enableAlternativeCapabilities: boolean;

  /**
   * Whether to enable capability composition fallback strategy.
   * Breaks down complex capabilities into simpler component capabilities.
   *
   * @default true
   */
  enableCapabilityComposition: boolean;

  /**
   * Maximum number of fallback attempts before giving up.
   * Prevents infinite fallback loops and ensures bounded execution time.
   *
   * @minimum 1
   * @maximum 10
   * @default 3
   */
  maxFallbackAttempts: number;

  /**
   * Priority order for fallback strategy execution.
   * Strategies are attempted in the specified order until one succeeds.
   *
   * @default ['alternative', 'degradation', 'composition']
   */
  fallbackPriority: Array<'alternative' | 'degradation' | 'composition' | 'custom'>;

  /**
   * Capabilities that should be excluded from fallback processing.
   * These capabilities will fail immediately without attempting fallbacks.
   *
   * @default []
   */
  excludedCapabilities: PlatformCapabilityId[];

  /**
   * Whether to cache fallback results for performance optimization.
   * Cached results are reused for subsequent identical fallback scenarios.
   *
   * @default true
   */
  cacheFallbackResults: boolean;

  /**
   * Cache TTL for fallback results in milliseconds.
   * Cached fallback results expire after this duration.
   *
   * @minimum 1000
   * @maximum 3600000
   * @default 300000
   */
  fallbackCacheTTLMs: number;

  /**
   * Whether to collect detailed performance metrics during fallback execution.
   * Enables timing, success rates, and strategy effectiveness tracking.
   *
   * @default true
   */
  collectPerformanceMetrics: boolean;

  /**
   * Custom fallback strategies mapped by strategy name.
   * Allows registration of application-specific fallback handlers.
   *
   * @default new Map()
   */
  customFallbackStrategies: Map<
    string,
    (capability: PlatformCapabilityId, context: unknown) => Promise<unknown>
  >;

  /**
   * Whether to enable automatic retry with exponential backoff.
   * Retries failed fallback attempts with increasing delays.
   *
   * @default false
   */
  enableRetryWithBackoff: boolean;

  /**
   * Initial retry delay in milliseconds for exponential backoff.
   * Used when enableRetryWithBackoff is true.
   *
   * @minimum 50
   * @maximum 5000
   * @default 100
   */
  retryInitialDelayMs: number;

  /**
   * Maximum retry delay in milliseconds for exponential backoff.
   * Caps the exponential growth of retry delays.
   *
   * @minimum 1000
   * @maximum 30000
   * @default 5000
   */
  retryMaxDelayMs: number;

  /**
   * Custom metadata for fallback configuration.
   * Can be used for environment-specific settings or debugging information.
   *
   * @default undefined
   */
  customMetadata?: Record<string, unknown>;
}

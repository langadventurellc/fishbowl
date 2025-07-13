import { z } from 'zod';
import { PlatformCapabilityIdSchema } from './PlatformCapabilityIdSchema';

/**
 * Zod schema for fallback configuration with comprehensive validation.
 *
 * Validates fallback behavior configuration to ensure safe operation
 * within performance constraints and proper strategy configuration.
 * Includes validation for timeouts, retry logic, and strategy selection.
 *
 * @example
 * ```typescript
 * import { FallbackConfigSchema } from './FallbackConfigSchema';
 *
 * const config = {
 *   enabled: true,
 *   maxFallbackTimeMs: 5000,
 *   enableGracefulDegradation: true,
 *   enableAlternativeCapabilities: true,
 *   enableCapabilityComposition: true,
 *   maxFallbackAttempts: 3,
 *   fallbackPriority: ['alternative', 'degradation'],
 *   excludedCapabilities: [],
 *   cacheFallbackResults: true,
 *   fallbackCacheTTLMs: 300000,
 *   collectPerformanceMetrics: true,
 *   customFallbackStrategies: {},
 *   enableRetryWithBackoff: false,
 *   retryInitialDelayMs: 100,
 *   retryMaxDelayMs: 5000,
 *   customMetadata: { source: 'user-config' }
 * };
 *
 * const result = FallbackConfigSchema.safeParse(config);
 * if (result.success) {
 *   // Configuration is valid
 * }
 * ```
 *
 * @see {@link FallbackConfig} for the TypeScript interface
 */
export const FallbackConfigSchema = z
  .object({
    enabled: z.boolean().describe('Whether fallback execution is enabled'),

    maxFallbackTimeMs: z
      .number()
      .int()
      .min(100, 'Fallback timeout must be at least 100ms for meaningful fallback execution')
      .max(30000, 'Fallback timeout cannot exceed 30 seconds to prevent blocking')
      .describe('Maximum time allowed for fallback execution in milliseconds'),

    enableGracefulDegradation: z
      .boolean()
      .describe('Whether to enable graceful degradation fallback strategy'),

    enableAlternativeCapabilities: z
      .boolean()
      .describe('Whether to enable alternative capability fallback strategy'),

    enableCapabilityComposition: z
      .boolean()
      .describe('Whether to enable capability composition fallback strategy'),

    maxFallbackAttempts: z
      .number()
      .int()
      .min(1, 'Must allow at least 1 fallback attempt')
      .max(10, 'Cannot exceed 10 fallback attempts to prevent excessive retry loops')
      .describe('Maximum number of fallback attempts before giving up'),

    fallbackPriority: z
      .array(z.enum(['alternative', 'degradation', 'composition', 'custom']))
      .min(1, 'Must specify at least one fallback priority strategy')
      .max(4, 'Cannot have more than 4 fallback priority strategies')
      .describe('Priority order for fallback strategy execution'),

    excludedCapabilities: z
      .array(PlatformCapabilityIdSchema)
      .max(50, 'Cannot exclude more than 50 capabilities to maintain system functionality')
      .describe('Capabilities that should be excluded from fallback processing'),

    cacheFallbackResults: z
      .boolean()
      .describe('Whether to cache fallback results for performance optimization'),

    fallbackCacheTTLMs: z
      .number()
      .int()
      .min(1000, 'Cache TTL must be at least 1 second for meaningful caching')
      .max(3600000, 'Cache TTL cannot exceed 1 hour to prevent stale results')
      .describe('Cache TTL for fallback results in milliseconds'),

    collectPerformanceMetrics: z
      .boolean()
      .describe('Whether to collect detailed performance metrics during fallback execution'),

    customFallbackStrategies: z
      .record(z.string(), z.any())
      .describe('Custom fallback strategies mapped by strategy name (Map serialized as object)'),

    enableRetryWithBackoff: z
      .boolean()
      .describe('Whether to enable automatic retry with exponential backoff'),

    retryInitialDelayMs: z
      .number()
      .int()
      .min(50, 'Initial retry delay must be at least 50ms for effective retry spacing')
      .max(5000, 'Initial retry delay cannot exceed 5 seconds to maintain responsiveness')
      .describe('Initial retry delay in milliseconds for exponential backoff'),

    retryMaxDelayMs: z
      .number()
      .int()
      .min(1000, 'Maximum retry delay must be at least 1 second for meaningful backoff')
      .max(30000, 'Maximum retry delay cannot exceed 30 seconds to prevent excessive delays')
      .describe('Maximum retry delay in milliseconds for exponential backoff'),

    customMetadata: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Custom metadata for fallback configuration'),
  })
  .strict()
  .refine(
    config => {
      // If fallback is disabled, no strategies should be enabled
      return (
        config.enabled ||
        (!config.enableGracefulDegradation &&
          !config.enableAlternativeCapabilities &&
          !config.enableCapabilityComposition)
      );
    },
    {
      message: 'When fallback is disabled, no fallback strategies should be enabled',
      path: ['enabled'],
    },
  )
  .refine(
    config => {
      // Retry delays must be properly ordered
      return !config.enableRetryWithBackoff || config.retryInitialDelayMs < config.retryMaxDelayMs;
    },
    {
      message: 'Initial retry delay must be less than maximum retry delay',
      path: ['retryInitialDelayMs'],
    },
  )
  .refine(
    config => {
      // Cache TTL should be reasonable when caching is enabled
      return !config.cacheFallbackResults || config.fallbackCacheTTLMs >= 5000;
    },
    {
      message:
        'Cache TTL should be at least 5 seconds when caching is enabled for meaningful performance benefit',
      path: ['fallbackCacheTTLMs'],
    },
  )
  .refine(
    config => {
      // Fallback priority should match enabled strategies
      const enabledStrategies = [
        config.enableGracefulDegradation && 'degradation',
        config.enableAlternativeCapabilities && 'alternative',
        config.enableCapabilityComposition && 'composition',
      ].filter(Boolean);

      const priorityStrategies = config.fallbackPriority.filter(p => p !== 'custom');
      const invalidPriorities = priorityStrategies.filter(p => !enabledStrategies.includes(p));

      return invalidPriorities.length === 0;
    },
    {
      message: 'Fallback priority contains strategies that are not enabled',
      path: ['fallbackPriority'],
    },
  )
  .describe('Configuration for fallback behavior with validation and consistency checks');

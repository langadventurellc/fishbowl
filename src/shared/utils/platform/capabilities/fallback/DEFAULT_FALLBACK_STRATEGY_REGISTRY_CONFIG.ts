import { FallbackStrategyRegistryConfig } from './FallbackStrategyRegistryConfig';

/**
 * Default configuration for the fallback strategy registry.
 * Provides sensible defaults for performance and resource management.
 */

export const DEFAULT_FALLBACK_STRATEGY_REGISTRY_CONFIG: FallbackStrategyRegistryConfig = {
  maxStrategiesPerCapability: 10,
  maxTotalStrategies: 100,
  enableValidation: true,
  validationTimeoutMs: 1000,
  enableApplicabilityCache: true,
  applicabilityCacheTTLMs: 300000, // 5 minutes
};

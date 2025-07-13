/**
 * Configuration for the fallback strategy registry.
 * Controls registry behavior, performance limits, and validation settings.
 */

export interface FallbackStrategyRegistryConfig {
  /** Maximum number of strategies per capability */
  maxStrategiesPerCapability: number;

  /** Maximum total number of registered strategies */
  maxTotalStrategies: number;

  /** Whether to validate strategies during registration */
  enableValidation: boolean;

  /** Timeout for strategy validation in milliseconds */
  validationTimeoutMs: number;

  /** Whether to cache strategy applicability results */
  enableApplicabilityCache: boolean;

  /** TTL for applicability cache entries in milliseconds */
  applicabilityCacheTTLMs: number;
}

/**
 * Configuration options for the LlmConfigurationLoader service.
 */
import type { ValidationOptions } from "../validation/ValidationOptions";
import type { ResilienceOptions } from "../resilience/ResilienceOptions";
import type { InvalidationOptions } from "../cache/InvalidationOptions";

/**
 * Comprehensive configuration options for the LlmConfigurationLoader service.
 */
export interface LoaderOptions {
  /**
   * Enable in-memory caching of loaded configurations
   * @default true
   */
  cacheEnabled?: boolean;

  /**
   * Cache invalidation options
   */
  cacheInvalidation?: InvalidationOptions;

  /**
   * Validation configuration
   */
  validation?: Partial<ValidationOptions>;

  /**
   * Resilience configuration (retry, circuit breaker, fallback)
   */
  resilience?: ResilienceOptions;

  /**
   * Logging configuration
   */
  logging?: {
    level?: "error" | "warn" | "info" | "debug";
    includeMetrics?: boolean;
  };

  /**
   * Enable hot-reload support (development only)
   * @default false
   */
  enableHotReload?: boolean;

  /**
   * @deprecated Use resilience.retry.maxAttempts instead
   */
  retryAttempts?: number;

  /**
   * @deprecated Use resilience.retry.baseDelayMs instead
   */
  retryDelay?: number;
}

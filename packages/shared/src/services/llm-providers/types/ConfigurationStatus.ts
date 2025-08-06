import type { CircuitState } from "../resilience/CircuitState";

/**
 * Comprehensive status information for the configuration loading service.
 */
export interface ConfigurationStatus {
  /**
   * Whether the loader has been initialized
   */
  isInitialized: boolean;

  /**
   * Last time configuration was loaded
   */
  lastLoaded: Date | null;

  /**
   * Number of providers in cache
   */
  providerCount: number;

  /**
   * Whether validation errors occurred
   */
  hasValidationErrors: boolean;

  /**
   * Current cache size (number of providers)
   */
  cacheSize: number;

  /**
   * Path to configuration file
   */
  filePath: string;

  /**
   * Whether configuration file exists
   */
  fileExists: boolean;

  /**
   * Resilience layer status
   */
  resilience: {
    retryCount: number;
    circuitBreakerState: CircuitState;
    hasFallback: boolean;
  };

  /**
   * Cache status
   */
  cache: {
    isValid: boolean;
    isEmpty: boolean;
    lastUpdated: Date | null;
  };
}

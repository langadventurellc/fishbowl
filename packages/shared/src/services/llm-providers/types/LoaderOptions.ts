/**
 * Configuration options for the LlmConfigurationLoader service.
 */
export interface LoaderOptions {
  /**
   * Enable in-memory caching of loaded configurations
   * @default true
   */
  cacheEnabled?: boolean;

  /**
   * Number of retry attempts for transient failures
   * @default 3
   */
  retryAttempts?: number;

  /**
   * Delay between retry attempts in milliseconds
   * @default 1000
   */
  retryDelay?: number;
}

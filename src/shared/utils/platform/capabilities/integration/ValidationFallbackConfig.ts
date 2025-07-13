/**
 * Configuration for ValidationFallbackOrchestrator behavior
 *
 * Controls the orchestration of validation and fallback pipeline execution,
 * including performance targets, feature toggles, and integration behavior.
 * Ensures compliance with sub-2ms validation and sub-5ms fallback requirements.
 */
export interface ValidationFallbackConfig {
  /** Whether to enable validation pipeline execution */
  enableValidation: boolean;

  /** Whether to enable fallback strategy execution */
  enableFallback: boolean;

  /** Whether to enable memory usage tracking during execution */
  enableMemoryTracking: boolean;

  /** Maximum time allowed for validation pipeline in milliseconds */
  maxValidationTimeMs: number;

  /** Maximum time allowed for fallback execution in milliseconds */
  maxFallbackTimeMs: number;

  /** Maximum total orchestration time in milliseconds */
  maxTotalExecutionTimeMs: number;

  /** Whether to automatically trigger fallback on validation failures */
  autoTriggerFallbackOnValidationFailure: boolean;

  /** Whether to automatically trigger fallback on detection failures */
  autoTriggerFallbackOnDetectionFailure: boolean;

  /** Whether to continue orchestration after validation errors */
  continueAfterValidationError: boolean;

  /** Whether to continue orchestration after fallback errors */
  continueAfterFallbackError: boolean;

  /** Threshold for triggering fallback based on validation warnings */
  fallbackTriggerThreshold: {
    /** Minimum number of validation errors to trigger fallback */
    minValidationErrors: number;

    /** Minimum number of high-priority suggestions to trigger fallback */
    minHighPrioritySuggestions: number;

    /** Whether to trigger fallback on permission-related failures */
    triggerOnPermissionFailure: boolean;

    /** Whether to trigger fallback on compatibility issues */
    triggerOnCompatibilityIssues: boolean;
  };

  /** Performance monitoring configuration */
  performanceMonitoring: {
    /** Whether to collect detailed performance metrics */
    enableDetailedMetrics: boolean;

    /** Whether to log performance warnings */
    logPerformanceWarnings: boolean;

    /** Threshold for performance warnings in milliseconds */
    performanceWarningThresholdMs: number;

    /** Whether to track memory usage patterns */
    trackMemoryPatterns: boolean;
  };

  /** Error handling configuration */
  errorHandling: {
    /** Maximum number of retry attempts for failed operations */
    maxRetryAttempts: number;

    /** Delay between retry attempts in milliseconds */
    retryDelayMs: number;

    /** Whether to provide graceful degradation on total failure */
    enableGracefulDegradation: boolean;

    /** Whether to include detailed error context in results */
    includeDetailedErrorContext: boolean;
  };

  /** Integration behavior configuration */
  integration: {
    /** Whether to cache orchestration results */
    enableResultCaching: boolean;

    /** TTL for cached orchestration results in milliseconds */
    cacheResultTtlMs: number;

    /** Whether to share context between validation and fallback */
    shareContextBetweenStages: boolean;

    /** Whether to combine recommendations from all stages */
    combineRecommendations: boolean;
  };
}

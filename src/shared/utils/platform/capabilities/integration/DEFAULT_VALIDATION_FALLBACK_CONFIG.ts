import type { ValidationFallbackConfig } from './ValidationFallbackConfig';

/**
 * Default configuration for ValidationFallbackOrchestrator
 *
 * Provides optimized default values that balance performance requirements
 * (sub-2ms validation, sub-5ms fallback) with comprehensive capability handling.
 * Configuration is tuned for production use with appropriate safety margins.
 */
export const DEFAULT_VALIDATION_FALLBACK_CONFIG: ValidationFallbackConfig = {
  // Core feature toggles
  enableValidation: true,
  enableFallback: true,
  enableMemoryTracking: true,

  // Performance targets with safety margins
  maxValidationTimeMs: 2, // Sub-2ms requirement
  maxFallbackTimeMs: 5, // Sub-5ms requirement
  maxTotalExecutionTimeMs: 10, // Total pipeline limit

  // Automatic fallback triggering
  autoTriggerFallbackOnValidationFailure: true,
  autoTriggerFallbackOnDetectionFailure: true,

  // Error handling behavior
  continueAfterValidationError: true,
  continueAfterFallbackError: false,

  // Fallback trigger thresholds
  fallbackTriggerThreshold: {
    minValidationErrors: 1,
    minHighPrioritySuggestions: 2,
    triggerOnPermissionFailure: true,
    triggerOnCompatibilityIssues: true,
  },

  // Performance monitoring
  performanceMonitoring: {
    enableDetailedMetrics: true,
    logPerformanceWarnings: true,
    performanceWarningThresholdMs: 8, // 80% of total limit
    trackMemoryPatterns: true,
  },

  // Error handling
  errorHandling: {
    maxRetryAttempts: 1,
    retryDelayMs: 100,
    enableGracefulDegradation: true,
    includeDetailedErrorContext: true,
  },

  // Integration behavior
  integration: {
    enableResultCaching: true,
    cacheResultTtlMs: 30000, // 30 seconds
    shareContextBetweenStages: true,
    combineRecommendations: true,
  },
};

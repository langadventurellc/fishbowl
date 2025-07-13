import type { PlatformCapability, PlatformCapabilityId } from '../../../../types/platform';
import type { CapabilityDependencyChain } from './CapabilityDependencyChain';
import type { FallbackChain } from './FallbackChain';

/**
 * Comprehensive result of dependency validation for a capability
 *
 * Provides detailed information about dependency chain validation,
 * including detected issues, fallback options, and resolution strategies.
 */
export interface DependencyValidationResult {
  /** The capability that was validated */
  capability: PlatformCapability;

  /** Dependencies that were analyzed */
  dependencies: PlatformCapability[];

  /** Structured dependency chain information */
  dependencyChain: CapabilityDependencyChain;

  /** Whether the dependency chain is valid */
  isValid: boolean;

  /** Circular dependencies detected in the chain */
  circularDependencies: string[];

  /** Dependencies that failed validation */
  failedDependencies: PlatformCapabilityId[];

  /** Available fallback chains for failed dependencies */
  fallbackChains: FallbackChain[];

  /** Specific issues found during validation */
  issues: string[];

  /** Strategies to resolve dependency issues */
  resolutionStrategies: string[];

  /** Performance impact assessment of dependency changes */
  performanceImpact: {
    /** Overall impact of using fallbacks */
    overallImpact: 'positive' | 'neutral' | 'negative';

    /** Specific performance impacts */
    specificImpacts: string[];

    /** Mitigation strategies for negative impacts */
    mitigation: string[];
  };

  /** Metrics about the validation process */
  validationMetrics: {
    /** Time taken for validation in milliseconds */
    validationTimeMs: number;

    /** Number of dependencies analyzed */
    dependenciesAnalyzed: number;

    /** Number of circular dependencies found */
    circularDependenciesFound: number;

    /** Number of fallback chains generated */
    fallbackChainsGenerated: number;

    /** Complexity score for the dependency chain (1-5) */
    complexityScore: number;
  };

  /** Recommendations based on validation results */
  recommendations: string[];

  /** Timestamp when validation completed */
  timestamp: number;

  /** Additional metadata from validation (optional) */
  metadata?: Record<string, unknown>;
}

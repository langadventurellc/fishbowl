import type { PlatformCapability, CapabilityDetectionResult } from '../../../../types/platform';
import type { ReducedFeatureSet } from './ReducedFeatureSet';
import type { CapabilityAlternative } from './CapabilityAlternative';

/**
 * Comprehensive analysis of failed capability requirements
 *
 * Provides detailed analysis of why a capability failed and comprehensive
 * recommendations for alternative approaches, reduced feature sets, and
 * optimization strategies.
 */
export interface CapabilityRequirementAnalysis {
  /** The original capability that failed requirements */
  originalCapability: PlatformCapability;

  /** The detection result that triggered the analysis */
  detectionResult: CapabilityDetectionResult;

  /** Specific reasons why the capability failed */
  failureReasons: string[];

  /** Suggested reduced feature sets that might work */
  reducedFeatureSets: ReducedFeatureSet[];

  /** Alternative capabilities that could provide similar functionality */
  alternatives: CapabilityAlternative[];

  /** Recommended approach based on analysis */
  recommendedApproach: string;

  /** Assessment of impact when using alternatives */
  impactAssessment: {
    /** Overall impact level of using alternatives */
    overallImpact: 'low' | 'moderate' | 'high';

    /** Specific impacts to be aware of */
    specificImpacts: string[];

    /** Strategies to mitigate negative impacts */
    mitigationStrategies: string[];
  };

  /** Metrics about the analysis process */
  analysisMetrics: {
    /** Time taken to complete analysis in milliseconds */
    analysisTimeMs: number;

    /** Number of reduced feature sets generated */
    featureSetsGenerated: number;

    /** Number of alternative capabilities found */
    alternativesFound: number;

    /** Complexity score for the analysis (1-5) */
    complexityScore: number;
  };

  /** Platform-specific optimization recommendations */
  platformOptimizations: string[];

  /** Timestamp when analysis was completed */
  timestamp: number;

  /** Additional metadata from analysis (optional) */
  metadata?: Record<string, unknown>;
}

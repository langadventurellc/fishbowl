import type { PlatformCapability, CapabilityDetectionResult } from '../../../../types/platform';
import { PermissionLevel } from '../../../../constants/platform/PermissionLevel';
import type { PermissionAlternative } from './PermissionAlternative';
import type { PermissionFallbackStrategy } from './PermissionFallbackStrategy';

/**
 * Comprehensive result of permission failure analysis
 *
 * Provides detailed analysis of permission-related capability failures,
 * including available alternatives, degradation strategies, and
 * implementation guidance for working within permission constraints.
 */
export interface PermissionAnalysisResult {
  /** The capability that failed due to permissions */
  capability: PlatformCapability;

  /** The detection result that triggered the analysis */
  detectionResult: CapabilityDetectionResult;

  /** Detailed analysis of permission requirements and failures */
  permissionAnalysis: {
    /** Permissions required by the capability */
    requiredPermissions: PermissionLevel[];

    /** Permissions that were denied */
    deniedPermissions: PermissionLevel[];

    /** Permissions that are available */
    availablePermissions: PermissionLevel[];

    /** Specific permission gaps identified */
    permissionGaps: string[];
  };

  /** Whether permission-free alternatives are available */
  hasPermissionFreeAlternatives: boolean;

  /** Available permission-free alternatives */
  alternatives: PermissionAlternative[];

  /** Available degradation strategies */
  degradationStrategies: PermissionFallbackStrategy[];

  /** Recommended strategy based on analysis */
  recommendedStrategy: PermissionFallbackStrategy;

  /** Assessment of user experience impact */
  userExperienceImpact: {
    /** Overall impact of permission-based changes */
    overallImpact: 'minimal' | 'moderate' | 'significant';

    /** Specific impacts to be aware of */
    specificImpacts: string[];

    /** Whether user communication is needed */
    userCommunicationNeeded: boolean;

    /** Approaches to mitigate negative impacts */
    mitigationApproaches: string[];
  };

  /** Platform-specific guidance for handling permissions */
  platformGuidance: string[];

  /** Security considerations for permission-based fallbacks */
  securityConsiderations: string[];

  /** Metrics about the analysis process */
  analysisMetrics: {
    /** Time taken for analysis in milliseconds */
    analysisTimeMs: number;

    /** Number of alternatives found */
    alternativesFound: number;

    /** Number of strategies generated */
    strategiesGenerated: number;

    /** Number of permissions analyzed */
    permissionsAnalyzed: number;
  };

  /** Implementation notes for the recommended approach */
  implementationNotes: string[];

  /** Timestamp when analysis completed */
  timestamp: number;

  /** Additional metadata from analysis (optional) */
  metadata?: Record<string, unknown>;
}

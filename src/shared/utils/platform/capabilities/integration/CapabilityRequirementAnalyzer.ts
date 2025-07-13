import { CapabilityCategory } from '../../../../constants/platform/CapabilityCategory';
import { PermissionLevel } from '../../../../constants/platform/PermissionLevel';
import type {
  CapabilityDetectionResult,
  PlatformCapability,
  PlatformCapabilityId,
} from '../../../../types/platform';
import type { CapabilityAlternative } from './CapabilityAlternative';
import type { CapabilityRequirementAnalysis } from './CapabilityRequirementAnalysis';
import type { ReducedFeatureSet } from './ReducedFeatureSet';

/**
 * Analyzes capability requirements and suggests reduced feature sets
 *
 * The CapabilityRequirementAnalyzer examines failed capability requirements
 * and provides intelligent recommendations for simplified feature sets,
 * capability downgrades, and alternative approaches that can work within
 * the constraints of the current platform environment.
 *
 * Key Features:
 * - Analysis of capability requirements and dependencies
 * - Intelligent feature set reduction recommendations
 * - Alternative capability suggestions with compatibility analysis
 * - Permission-aware downgrade strategies
 * - Platform-specific optimization recommendations
 * - Performance impact assessment for alternatives
 *
 * @example
 * ```typescript
 * const analyzer = new CapabilityRequirementAnalyzer();
 *
 * const analysis = await analyzer.analyzeFailedRequirement(
 *   secureStorageCapability,
 *   failedDetectionResult,
 *   'ELECTRON'
 * );
 *
 * console.log(`Reduced feature sets: ${analysis.reducedFeatureSets.length}`);
 * console.log(`Alternative capabilities: ${analysis.alternatives.length}`);
 * console.log(`Recommended approach: ${analysis.recommendedApproach}`);
 * ```
 */
export class CapabilityRequirementAnalyzer {
  private readonly featureSetMappings: Map<CapabilityCategory, string[]>;
  private readonly alternativeMappings: Map<PlatformCapabilityId, PlatformCapabilityId[]>;
  private readonly permissionDowngrades: Map<PermissionLevel, PermissionLevel[]>;

  constructor() {
    this.featureSetMappings = this.initializeFeatureSetMappings();
    this.alternativeMappings = this.initializeAlternativeMappings();
    this.permissionDowngrades = this.initializePermissionDowngrades();
  }

  /**
   * Analyzes a failed capability requirement and suggests alternatives
   *
   * @param capability - The capability that failed requirements
   * @param detectionResult - Result from the failed detection
   * @param platformType - Current platform type
   * @param _context - Additional context for analysis
   * @returns Comprehensive requirement analysis
   */
  analyzeFailedRequirement(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    platformType: string,
    _context?: Record<string, unknown>,
  ): CapabilityRequirementAnalysis {
    const analysisStartTime = performance.now();

    try {
      // Analyze the failure reasons
      const failureReasons = this.analyzeFailureReasons(detectionResult);

      // Generate reduced feature sets
      const reducedFeatureSets = this.generateReducedFeatureSets(
        capability,
        failureReasons,
        platformType,
      );

      // Find alternative capabilities
      const alternatives = this.findAlternativeCapabilities(
        capability,
        failureReasons,
        platformType,
      );

      // Determine recommended approach
      const recommendedApproach = this.determineRecommendedApproach(
        capability,
        reducedFeatureSets,
        alternatives,
        failureReasons,
      );

      // Assess impact of using alternatives
      const impactAssessment = this.assessAlternativeImpact(
        capability,
        alternatives,
        reducedFeatureSets,
      );

      const analysisTime = performance.now() - analysisStartTime;

      return {
        originalCapability: capability,
        detectionResult,
        failureReasons,
        reducedFeatureSets,
        alternatives,
        recommendedApproach,
        impactAssessment,
        analysisMetrics: {
          analysisTimeMs: analysisTime,
          featureSetsGenerated: reducedFeatureSets.length,
          alternativesFound: alternatives.length,
          complexityScore: this.calculateComplexityScore(capability, failureReasons),
        },
        platformOptimizations: this.getPlatformOptimizations(platformType, capability),
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(
        `Capability requirement analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Analyzes multiple failed capabilities and finds common alternatives
   *
   * @param failedCapabilities - Array of capabilities with their detection results
   * @param platformType - Current platform type
   * @returns Promise resolving to batch analysis result
   */
  async analyzeBatchRequirements(
    failedCapabilities: Array<{
      capability: PlatformCapability;
      result: CapabilityDetectionResult;
    }>,
    platformType: string,
  ): Promise<{
    individualAnalyses: CapabilityRequirementAnalysis[];
    commonAlternatives: CapabilityAlternative[];
    batchRecommendations: string[];
    crossCapabilityOptimizations: string[];
  }> {
    // Analyze each capability individually
    const individualAnalyses = await Promise.all(
      failedCapabilities.map(({ capability, result }) =>
        this.analyzeFailedRequirement(capability, result, platformType),
      ),
    );

    // Find common alternatives across failed capabilities
    const commonAlternatives = this.findCommonAlternatives(individualAnalyses);

    // Generate batch recommendations
    const batchRecommendations = this.generateBatchRecommendations(
      individualAnalyses,
      commonAlternatives,
    );

    // Find cross-capability optimizations
    const crossCapabilityOptimizations = this.findCrossCapabilityOptimizations(
      failedCapabilities.map(fc => fc.capability),
      platformType,
    );

    return {
      individualAnalyses,
      commonAlternatives,
      batchRecommendations,
      crossCapabilityOptimizations,
    };
  }

  /**
   * Analyzes the specific reasons why capability detection failed
   */
  private analyzeFailureReasons(detectionResult: CapabilityDetectionResult): string[] {
    const reasons: string[] = [];

    if (!detectionResult.available) {
      reasons.push('capability-unavailable');
    }

    if (!detectionResult.permissionsGranted && detectionResult.requiredPermissions.length > 0) {
      reasons.push('permission-denied');
    }

    if (detectionResult.warnings && detectionResult.warnings.length > 0) {
      reasons.push('compatibility-warnings');
    }

    // Analyze evidence for specific failure patterns
    const evidence = detectionResult.evidence.join(' ').toLowerCase();

    if (evidence.includes('security') || evidence.includes('context')) {
      reasons.push('security-constraints');
    }

    if (evidence.includes('unsupported') || evidence.includes('not found')) {
      reasons.push('platform-unsupported');
    }

    if (evidence.includes('timeout') || evidence.includes('slow')) {
      reasons.push('performance-issues');
    }

    return reasons;
  }

  /**
   * Generates reduced feature sets based on failure analysis
   */
  private generateReducedFeatureSets(
    capability: PlatformCapability,
    failureReasons: string[],
    platformType: string,
  ): ReducedFeatureSet[] {
    const reducedSets: ReducedFeatureSet[] = [];

    // Basic reduced set - core functionality only
    reducedSets.push({
      name: 'Core Functionality',
      description: 'Essential features with minimal requirements',
      removedFeatures: this.getAdvancedFeatures(capability),
      retainedFeatures: this.getCoreFeatures(capability),
      performanceImpact: 'minimal',
      compatibilityGain: 'high',
      userExperienceImpact: 'minor',
    });

    // Permission-reduced set for permission failures
    if (failureReasons.includes('permission-denied')) {
      reducedSets.push({
        name: 'Permission-Free Mode',
        description: 'Functionality that works without elevated permissions',
        removedFeatures: this.getPermissionRequiredFeatures(capability),
        retainedFeatures: this.getPermissionFreeFeatures(capability),
        performanceImpact: 'moderate',
        compatibilityGain: 'very-high',
        userExperienceImpact: 'moderate',
      });
    }

    // Platform-optimized set for platform issues
    if (failureReasons.includes('platform-unsupported')) {
      const platformFeatures = this.getPlatformSpecificFeatures(capability, platformType);
      reducedSets.push({
        name: 'Platform-Optimized',
        description: `Features optimized for ${platformType} environment`,
        removedFeatures: this.getCrossPlatformFeatures(capability),
        retainedFeatures: platformFeatures,
        performanceImpact: 'improved',
        compatibilityGain: 'high',
        userExperienceImpact: 'minor',
      });
    }

    return reducedSets;
  }

  /**
   * Finds alternative capabilities that can provide similar functionality
   */
  private findAlternativeCapabilities(
    capability: PlatformCapability,
    failureReasons: string[],
    platformType: string,
  ): CapabilityAlternative[] {
    const alternatives: CapabilityAlternative[] = [];

    // Get predefined alternatives for this capability
    const predefinedAlternatives =
      this.alternativeMappings.get(capability.id as PlatformCapabilityId) ?? [];

    for (const altId of predefinedAlternatives) {
      const alternative = this.createCapabilityAlternative(
        altId,
        capability,
        failureReasons,
        platformType,
      );
      if (alternative) {
        alternatives.push(alternative);
      }
    }

    // Find category-based alternatives
    if ('category' in capability && capability.category) {
      const categoryAlternatives = this.findCategoryAlternatives(
        capability.category as CapabilityCategory,
        capability.id as PlatformCapabilityId,
        failureReasons,
        platformType,
      );
      alternatives.push(...categoryAlternatives);
    }

    // Sort by compatibility and functionality coverage
    return alternatives.sort((a, b) => {
      const aScore = a.compatibilityScore * 0.6 + a.functionalityCoverage * 0.4;
      const bScore = b.compatibilityScore * 0.6 + b.functionalityCoverage * 0.4;
      return bScore - aScore;
    });
  }

  /**
   * Creates a capability alternative with detailed analysis
   */
  private createCapabilityAlternative(
    alternativeId: PlatformCapabilityId,
    originalCapability: PlatformCapability,
    failureReasons: string[],
    platformType: string,
  ): CapabilityAlternative | null {
    // This would typically fetch capability details from a registry
    // For now, we'll create a basic alternative structure

    const compatibilityScore = this.calculateCompatibilityScore(
      alternativeId,
      failureReasons,
      platformType,
    );

    const functionalityCoverage = this.calculateFunctionalityCoverage(
      alternativeId,
      originalCapability,
    );

    if (compatibilityScore < 0.3) {
      return null; // Too incompatible
    }

    return {
      capabilityId: alternativeId,
      description: `Alternative to ${originalCapability.id}`,
      compatibilityScore,
      functionalityCoverage,
      implementationComplexity: this.getImplementationComplexity(alternativeId),
      performanceComparison: this.getPerformanceComparison(
        originalCapability.id as PlatformCapabilityId,
        alternativeId,
      ),
      migrationPath: this.generateMigrationPath(
        originalCapability.id as PlatformCapabilityId,
        alternativeId,
      ),
      limitations: this.getAlternativeLimitations(alternativeId, originalCapability),
      benefits: this.getAlternativeBenefits(alternativeId, originalCapability),
      platformSupport: {
        ELECTRON: this.isPlatformSupported(alternativeId, 'ELECTRON'),
        WEB: this.isPlatformSupported(alternativeId, 'WEB'),
        CAPACITOR: this.isPlatformSupported(alternativeId, 'CAPACITOR'),
      },
    };
  }

  /**
   * Determines the recommended approach based on analysis
   */
  private determineRecommendedApproach(
    capability: PlatformCapability,
    reducedFeatureSets: ReducedFeatureSet[],
    alternatives: CapabilityAlternative[],
    failureReasons: string[],
  ): string {
    // If high-compatibility alternative exists, recommend it
    const bestAlternative = alternatives.find(alt => alt.compatibilityScore > 0.8);
    if (bestAlternative) {
      return `Use alternative capability: ${String(bestAlternative.capabilityId)}`;
    }

    // If good reduced feature set exists, recommend it
    const bestReducedSet = reducedFeatureSets.find(
      set => set.compatibilityGain === 'high' && set.userExperienceImpact === 'minor',
    );
    if (bestReducedSet) {
      return `Use reduced feature set: ${bestReducedSet.name}`;
    }

    // Fall back to graceful degradation
    if (failureReasons.includes('permission-denied')) {
      return 'Implement graceful degradation with user notification about limited functionality';
    }

    if (failureReasons.includes('platform-unsupported')) {
      return 'Disable feature for this platform with appropriate user feedback';
    }

    return 'Implement fallback behavior with user notification';
  }

  /**
   * Assesses the impact of using alternative capabilities
   */
  private assessAlternativeImpact(
    originalCapability: PlatformCapability,
    alternatives: CapabilityAlternative[],
    reducedFeatureSets: ReducedFeatureSet[],
  ): {
    overallImpact: 'low' | 'moderate' | 'high';
    specificImpacts: string[];
    mitigationStrategies: string[];
  } {
    const impacts: string[] = [];
    const mitigationStrategies: string[] = [];

    // Analyze alternative impacts
    alternatives.forEach(alt => {
      if (alt.functionalityCoverage < 0.7) {
        impacts.push(`Reduced functionality with ${alt.capabilityId}`);
        mitigationStrategies.push(`Document functionality differences for ${alt.capabilityId}`);
      }

      if (alt.implementationComplexity === 'high') {
        impacts.push(`High implementation complexity for ${alt.capabilityId}`);
        mitigationStrategies.push(`Plan additional development time for ${alt.capabilityId}`);
      }
    });

    // Analyze reduced feature set impacts
    reducedFeatureSets.forEach(set => {
      if (set.userExperienceImpact === 'moderate' || set.userExperienceImpact === 'major') {
        impacts.push(`User experience impact: ${set.userExperienceImpact}`);
        mitigationStrategies.push(`Provide clear user communication about ${set.name}`);
      }
    });

    // Determine overall impact level
    let overallImpact: 'low' | 'moderate' | 'high' = 'low';
    if (impacts.length > 2) overallImpact = 'moderate';
    if (impacts.length > 4) overallImpact = 'high';

    return {
      overallImpact,
      specificImpacts: impacts,
      mitigationStrategies,
    };
  }

  /**
   * Helper methods for capability analysis
   */
  private getAdvancedFeatures(_capability: PlatformCapability): string[] {
    // This would be capability-specific
    return ['advanced-encryption', 'background-sync', 'offline-storage'];
  }

  private getCoreFeatures(_capability: PlatformCapability): string[] {
    // This would be capability-specific
    return ['basic-storage', 'data-retrieval', 'simple-encryption'];
  }

  private getPermissionRequiredFeatures(_capability: PlatformCapability): string[] {
    return ['system-level-access', 'external-device-access'];
  }

  private getPermissionFreeFeatures(_capability: PlatformCapability): string[] {
    return ['in-memory-storage', 'session-storage'];
  }

  private getPlatformSpecificFeatures(
    _capability: PlatformCapability,
    platformType: string,
  ): string[] {
    // Platform-specific feature mapping
    const platformFeatures: Record<string, string[]> = {
      ELECTRON: ['native-api-access', 'file-system-storage'],
      WEB: ['web-api-access', 'indexed-db-storage'],
      CAPACITOR: ['mobile-api-access', 'native-storage'],
    };

    return platformFeatures[platformType] ?? [];
  }

  private getCrossPlatformFeatures(_capability: PlatformCapability): string[] {
    return ['cross-platform-api', 'universal-storage'];
  }

  private calculateComplexityScore(
    capability: PlatformCapability,
    failureReasons: string[],
  ): number {
    let score = 1;
    score += failureReasons.length * 0.2;
    score +=
      ('requiredPermissions' in capability && Array.isArray(capability.requiredPermissions)
        ? (capability.requiredPermissions.length ?? 0)
        : 0) * 0.1;
    return Math.min(score, 5);
  }

  private calculateCompatibilityScore(
    _capabilityId: PlatformCapabilityId,
    failureReasons: string[],
    _platformType: string,
  ): number {
    // Simplified compatibility scoring
    let score = 0.8;

    if (failureReasons.includes('platform-unsupported')) {
      score -= 0.3;
    }
    if (failureReasons.includes('permission-denied')) {
      score -= 0.2;
    }

    return Math.max(score, 0);
  }

  private calculateFunctionalityCoverage(
    _alternativeId: PlatformCapabilityId,
    _originalCapability: PlatformCapability,
  ): number {
    // Simplified functionality coverage calculation
    return 0.75; // Would be based on actual capability comparison
  }

  private getImplementationComplexity(
    _capabilityId: PlatformCapabilityId,
  ): 'low' | 'moderate' | 'high' {
    // Would be based on capability metadata
    return 'moderate';
  }

  private getPerformanceComparison(
    _originalId: PlatformCapabilityId,
    _alternativeId: PlatformCapabilityId,
  ): string {
    return 'Similar performance characteristics';
  }

  private generateMigrationPath(
    originalId: PlatformCapabilityId,
    alternativeId: PlatformCapabilityId,
  ): string[] {
    return [
      `Replace ${originalId} calls with ${alternativeId}`,
      'Update configuration for new capability',
      'Test functionality with alternative implementation',
    ];
  }

  private getAlternativeLimitations(
    _alternativeId: PlatformCapabilityId,
    _originalCapability: PlatformCapability,
  ): string[] {
    return ['May have reduced feature set', 'Different API surface'];
  }

  private getAlternativeBenefits(
    _alternativeId: PlatformCapabilityId,
    _originalCapability: PlatformCapability,
  ): string[] {
    return ['Better platform compatibility', 'Simplified implementation'];
  }

  private isPlatformSupported(_capabilityId: PlatformCapabilityId, _platform: string): boolean {
    // Would check actual platform support matrix
    return true;
  }

  private findCategoryAlternatives(
    _category: CapabilityCategory,
    _excludeId: PlatformCapabilityId,
    _failureReasons: string[],
    _platformType: string,
  ): CapabilityAlternative[] {
    // Would find alternatives within the same category
    return [];
  }

  private findCommonAlternatives(
    analyses: CapabilityRequirementAnalysis[],
  ): CapabilityAlternative[] {
    // Find alternatives that appear in multiple analyses
    const alternativeMap = new Map<PlatformCapabilityId, CapabilityAlternative[]>();

    analyses.forEach(analysis => {
      analysis.alternatives.forEach(alt => {
        if (!alternativeMap.has(alt.capabilityId)) {
          alternativeMap.set(alt.capabilityId, []);
        }
        alternativeMap.get(alt.capabilityId)?.push(alt);
      });
    });

    // Return alternatives that appear in multiple analyses
    return Array.from(alternativeMap.entries())
      .filter(([_, alts]) => alts.length > 1)
      .map(([_, alts]) => alts[0]);
  }

  private generateBatchRecommendations(
    analyses: CapabilityRequirementAnalysis[],
    commonAlternatives: CapabilityAlternative[],
  ): string[] {
    const recommendations: string[] = [];

    if (commonAlternatives.length > 0) {
      recommendations.push(
        `Consider ${commonAlternatives[0].capabilityId} as a common alternative`,
      );
    }

    const failurePatterns = new Set(analyses.flatMap(a => a.failureReasons));
    if (failurePatterns.has('permission-denied')) {
      recommendations.push('Implement permission-free mode for better compatibility');
    }

    return recommendations;
  }

  private findCrossCapabilityOptimizations(
    _capabilities: PlatformCapability[],
    _platformType: string,
  ): string[] {
    // Find optimizations that apply across multiple capabilities
    return ['Use unified storage approach', 'Implement shared permission handling'];
  }

  private getPlatformOptimizations(
    platformType: string,
    _capability: PlatformCapability,
  ): string[] {
    const optimizations: Record<string, string[]> = {
      ELECTRON: ['Use Node.js APIs for better performance', 'Leverage IPC for secure operations'],
      WEB: ['Use Web APIs with progressive enhancement', 'Implement service worker caching'],
      CAPACITOR: ['Use native plugins when available', 'Implement cross-platform fallbacks'],
    };

    return optimizations[platformType] || [];
  }

  /**
   * Initialize mapping data structures
   */
  private initializeFeatureSetMappings(): Map<CapabilityCategory, string[]> {
    const mappings = new Map<CapabilityCategory, string[]>();

    mappings.set(CapabilityCategory.STORAGE, ['basic-storage', 'advanced-encryption', 'sync']);
    mappings.set(CapabilityCategory.FILESYSTEM, ['read-access', 'write-access', 'watch']);
    mappings.set(CapabilityCategory.NETWORKING, ['basic-http', 'websockets', 'p2p']);

    return mappings;
  }

  private initializeAlternativeMappings(): Map<PlatformCapabilityId, PlatformCapabilityId[]> {
    const mappings = new Map<PlatformCapabilityId, PlatformCapabilityId[]>();

    mappings.set('storage.secure' as PlatformCapabilityId, [
      'storage.session' as PlatformCapabilityId,
      'storage.local' as PlatformCapabilityId,
    ]);

    return mappings;
  }

  private initializePermissionDowngrades(): Map<PermissionLevel, PermissionLevel[]> {
    const mappings = new Map<PermissionLevel, PermissionLevel[]>();

    mappings.set(PermissionLevel.SYSTEM, [PermissionLevel.ADMIN, PermissionLevel.WRITE]);
    mappings.set(PermissionLevel.ADMIN, [PermissionLevel.WRITE, PermissionLevel.READ]);
    mappings.set(PermissionLevel.WRITE, [PermissionLevel.READ, PermissionLevel.NONE]);

    return mappings;
  }
}

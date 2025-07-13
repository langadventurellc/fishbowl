/* eslint-disable max-lines */
import { PermissionLevel } from '../../../../constants/platform/PermissionLevel';
import type {
  CapabilityDetectionResult,
  PlatformCapability,
  PlatformCapabilityId,
} from '../../../../types/platform';
import type { PermissionAlternative } from './PermissionAlternative';
import type { PermissionAnalysisResult } from './PermissionAnalysisResult';
import type { PermissionFallbackStrategy } from './PermissionFallbackStrategy';

/**
 * Handles permission-denied scenarios with alternative approaches
 *
 * The PermissionBasedFallback analyzes permission-related capability failures
 * and provides intelligent strategies for working within permission constraints,
 * including permission-free alternatives, graceful degradation approaches,
 * and user notification strategies.
 *
 * Key Features:
 * - Permission requirement analysis and alternative identification
 * - Permission-free capability alternatives
 * - Graceful degradation strategies for restricted environments
 * - User experience optimization for permission-denied scenarios
 * - Platform-specific permission handling approaches
 * - Security-conscious fallback recommendations
 *
 * @example
 * ```typescript
 * const permissionFallback = new PermissionBasedFallback();
 *
 * const analysis = await permissionFallback.analyzePermissionFailure(
 *   secureStorageCapability,
 *   detectionResult,
 *   'ELECTRON'
 * );
 *
 * if (analysis.hasPermissionFreeAlternatives) {
 *   console.log(`Alternative approaches: ${analysis.alternatives.length}`);
 *   console.log(`Recommended strategy: ${analysis.recommendedStrategy.name}`);
 * }
 * ```
 */
export class PermissionBasedFallback {
  private readonly permissionRequirements: Map<PlatformCapabilityId, PermissionLevel[]>;
  private readonly permissionFreeAlternatives: Map<PlatformCapabilityId, PlatformCapabilityId[]>;
  private readonly degradationStrategies: Map<PermissionLevel, string[]>;
  private readonly platformPermissionHandlers: Map<
    string,
    (capability: PlatformCapability) => string[]
  >;

  constructor() {
    this.permissionRequirements = this.initializePermissionRequirements();
    this.permissionFreeAlternatives = this.initializePermissionFreeAlternatives();
    this.degradationStrategies = this.initializeDegradationStrategies();
    this.platformPermissionHandlers = this.initializePlatformPermissionHandlers();
  }

  /**
   * Analyzes a permission-related failure and provides fallback strategies
   *
   * @param capability - The capability that failed due to permissions
   * @param detectionResult - Result from the failed detection
   * @param platformType - Current platform type
   * @param context - Additional context for analysis
   * @returns Comprehensive permission analysis
   */
  analyzePermissionFailure(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    platformType: string,
    _context?: Record<string, unknown>,
  ): PermissionAnalysisResult {
    const analysisStartTime = performance.now();

    try {
      // Analyze what permissions were required and denied
      const permissionAnalysis = this.analyzePermissionRequirements(capability, detectionResult);

      // Find permission-free alternatives
      const alternatives = this.findPermissionFreeAlternatives(
        capability,
        permissionAnalysis.deniedPermissions,
        platformType,
      );

      // Generate degradation strategies
      const degradationStrategies = this.generateDegradationStrategies(
        capability,
        permissionAnalysis.deniedPermissions,
        platformType,
      );

      // Determine recommended strategy
      const recommendedStrategy = this.determineRecommendedStrategy(
        capability,
        alternatives,
        degradationStrategies,
        permissionAnalysis,
      );

      // Assess user experience impact
      const userExperienceImpact = this.assessUserExperienceImpact(
        capability,
        recommendedStrategy,
        alternatives,
      );

      // Generate platform-specific guidance
      const platformGuidance = this.generatePlatformSpecificGuidance(
        capability,
        platformType,
        permissionAnalysis.deniedPermissions,
      );

      const analysisTime = performance.now() - analysisStartTime;

      return {
        capability,
        detectionResult,
        permissionAnalysis,
        hasPermissionFreeAlternatives: alternatives.length > 0,
        alternatives,
        degradationStrategies,
        recommendedStrategy,
        userExperienceImpact,
        platformGuidance,
        securityConsiderations: this.generateSecurityConsiderations(
          capability,
          alternatives,
          degradationStrategies,
        ),
        analysisMetrics: {
          analysisTimeMs: analysisTime,
          alternativesFound: alternatives.length,
          strategiesGenerated: degradationStrategies.length,
          permissionsAnalyzed: permissionAnalysis.requiredPermissions.length,
        },
        implementationNotes: this.generateImplementationNotes(recommendedStrategy, alternatives),
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(
        `Permission fallback analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Finds permission-free alternatives for a capability
   *
   * @param capability - The capability needing alternatives
   * @param deniedPermissions - Permissions that were denied
   * @param platformType - Current platform type
   * @returns Array of permission-free alternatives
   */
  findPermissionFreeAlternativesForCapability(
    capability: PlatformCapability,
    deniedPermissions: PermissionLevel[],
    platformType: string,
  ): PermissionAlternative[] {
    return this.findPermissionFreeAlternatives(capability, deniedPermissions, platformType);
  }

  /**
   * Generates graceful degradation strategies for permission constraints
   *
   * @param capability - The capability with permission issues
   * @param deniedPermissions - Permissions that were denied
   * @param platformType - Current platform type
   * @returns Array of degradation strategies
   */
  generateGracefulDegradationStrategies(
    capability: PlatformCapability,
    deniedPermissions: PermissionLevel[],
    platformType: string,
  ): PermissionFallbackStrategy[] {
    return this.generateDegradationStrategies(capability, deniedPermissions, platformType);
  }

  /**
   * Analyzes what permissions were required and which were denied
   */
  private analyzePermissionRequirements(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
  ): {
    requiredPermissions: PermissionLevel[];
    deniedPermissions: PermissionLevel[];
    availablePermissions: PermissionLevel[];
    permissionGaps: string[];
  } {
    // Get required permissions for this capability
    const requiredPermissions =
      this.permissionRequirements.get(capability.id as PlatformCapabilityId) ?? [];

    // Analyze what was actually denied based on detection result
    const deniedPermissions = this.extractDeniedPermissions(detectionResult);

    // Determine what permissions are available
    const availablePermissions = requiredPermissions.filter(
      perm => !deniedPermissions.includes(perm),
    );

    // Identify permission gaps
    const permissionGaps = this.identifyPermissionGaps(
      capability,
      requiredPermissions,
      deniedPermissions,
    );

    return {
      requiredPermissions,
      deniedPermissions,
      availablePermissions,
      permissionGaps,
    };
  }

  /**
   * Finds permission-free alternatives for a capability
   */
  private findPermissionFreeAlternatives(
    capability: PlatformCapability,
    deniedPermissions: PermissionLevel[],
    platformType: string,
  ): PermissionAlternative[] {
    const alternatives: PermissionAlternative[] = [];

    // Get predefined permission-free alternatives
    const predefinedAlternatives =
      this.permissionFreeAlternatives.get(capability.id as PlatformCapabilityId) ?? [];

    for (const altId of predefinedAlternatives) {
      const alternative = this.createPermissionAlternative(
        altId,
        capability,
        deniedPermissions,
        platformType,
      );
      if (alternative) {
        alternatives.push(alternative);
      }
    }

    // Find generic permission-reduction strategies
    const genericAlternatives = this.findGenericPermissionReductions(
      capability,
      deniedPermissions,
      platformType,
    );
    alternatives.push(...genericAlternatives);

    // Sort by effectiveness and ease of implementation
    return alternatives.sort((a, b) => {
      const aScore = a.effectivenessScore * 0.6 + a.implementationEase * 0.4;
      const bScore = b.effectivenessScore * 0.6 + b.implementationEase * 0.4;
      return bScore - aScore;
    });
  }

  /**
   * Generates degradation strategies for permission constraints
   */
  private generateDegradationStrategies(
    capability: PlatformCapability,
    deniedPermissions: PermissionLevel[],
    platformType: string,
  ): PermissionFallbackStrategy[] {
    const strategies: PermissionFallbackStrategy[] = [];

    for (const deniedPermission of deniedPermissions) {
      const degradationOptions = this.degradationStrategies.get(deniedPermission) ?? [];

      for (const option of degradationOptions) {
        strategies.push({
          name: `Graceful degradation for ${deniedPermission}`,
          description: option,
          permissionRequirement: PermissionLevel.NONE,
          functionalityRetained: this.calculateFunctionalityRetained(capability, deniedPermission),
          implementationComplexity: this.calculateImplementationComplexity(option),
          userExperienceImpact: this.calculateUserExperienceImpact(option),
          securityImplications: this.getSecurityImplications(option),
          platformCompatibility: this.getPlatformCompatibility(option, platformType),
          fallbackChain: this.generateFallbackChain(capability, deniedPermission, option),
        });
      }
    }

    return strategies;
  }

  /**
   * Creates a permission alternative with detailed analysis
   */
  private createPermissionAlternative(
    alternativeId: PlatformCapabilityId,
    originalCapability: PlatformCapability,
    deniedPermissions: PermissionLevel[],
    _platformType: string,
  ): PermissionAlternative | null {
    // Check if alternative requires any of the denied permissions
    const altRequirements = this.permissionRequirements.get(alternativeId) ?? [];
    const hasConflict = altRequirements.some(req => deniedPermissions.includes(req));

    if (hasConflict) {
      return null; // Alternative also requires denied permissions
    }

    const effectivenessScore = this.calculateEffectivenessScore(
      alternativeId,
      originalCapability,
      deniedPermissions,
    );

    if (effectivenessScore < 0.3) {
      return null; // Too ineffective
    }

    return {
      capabilityId: alternativeId,
      description: `Permission-free alternative to ${originalCapability.id}`,
      permissionRequirements: altRequirements,
      effectivenessScore,
      implementationEase: this.calculateImplementationEase(alternativeId, originalCapability),
      functionalityComparison: this.compareFunctionality(alternativeId, originalCapability),
      securityProfile: this.getSecurityProfile(alternativeId),
      platformSupport: this.getAlternativePlatformSupport(alternativeId),
      migrationSteps: this.generateMigrationSteps(
        originalCapability.id as PlatformCapabilityId,
        alternativeId,
      ),
      limitations: this.getAlternativeLimitations(alternativeId, originalCapability),
      benefits: this.getAlternativeBenefits(alternativeId, originalCapability),
    };
  }

  /**
   * Determines the recommended strategy based on analysis
   */
  private determineRecommendedStrategy(
    capability: PlatformCapability,
    alternatives: PermissionAlternative[],
    degradationStrategies: PermissionFallbackStrategy[],
    _permissionAnalysis: { deniedPermissions: PermissionLevel[] },
  ): PermissionFallbackStrategy {
    // Prefer high-effectiveness alternatives
    const bestAlternative = alternatives.find(alt => alt.effectivenessScore > 0.8);
    if (bestAlternative) {
      return {
        name: `Use permission-free alternative: ${bestAlternative.capabilityId}`,
        description: bestAlternative.description,
        permissionRequirement: PermissionLevel.NONE,
        functionalityRetained: bestAlternative.effectivenessScore,
        implementationComplexity: bestAlternative.implementationEase > 0.7 ? 'low' : 'moderate',
        userExperienceImpact: 'minimal',
        securityImplications: bestAlternative.securityProfile,
        platformCompatibility: bestAlternative.platformSupport,
        fallbackChain: [`Use ${bestAlternative.capabilityId} instead of ${capability.id}`],
      };
    }

    // Fall back to best degradation strategy
    const bestDegradation = degradationStrategies.find(
      strategy => strategy.userExperienceImpact === 'minimal',
    );
    if (bestDegradation) {
      return bestDegradation;
    }

    // Default graceful degradation
    return {
      name: 'Graceful degradation with user notification',
      description: 'Disable functionality with clear user communication',
      permissionRequirement: PermissionLevel.NONE,
      functionalityRetained: 0,
      implementationComplexity: 'low',
      userExperienceImpact: 'moderate',
      securityImplications: 'No security risks',
      platformCompatibility: { ELECTRON: true, WEB: true, CAPACITOR: true },
      fallbackChain: ['Display user-friendly message about unavailable functionality'],
    };
  }

  /**
   * Assesses user experience impact of permission-based changes
   */
  private assessUserExperienceImpact(
    _capability: PlatformCapability,
    recommendedStrategy: PermissionFallbackStrategy,
    _alternatives: PermissionAlternative[],
  ): {
    overallImpact: 'minimal' | 'moderate' | 'significant';
    specificImpacts: string[];
    userCommunicationNeeded: boolean;
    mitigationApproaches: string[];
  } {
    const impacts: string[] = [];
    const mitigationApproaches: string[] = [];

    // Analyze functionality loss
    if (recommendedStrategy.functionalityRetained < 0.7) {
      impacts.push('Reduced functionality available to user');
      mitigationApproaches.push('Provide clear explanation of feature limitations');
    }

    // Analyze workflow changes
    if (recommendedStrategy.implementationComplexity !== 'low') {
      impacts.push('User workflow may need adjustment');
      mitigationApproaches.push('Provide guided tutorial for new workflow');
    }

    // Determine overall impact
    let overallImpact: 'minimal' | 'moderate' | 'significant' = 'minimal';
    if (impacts.length > 1) overallImpact = 'moderate';
    if (impacts.length > 3) overallImpact = 'significant';

    return {
      overallImpact,
      specificImpacts: impacts,
      userCommunicationNeeded: impacts.length > 0,
      mitigationApproaches,
    };
  }

  /**
   * Helper methods for permission analysis
   */
  private extractDeniedPermissions(detectionResult: CapabilityDetectionResult): PermissionLevel[] {
    // Extract denied permissions from detection result evidence and required permissions
    const deniedPermissions: PermissionLevel[] = [];

    if (!detectionResult.permissionsGranted && detectionResult.requiredPermissions.length > 0) {
      // Map permission strings to PermissionLevel enum
      detectionResult.requiredPermissions.forEach(permString => {
        const permLevel = this.mapPermissionStringToLevel(permString);
        if (permLevel) {
          deniedPermissions.push(permLevel);
        }
      });
    }

    return deniedPermissions;
  }

  private mapPermissionStringToLevel(permissionString: string): PermissionLevel | null {
    const mapping: Record<string, PermissionLevel> = {
      system: PermissionLevel.SYSTEM,
      admin: PermissionLevel.ADMIN,
      write: PermissionLevel.WRITE,
      read: PermissionLevel.READ,
      none: PermissionLevel.NONE,
    };

    return mapping[permissionString.toLowerCase()] ?? null;
  }

  private identifyPermissionGaps(
    capability: PlatformCapability,
    required: PermissionLevel[],
    denied: PermissionLevel[],
  ): string[] {
    const gaps: string[] = [];

    denied.forEach(deniedPerm => {
      if (required.includes(deniedPerm)) {
        gaps.push(`Missing ${deniedPerm} permission required for ${capability.id}`);
      }
    });

    return gaps;
  }

  private findGenericPermissionReductions(
    _capability: PlatformCapability,
    _deniedPermissions: PermissionLevel[],
    _platformType: string,
  ): PermissionAlternative[] {
    // Generate generic alternatives based on permission reduction patterns
    return [];
  }

  private calculateFunctionalityRetained(
    _capability: PlatformCapability,
    deniedPermission: PermissionLevel,
  ): number {
    // Calculate what percentage of functionality is retained without this permission
    const permissionImpact: Record<PermissionLevel, number> = {
      [PermissionLevel.SYSTEM]: 0.3,
      [PermissionLevel.ADMIN]: 0.5,
      [PermissionLevel.WRITE]: 0.7,
      [PermissionLevel.READ]: 0.9,
      [PermissionLevel.NONE]: 1.0,
    };

    return permissionImpact[deniedPermission] ?? 0.5;
  }

  private calculateImplementationComplexity(
    _degradationOption: string,
  ): 'low' | 'moderate' | 'high' {
    // Analyze complexity of implementing this degradation option
    if (_degradationOption.includes('disable') || _degradationOption.includes('notify')) {
      return 'low';
    }
    if (_degradationOption.includes('alternative') || _degradationOption.includes('fallback')) {
      return 'moderate';
    }
    return 'high';
  }

  private calculateUserExperienceImpact(
    _degradationOption: string,
  ): 'minimal' | 'moderate' | 'significant' {
    if (_degradationOption.includes('seamless') || _degradationOption.includes('transparent')) {
      return 'minimal';
    }
    if (_degradationOption.includes('notification') || _degradationOption.includes('guidance')) {
      return 'moderate';
    }
    return 'significant';
  }

  private getSecurityImplications(_degradationOption: string): string {
    return 'No additional security risks introduced';
  }

  private getPlatformCompatibility(
    _degradationOption: string,
    _platformType: string,
  ): Record<string, boolean> {
    return { ELECTRON: true, WEB: true, CAPACITOR: true };
  }

  private generateFallbackChain(
    capability: PlatformCapability,
    deniedPermission: PermissionLevel,
    _degradationOption: string,
  ): string[] {
    return [`Implement ${_degradationOption} for ${capability.id} without ${deniedPermission}`];
  }

  private calculateEffectivenessScore(
    _alternativeId: PlatformCapabilityId,
    _originalCapability: PlatformCapability,
    _deniedPermissions: PermissionLevel[],
  ): number {
    // Calculate how effective this alternative is
    return 0.75;
  }

  private calculateImplementationEase(
    _alternativeId: PlatformCapabilityId,
    _originalCapability: PlatformCapability,
  ): number {
    // Calculate how easy it is to implement this alternative
    return 0.8;
  }

  private compareFunctionality(
    _alternativeId: PlatformCapabilityId,
    _originalCapability: PlatformCapability,
  ): string {
    return 'Provides 80% of original functionality without permission requirements';
  }

  private getSecurityProfile(_alternativeId: PlatformCapabilityId): string {
    return 'Reduced security capabilities but no additional risks';
  }

  private getAlternativePlatformSupport(
    _alternativeId: PlatformCapabilityId,
  ): Record<string, boolean> {
    return { ELECTRON: true, WEB: true, CAPACITOR: true };
  }

  private generateMigrationSteps(
    originalId: PlatformCapabilityId,
    alternativeId: PlatformCapabilityId,
  ): string[] {
    return [
      `Replace ${originalId} implementation with ${alternativeId}`,
      'Update permission handling logic',
      'Test functionality without elevated permissions',
    ];
  }

  private getAlternativeLimitations(
    _alternativeId: PlatformCapabilityId,
    _originalCapability: PlatformCapability,
  ): string[] {
    return ['Reduced functionality', 'May require additional user interaction'];
  }

  private getAlternativeBenefits(
    _alternativeId: PlatformCapabilityId,
    _originalCapability: PlatformCapability,
  ): string[] {
    return ['No permission requirements', 'Better compatibility across environments'];
  }

  private generatePlatformSpecificGuidance(
    capability: PlatformCapability,
    platformType: string,
    _deniedPermissions: PermissionLevel[],
  ): string[] {
    const handler = this.platformPermissionHandlers.get(platformType);
    return handler ? handler(capability) : ['Use standard permission handling approaches'];
  }

  private generateSecurityConsiderations(
    _capability: PlatformCapability,
    _alternatives: PermissionAlternative[],
    _degradationStrategies: PermissionFallbackStrategy[],
  ): string[] {
    return [
      'Validate all user inputs in permission-free alternatives',
      'Ensure graceful degradation does not expose sensitive data',
      'Monitor for security implications of reduced functionality',
    ];
  }

  private generateImplementationNotes(
    recommendedStrategy: PermissionFallbackStrategy,
    _alternatives: PermissionAlternative[],
  ): string[] {
    return [
      `Implement ${recommendedStrategy.name} as primary approach`,
      'Provide clear user feedback about permission limitations',
      'Consider progressive enhancement when permissions become available',
    ];
  }

  /**
   * Initialize data structures for permission handling
   */
  private initializePermissionRequirements(): Map<PlatformCapabilityId, PermissionLevel[]> {
    const requirements = new Map<PlatformCapabilityId, PermissionLevel[]>();

    requirements.set('storage.secure' as PlatformCapabilityId, [
      PermissionLevel.WRITE,
      PermissionLevel.READ,
    ]);

    requirements.set('filesystem.access' as PlatformCapabilityId, [
      PermissionLevel.SYSTEM,
      PermissionLevel.WRITE,
    ]);

    return requirements;
  }

  private initializePermissionFreeAlternatives(): Map<
    PlatformCapabilityId,
    PlatformCapabilityId[]
  > {
    const alternatives = new Map<PlatformCapabilityId, PlatformCapabilityId[]>();

    alternatives.set('storage.secure' as PlatformCapabilityId, [
      'storage.session' as PlatformCapabilityId,
      'storage.memory' as PlatformCapabilityId,
    ]);

    return alternatives;
  }

  private initializeDegradationStrategies(): Map<PermissionLevel, string[]> {
    const strategies = new Map<PermissionLevel, string[]>();

    strategies.set(PermissionLevel.SYSTEM, [
      'Use user-space alternatives instead of system-level access',
      'Provide read-only functionality with user notification',
    ]);

    strategies.set(PermissionLevel.WRITE, [
      'Switch to read-only mode with clear user indication',
      'Use in-memory storage with export options',
    ]);

    return strategies;
  }

  private initializePlatformPermissionHandlers(): Map<
    string,
    (capability: PlatformCapability) => string[]
  > {
    const handlers = new Map<string, (capability: PlatformCapability) => string[]>();

    handlers.set('ELECTRON', _capability => [
      'Use Node.js APIs with appropriate security context',
      'Implement IPC-based permission checks',
    ]);

    handlers.set('WEB', _capability => [
      'Use Permissions API for graceful permission handling',
      'Implement progressive enhancement patterns',
    ]);

    handlers.set('CAPACITOR', _capability => [
      'Use Capacitor permission management',
      'Implement native fallbacks where available',
    ]);

    return handlers;
  }
}

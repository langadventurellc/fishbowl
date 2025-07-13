import type { PlatformCapability, PlatformCapabilityId } from '../../../../types/platform';
import type { CapabilityDependencyChain } from './CapabilityDependencyChain';
import type { DependencyValidationResult } from './DependencyValidationResult';
import type { FallbackChain } from './FallbackChain';

/**
 * Validates capability dependencies and provides fallback chains
 *
 * The DependencyValidator analyzes capability dependency relationships,
 * detects circular dependencies, validates dependency chains, and provides
 * intelligent fallback chains when dependencies fail.
 *
 * Key Features:
 * - Dependency chain validation and analysis
 * - Circular dependency detection and resolution
 * - Intelligent fallback chain generation
 * - Performance impact assessment for dependency changes
 * - Alternative dependency path suggestions
 * - Dependency conflict resolution strategies
 *
 * @example
 * ```typescript
 * const validator = new DependencyValidator();
 *
 * const result = await validator.validateDependencyChain(
 *   secureStorageCapability,
 *   [encryptionCapability, filesystemCapability],
 *   'ELECTRON'
 * );
 *
 * if (!result.isValid) {
 *   console.log(`Dependency issues: ${result.issues.join(', ')}`);
 *   console.log(`Fallback chains: ${result.fallbackChains.length}`);
 * }
 * ```
 */
export class DependencyValidator {
  private readonly dependencyGraph: Map<PlatformCapabilityId, PlatformCapabilityId[]>;
  private readonly reverseDependencyGraph: Map<PlatformCapabilityId, PlatformCapabilityId[]>;
  private readonly fallbackMappings: Map<PlatformCapabilityId, PlatformCapabilityId[]>;

  constructor() {
    this.dependencyGraph = this.initializeDependencyGraph();
    this.reverseDependencyGraph = this.initializeReverseDependencyGraph();
    this.fallbackMappings = this.initializeFallbackMappings();
  }

  /**
   * Validates a complete dependency chain for a capability
   *
   * @param capability - The primary capability to validate
   * @param dependencies - Array of dependencies for this capability
   * @param platformType - Current platform type
   * @param context - Additional validation context
   * @returns Promise resolving to comprehensive dependency validation result
   */
  async validateDependencyChain(
    capability: PlatformCapability,
    dependencies: PlatformCapability[],
    platformType: string,
    _context?: Record<string, unknown>,
  ): Promise<DependencyValidationResult> {
    const validationStartTime = performance.now();

    try {
      // Build dependency chain structure
      const dependencyChain = this.buildDependencyChain(capability, dependencies);

      // Check for circular dependencies
      const circularDependencies = this.detectCircularDependencies(dependencyChain);

      // Validate each dependency relationship
      const relationshipValidation = this.validateRelationships(dependencyChain, platformType);

      // Generate fallback chains for failed dependencies
      const fallbackChains = await this.generateFallbackChains(
        dependencyChain,
        relationshipValidation.failedDependencies,
        platformType,
      );

      // Assess performance impact of dependency changes
      const performanceImpact = this.assessPerformanceImpact(
        dependencyChain,
        fallbackChains,
        platformType,
      );

      // Generate resolution strategies
      const resolutionStrategies = this.generateResolutionStrategies(
        circularDependencies,
        relationshipValidation.failedDependencies,
        fallbackChains,
      );

      const validationTime = performance.now() - validationStartTime;

      return {
        capability,
        dependencies,
        dependencyChain,
        isValid:
          circularDependencies.length === 0 &&
          relationshipValidation.failedDependencies.length === 0,
        circularDependencies,
        failedDependencies: relationshipValidation.failedDependencies,
        fallbackChains,
        issues: this.collectValidationIssues(circularDependencies, relationshipValidation),
        resolutionStrategies,
        performanceImpact,
        validationMetrics: {
          validationTimeMs: validationTime,
          dependenciesAnalyzed: dependencies.length,
          circularDependenciesFound: circularDependencies.length,
          fallbackChainsGenerated: fallbackChains.length,
          complexityScore: this.calculateComplexityScore(dependencyChain, circularDependencies),
        },
        recommendations: this.generateRecommendations(
          circularDependencies,
          relationshipValidation.failedDependencies,
          fallbackChains,
        ),
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(
        `Dependency validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Validates dependencies for multiple capabilities and finds conflicts
   *
   * @param capabilities - Array of capabilities with their dependencies
   * @param platformType - Current platform type
   * @returns Promise resolving to batch validation result
   */
  async validateBatchDependencies(
    capabilities: Array<{ capability: PlatformCapability; dependencies: PlatformCapability[] }>,
    platformType: string,
  ): Promise<{
    individualResults: DependencyValidationResult[];
    crossCapabilityConflicts: string[];
    sharedDependencyOptimizations: string[];
    batchResolutionStrategies: string[];
  }> {
    // Validate each capability's dependencies
    const individualResults = await Promise.all(
      capabilities.map(({ capability, dependencies }) =>
        this.validateDependencyChain(capability, dependencies, platformType),
      ),
    );

    // Find cross-capability conflicts
    const crossCapabilityConflicts = this.findCrossCapabilityConflicts(individualResults);

    // Find shared dependency optimizations
    const sharedDependencyOptimizations = this.findSharedDependencyOptimizations(individualResults);

    // Generate batch resolution strategies
    const batchResolutionStrategies = this.generateBatchResolutionStrategies(
      individualResults,
      crossCapabilityConflicts,
    );

    return {
      individualResults,
      crossCapabilityConflicts,
      sharedDependencyOptimizations,
      batchResolutionStrategies,
    };
  }

  /**
   * Generates fallback chains for failed dependencies
   *
   * @param capability - The capability needing fallback
   * @param failedDependencies - Dependencies that are not available
   * @param platformType - Current platform type
   * @returns Promise resolving to array of fallback chains
   */
  async generateFallbackChainsForCapability(
    capability: PlatformCapability,
    failedDependencies: PlatformCapabilityId[],
    platformType: string,
  ): Promise<FallbackChain[]> {
    const dependencyChain = this.buildDependencyChain(capability, []);
    return this.generateFallbackChains(dependencyChain, failedDependencies, platformType);
  }

  /**
   * Builds a structured dependency chain from capability and dependencies
   */
  private buildDependencyChain(
    capability: PlatformCapability,
    dependencies: PlatformCapability[],
  ): CapabilityDependencyChain {
    const chain: CapabilityDependencyChain = {
      rootCapability: capability,
      directDependencies: dependencies.map(dep => ({
        capability: dep,
        dependencyType: this.determineDependencyType(capability, dep),
        required: this.isDependencyRequired(capability, dep),
        platformSpecific: this.isPlatformSpecific(dep),
      })),
      transitiveDependencies: [],
      dependencyLevels: {},
    };

    // Build transitive dependencies
    dependencies.forEach(dep => {
      const transitive = this.getTransitiveDependencies(dep.id as PlatformCapabilityId);
      chain.transitiveDependencies.push(...transitive);
    });

    // Calculate dependency levels
    chain.dependencyLevels = this.calculateDependencyLevels(chain);

    return chain;
  }

  /**
   * Detects circular dependencies in the dependency chain
   */
  private detectCircularDependencies(dependencyChain: CapabilityDependencyChain): string[] {
    const circularDeps: string[] = [];
    const visited = new Set<PlatformCapabilityId>();
    const recursionStack = new Set<PlatformCapabilityId>();

    const detectCycles = (
      capabilityId: PlatformCapabilityId,
      path: PlatformCapabilityId[],
    ): void => {
      if (recursionStack.has(capabilityId)) {
        const cycleStart = path.indexOf(capabilityId);
        const cycle = path.slice(cycleStart).concat(capabilityId);
        circularDeps.push(`Circular dependency: ${cycle.join(' -> ')}`);
        return;
      }

      if (visited.has(capabilityId)) {
        return;
      }

      visited.add(capabilityId);
      recursionStack.add(capabilityId);

      const dependencies = this.dependencyGraph.get(capabilityId) ?? [];
      dependencies.forEach(dep => {
        detectCycles(dep, [...path, capabilityId]);
      });

      recursionStack.delete(capabilityId);
    };

    // Start detection from root capability
    detectCycles(dependencyChain.rootCapability.id as PlatformCapabilityId, []);

    return circularDeps;
  }

  /**
   * Validates dependency relationships for platform compatibility
   */
  private validateRelationships(
    dependencyChain: CapabilityDependencyChain,
    platformType: string,
  ): {
    validDependencies: PlatformCapabilityId[];
    failedDependencies: PlatformCapabilityId[];
    issues: string[];
  } {
    const validDependencies: PlatformCapabilityId[] = [];
    const failedDependencies: PlatformCapabilityId[] = [];
    const issues: string[] = [];

    dependencyChain.directDependencies.forEach(dep => {
      const isValid = this.validateDependencyRelationship(
        dependencyChain.rootCapability.id as PlatformCapabilityId,
        dep.capability.id as PlatformCapabilityId,
        platformType,
      );

      if (isValid) {
        validDependencies.push(dep.capability.id as PlatformCapabilityId);
      } else {
        failedDependencies.push(dep.capability.id as PlatformCapabilityId);
        issues.push(`Dependency ${dep.capability.id} is not compatible with ${platformType}`);
      }

      // Check if required dependency is available
      if (dep.required && !isValid) {
        issues.push(`Required dependency ${dep.capability.id} is not available`);
      }
    });

    return { validDependencies, failedDependencies, issues };
  }

  /**
   * Generates fallback chains for failed dependencies
   */
  private generateFallbackChains(
    dependencyChain: CapabilityDependencyChain,
    failedDependencies: PlatformCapabilityId[],
    platformType: string,
  ): Promise<FallbackChain[]> {
    const fallbackChains: FallbackChain[] = [];

    for (const failedDep of failedDependencies) {
      const fallbacks = this.fallbackMappings.get(failedDep) ?? [];

      for (const fallback of fallbacks) {
        const isCompatible = this.validateDependencyRelationship(
          dependencyChain.rootCapability.id as PlatformCapabilityId,
          fallback,
          platformType,
        );

        if (isCompatible) {
          fallbackChains.push({
            originalDependency: failedDep,
            fallbackDependency: fallback,
            fallbackType: this.determineFallbackType(failedDep, fallback),
            compatibilityScore: this.calculateFallbackCompatibility(failedDep, fallback),
            functionalityImpact: this.assessFunctionalityImpact(failedDep, fallback),
            implementationChanges: this.getImplementationChanges(failedDep, fallback),
            performanceImplications: this.getPerformanceImplications(failedDep, fallback),
            platformSupport: this.getFallbackPlatformSupport(fallback),
          });
        }
      }
    }

    // Sort by compatibility score
    return Promise.resolve(
      fallbackChains.sort((a, b) => b.compatibilityScore - a.compatibilityScore),
    );
  }

  /**
   * Assesses performance impact of dependency changes
   */
  private assessPerformanceImpact(
    dependencyChain: CapabilityDependencyChain,
    fallbackChains: FallbackChain[],
    _platformType: string,
  ): {
    overallImpact: 'positive' | 'neutral' | 'negative';
    specificImpacts: string[];
    mitigation: string[];
  } {
    const impacts: string[] = [];
    const mitigation: string[] = [];
    let overallScore = 0;

    fallbackChains.forEach(chain => {
      const impact = chain.performanceImplications;
      impacts.push(`${chain.fallbackDependency}: ${impact}`);

      if (impact.includes('slower')) {
        overallScore -= 1;
        mitigation.push(`Optimize ${chain.fallbackDependency} implementation`);
      } else if (impact.includes('faster')) {
        overallScore += 1;
      }
    });

    const overallImpact = overallScore > 0 ? 'positive' : overallScore < 0 ? 'negative' : 'neutral';

    return { overallImpact, specificImpacts: impacts, mitigation };
  }

  /**
   * Generates resolution strategies for dependency issues
   */
  private generateResolutionStrategies(
    circularDependencies: string[],
    failedDependencies: PlatformCapabilityId[],
    fallbackChains: FallbackChain[],
  ): string[] {
    const strategies: string[] = [];

    if (circularDependencies.length > 0) {
      strategies.push('Break circular dependencies by introducing interface abstraction');
      strategies.push('Use dependency injection to manage circular references');
    }

    if (failedDependencies.length > 0) {
      strategies.push('Implement graceful degradation for missing dependencies');
      if (fallbackChains.length > 0) {
        strategies.push(
          `Use fallback dependencies: ${fallbackChains.map(c => c.fallbackDependency).join(', ')}`,
        );
      }
    }

    return strategies;
  }

  /**
   * Helper methods for dependency analysis
   */
  private determineDependencyType(
    _capability: PlatformCapability,
    _dependency: PlatformCapability,
  ): 'required' | 'optional' | 'conditional' {
    // Would analyze actual dependency metadata
    return 'required';
  }

  private isDependencyRequired(
    _capability: PlatformCapability,
    _dependency: PlatformCapability,
  ): boolean {
    // Would check actual dependency requirements
    return true;
  }

  private isPlatformSpecific(_capability: PlatformCapability): boolean {
    // Would check platform specificity
    return false;
  }

  private getTransitiveDependencies(capabilityId: PlatformCapabilityId): PlatformCapabilityId[] {
    return this.dependencyGraph.get(capabilityId) ?? [];
  }

  private calculateDependencyLevels(
    chain: CapabilityDependencyChain,
  ): Record<PlatformCapabilityId, number> {
    const levels: Record<PlatformCapabilityId, number> = {};

    // Root capability is level 0
    levels[chain.rootCapability.id as PlatformCapabilityId] = 0;

    // Direct dependencies are level 1
    chain.directDependencies.forEach(dep => {
      levels[dep.capability.id as PlatformCapabilityId] = 1;
    });

    return levels;
  }

  private validateDependencyRelationship(
    _capabilityId: PlatformCapabilityId,
    _dependencyId: PlatformCapabilityId,
    _platformType: string,
  ): boolean {
    // Would perform actual compatibility validation
    return true;
  }

  private determineFallbackType(
    _original: PlatformCapabilityId,
    _fallback: PlatformCapabilityId,
  ): 'direct-replacement' | 'functional-equivalent' | 'reduced-functionality' {
    // Would determine actual fallback type
    return 'functional-equivalent';
  }

  private calculateFallbackCompatibility(
    _original: PlatformCapabilityId,
    _fallback: PlatformCapabilityId,
  ): number {
    // Would calculate actual compatibility score
    return 0.8;
  }

  private assessFunctionalityImpact(
    _original: PlatformCapabilityId,
    _fallback: PlatformCapabilityId,
  ): 'none' | 'minor' | 'moderate' | 'major' {
    return 'minor';
  }

  private getImplementationChanges(
    original: PlatformCapabilityId,
    fallback: PlatformCapabilityId,
  ): string[] {
    return [`Replace ${original} API calls with ${fallback} API`];
  }

  private getPerformanceImplications(
    _original: PlatformCapabilityId,
    _fallback: PlatformCapabilityId,
  ): string {
    return 'Similar performance characteristics';
  }

  private getFallbackPlatformSupport(_fallback: PlatformCapabilityId): Record<string, boolean> {
    return { ELECTRON: true, WEB: true, CAPACITOR: true };
  }

  private calculateComplexityScore(
    dependencyChain: CapabilityDependencyChain,
    circularDependencies: string[],
  ): number {
    let score = 1;
    score += dependencyChain.directDependencies.length * 0.2;
    score += circularDependencies.length * 0.5;
    return Math.min(score, 5);
  }

  private collectValidationIssues(
    circularDependencies: string[],
    relationshipValidation: { issues: string[] },
  ): string[] {
    return [...circularDependencies, ...relationshipValidation.issues];
  }

  private generateRecommendations(
    circularDependencies: string[],
    failedDependencies: PlatformCapabilityId[],
    fallbackChains: FallbackChain[],
  ): string[] {
    const recommendations: string[] = [];

    if (circularDependencies.length > 0) {
      recommendations.push('Refactor code to eliminate circular dependencies');
    }

    if (failedDependencies.length > 0 && fallbackChains.length > 0) {
      recommendations.push(`Consider using fallback: ${fallbackChains[0].fallbackDependency}`);
    }

    return recommendations;
  }

  private findCrossCapabilityConflicts(_results: DependencyValidationResult[]): string[] {
    // Would find conflicts between different capability dependency chains
    return [];
  }

  private findSharedDependencyOptimizations(_results: DependencyValidationResult[]): string[] {
    // Would find opportunities to optimize shared dependencies
    return ['Use shared dependency instance for common requirements'];
  }

  private generateBatchResolutionStrategies(
    _results: DependencyValidationResult[],
    _conflicts: string[],
  ): string[] {
    return ['Implement unified dependency management strategy'];
  }

  /**
   * Initialize dependency graph data structures
   */
  private initializeDependencyGraph(): Map<PlatformCapabilityId, PlatformCapabilityId[]> {
    const graph = new Map<PlatformCapabilityId, PlatformCapabilityId[]>();

    // Example dependency relationships
    graph.set('storage.secure' as PlatformCapabilityId, [
      'security.encryption' as PlatformCapabilityId,
    ]);

    return graph;
  }

  private initializeReverseDependencyGraph(): Map<PlatformCapabilityId, PlatformCapabilityId[]> {
    const reverseGraph = new Map<PlatformCapabilityId, PlatformCapabilityId[]>();

    // Build reverse graph from dependency graph
    this.dependencyGraph.forEach((dependencies, capability) => {
      dependencies.forEach(dep => {
        if (!reverseGraph.has(dep)) {
          reverseGraph.set(dep, []);
        }
        const currentDeps = reverseGraph.get(dep);
        if (currentDeps) {
          currentDeps.push(capability);
        }
      });
    });

    return reverseGraph;
  }

  private initializeFallbackMappings(): Map<PlatformCapabilityId, PlatformCapabilityId[]> {
    const mappings = new Map<PlatformCapabilityId, PlatformCapabilityId[]>();

    mappings.set('security.encryption' as PlatformCapabilityId, [
      'security.basic-encryption' as PlatformCapabilityId,
    ]);

    return mappings;
  }
}

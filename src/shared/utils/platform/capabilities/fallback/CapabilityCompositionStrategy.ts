import { PlatformType } from '../../../../constants/platform/PlatformType';
import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import type { FallbackApplicationContext } from './FallbackApplicationContext';
import type { FallbackApplicationResult } from './FallbackApplicationResult';
import type { FallbackPriority } from './FallbackPriority';
import type { FallbackStrategy } from './FallbackStrategy';
import { capabilityCompositionMappings } from './capabilityCompositionMappingsData';
import type { CompositionMapping } from './CompositionMapping';
import type { ComponentCapability } from './ComponentCapability';

/**
 * Fallback strategy that breaks down complex capabilities into simpler, composable components.
 *
 * This strategy analyzes complex capabilities and suggests combinations of simpler
 * capabilities that together can provide similar functionality. It's particularly
 * useful when a high-level capability is not available but its constituent parts
 * can be assembled manually.
 *
 * Features:
 * - Complex capability decomposition into manageable components
 * - Platform-specific component availability analysis
 * - Integration guidance and implementation hints
 * - Dependency analysis between components
 * - Implementation effort estimation
 * - Performance comparison with original capability
 *
 * @example
 * ```typescript
 * const strategy = new CapabilityCompositionStrategy();
 *
 * const context: FallbackApplicationContext = {
 *   capabilityId: 'ui.rich-editor',
 *   platformType: PlatformType.WEB,
 *   detectionResult: { status: DetectionStatus.NOT_SUPPORTED },
 *   executionStartTime: performance.now()
 * };
 *
 * const result = await strategy.apply(context);
 * // Result suggests components like 'ui.text-input', 'ui.formatting', 'ui.selection'
 * ```
 */
export class CapabilityCompositionStrategy implements FallbackStrategy {
  readonly id = 'capability-composition';
  readonly name = 'Capability Composition Strategy';
  readonly description = 'Breaks down complex capabilities into simpler, composable components';
  readonly priority: FallbackPriority = 60; // Medium-high priority for component breakdown
  readonly supportedCapabilities: PlatformCapabilityId[] = []; // Supports all capabilities
  readonly supportedPlatforms: PlatformType[] = []; // Supports all platforms

  private readonly compositionMappings: CompositionMapping[] = capabilityCompositionMappings;

  /**
   * Determines if capability composition can be applied to the given context.
   *
   * @param context - The fallback application context
   * @returns true if composition is available, false otherwise
   */
  canApply(context: FallbackApplicationContext): boolean {
    // Can apply composition when capability is unavailable, not supported, or has errors
    // Since CapabilityDetectionResult doesn't have status property, derive it from available property
    const isApplicable =
      !context.detectionResult.available ||
      (context.detectionResult.requiredPermissions.length > 0 &&
        !context.detectionResult.permissionsGranted);

    if (!isApplicable) {
      return false;
    }

    // Check if we have a composition mapping for this capability
    return this.getCompositionMapping(context.capabilityId, context.platformType) !== undefined;
  }

  /**
   * Suggests component capabilities that can be composed to provide similar functionality.
   *
   * @param context - The fallback application context
   * @returns Promise resolving to the composition suggestions
   */
  apply(context: FallbackApplicationContext): Promise<FallbackApplicationResult> {
    const startTime = performance.now();

    try {
      const mapping = this.getCompositionMapping(context.capabilityId, context.platformType);

      if (!mapping) {
        return Promise.resolve({
          success: false,
          message: `No composition mapping available for '${context.capabilityId}' on ${context.platformType}`,
          recommendations: [
            'Consider breaking down the capability manually into smaller components',
            'Research if the capability has any documented component dependencies',
            'Look for community implementations that decompose this capability',
          ],
          executionTimeMs: performance.now() - startTime,
          cacheable: true,
        });
      }

      // Filter components by platform availability
      const availableComponents = mapping.componentCapabilities.filter(comp =>
        comp.availablePlatforms.includes(context.platformType),
      );

      if (availableComponents.length === 0) {
        return Promise.resolve({
          success: false,
          message: `No platform-compatible components found for '${context.capabilityId}' on ${context.platformType}`,
          recommendations: [
            `Component capabilities exist but are not available on ${context.platformType}`,
            'Consider using a different platform or implementing platform-specific components',
          ],
          executionTimeMs: performance.now() - startTime,
          cacheable: true,
        });
      }

      // Analyze component dependencies and generate recommendations
      const recommendations = this.generateCompositionRecommendations(mapping, availableComponents);
      const alternativeCapabilities = availableComponents.map(comp => comp.capabilityId);

      // Determine success based on functional coverage and required components
      const requiredComponents = availableComponents.filter(comp => comp.required);
      const hasAllRequired =
        requiredComponents.length ===
        mapping.componentCapabilities.filter(comp => comp.required).length;
      const success =
        hasAllRequired && ['complete', 'substantial'].includes(mapping.functionalCoverage);

      return Promise.resolve({
        success,
        message: success
          ? `Found viable composition for '${context.capabilityId}' using ${availableComponents.length} components`
          : `Partial composition available for '${context.capabilityId}' but may have limitations`,
        recommendations,
        alternativeCapabilities,
        executionTimeMs: performance.now() - startTime,
        cacheable: true,
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Error analyzing capability composition: ${error instanceof Error ? error.message : String(error)}`,
        recommendations: [
          'Check composition mapping configuration',
          'Verify component capability definitions and dependencies',
        ],
        executionTimeMs: performance.now() - startTime,
        errors: [error instanceof Error ? error : new Error(String(error))],
        cacheable: false,
      });
    }
  }

  /**
   * Finds the appropriate composition mapping for the given capability and platform.
   */
  private getCompositionMapping(
    capabilityId: PlatformCapabilityId,
    platformType: PlatformType,
  ): CompositionMapping | undefined {
    return this.compositionMappings.find(
      mapping =>
        mapping.complexCapability === capabilityId &&
        (mapping.supportedPlatforms.length === 0 ||
          mapping.supportedPlatforms.includes(platformType)),
    );
  }

  /**
   * Generates detailed recommendations for capability composition.
   */
  private generateCompositionRecommendations(
    mapping: CompositionMapping,
    availableComponents: ComponentCapability[],
  ): string[] {
    const recommendations: string[] = [];

    // Add general composition information
    recommendations.push(`Capability composition for '${mapping.complexCapability}':`);
    recommendations.push(`Functional coverage: ${mapping.functionalCoverage}`);
    recommendations.push(`Implementation complexity: ${mapping.implementationComplexity}`);
    recommendations.push(`Performance compared to original: ${mapping.performanceComparison}`);

    if (mapping.integrationNotes) {
      recommendations.push(`Integration notes: ${mapping.integrationNotes}`);
    }

    // Analyze component dependencies
    const requiredComponents = availableComponents.filter(comp => comp.required);
    const optionalComponents = availableComponents.filter(comp => !comp.required);

    if (requiredComponents.length > 0) {
      recommendations.push('\nRequired components:');
      this.addComponentRecommendations(recommendations, requiredComponents);
    }

    if (optionalComponents.length > 0) {
      recommendations.push('\nOptional components:');
      this.addComponentRecommendations(recommendations, optionalComponents);
    }

    // Add implementation guidance
    recommendations.push('\nImplementation guidance:');
    recommendations.push('• Implement required components first for basic functionality');
    recommendations.push('• Add optional components to enhance user experience');
    recommendations.push('• Consider component dependencies when planning implementation order');

    // Add dependency analysis
    const dependencyChain = this.analyzeDependencyChain(availableComponents);
    if (dependencyChain.length > 0) {
      recommendations.push('\nRecommended implementation order:');
      dependencyChain.forEach((comp, index) => {
        recommendations.push(`${index + 1}. ${comp.name} (${comp.integrationRole})`);
      });
    }

    // Add effort estimation
    const totalEffort = this.estimateTotalEffort(availableComponents);
    recommendations.push(`\nEstimated total implementation effort: ${totalEffort}`);

    return recommendations;
  }

  /**
   * Adds component-specific recommendations to the list.
   */
  private addComponentRecommendations(
    recommendations: string[],
    components: ComponentCapability[],
  ): void {
    components.forEach(comp => {
      recommendations.push(`  • ${comp.name}: ${comp.description}`);
      recommendations.push(`    - Role: ${comp.integrationRole}`);
      recommendations.push(`    - Effort: ${comp.implementationEffort}`);

      if (comp.dependsOn.length > 0) {
        recommendations.push(`    - Depends on: ${comp.dependsOn.join(', ')}`);
      }

      if (comp.implementationHint) {
        recommendations.push(`    - Hint: ${comp.implementationHint}`);
      }
    });
  }

  /**
   * Analyzes component dependencies to suggest implementation order.
   */
  private analyzeDependencyChain(components: ComponentCapability[]): ComponentCapability[] {
    const ordered: ComponentCapability[] = [];
    const remaining = [...components];

    // Simple topological sort based on dependencies
    while (remaining.length > 0) {
      const canImplement = remaining.filter(comp =>
        comp.dependsOn.every(
          dep =>
            ordered.some(impl => impl.capabilityId === dep) ||
            !components.some(c => c.capabilityId === dep),
        ),
      );

      if (canImplement.length === 0) {
        // Circular dependency or missing dependency, add remaining in order
        ordered.push(...remaining);
        break;
      }

      // Sort by role priority (primary > secondary > auxiliary > optional)
      const rolePriority = { primary: 4, secondary: 3, auxiliary: 2, optional: 1 };
      canImplement.sort(
        (a, b) => rolePriority[b.integrationRole] - rolePriority[a.integrationRole],
      );

      const next = canImplement[0];
      ordered.push(next);
      remaining.splice(remaining.indexOf(next), 1);
    }

    return ordered;
  }

  /**
   * Estimates total implementation effort for all components.
   */
  private estimateTotalEffort(components: ComponentCapability[]): string {
    const effortWeights = { minimal: 1, moderate: 3, significant: 5 };
    const totalWeight = components.reduce(
      (sum, comp) => sum + effortWeights[comp.implementationEffort],
      0,
    );

    if (totalWeight <= 3) return 'minimal';
    if (totalWeight <= 8) return 'moderate';
    return 'significant';
  }

  /**
   * Validates the strategy configuration and composition mappings.
   *
   * @returns Promise resolving to true if strategy is valid
   */
  validate(): Promise<boolean> {
    try {
      // Validate all composition mappings
      for (const mapping of capabilityCompositionMappings) {
        if (!mapping.complexCapability || typeof mapping.complexCapability !== 'string') {
          return Promise.resolve(false);
        }

        if (
          !Array.isArray(mapping.componentCapabilities) ||
          mapping.componentCapabilities.length === 0
        ) {
          return Promise.resolve(false);
        }

        if (
          !['complete', 'substantial', 'partial', 'limited'].includes(mapping.functionalCoverage)
        ) {
          return Promise.resolve(false);
        }

        if (!['low', 'medium', 'high'].includes(mapping.implementationComplexity)) {
          return Promise.resolve(false);
        }

        // Validate each component
        for (const comp of mapping.componentCapabilities) {
          if (!comp.capabilityId || typeof comp.capabilityId !== 'string') {
            return Promise.resolve(false);
          }

          if (!comp.name || typeof comp.name !== 'string') {
            return Promise.resolve(false);
          }

          if (typeof comp.required !== 'boolean') {
            return Promise.resolve(false);
          }

          if (!['primary', 'secondary', 'auxiliary', 'optional'].includes(comp.integrationRole)) {
            return Promise.resolve(false);
          }

          if (!Array.isArray(comp.dependsOn)) {
            return Promise.resolve(false);
          }

          if (!Array.isArray(comp.availablePlatforms)) {
            return Promise.resolve(false);
          }

          if (!['minimal', 'moderate', 'significant'].includes(comp.implementationEffort)) {
            return Promise.resolve(false);
          }
        }
      }

      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }
}

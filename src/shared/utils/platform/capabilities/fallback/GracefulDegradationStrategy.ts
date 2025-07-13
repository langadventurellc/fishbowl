import { DetectionStatus } from '../../../../constants/platform/DetectionStatus';
import { PlatformType } from '../../../../constants/platform/PlatformType';
import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import type { CapabilityDetectionResult } from '../../../../types/platform/CapabilityDetectionResult';
import type { FallbackApplicationContext } from './FallbackApplicationContext';
import type { FallbackApplicationResult } from './FallbackApplicationResult';
import type { FallbackPriority } from './FallbackPriority';
import type { FallbackStrategy } from './FallbackStrategy';
import { gracefulDegradationMappings } from './gracefulDegradationMappingsData';
import type { DegradationMapping } from './DegradationMapping';

/**
 * Fallback strategy that provides automatic feature degradation when capabilities are unavailable.
 *
 * This strategy gracefully reduces functionality to ensure the application remains usable
 * even when preferred capabilities cannot be detected or are not supported. It provides
 * a predefined set of degradation mappings for common capability failures.
 *
 * Features:
 * - Predefined degradation mappings for common capabilities
 * - Platform-specific degradation rules
 * - Impact level assessment for degradation decisions
 * - Production safety validation
 * - Detailed recommendations for reduced functionality
 *
 * @example
 * ```typescript
 * const strategy = new GracefulDegradationStrategy();
 *
 * const context: FallbackApplicationContext = {
 *   capabilityId: 'storage.secure',
 *   platformType: PlatformType.WEB,
 *   detectionResult: { status: DetectionStatus.UNAVAILABLE },
 *   executionStartTime: performance.now()
 * };
 *
 * const result = await strategy.apply(context);
 * // Result provides degraded features like localStorage fallback
 * ```
 */
export class GracefulDegradationStrategy implements FallbackStrategy {
  readonly id = 'graceful-degradation';
  readonly name = 'Graceful Degradation Strategy';
  readonly description =
    'Automatically degrades features when capabilities are unavailable to maintain application functionality';
  readonly priority: FallbackPriority = 75; // High priority for graceful degradation
  readonly supportedCapabilities: PlatformCapabilityId[] = []; // Supports all capabilities
  readonly supportedPlatforms: PlatformType[] = []; // Supports all platforms

  private readonly degradationMappings: DegradationMapping[] = gracefulDegradationMappings;

  /**
   * Determines if graceful degradation can be applied to the given context.
   *
   * @param context - The fallback application context
   * @returns true if degradation is possible, false otherwise
   */
  canApply(context: FallbackApplicationContext): boolean {
    // Can apply degradation when capability is unavailable, not supported, or has errors
    const applicableStatuses = [
      DetectionStatus.UNAVAILABLE,
      DetectionStatus.NOT_SUPPORTED,
      DetectionStatus.ERROR,
      DetectionStatus.PERMISSION_DENIED,
    ];

    // Derive status from detection result properties
    const detectedStatus = this.getDetectionStatus(context.detectionResult);

    if (!applicableStatuses.includes(detectedStatus)) {
      return false;
    }

    // Check if we have a degradation mapping for this capability
    return this.getDegradationMapping(context.capabilityId, context.platformType) !== undefined;
  }

  /**
   * Applies graceful degradation for the unavailable capability.
   *
   * @param context - The fallback application context
   * @returns Promise resolving to the degradation result
   */
  apply(context: FallbackApplicationContext): Promise<FallbackApplicationResult> {
    const startTime = performance.now();

    try {
      const mapping = this.getDegradationMapping(context.capabilityId, context.platformType);

      if (!mapping) {
        return Promise.resolve({
          success: false,
          message: `No graceful degradation available for capability '${context.capabilityId}' on ${context.platformType}`,
          recommendations: [
            'Consider implementing a custom degradation strategy for this capability',
            'Check if alternative capabilities can provide similar functionality',
          ],
          executionTimeMs: performance.now() - startTime,
          cacheable: true,
        });
      }

      // Generate recommendations based on degradation mapping
      const recommendations = this.generateRecommendations(mapping);

      // Determine if this degradation is acceptable
      const isAcceptable = this.isDegradationAcceptable(mapping, context);

      return Promise.resolve({
        success: isAcceptable,
        message: isAcceptable
          ? `Applied graceful degradation: ${mapping.description}`
          : `Degradation available but may not be suitable: ${mapping.description}`,
        recommendations,
        degradedFeatures: mapping.degradedFeatures,
        executionTimeMs: performance.now() - startTime,
        cacheable: true,
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Error applying graceful degradation: ${error instanceof Error ? error.message : String(error)}`,
        recommendations: [
          'Check degradation mapping configuration',
          'Verify platform compatibility for degradation strategy',
        ],
        executionTimeMs: performance.now() - startTime,
        errors: [error instanceof Error ? error : new Error(String(error))],
        cacheable: false,
      });
    }
  }

  /**
   * Finds the appropriate degradation mapping for the given capability and platform.
   */
  private getDegradationMapping(
    capabilityId: PlatformCapabilityId,
    platformType: PlatformType,
  ): DegradationMapping | undefined {
    return this.degradationMappings.find(
      mapping =>
        mapping.capabilityId === capabilityId &&
        (mapping.supportedPlatforms.length === 0 ||
          mapping.supportedPlatforms.includes(platformType)),
    );
  }

  /**
   * Generates detailed recommendations based on the degradation mapping.
   */
  private generateRecommendations(mapping: DegradationMapping): string[] {
    const recommendations: string[] = [];

    // Add basic degradation information
    recommendations.push(`Feature degradation: ${mapping.description}`);
    recommendations.push(`Impact level: ${mapping.impactLevel}`);

    // Add production safety warning if needed
    if (!mapping.productionSafe) {
      recommendations.push('⚠️ WARNING: This degradation may not be suitable for production use');
      recommendations.push('Consider implementing additional security measures or user warnings');
    }

    // Add specific feature limitations
    const features = Object.entries(mapping.degradedFeatures);
    if (features.length > 0) {
      recommendations.push('Degraded features:');
      features.forEach(([key, value]) => {
        recommendations.push(`  • ${key}: ${String(value)}`);
      });
    }

    // Add impact-specific recommendations
    switch (mapping.impactLevel) {
      case 'high':
        recommendations.push('Consider informing users about reduced functionality');
        recommendations.push('Implement additional error handling for degraded features');
        break;
      case 'medium':
        recommendations.push('Monitor user experience with degraded functionality');
        recommendations.push('Consider progressive enhancement when capability becomes available');
        break;
      case 'low':
        recommendations.push('Degradation should be transparent to most users');
        break;
    }

    return recommendations;
  }

  /**
   * Determines if the degradation is acceptable based on context and mapping.
   */
  private isDegradationAcceptable(
    mapping: DegradationMapping,
    context: FallbackApplicationContext,
  ): boolean {
    // Always reject if not production safe and we're in a production-like environment
    if (!mapping.productionSafe) {
      // Check if this might be a production environment
      let userAgent = '';
      if (typeof globalThis !== 'undefined' && 'navigator' in globalThis) {
        const nav = (globalThis as { navigator?: { userAgent?: string } }).navigator;
        userAgent = nav?.userAgent ?? '';
      }
      const isPotentiallyProduction = !userAgent.includes('dev') && !userAgent.includes('test');

      if (isPotentiallyProduction && !context.userPreferences?.allowUnsafeDegradation) {
        return false;
      }
    }

    // Check user preferences for impact tolerance
    const maxImpactLevel = (context.userPreferences?.maxDegradationImpact as string) || 'medium';
    const impactHierarchy = { low: 1, medium: 2, high: 3 };

    const mappingImpact = impactHierarchy[mapping.impactLevel];
    const maxAllowedImpact = impactHierarchy[maxImpactLevel as keyof typeof impactHierarchy] || 2;

    return mappingImpact <= maxAllowedImpact;
  }

  /**
   * Derives detection status from capability detection result.
   */
  private getDetectionStatus(detectionResult: CapabilityDetectionResult): DetectionStatus {
    // If capability is available, status is AVAILABLE
    if (detectionResult.available) {
      return DetectionStatus.AVAILABLE;
    }

    // If not available but permissions are required and not granted
    if (detectionResult.requiredPermissions.length > 0 && !detectionResult.permissionsGranted) {
      return DetectionStatus.PERMISSION_DENIED;
    }

    // If warnings indicate errors, treat as ERROR
    if (detectionResult.warnings?.some(warning => warning.toLowerCase().includes('error'))) {
      return DetectionStatus.ERROR;
    }

    // Default to UNAVAILABLE for other cases
    return DetectionStatus.UNAVAILABLE;
  }

  /**
   * Validates the strategy configuration and mappings.
   *
   * @returns Promise resolving to true if strategy is valid
   */
  validate(): Promise<boolean> {
    try {
      // Validate all degradation mappings
      for (const mapping of gracefulDegradationMappings) {
        if (!mapping.capabilityId || typeof mapping.capabilityId !== 'string') {
          return Promise.resolve(false);
        }

        if (!mapping.description || typeof mapping.description !== 'string') {
          return Promise.resolve(false);
        }

        if (!['low', 'medium', 'high'].includes(mapping.impactLevel)) {
          return Promise.resolve(false);
        }

        if (typeof mapping.productionSafe !== 'boolean') {
          return Promise.resolve(false);
        }

        if (!mapping.degradedFeatures || typeof mapping.degradedFeatures !== 'object') {
          return Promise.resolve(false);
        }
      }

      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }
}

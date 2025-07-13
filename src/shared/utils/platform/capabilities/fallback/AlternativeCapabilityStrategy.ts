import { PlatformType } from '../../../../constants/platform/PlatformType';
import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import type { FallbackApplicationContext } from './FallbackApplicationContext';
import type { FallbackApplicationResult } from './FallbackApplicationResult';
import type { FallbackPriority } from './FallbackPriority';
import type { FallbackStrategy } from './FallbackStrategy';

/**
 * Configuration for alternative capability mapping.
 * Defines equivalent capabilities that can substitute for unavailable ones.
 */
interface AlternativeMapping {
  /** The original capability that is unavailable */
  originalCapability: PlatformCapabilityId;

  /** Alternative capabilities that can provide similar functionality */
  alternatives: AlternativeCapabilityOption[];

  /** Platforms where these alternatives apply */
  supportedPlatforms: PlatformType[];

  /** Whether alternatives provide equivalent functionality */
  functionalEquivalence: 'full' | 'partial' | 'limited';

  /** Additional context about the alternatives */
  migrationNotes?: string;
}

/**
 * Configuration for an individual alternative capability option.
 */
interface AlternativeCapabilityOption {
  /** The alternative capability ID */
  capabilityId: PlatformCapabilityId;

  /** Human-readable name for this alternative */
  name: string;

  /** Description of how this alternative differs from the original */
  description: string;

  /** Confidence that this alternative will work (0-1) */
  confidence: number;

  /** Performance characteristics compared to original */
  performanceImpact: 'better' | 'similar' | 'worse';

  /** Security implications of using this alternative */
  securityImpact: 'better' | 'similar' | 'worse';

  /** Whether this alternative requires additional setup or configuration */
  setupRequired: boolean;

  /** Migration effort required to use this alternative */
  migrationEffort: 'minimal' | 'moderate' | 'significant';

  /** Platforms where this specific alternative is available */
  availablePlatforms: PlatformType[];
}

/**
 * Fallback strategy that suggests equivalent alternative capabilities when the requested one is unavailable.
 *
 * This strategy maintains a comprehensive mapping of capability alternatives and provides
 * intelligent recommendations based on platform context, performance characteristics,
 * and functional equivalence. It helps applications gracefully adapt to different
 * platform capabilities while maintaining similar functionality.
 *
 * Features:
 * - Comprehensive alternative capability mappings
 * - Platform-specific alternative recommendations
 * - Confidence scoring for alternative suggestions
 * - Performance and security impact assessment
 * - Migration effort estimation and guidance
 *
 * @example
 * ```typescript
 * const strategy = new AlternativeCapabilityStrategy();
 *
 * const context: FallbackApplicationContext = {
 *   capabilityId: 'storage.secure',
 *   platformType: PlatformType.WEB,
 *   detectionResult: { status: DetectionStatus.NOT_SUPPORTED },
 *   executionStartTime: performance.now()
 * };
 *
 * const result = await strategy.apply(context);
 * // Result suggests alternatives like 'storage.local' with encryption
 * ```
 */
export class AlternativeCapabilityStrategy implements FallbackStrategy {
  readonly id = 'alternative-capability';
  readonly name = 'Alternative Capability Strategy';
  readonly description =
    'Suggests equivalent alternative capabilities when the requested capability is unavailable';
  readonly priority: FallbackPriority = 70; // High priority for direct alternatives
  readonly supportedCapabilities: PlatformCapabilityId[] = []; // Supports all capabilities
  readonly supportedPlatforms: PlatformType[] = []; // Supports all platforms

  private readonly alternativeMappings: AlternativeMapping[] = [
    // Secure Storage alternatives
    {
      originalCapability: 'storage.secure' as PlatformCapabilityId,
      supportedPlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
      functionalEquivalence: 'partial',
      alternatives: [
        {
          capabilityId: 'storage.local' as PlatformCapabilityId,
          name: 'Local Storage with Encryption',
          description: 'Use localStorage with client-side encryption for sensitive data',
          confidence: 0.7,
          performanceImpact: 'worse',
          securityImpact: 'worse',
          setupRequired: true,
          migrationEffort: 'moderate',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
        },
        {
          capabilityId: 'storage.session' as PlatformCapabilityId,
          name: 'Session Storage',
          description: 'Use sessionStorage for temporary secure data (cleared on browser close)',
          confidence: 0.5,
          performanceImpact: 'similar',
          securityImpact: 'worse',
          setupRequired: false,
          migrationEffort: 'minimal',
          availablePlatforms: [PlatformType.WEB],
        },
        {
          capabilityId: 'storage.indexed-db' as PlatformCapabilityId,
          name: 'IndexedDB with Encryption',
          description: 'Use IndexedDB with client-side encryption for larger secure datasets',
          confidence: 0.8,
          performanceImpact: 'better',
          securityImpact: 'worse',
          setupRequired: true,
          migrationEffort: 'significant',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
        },
      ],
      migrationNotes:
        'Consider implementing client-side encryption using Web Crypto API for enhanced security',
    },

    // File System Read alternatives
    {
      originalCapability: 'filesystem.read' as PlatformCapabilityId,
      supportedPlatforms: [PlatformType.WEB],
      functionalEquivalence: 'limited',
      alternatives: [
        {
          capabilityId: 'ui.file-input' as PlatformCapabilityId,
          name: 'HTML File Input',
          description: 'Use HTML file input element for user-initiated file selection',
          confidence: 0.9,
          performanceImpact: 'worse',
          securityImpact: 'better',
          setupRequired: false,
          migrationEffort: 'minimal',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
        },
        {
          capabilityId: 'ui.drag-drop' as PlatformCapabilityId,
          name: 'Drag and Drop API',
          description: 'Use drag and drop API for file uploads and reading',
          confidence: 0.8,
          performanceImpact: 'similar',
          securityImpact: 'better',
          setupRequired: true,
          migrationEffort: 'moderate',
          availablePlatforms: [PlatformType.WEB],
        },
      ],
      migrationNotes: 'File system access in web requires user interaction for security reasons',
    },

    // File System Write alternatives
    {
      originalCapability: 'filesystem.write' as PlatformCapabilityId,
      supportedPlatforms: [PlatformType.WEB],
      functionalEquivalence: 'limited',
      alternatives: [
        {
          capabilityId: 'ui.download-link' as PlatformCapabilityId,
          name: 'Download Link',
          description: 'Generate download links for file saving via browser downloads',
          confidence: 0.9,
          performanceImpact: 'worse',
          securityImpact: 'similar',
          setupRequired: false,
          migrationEffort: 'minimal',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
        },
        {
          capabilityId: 'storage.blob' as PlatformCapabilityId,
          name: 'Blob URLs',
          description: 'Create blob URLs for temporary file access and download',
          confidence: 0.8,
          performanceImpact: 'similar',
          securityImpact: 'similar',
          setupRequired: true,
          migrationEffort: 'moderate',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
        },
      ],
      migrationNotes: 'Web file writing requires user interaction for downloads',
    },

    // Network Offline alternatives
    {
      originalCapability: 'networking.offline' as PlatformCapabilityId,
      supportedPlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
      functionalEquivalence: 'partial',
      alternatives: [
        {
          capabilityId: 'storage.cache-api' as PlatformCapabilityId,
          name: 'Cache API',
          description: 'Use Cache API for manual offline data management',
          confidence: 0.8,
          performanceImpact: 'worse',
          securityImpact: 'similar',
          setupRequired: true,
          migrationEffort: 'significant',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
        },
        {
          capabilityId: 'storage.local' as PlatformCapabilityId,
          name: 'Local Storage Caching',
          description: 'Use localStorage for simple offline data caching',
          confidence: 0.6,
          performanceImpact: 'worse',
          securityImpact: 'similar',
          setupRequired: true,
          migrationEffort: 'moderate',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
        },
      ],
      migrationNotes: 'Manual cache management required without service worker support',
    },

    // System Notifications alternatives
    {
      originalCapability: 'system.notifications' as PlatformCapabilityId,
      supportedPlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
      functionalEquivalence: 'partial',
      alternatives: [
        {
          capabilityId: 'ui.toast' as PlatformCapabilityId,
          name: 'In-App Toast Notifications',
          description: 'Use in-app toast/banner notifications instead of system notifications',
          confidence: 0.9,
          performanceImpact: 'better',
          securityImpact: 'similar',
          setupRequired: false,
          migrationEffort: 'minimal',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR, PlatformType.ELECTRON],
        },
        {
          capabilityId: 'ui.modal' as PlatformCapabilityId,
          name: 'Modal Dialogs',
          description: 'Use modal dialogs for important notifications requiring user attention',
          confidence: 0.7,
          performanceImpact: 'similar',
          securityImpact: 'similar',
          setupRequired: false,
          migrationEffort: 'minimal',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR, PlatformType.ELECTRON],
        },
      ],
      migrationNotes:
        'In-app notifications are less intrusive but may be missed when app is not active',
    },

    // Background Tasks alternatives
    {
      originalCapability: 'performance.background-tasks' as PlatformCapabilityId,
      supportedPlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
      functionalEquivalence: 'limited',
      alternatives: [
        {
          capabilityId: 'performance.web-workers' as PlatformCapabilityId,
          name: 'Web Workers',
          description: 'Use Web Workers for background processing while app is active',
          confidence: 0.8,
          performanceImpact: 'similar',
          securityImpact: 'similar',
          setupRequired: true,
          migrationEffort: 'moderate',
          availablePlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
        },
        {
          capabilityId: 'performance.request-idle' as PlatformCapabilityId,
          name: 'RequestIdleCallback',
          description: 'Use requestIdleCallback for low-priority background tasks',
          confidence: 0.6,
          performanceImpact: 'worse',
          securityImpact: 'similar',
          setupRequired: true,
          migrationEffort: 'moderate',
          availablePlatforms: [PlatformType.WEB],
        },
      ],
      migrationNotes: 'Background processing limited to when application is active and visible',
    },
  ];

  /**
   * Determines if alternative capabilities can be suggested for the given context.
   *
   * @param context - The fallback application context
   * @returns true if alternatives are available, false otherwise
   */
  canApply(context: FallbackApplicationContext): boolean {
    // Can suggest alternatives when capability is not available or has permission issues
    if (context.detectionResult.available && context.detectionResult.permissionsGranted) {
      return false;
    }

    // Check if we have alternative mappings for this capability
    return this.getAlternativeMapping(context.capabilityId, context.platformType) !== undefined;
  }

  /**
   * Suggests alternative capabilities for the unavailable capability.
   *
   * @param context - The fallback application context
   * @returns Promise resolving to the alternative capability suggestions
   */
  apply(context: FallbackApplicationContext): Promise<FallbackApplicationResult> {
    const startTime = performance.now();

    try {
      const mapping = this.getAlternativeMapping(context.capabilityId, context.platformType);

      if (!mapping) {
        return Promise.resolve({
          success: false,
          message: `No alternative capabilities available for '${context.capabilityId}' on ${context.platformType}`,
          recommendations: [
            'Consider implementing a custom capability detector',
            'Check if the capability might be available under a different name',
            'Review platform-specific documentation for equivalent functionality',
          ],
          executionTimeMs: performance.now() - startTime,
          cacheable: true,
        });
      }

      // Filter alternatives by platform availability
      const availableAlternatives = mapping.alternatives.filter(alt =>
        alt.availablePlatforms.includes(context.platformType),
      );

      if (availableAlternatives.length === 0) {
        return Promise.resolve({
          success: false,
          message: `No platform-compatible alternatives found for '${context.capabilityId}' on ${context.platformType}`,
          recommendations: [
            `Alternative capabilities exist but are not available on ${context.platformType}`,
            'Consider using a different platform or implementing platform-specific solutions',
          ],
          executionTimeMs: performance.now() - startTime,
          cacheable: true,
        });
      }

      // Sort alternatives by confidence and performance
      const sortedAlternatives = this.sortAlternativesByPreference(availableAlternatives);

      // Generate recommendations and extract alternative capability IDs
      const recommendations = this.generateAlternativeRecommendations(mapping, sortedAlternatives);
      const alternativeCapabilities = sortedAlternatives.map(alt => alt.capabilityId);

      return Promise.resolve({
        success: true,
        message: `Found ${sortedAlternatives.length} alternative capabilities for '${context.capabilityId}'`,
        recommendations,
        alternativeCapabilities,
        executionTimeMs: performance.now() - startTime,
        cacheable: true,
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: `Error suggesting alternative capabilities: ${error instanceof Error ? error.message : String(error)}`,
        recommendations: [
          'Check alternative capability mapping configuration',
          'Verify platform compatibility for alternative suggestions',
        ],
        executionTimeMs: performance.now() - startTime,
        errors: [error instanceof Error ? error : new Error(String(error))],
        cacheable: false,
      });
    }
  }

  /**
   * Finds the appropriate alternative mapping for the given capability and platform.
   */
  private getAlternativeMapping(
    capabilityId: PlatformCapabilityId,
    platformType: PlatformType,
  ): AlternativeMapping | undefined {
    return this.alternativeMappings.find(
      mapping =>
        mapping.originalCapability === capabilityId &&
        (mapping.supportedPlatforms.length === 0 ||
          mapping.supportedPlatforms.includes(platformType)),
    );
  }

  /**
   * Sorts alternatives by preference based on confidence, performance, and migration effort.
   */
  private sortAlternativesByPreference(
    alternatives: AlternativeCapabilityOption[],
  ): AlternativeCapabilityOption[] {
    return alternatives.sort((a, b) => {
      // Primary sort: confidence (higher is better)
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }

      // Secondary sort: migration effort (lower is better)
      const effortOrder = { minimal: 1, moderate: 2, significant: 3 };
      const aEffort = effortOrder[a.migrationEffort];
      const bEffort = effortOrder[b.migrationEffort];

      if (aEffort !== bEffort) {
        return aEffort - bEffort;
      }

      // Tertiary sort: setup required (false is better)
      return Number(a.setupRequired) - Number(b.setupRequired);
    });
  }

  /**
   * Generates detailed recommendations for alternative capabilities.
   */
  private generateAlternativeRecommendations(
    mapping: AlternativeMapping,
    alternatives: AlternativeCapabilityOption[],
  ): string[] {
    const recommendations: string[] = [];

    // Add general information about alternatives
    recommendations.push(`Alternative capabilities for '${mapping.originalCapability}':`);
    recommendations.push(`Functional equivalence: ${mapping.functionalEquivalence}`);

    if (mapping.migrationNotes) {
      recommendations.push(`Migration notes: ${mapping.migrationNotes}`);
    }

    // Add information about each alternative
    alternatives.forEach((alt, index) => {
      const priority = index === 0 ? 'RECOMMENDED' : `Alternative ${index + 1}`;
      recommendations.push(`\n${priority}: ${alt.name}`);
      recommendations.push(`  • Description: ${alt.description}`);
      recommendations.push(`  • Confidence: ${Math.round(alt.confidence * 100)}%`);
      recommendations.push(`  • Performance impact: ${alt.performanceImpact}`);
      recommendations.push(`  • Security impact: ${alt.securityImpact}`);
      recommendations.push(`  • Migration effort: ${alt.migrationEffort}`);

      if (alt.setupRequired) {
        recommendations.push(`  • ⚠️ Requires additional setup or configuration`);
      }
    });

    // Add usage guidance
    recommendations.push('\nUsage guidance:');
    recommendations.push('• Test alternatives thoroughly in your specific use case');
    recommendations.push('• Consider implementing multiple alternatives for better compatibility');
    recommendations.push('• Monitor performance and security implications of chosen alternatives');

    return recommendations;
  }

  /**
   * Validates the strategy configuration and alternative mappings.
   *
   * @returns Promise resolving to true if strategy is valid
   */
  validate(): Promise<boolean> {
    try {
      // Validate all alternative mappings
      for (const mapping of this.alternativeMappings) {
        if (!mapping.originalCapability || typeof mapping.originalCapability !== 'string') {
          return Promise.resolve(false);
        }

        if (!Array.isArray(mapping.alternatives) || mapping.alternatives.length === 0) {
          return Promise.resolve(false);
        }

        if (!['full', 'partial', 'limited'].includes(mapping.functionalEquivalence)) {
          return Promise.resolve(false);
        }

        // Validate each alternative
        for (const alt of mapping.alternatives) {
          if (!alt.capabilityId || typeof alt.capabilityId !== 'string') {
            return Promise.resolve(false);
          }

          if (!alt.name || typeof alt.name !== 'string') {
            return Promise.resolve(false);
          }

          if (typeof alt.confidence !== 'number' || alt.confidence < 0 || alt.confidence > 1) {
            return Promise.resolve(false);
          }

          if (!['better', 'similar', 'worse'].includes(alt.performanceImpact)) {
            return Promise.resolve(false);
          }

          if (!['better', 'similar', 'worse'].includes(alt.securityImpact)) {
            return Promise.resolve(false);
          }

          if (!['minimal', 'moderate', 'significant'].includes(alt.migrationEffort)) {
            return Promise.resolve(false);
          }

          if (!Array.isArray(alt.availablePlatforms)) {
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

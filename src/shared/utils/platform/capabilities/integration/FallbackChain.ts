import type { PlatformCapabilityId } from '../../../../types/platform';

/**
 * Represents a fallback chain for a failed dependency
 *
 * Defines an alternative dependency that can be used when the original
 * dependency fails, including compatibility analysis, implementation
 * requirements, and performance implications.
 */
export interface FallbackChain {
  /** The original dependency that failed */
  originalDependency: PlatformCapabilityId;

  /** The fallback dependency to use instead */
  fallbackDependency: PlatformCapabilityId;

  /** Type of fallback relationship */
  fallbackType: 'direct-replacement' | 'functional-equivalent' | 'reduced-functionality';

  /** How compatible the fallback is with the original (0-1) */
  compatibilityScore: number;

  /** Impact on functionality when using this fallback */
  functionalityImpact: 'none' | 'minor' | 'moderate' | 'major';

  /** Changes needed to implement this fallback */
  implementationChanges: string[];

  /** Performance implications of using this fallback */
  performanceImplications: string;

  /** Platform support for the fallback dependency */
  platformSupport: Record<string, boolean>;

  /** Additional metadata about this fallback chain (optional) */
  metadata?: Record<string, unknown>;
}

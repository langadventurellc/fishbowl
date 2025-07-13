import { PermissionLevel } from '../../../../constants/platform/PermissionLevel';

/**
 * Represents a fallback strategy for permission-denied scenarios
 *
 * Defines an approach for handling capability failures due to insufficient
 * permissions, including graceful degradation, alternative implementations,
 * and user experience considerations.
 */
export interface PermissionFallbackStrategy {
  /** Name of this fallback strategy */
  name: string;

  /** Description of what this strategy does */
  description: string;

  /** Permission level required for this strategy */
  permissionRequirement: PermissionLevel;

  /** How much of the original functionality is retained (0-1) */
  functionalityRetained: number;

  /** Complexity of implementing this strategy */
  implementationComplexity: 'low' | 'moderate' | 'high';

  /** Impact on user experience */
  userExperienceImpact: 'minimal' | 'moderate' | 'significant';

  /** Security implications of using this strategy */
  securityImplications: string;

  /** Platform compatibility for this strategy */
  platformCompatibility: Record<string, boolean>;

  /** Step-by-step fallback implementation chain */
  fallbackChain: string[];

  /** Additional metadata about this strategy (optional) */
  metadata?: Record<string, unknown>;
}

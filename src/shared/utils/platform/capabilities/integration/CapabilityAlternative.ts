import type { PlatformCapabilityId } from '../../../../types/platform';

/**
 * Represents an alternative capability that can provide similar functionality
 *
 * Defines a substitute capability that can be used when the original capability
 * is not available, including compatibility analysis, migration path, and
 * platform support information.
 */
export interface CapabilityAlternative {
  /** ID of the alternative capability */
  capabilityId: PlatformCapabilityId;

  /** Human-readable description of this alternative */
  description: string;

  /** How compatible this alternative is with the original (0-1) */
  compatibilityScore: number;

  /** What percentage of original functionality is covered (0-1) */
  functionalityCoverage: number;

  /** Complexity of implementing this alternative */
  implementationComplexity: 'low' | 'moderate' | 'high';

  /** How this alternative compares in performance to the original */
  performanceComparison: string;

  /** Steps needed to migrate to this alternative */
  migrationPath: string[];

  /** Known limitations of this alternative */
  limitations: string[];

  /** Benefits of using this alternative */
  benefits: string[];

  /** Platform support matrix for this alternative */
  platformSupport: {
    /** Whether supported on Electron */
    ELECTRON: boolean;

    /** Whether supported on Web */
    WEB: boolean;

    /** Whether supported on Capacitor */
    CAPACITOR: boolean;
  };

  /** Additional metadata about this alternative (optional) */
  metadata?: Record<string, unknown>;
}

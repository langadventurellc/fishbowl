import type { PlatformCapability, PlatformCapabilityId } from '../../../../types/platform';

/**
 * Represents a structured dependency chain for a capability
 *
 * Defines the complete dependency structure including direct dependencies,
 * transitive dependencies, and dependency level analysis for comprehensive
 * dependency management and validation.
 */
export interface CapabilityDependencyChain {
  /** The root capability that has dependencies */
  rootCapability: PlatformCapability;

  /** Direct dependencies of the root capability */
  directDependencies: Array<{
    /** The dependency capability */
    capability: PlatformCapability;

    /** Type of dependency relationship */
    dependencyType: 'required' | 'optional' | 'conditional';

    /** Whether this dependency is required for functionality */
    required: boolean;

    /** Whether this dependency is platform-specific */
    platformSpecific: boolean;
  }>;

  /** Transitive dependencies (dependencies of dependencies) */
  transitiveDependencies: PlatformCapabilityId[];

  /** Dependency levels in the chain (0 = root, 1 = direct, 2+ = transitive) */
  dependencyLevels: Record<PlatformCapabilityId, number>;

  /** Additional metadata about the dependency chain (optional) */
  metadata?: Record<string, unknown>;
}

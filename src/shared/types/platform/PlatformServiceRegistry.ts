/**
 * Platform Service Registry Interface
 *
 * Registry that manages all platform-specific services and their creation.
 * Provides lookup and management capabilities for the ServiceFactory.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { PlatformServiceDescriptor } from './PlatformServiceDescriptor';
import { PlatformServiceCreationResult } from './PlatformServiceCreationResult';

/**
 * Registry for managing platform-specific services
 *
 * This interface defines a comprehensive service registry that manages the
 * lifecycle, dependencies, and availability of platform-specific services.
 * It provides the foundation for the ServiceFactory's platform-aware
 * service instantiation and dependency management.
 *
 * @example
 * ```typescript
 * const registry: PlatformServiceRegistry = {
 *   currentPlatform: PlatformType.ELECTRON,
 *   registeredServices: new Map([
 *     ['fileService', electronFileServiceDescriptor],
 *     ['networkService', commonNetworkServiceDescriptor]
 *   ]),
 *   availableServices: ['fileService', 'networkService'],
 *   unavailableServices: [],
 *   // ... other properties
 * };
 * ```
 */
export interface PlatformServiceRegistry {
  /**
   * Current platform this registry is configured for.
   * Determines which services are available and how they should be instantiated.
   */
  currentPlatform: PlatformType;
  /**
   * All registered service descriptors mapped by service name.
   * Contains the complete catalog of services that can be instantiated,
   * including their platform requirements and creation strategies.
   */
  registeredServices: Map<string, PlatformServiceDescriptor>;
  /**
   * Services that are available on the current platform.
   * Updated automatically when platform detection completes or changes.
   * Used for quick availability checks without descriptor lookup.
   */
  availableServices: string[];
  /**
   * Services that are unavailable on the current platform.
   * Includes services that failed capability checks or are not supported.
   * Useful for diagnostic reporting and fallback strategy planning.
   */
  unavailableServices: string[];
  /**
   * Currently instantiated service instances mapped by service name.
   * Manages service lifecycle and prevents duplicate instantiation.
   * Services are removed when explicitly destroyed or during cleanup.
   */
  activeInstances: Map<string, unknown>;
  /**
   * Service creation history with detailed creation results.
   * Tracks successful and failed creation attempts for debugging,
   * performance analysis, and service reliability monitoring.
   * Includes timing, error details, and dependency resolution info.
   */
  creationHistory: PlatformServiceCreationResult[];
  /** Whether the registry has been initialized */
  initialized: boolean;
  /** Last time the registry was updated */
  lastUpdated: number;
  /**
   * Service dependency graph mapping each service to its dependencies.
   * Used for dependency resolution order, circular dependency detection,
   * and cascading service initialization. Dependencies must be created
   * before dependent services during initialization.
   *
   * @example
   * ```typescript
   * // fileService depends on both configService and loggerService
   * dependencyGraph.set('fileService', ['configService', 'loggerService']);
   * ```
   */
  dependencyGraph: Map<string, string[]>;
  /**
   * Failed service creation attempts mapped to their error messages.
   * Prevents repeated creation attempts for persistently failing services
   * and provides diagnostic information for troubleshooting service issues.
   */
  failedCreations: Map<string, string>;
  /**
   * Registry configuration containing platform-specific settings.
   * Includes service creation timeouts, retry policies, cache settings,
   * and other registry behavior customizations. Configuration is merged
   * from default settings and platform-specific overrides.
   */
  configuration: Record<string, unknown>;
}

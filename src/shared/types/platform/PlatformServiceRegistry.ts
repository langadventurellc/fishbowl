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
 */
export interface PlatformServiceRegistry {
  /** Current platform this registry is configured for */
  currentPlatform: PlatformType;
  /** All registered service descriptors */
  registeredServices: Map<string, PlatformServiceDescriptor>;
  /** Services that are available on current platform */
  availableServices: string[];
  /** Services that are unavailable on current platform */
  unavailableServices: string[];
  /** Currently instantiated service instances */
  activeInstances: Map<string, unknown>;
  /** Service creation history */
  creationHistory: PlatformServiceCreationResult[];
  /** Whether the registry has been initialized */
  initialized: boolean;
  /** Last time the registry was updated */
  lastUpdated: number;
  /** Service dependency graph */
  dependencyGraph: Map<string, string[]>;
  /** Failed service creation attempts */
  failedCreations: Map<string, string>;
  /** Registry configuration */
  configuration: Record<string, unknown>;
}

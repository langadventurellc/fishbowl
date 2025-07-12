/**
 * Platform Service Factory Configuration Interface
 *
 * Configuration for platform-aware service creation in the ServiceFactory.
 * Defines how services should be instantiated based on platform capabilities.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { PlatformServiceDescriptor } from './PlatformServiceDescriptor';

/**
 * Configuration for platform-aware service factory
 */
export interface PlatformServiceFactoryConfig {
  /** Target platform for service creation */
  targetPlatform: PlatformType;
  /** Available service descriptors */
  availableServices: PlatformServiceDescriptor[];
  /** Whether to enable strict platform checking */
  strictPlatformChecking: boolean;
  /** Whether to allow fallback services */
  allowFallbacks: boolean;
  /** Maximum time to wait for service initialization in milliseconds */
  initializationTimeoutMs: number;
  /** Whether to cache service instances */
  cacheInstances: boolean;
  /** Service creation strategy */
  creationStrategy: 'eager' | 'lazy' | 'on-demand';
  /** Error handling strategy for service creation failures */
  errorHandling: 'strict' | 'graceful' | 'silent';
  /** Whether to validate service capabilities before creation */
  validateCapabilities: boolean;
  /** Custom service resolution order */
  resolutionOrder?: string[];
}

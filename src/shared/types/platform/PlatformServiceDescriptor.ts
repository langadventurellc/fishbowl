/**
 * Platform Service Descriptor Interface
 *
 * Describes a service that can be created by the ServiceFactory based on platform.
 * Defines platform requirements and service creation metadata.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Descriptor for a platform-specific service
 */
export interface PlatformServiceDescriptor {
  /** Unique service identifier */
  serviceId: string;
  /** Human-readable service name */
  serviceName: string;
  /** Description of service functionality */
  description: string;
  /** Platforms that support this service */
  supportedPlatforms: PlatformType[];
  /** Required capabilities for this service */
  requiredCapabilities: string[];
  /** Service implementation class name or factory function name */
  implementationName: string;
  /** Service initialization priority (lower = higher priority) */
  priority: number;
  /** Whether this service is critical for platform functionality */
  critical: boolean;
  /** Service dependencies that must be available first */
  dependencies: string[];
  /** Configuration options for service creation */
  configurationOptions?: Record<string, unknown>;
  /** Whether this service can be lazy-loaded */
  lazyLoad: boolean;
  /** Fallback service ID if this service is unavailable */
  fallbackService?: string;
}

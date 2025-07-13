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
 *
 * This configuration controls how the ServiceFactory creates, manages,
 * and validates platform-specific services. Different configurations
 * can be used for different environments (development, testing, production)
 * or different application contexts (startup, runtime, shutdown).
 *
 * @example
 * ```typescript
 * // Production configuration - strict and reliable
 * const productionConfig: PlatformServiceFactoryConfig = {
 *   targetPlatform: PlatformType.ELECTRON,
 *   availableServices: [fileServiceDescriptor, networkServiceDescriptor],
 *   strictPlatformChecking: true,
 *   allowFallbacks: false,
 *   initializationTimeoutMs: 10000,
 *   cacheInstances: true,
 *   creationStrategy: 'lazy',
 *   errorHandling: 'strict',
 *   validateCapabilities: true
 * };
 *
 * // Development configuration - fast and flexible
 * const devConfig: PlatformServiceFactoryConfig = {
 *   targetPlatform: PlatformType.WEB,
 *   availableServices: [mockServiceDescriptor],
 *   strictPlatformChecking: false,
 *   allowFallbacks: true,
 *   initializationTimeoutMs: 5000,
 *   cacheInstances: false,
 *   creationStrategy: 'eager',
 *   errorHandling: 'graceful',
 *   validateCapabilities: false
 * };
 * ```
 */
export interface PlatformServiceFactoryConfig {
  /** Target platform for service creation */
  targetPlatform: PlatformType;
  /** Available service descriptors */
  availableServices: PlatformServiceDescriptor[];
  /** Whether to enable strict platform checking */
  strictPlatformChecking: boolean;
  /**
   * Whether to allow fallback services when primary services fail.
   *
   * When enabled, the factory will attempt to create fallback services
   * if the primary service creation fails. Fallbacks are typically:
   * - Mock implementations for development
   * - Simplified implementations with reduced functionality
   * - Cross-platform implementations that work everywhere
   *
   * **Considerations:**
   * - Production: Usually false (ensure full functionality)
   * - Development: Usually true (keep development flow smooth)
   * - Testing: Usually true (use mock services)
   */
  allowFallbacks: boolean;
  /** Maximum time to wait for service initialization in milliseconds */
  initializationTimeoutMs: number;
  /** Whether to cache service instances */
  cacheInstances: boolean;
  /**
   * Service creation strategy determining when services are instantiated.
   *
   * **Strategy Details:**
   * - `eager`: Create all services immediately during factory initialization.
   *   - Pros: Fastest runtime access, early error detection
   *   - Cons: Slower startup, higher memory usage
   *   - Best for: Critical services, production environments
   *
   * - `lazy`: Create services when first accessed, then cache.
   *   - Pros: Balanced startup vs runtime performance
   *   - Cons: Slight delay on first access
   *   - Best for: Most use cases, balanced approach
   *
   * - `on-demand`: Create services fresh for each request.
   *   - Pros: Lowest memory usage, always fresh instances
   *   - Cons: Slower access, higher CPU usage
   *   - Best for: Testing, stateless services
   */
  creationStrategy: 'eager' | 'lazy' | 'on-demand';
  /**
   * Error handling strategy for service creation failures.
   *
   * **Handling Modes:**
   * - `strict`: Throw errors immediately, halt execution.
   *   - Use for: Production systems where service availability is critical
   *   - Behavior: Fast failure, clear error reporting
   *   - Risk: Application may crash if service creation fails
   *
   * - `graceful`: Log errors, attempt fallbacks, continue execution.
   *   - Use for: Resilient systems with fallback capabilities
   *   - Behavior: Error logging, fallback service usage, degraded functionality
   *   - Risk: Silent degradation may go unnoticed
   *
   * - `silent`: Suppress errors, return null/undefined for failed services.
   *   - Use for: Optional services, development environments
   *   - Behavior: No error output, null checks required in consuming code
   *   - Risk: Difficult debugging, unexpected null references
   */
  errorHandling: 'strict' | 'graceful' | 'silent';
  /**
   * Whether to validate service capabilities before creation.
   *
   * When enabled, the factory checks if all required platform capabilities
   * are available before attempting service creation. This prevents:
   * - Runtime errors from missing platform APIs
   * - Services that would fail during usage
   * - Resource waste on non-functional services
   *
   * **Performance Impact:**
   * - Adds capability detection time to service creation
   * - Results are cached, so subsequent creations are faster
   * - Overall improves reliability at small performance cost
   *
   * **Recommended Settings:**
   * - Production: true (reliability over speed)
   * - Development: false (speed over validation)
   * - Testing: false (use mock capabilities)
   */
  validateCapabilities: boolean;
  /**
   * Custom service resolution order for dependency injection.
   *
   * When specified, services will be created in this exact order,
   * overriding the default dependency-based resolution. Useful for:
   * - Ensuring critical services are created first
   * - Working around complex dependency cycles
   * - Optimizing startup performance
   *
   * @example
   * ```typescript
   * // Ensure logger is created first, then config, then everything else
   * resolutionOrder: ['logger', 'config', 'database', 'fileService']
   * ```
   *
   * **Note:** Services not listed will be created after listed services
   * in dependency order. Invalid service names are ignored.
   */
  resolutionOrder?: string[];
}

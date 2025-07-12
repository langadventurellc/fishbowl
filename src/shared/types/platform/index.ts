/**
 * Platform Types Barrel Export
 *
 * Re-exports all platform-related TypeScript interfaces and types.
 * Provides centralized access to platform detection type definitions.
 */

// Platform Detection Result Types
export type { PlatformDetectionResult } from './PlatformDetectionResult';
export type { PlatformDetectionContext } from './PlatformDetectionContext';
export type { PlatformMethodResult } from './PlatformMethodResult';
export type { PlatformDetectionSummary } from './PlatformDetectionSummary';

// Type Guard Function Signatures
export type { PlatformTypeGuard } from './PlatformTypeGuard';
export type { ElectronTypeGuard } from './ElectronTypeGuard';
export type { CapacitorTypeGuard } from './CapacitorTypeGuard';
export type { WebTypeGuard } from './WebTypeGuard';
export type { PlatformTypeGuards } from './PlatformTypeGuards';

// React Hook Integration Types
export type { UsePlatformState } from './UsePlatformState';
export type { UsePlatformActions } from './UsePlatformActions';
export type { UsePlatformReturn } from './UsePlatformReturn';
export type { UsePlatformCapabilitiesState } from './UsePlatformCapabilitiesState';
export type { UsePlatformCapabilitiesActions } from './UsePlatformCapabilitiesActions';
export type { UsePlatformCapabilitiesReturn } from './UsePlatformCapabilitiesReturn';

// Capability Detection Types
export type { PlatformCapability } from './PlatformCapability';
export type { PlatformCapabilities } from './PlatformCapabilities';
export type { CapabilityDetectionResult } from './CapabilityDetectionResult';
export type { PlatformCapabilityAssessment } from './PlatformCapabilityAssessment';

// Error Handling Types
export { PlatformErrorType } from './PlatformErrorType';
export type { PlatformError } from './PlatformError';
export type { PlatformErrorContext } from './PlatformErrorContext';
export type { PlatformErrorResult } from './PlatformErrorResult';

// Performance Monitoring Types
export type { PlatformPerformanceMetrics } from './PlatformPerformanceMetrics';
export type { PlatformPerformanceConfig } from './PlatformPerformanceConfig';
export type { PlatformPerformanceBenchmark } from './PlatformPerformanceBenchmark';

// ServiceFactory Integration Types
export type { PlatformServiceDescriptor } from './PlatformServiceDescriptor';
export type { PlatformServiceFactoryConfig } from './PlatformServiceFactoryConfig';
export type { PlatformServiceCreationResult } from './PlatformServiceCreationResult';
export type { PlatformServiceRegistry } from './PlatformServiceRegistry';

// Import existing platform utilities for type compatibility
export type { PlatformInfo } from '../../utils/platform/PlatformInfo';
export type { PlatformCacheConfig } from '../../utils/platform/PlatformCacheConfig';
export type { PlatformCacheEntry } from '../../utils/platform/PlatformCacheEntry';

// Import platform constants for type definitions
export { PlatformType } from '../../constants/platform/PlatformType';
export { OperatingSystem } from '../../constants/platform/OperatingSystem';
export { RuntimeEnvironment } from '../../constants/platform/RuntimeEnvironment';

// Platform detection and validation schemas
export * from '../validation/platformSchema';

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

// Type Guard Environment Types
export type { ElectronEnvironment } from './ElectronEnvironment';
export type { NonElectronEnvironment } from './NonElectronEnvironment';
export type { RuntimeEnvironment as PlatformRuntimeEnvironment } from './RuntimeEnvironment';
export type { CapacitorEnvironment } from './CapacitorEnvironment';
export type { NonCapacitorEnvironment } from './NonCapacitorEnvironment';
export type { CapacitorRuntimeEnvironment } from './CapacitorRuntimeEnvironment';
export type { WebEnvironment } from './WebEnvironment';
export type { NonWebEnvironment } from './NonWebEnvironment';
export type { WebRuntimeEnvironment } from './WebRuntimeEnvironment';
export type { UnknownEnvironment } from './UnknownEnvironment';
export type { AllPlatformEnvironment } from './AllPlatformEnvironment';
export type { PlatformEnvironmentMap } from './PlatformEnvironmentMap';
export type { KnownPlatformType } from './KnownPlatformType';
export type { PlatformContextType } from './PlatformContextType';

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
export type { EnhancedCapabilityDetectionResult } from './EnhancedCapabilityDetectionResult';
export type { PlatformCapabilityAssessment } from './PlatformCapabilityAssessment';
export { ValidationStatus } from './ValidationStatus';
export type { FallbackApplicationResult } from './FallbackApplicationResult';

// Platform Capability Utility Types
export type { PlatformCapabilityId } from './PlatformCapabilityId';
export type { CapabilityCategoryMap } from './CapabilityCategoryMap';
export type { CategoryCapabilityId } from './CategoryCapabilityId';
export type { DetectionResultMap } from './DetectionResultMap';
export type { TypedDetectionResult } from './TypedDetectionResult';
export type { TypedCapabilityState } from './TypedCapabilityState';
export type { CapabilityPermissionRequirement } from './CapabilityPermissionRequirement';
export type { PlatformCapabilityDetectionConfig } from './PlatformCapabilityDetectionConfig';

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
export { CapabilityCategory } from '../../constants/platform/CapabilityCategory';
export { DetectionStatus } from '../../constants/platform/DetectionStatus';
export { OperatingSystem } from '../../constants/platform/OperatingSystem';
export { PermissionLevel } from '../../constants/platform/PermissionLevel';
export { PlatformType } from '../../constants/platform/PlatformType';
export { RuntimeEnvironment } from '../../constants/platform/RuntimeEnvironment';

// Platform Conditional Utility Types
export type { ConditionalOnPlatform } from './conditional/ConditionalOnPlatform';
export type { ExcludeOnPlatform } from './conditional/ExcludeOnPlatform';
export type { PlatformSpecificConfig } from './conditional/PlatformSpecificConfig';
export type { CapabilityConditional } from './conditional/CapabilityConditional';
export type { PlatformApiSurface } from './conditional/PlatformApiSurface';
export type { PlatformFallback } from './conditional/PlatformFallback';
export type { RequirePlatform } from './conditional/RequirePlatform';
export type { PlatformUnion } from './conditional/PlatformUnion';
export type { CapabilityAwareService } from './conditional/CapabilityAwareService';
export type { PlatformCompatible } from './conditional/PlatformCompatible';

// Platform detection and validation schemas
export * from '../validation/platformSchema';

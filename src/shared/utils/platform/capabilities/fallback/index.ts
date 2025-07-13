// Core Fallback System
export { DEFAULT_FALLBACK_EXECUTOR_CONFIG } from './DEFAULT_FALLBACK_EXECUTOR_CONFIG';
export { FallbackExecutor } from './FallbackExecutor';

// Strategy Registry
export { DEFAULT_FALLBACK_STRATEGY_REGISTRY_CONFIG } from './DEFAULT_FALLBACK_STRATEGY_REGISTRY_CONFIG';
export { FallbackStrategyRegistry } from './FallbackStrategyRegistry';

// Concrete Strategy Implementations
export { AlternativeCapabilityStrategy } from './AlternativeCapabilityStrategy';
export { CapabilityCompositionStrategy } from './CapabilityCompositionStrategy';
export { GracefulDegradationStrategy } from './GracefulDegradationStrategy';

// Enums
export { FallbackPriority } from './FallbackPriority';

// Mapping Configuration Data
export { gracefulDegradationMappings } from './gracefulDegradationMappingsData';
export { capabilityCompositionMappings } from './capabilityCompositionMappingsData';

// Mapping Configuration Types
export type { DegradationMapping } from './DegradationMapping';
export type { CompositionMapping } from './CompositionMapping';
export type { ComponentCapability } from './ComponentCapability';

// Type Exports
export type { FallbackApplicationContext } from './FallbackApplicationContext';
export type { FallbackApplicationResult } from './FallbackApplicationResult';
export type { FallbackExecutionMetrics } from './FallbackExecutionMetrics';
export type { FallbackExecutionResult } from './FallbackExecutionResult';
export type { FallbackExecutorConfig } from './FallbackExecutorConfig';
export type { FallbackStrategy } from './FallbackStrategy';
export type { FallbackStrategyRegistryConfig } from './FallbackStrategyRegistryConfig';
export type { FallbackStrategyRegistryStats } from './FallbackStrategyRegistryStats';

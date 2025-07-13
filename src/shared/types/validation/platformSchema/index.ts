/**
 * Platform Detection Validation Schemas
 *
 * Provides Zod schemas for validating platform detection inputs and outputs.
 * These schemas ensure type safety and security for all platform-related
 * operations across the application.
 *
 * @module PlatformValidationSchemas
 */

// Enum validation schemas
export { PlatformTypeSchema } from './PlatformTypeSchema';
export { OperatingSystemSchema } from './OperatingSystemSchema';
export { RuntimeEnvironmentSchema } from './RuntimeEnvironmentSchema';

// Configuration validation schemas
export { PlatformCacheConfigSchema } from './PlatformCacheConfigSchema';
export { PartialPlatformCacheConfigSchema } from './PartialPlatformCacheConfigSchema';

// Data structure validation schemas
export { PlatformInfoSchema } from './PlatformInfoSchema';
export { PlatformCacheEntrySchema } from './PlatformCacheEntrySchema';

// Input parameter validation schemas
export { WindowPropertyNameSchema } from './WindowPropertyNameSchema';
export { TimestampSchema } from './TimestampSchema';

// Platform detection result validation schemas
export { PlatformDetectionResultSchema } from './PlatformDetectionResultSchema';
export { PlatformDetectionContextSchema } from './PlatformDetectionContextSchema';
export { PlatformMethodResultSchema } from './PlatformMethodResultSchema';
export { PlatformDetectionSummarySchema } from './PlatformDetectionSummarySchema';

// Error handling validation schemas
export { PlatformErrorTypeSchema } from './PlatformErrorTypeSchema';
export { PlatformErrorSchema } from './PlatformErrorSchema';
export { PlatformErrorContextSchema } from './PlatformErrorContextSchema';
export { RecoveryActionSchema } from './RecoveryActionSchema';
export { PlatformErrorResultSchema } from './PlatformErrorResultSchema';

// Performance validation schemas
export { PlatformPerformanceMetricsSchema } from './PlatformPerformanceMetricsSchema';

// Capability validation schemas
export { CapabilityCategorySchema } from './CapabilityCategorySchema';
export { PermissionLevelSchema } from './PermissionLevelSchema';
export { PlatformCapabilitySchema } from './PlatformCapabilitySchema';
export { DetectionStatusSchema } from './DetectionStatusSchema';
export { CapabilityDetectionResultSchema } from './CapabilityDetectionResultSchema';

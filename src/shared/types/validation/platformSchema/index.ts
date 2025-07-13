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

// Test utilities
export { isValidationTestEnvironment } from './isValidationTestEnvironment';
export { isCacheTTLTestEnvironment } from './isCacheTTLTestEnvironment';

/**
 * Platform Conditional Utility Types
 *
 * This module provides utility types for creating conditional logic based on
 * platform detection and capability availability. These types enable compile-time
 * platform safety and graceful degradation of features.
 *
 * @fileoverview Platform conditional utility types for type-safe platform logic
 */

export type { ConditionalOnPlatform } from './ConditionalOnPlatform';
export type { ExcludeOnPlatform } from './ExcludeOnPlatform';
export type { PlatformSpecificConfig } from './PlatformSpecificConfig';
export type { CapabilityConditional } from './CapabilityConditional';
export type { PlatformApiSurface } from './PlatformApiSurface';
export type { PlatformFallback } from './PlatformFallback';
export type { RequirePlatform } from './RequirePlatform';
export type { PlatformUnion } from './PlatformUnion';
export type { CapabilityAwareService } from './CapabilityAwareService';
export type { PlatformCompatible } from './PlatformCompatible';

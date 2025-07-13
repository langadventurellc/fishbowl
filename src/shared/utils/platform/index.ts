/**
 * Platform Detection System
 *
 * Provides centralized, performant platform identification services that integrate
 * seamlessly with the existing Fishbowl architecture. This system wraps the current
 * `isElectronAPIAvailable()` function while extending it to support future Capacitor
 * integration and granular platform detection.
 *
 * @module Platform
 */

// Individual platform detection functions
export { isCapacitorAndroid } from './isCapacitorAndroid';
export { isCapacitorIOS } from './isCapacitorIOS';
export { isCapacitorPlatform } from './isCapacitorPlatform';
export { isElectronPlatform } from './isElectronPlatform';
export { isWebPlatform } from './isWebPlatform';

// Operating system detection functions
export { getCapacitorOperatingSystem } from './getCapacitorOperatingSystem';

// Main platform detection functions
export { detectPlatformType } from './detectPlatformType';
export { getPlatformInfo } from './getPlatformInfo';

// Platform information types
export { type PlatformInfo } from './PlatformInfo';

// Platform type guards for TypeScript type narrowing
export { isCapacitorEnvironment } from './isCapacitorEnvironment';
export { isElectronEnvironment } from './isElectronEnvironment';
export { isKnownPlatform } from './isKnownPlatform';
export { isPlatformContext } from './isPlatformContext';
export { isPlatformType } from './isPlatformType';
export { isWebEnvironment } from './isWebEnvironment';

// Export type guard types from shared platform types
export type { CapacitorEnvironment } from '../../types/platform/CapacitorEnvironment';
export type { CapacitorRuntimeEnvironment } from '../../types/platform/CapacitorRuntimeEnvironment';
export type { ElectronEnvironment } from '../../types/platform/ElectronEnvironment';
export type { KnownPlatformType } from '../../types/platform/KnownPlatformType';
export type { NonCapacitorEnvironment } from '../../types/platform/NonCapacitorEnvironment';
export type { NonElectronEnvironment } from '../../types/platform/NonElectronEnvironment';
export type { NonWebEnvironment } from '../../types/platform/NonWebEnvironment';
export type { PlatformContextType } from '../../types/platform/PlatformContextType';
export type { RuntimeEnvironment as PlatformRuntimeEnvironment } from '../../types/platform/RuntimeEnvironment';
export type { WebEnvironment } from '../../types/platform/WebEnvironment';
export type { WebRuntimeEnvironment } from '../../types/platform/WebRuntimeEnvironment';

// Safe global access utilities
export { hasDocument } from './hasDocument';
export { hasWebAPIs } from './hasWebAPIs';
export { hasWebLocation } from './hasWebLocation';
export { hasWebNavigator } from './hasWebNavigator';
export { hasWindow } from './hasWindow';
export { hasWindowProperty } from './hasWindowProperty';

// Other modules (implemented in future tasks)
export * from './cache';
export * from './capabilities';
export * from './detection';
export * from './types';

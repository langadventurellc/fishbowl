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
export { isElectronPlatform } from './isElectronPlatform';
export { isCapacitorPlatform } from './isCapacitorPlatform';
export { isCapacitorIOS } from './isCapacitorIOS';
export { isCapacitorAndroid } from './isCapacitorAndroid';
export { isWebPlatform } from './isWebPlatform';

// Operating system detection functions
export { getCapacitorOperatingSystem } from './getCapacitorOperatingSystem';

// Main platform detection functions
export { detectPlatformType } from './detectPlatformType';
export { getPlatformInfo } from './getPlatformInfo';

// Platform information types
export { type PlatformInfo } from './PlatformInfo';

// Platform type guards for TypeScript type narrowing
export { isElectronEnvironment } from './isElectronEnvironment';
export { isCapacitorEnvironment } from './isCapacitorEnvironment';
export { isWebEnvironment } from './isWebEnvironment';
export { isPlatformType } from './isPlatformType';
export { isKnownPlatform } from './isKnownPlatform';
export { isPlatformContext } from './isPlatformContext';

// Export type guard types from shared platform types
export type { ElectronEnvironment } from '../../types/platform/ElectronEnvironment';
export type { NonElectronEnvironment } from '../../types/platform/NonElectronEnvironment';
export type { RuntimeEnvironment as PlatformRuntimeEnvironment } from '../../types/platform/RuntimeEnvironment';
export type { CapacitorEnvironment } from '../../types/platform/CapacitorEnvironment';
export type { NonCapacitorEnvironment } from '../../types/platform/NonCapacitorEnvironment';
export type { CapacitorRuntimeEnvironment } from '../../types/platform/CapacitorRuntimeEnvironment';
export type { WebEnvironment } from '../../types/platform/WebEnvironment';
export type { NonWebEnvironment } from '../../types/platform/NonWebEnvironment';
export type { WebRuntimeEnvironment } from '../../types/platform/WebRuntimeEnvironment';
export type { KnownPlatformType } from '../../types/platform/KnownPlatformType';
export type { PlatformContextType } from '../../types/platform/PlatformContextType';

// Safe global access utilities
export { hasWindow } from './hasWindow';
export { hasWindowProperty } from './hasWindowProperty';
export { hasDocument } from './hasDocument';
export { hasWebNavigator } from './hasWebNavigator';
export { hasWebAPIs } from './hasWebAPIs';
export { hasWebLocation } from './hasWebLocation';

// Other modules (implemented in future tasks)
export * from './cache';
export * from './capabilities';
export * from './detection';
export * from './types';

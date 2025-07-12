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
export { isWebPlatform } from './isWebPlatform';

// Main platform detection functions
export { detectPlatformType } from './detectPlatformType';
export { getPlatformInfo } from './getPlatformInfo';

// Platform information types
export { type PlatformInfo } from './PlatformInfo';

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

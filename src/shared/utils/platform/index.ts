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

// Core platform detection will be exported here

export * from './cache';
export * from './capabilities';
export * from './detection';
export * from './types';

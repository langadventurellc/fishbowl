/**
 * Platform Feature Capability Detection
 *
 * Provides extensible framework for detecting platform-specific capabilities
 * such as secure storage, file system access, and other features.
 *
 * This module exports the complete capability checking API structure designed
 * for extensibility and integration with the existing platform detection system.
 */

// Core capability detection interfaces and classes
export { BaseCapabilityDetector } from './BaseCapabilityDetector';
export { type CapabilityDetector } from './CapabilityDetector';
export { CapabilityManager } from './CapabilityManager';
export { CapabilityRegistry } from './CapabilityRegistry';

// Concrete capability detectors
export { SecureStorageCapabilityDetector } from './SecureStorageCapabilityDetector';
export { FileSystemCapabilityDetector } from './FileSystemCapabilityDetector';

// Configuration and context interfaces
export {
  DEFAULT_CAPABILITY_DETECTION_CONFIG,
  type CapabilityDetectionConfig,
} from './capabilityConfig';
export { type CapabilityDetectionContext } from './CapabilityDetectionContext';

export { detectCapability } from './detectCapability';
export { getRegisteredCapabilities } from './getRegisteredCapabilities';
export { hasSecureStorageCapability } from './hasSecureStorageCapability';
export { hasFileSystemCapability } from './hasFileSystemCapability';
export { isCapabilitySupported } from './isCapabilitySupported';
export { registerCapabilityDetector } from './registerCapabilityDetector';

export { getGlobalCapabilityManager } from './capabilityManager/getGlobalCapabilityManager';
export { hasGlobalCapabilityManager } from './capabilityManager/hasGlobalCapabilityManager';
export { resetGlobalCapabilityManager } from './capabilityManager/resetGlobalCapabilityManager';

// Error handling
export { CapabilityDetectionError, CapabilityDetectionErrorType } from './capabilityError';

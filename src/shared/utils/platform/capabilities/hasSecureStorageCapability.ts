/**
 * Secure Storage Capability Check Utility
 *
 * Provides a convenient function to check if secure storage is available
 * on the current platform, automatically handling detector registration.
 */

import { PlatformType } from '../../../constants/platform/PlatformType';
import { PLATFORM_CAPABILITIES } from '../../../constants/platform/PLATFORM_CAPABILITIES';
import { PlatformCapability } from '../../../types/platform/PlatformCapability';
import { detectCapability } from './detectCapability';
import { getGlobalCapabilityManager } from './capabilityManager/getGlobalCapabilityManager';
import { SecureStorageCapabilityDetector } from './SecureStorageCapabilityDetector';
import { registerCapabilityDetector } from './registerCapabilityDetector';

/**
 * Checks if secure storage capability is available on the current platform
 *
 * This function handles the registration of the secure storage detector
 * and performs the capability check in one convenient call.
 *
 * @returns Promise resolving to boolean indicating secure storage availability
 *
 * @example
 * ```typescript
 * const hasSecureStorage = await hasSecureStorageCapability();
 * if (hasSecureStorage) {
 *   // Use secure storage for API keys
 * } else {
 *   // Provide fallback or warn user
 * }
 * ```
 */
export async function hasSecureStorageCapability(): Promise<boolean> {
  try {
    // Ensure the secure storage detector is registered
    ensureSecureStorageDetectorRegistered();

    // Create the secure storage capability definition
    const secureStorageCapability: PlatformCapability = {
      id: PLATFORM_CAPABILITIES.SECURE_STORAGE,
      name: 'Secure Storage',
      description: 'Native secure credential storage (keytar/keychain)',
      supportedPlatforms: [PlatformType.ELECTRON], // Currently only Electron
      available: false, // Will be determined by detection
      confidence: 0, // Will be set by detection
      requiresPermissions: true,
      metadata: {
        provider: 'keytar',
        storageTypes: ['credentials', 'apiKeys', 'tokens'],
      },
    };

    // Detect the capability
    const result = await detectCapability(secureStorageCapability);
    return result.available;
  } catch (error) {
    // Log error in development but don't expose it to production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to check secure storage capability:', error);
    }
    return false;
  }
}

/**
 * Ensures the secure storage detector is registered with the global manager
 */
function ensureSecureStorageDetectorRegistered(): void {
  const manager = getGlobalCapabilityManager();

  // Check if detector is already registered
  const registeredCapabilities = manager.getSupportedCapabilities();
  const isRegistered = registeredCapabilities.includes(PLATFORM_CAPABILITIES.SECURE_STORAGE);

  if (!isRegistered) {
    // Register the secure storage detector
    const detector = new SecureStorageCapabilityDetector();
    registerCapabilityDetector(detector);
  }
}

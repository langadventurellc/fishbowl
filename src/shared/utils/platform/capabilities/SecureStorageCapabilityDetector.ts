/**
 * Secure Storage Capability Detector
 *
 * Detects whether secure storage (keytar) is available on the current platform.
 * Provides platform-specific secure storage capability checking.
 */

import { PlatformType } from '../../../constants/platform/PlatformType';
import { PLATFORM_CAPABILITIES } from '../../../constants/platform/PLATFORM_CAPABILITIES';
import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';
import { PlatformCapability } from '../../../types/platform/PlatformCapability';
import { BaseCapabilityDetector } from './BaseCapabilityDetector';
import { detectPlatformType } from '../detectPlatformType';

/**
 * Detector for secure storage capability
 *
 * Checks whether the platform supports secure credential storage:
 * - Electron: Tests keytar availability and functionality
 * - Web: Always unavailable (no keytar equivalent)
 * - Capacitor: Future support (currently unavailable)
 * - Unknown: Always unavailable
 */
export class SecureStorageCapabilityDetector extends BaseCapabilityDetector {
  constructor() {
    super('secure-storage-detector', [PLATFORM_CAPABILITIES.SECURE_STORAGE]);
  }

  /**
   * Performs platform-specific secure storage detection
   */
  protected async performDetection(
    capability: PlatformCapability,
  ): Promise<Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'>> {
    const platformType = detectPlatformType();

    switch (platformType) {
      case PlatformType.ELECTRON:
        return Promise.resolve(this.detectElectronSecureStorage(capability));

      case PlatformType.WEB:
        return Promise.resolve(
          this.createFailureResult(capability, 'Secure storage not available in web environment', [
            'Use browser localStorage (less secure)',
            'Implement server-side credential storage',
          ]),
        );

      case PlatformType.CAPACITOR:
        return Promise.resolve(
          this.createFailureResult(capability, 'Capacitor secure storage not yet implemented', [
            'Plan for iOS Keychain and Android Keystore integration',
          ]),
        );

      case PlatformType.UNKNOWN:
      default:
        return Promise.resolve(
          this.createFailureResult(
            capability,
            'Cannot determine secure storage availability on unknown platform',
            ['Ensure platform detection is working correctly'],
          ),
        );
    }
  }

  /**
   * Detects secure storage capability in Electron environment
   */
  private detectElectronSecureStorage(
    capability: PlatformCapability,
  ): Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'> {
    try {
      // Check if we're actually in an Electron environment
      // Use type-safe access to global objects
      if (typeof globalThis === 'undefined') {
        return this.createFailureResult(capability, 'Not running in browser environment', [
          'Ensure application is running in a browser context',
        ]);
      }

      const globalObject = globalThis as { window?: { electronAPI?: unknown } };
      if (!globalObject.window?.electronAPI) {
        return this.createFailureResult(capability, 'Not running in Electron environment', [
          'Ensure application is running as Electron app',
        ]);
      }

      // In Electron's renderer process, we can't directly access keytar
      // We need to check if the IPC channel for secure storage is available
      const electronAPI = globalObject.window.electronAPI as Record<string, unknown>;
      const secureStorageAPI = electronAPI.secureStorage;

      if (!secureStorageAPI || typeof secureStorageAPI !== 'object') {
        return this.createFailureResult(capability, 'Secure storage IPC interface not available', [
          'Ensure preload script includes secure storage methods',
        ]);
      }

      // Test if secure storage operations are available by checking the API surface
      const secureStorage = secureStorageAPI as Record<string, unknown>;
      const hasRequiredMethods = [
        'secureKeytarGet',
        'secureKeytarSet',
        'secureKeytarDelete',
        'secureCredentialsGet',
        'secureCredentialsSet',
        'secureCredentialsDelete',
      ].every(method => typeof secureStorage[method] === 'function');

      if (!hasRequiredMethods) {
        return this.createFailureResult(capability, 'Secure storage API methods not available', [
          'Ensure all secure storage IPC methods are exposed in preload script',
        ]);
      }

      // The actual keytar functionality test should be done in the main process
      // We consider it available if the IPC interface is properly set up
      return this.createSuccessResult(
        capability,
        [
          'Electron environment detected',
          'Secure storage IPC interface available',
          'All required secure storage methods present',
        ],
        {
          requiredPermissions: ['keytar', 'os-credential-access'],
          permissionsGranted: true,
          fallbackOptions: [],
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error during detection';
      return this.createFailureResult(
        capability,
        `Secure storage detection failed: ${errorMessage}`,
        ['Check Electron setup and keytar installation', 'Verify secure storage IPC configuration'],
      );
    }
  }
}

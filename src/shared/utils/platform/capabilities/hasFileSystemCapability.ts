/**
 * File System Capability Check Utility
 *
 * Convenient utility function for checking file system access capability availability.
 * Automatically registers the FileSystemCapabilityDetector and performs capability detection.
 */

import { PlatformType } from '../../../constants/platform/PlatformType';
import { PLATFORM_CAPABILITIES } from '../../../constants/platform/PLATFORM_CAPABILITIES';
import { PlatformCapability } from '../../../types/platform/PlatformCapability';
import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';
import { detectCapability } from './detectCapability';
import { getGlobalCapabilityManager } from './capabilityManager/getGlobalCapabilityManager';
import { FileSystemCapabilityDetector } from './FileSystemCapabilityDetector';
import { registerCapabilityDetector } from './registerCapabilityDetector';

/**
 * Check if file system access capability is available
 *
 * This utility function automatically registers the FileSystemCapabilityDetector
 * if not already registered and checks for file system access capability availability.
 *
 * @returns Promise resolving to capability detection result
 *
 * @example
 * ```typescript
 * const result = await hasFileSystemCapability();
 * if (result.available) {
 *   console.log('File system access is available');
 *   console.log('Evidence:', result.evidence);
 * } else {
 *   console.log('File system access unavailable:', result.fallbackOptions);
 * }
 * ```
 */
export async function hasFileSystemCapability(): Promise<CapabilityDetectionResult> {
  try {
    // Ensure the file system detector is registered
    ensureFileSystemDetectorRegistered();

    // Create the file system capability definition
    const fileSystemCapability: PlatformCapability = {
      id: PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS,
      name: 'File System Access',
      description: 'Platform-specific file system access capabilities (read, write, delete)',
      supportedPlatforms: [PlatformType.ELECTRON, PlatformType.WEB, PlatformType.CAPACITOR],
      available: false, // Will be determined by detection
      confidence: 0, // Will be set by detection
      requiresPermissions: true,
      metadata: {
        operations: ['read', 'write', 'delete', 'watch'],
        platforms: {
          electron: 'Node.js file system via IPC',
          web: 'File System Access API and OPFS',
          capacitor: 'Filesystem plugin',
        },
      },
    };

    // Detect the capability
    return await detectCapability(fileSystemCapability);
  } catch (error) {
    // Log error in development but don't expose it to production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to check file system capability:', error);
    }

    // Return error result for any unexpected failures
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      capability: {
        id: PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS,
        name: 'File System Access',
        description: 'File system access capability detection failed',
        supportedPlatforms: [],
        available: false,
        confidence: 0,
        requiresPermissions: true,
      },
      available: false,
      detectionTimeMs: 0,
      detectionMethod: 'hasFileSystemCapability',
      evidence: [`Error during detection: ${errorMessage}`],
      warnings: ['Detection failed due to an error'],
      requiredPermissions: [],
      permissionsGranted: false,
      fallbackOptions: ['Assume file system access is unavailable'],
      timestamp: Date.now(),
    };
  }
}

/**
 * Ensures the file system detector is registered with the global manager
 */
function ensureFileSystemDetectorRegistered(): void {
  const manager = getGlobalCapabilityManager();

  // Check if detector is already registered
  const registeredCapabilities = manager.getSupportedCapabilities();
  const isRegistered = registeredCapabilities.includes(PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS);

  if (!isRegistered) {
    // Register the file system detector
    const detector = new FileSystemCapabilityDetector();
    registerCapabilityDetector(detector);
  }
}

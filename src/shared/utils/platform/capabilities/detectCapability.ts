/**
 * Detect Capability Utility
 *
 * Provides a convenient function for detecting platform capabilities
 * using the global capability manager.
 */

import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';
import { PlatformCapability } from '../../../types/platform/PlatformCapability';
import { getGlobalCapabilityManager } from './capabilityManager/index';

/**
 * Detects whether a platform capability is available
 *
 * This function provides a convenient way to detect capabilities
 * without needing to manage CapabilityManager instances directly.
 *
 * @param capability - The capability definition to detect
 * @returns Promise resolving to detailed detection result
 *
 * @example
 * ```typescript
 * import { detectCapability } from '@/shared/utils/platform';
 *
 * const capability = {
 *   id: 'secure-storage',
 *   name: 'Secure Storage',
 *   description: 'Access to secure credential storage',
 *   supportedPlatforms: ['ELECTRON'],
 *   available: false,
 *   confidence: 0,
 *   requiresPermissions: true
 * };
 *
 * const result = await detectCapability(capability);
 * if (result.available) {
 *   console.log('Secure storage is available');
 * }
 * ```
 */
export async function detectCapability(
  capability: PlatformCapability,
): Promise<CapabilityDetectionResult> {
  const manager = getGlobalCapabilityManager();
  return await manager.detectCapability(capability);
}

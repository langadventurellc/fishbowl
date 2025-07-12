/**
 * Capability Category Map Type
 *
 * Maps capability categories to their specific capability names.
 */

import { CapabilityCategory } from '../../constants/platform/CapabilityCategory';

/**
 * Map of capability categories to their capability names
 */
export type CapabilityCategoryMap = {
  [CapabilityCategory.STORAGE]: 'keychain' | 'credentials' | 'encryption';
  [CapabilityCategory.FILESYSTEM]: 'read' | 'write' | 'delete' | 'watch';
  [CapabilityCategory.NETWORKING]: 'fetch' | 'websockets' | 'bluetooth' | 'geolocation';
  [CapabilityCategory.SYSTEM]: 'notifications' | 'clipboard' | 'windowControls' | 'systemTray';
  [CapabilityCategory.UI]: 'dialog' | 'menu' | 'tray' | 'statusBar';
  [CapabilityCategory.SECURITY]: 'encryption' | 'authentication' | 'permissions' | 'isolation';
  [CapabilityCategory.PERFORMANCE]: 'threading' | 'caching' | 'optimization' | 'monitoring';
  [CapabilityCategory.PLATFORM_SPECIFIC]: 'electron' | 'capacitor' | 'webAPIs';
};

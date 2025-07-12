/**
 * Platform Capabilities Collection Interface
 *
 * Collection of all platform capabilities organized by category.
 * Provides structured access to feature availability across platforms.
 */

import { PlatformCapability } from './PlatformCapability';

/**
 * Collection of platform capabilities organized by category
 */
export interface PlatformCapabilities {
  /** File system access capabilities */
  fileSystem: {
    read: PlatformCapability;
    write: PlatformCapability;
    delete: PlatformCapability;
    watch: PlatformCapability;
  };
  /** Secure storage capabilities */
  secureStorage: {
    keychain: PlatformCapability;
    credentials: PlatformCapability;
    encryption: PlatformCapability;
  };
  /** System integration capabilities */
  system: {
    notifications: PlatformCapability;
    clipboard: PlatformCapability;
    windowControls: PlatformCapability;
    systemTray: PlatformCapability;
  };
  /** Network and communication capabilities */
  network: {
    fetch: PlatformCapability;
    websockets: PlatformCapability;
    bluetooth: PlatformCapability;
    geolocation: PlatformCapability;
  };
  /** Device hardware capabilities */
  hardware: {
    camera: PlatformCapability;
    microphone: PlatformCapability;
    sensors: PlatformCapability;
    storage: PlatformCapability;
  };
  /** Platform-specific API capabilities */
  apis: {
    electron: PlatformCapability;
    capacitor: PlatformCapability;
    webAPIs: PlatformCapability;
  };
}

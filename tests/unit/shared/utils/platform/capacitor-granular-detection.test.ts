import { describe, it, expect, afterEach } from 'vitest';
import {
  isCapacitorIOS,
  isCapacitorAndroid,
  getCapacitorOperatingSystem,
  isCapacitorPlatform,
} from '../../../../../src/shared/utils/platform';
import { OperatingSystem } from '../../../../../src/shared/constants/platform/OperatingSystem';
import {
  capacitorEnvironment,
  webEnvironment,
  electronEnvironment,
  unknownEnvironment,
} from './mock-environments';

describe('Capacitor Granular Platform Detection', () => {
  let cleanup: (() => void) | null = null;

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  describe('isCapacitorIOS', () => {
    it('should return true when in Capacitor iOS environment', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Ensure the mock Capacitor has iOS platform
      const capacitor = (globalThis.window as any).Capacitor;
      capacitor.platform = 'ios';

      expect(isCapacitorIOS()).toBe(true);
    });

    it('should return false when in Capacitor Android environment', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Set the mock Capacitor to Android platform
      const capacitor = (globalThis.window as any).Capacitor;
      capacitor.platform = 'android';

      expect(isCapacitorIOS()).toBe(false);
    });

    it('should return false when not in Capacitor environment', () => {
      cleanup = () => webEnvironment.cleanup();
      webEnvironment.setup();

      expect(isCapacitorIOS()).toBe(false);
    });

    it('should return false when in Electron environment', () => {
      cleanup = () => electronEnvironment.cleanup();
      electronEnvironment.setup();

      expect(isCapacitorIOS()).toBe(false);
    });

    it('should return false when window.Capacitor is not available', () => {
      cleanup = () => unknownEnvironment.cleanup();
      unknownEnvironment.setup();

      expect(isCapacitorIOS()).toBe(false);
    });

    it('should return false when Capacitor.platform is not set', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Remove the platform property
      const capacitor = (globalThis.window as any).Capacitor;
      delete capacitor.platform;

      expect(isCapacitorIOS()).toBe(false);
    });

    it('should handle edge case when Capacitor is null', () => {
      cleanup = () => webEnvironment.cleanup();
      webEnvironment.setup();

      // Add Capacitor but set it to null
      (globalThis.window as any).Capacitor = null;

      expect(isCapacitorIOS()).toBe(false);
    });

    it('should handle edge case when window is not available', () => {
      cleanup = () => unknownEnvironment.cleanup();
      unknownEnvironment.setup();

      expect(isCapacitorIOS()).toBe(false);
    });
  });

  describe('isCapacitorAndroid', () => {
    it('should return true when in Capacitor Android environment', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Set the mock Capacitor to Android platform
      const capacitor = (globalThis.window as any).Capacitor;
      capacitor.platform = 'android';

      expect(isCapacitorAndroid()).toBe(true);
    });

    it('should return false when in Capacitor iOS environment', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Ensure the mock Capacitor has iOS platform
      const capacitor = (globalThis.window as any).Capacitor;
      capacitor.platform = 'ios';

      expect(isCapacitorAndroid()).toBe(false);
    });

    it('should return false when not in Capacitor environment', () => {
      cleanup = () => webEnvironment.cleanup();
      webEnvironment.setup();

      expect(isCapacitorAndroid()).toBe(false);
    });

    it('should return false when in Electron environment', () => {
      cleanup = () => electronEnvironment.cleanup();
      electronEnvironment.setup();

      expect(isCapacitorAndroid()).toBe(false);
    });

    it('should return false when window.Capacitor is not available', () => {
      cleanup = () => unknownEnvironment.cleanup();
      unknownEnvironment.setup();

      expect(isCapacitorAndroid()).toBe(false);
    });

    it('should return false when Capacitor.platform is not set', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Remove the platform property
      const capacitor = (globalThis.window as any).Capacitor;
      delete capacitor.platform;

      expect(isCapacitorAndroid()).toBe(false);
    });

    it('should handle edge case when Capacitor is null', () => {
      cleanup = () => webEnvironment.cleanup();
      webEnvironment.setup();

      // Add Capacitor but set it to null
      (globalThis.window as any).Capacitor = null;

      expect(isCapacitorAndroid()).toBe(false);
    });
  });

  describe('getCapacitorOperatingSystem', () => {
    it('should return OperatingSystem.IOS when in Capacitor iOS environment', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Ensure the mock Capacitor has iOS platform
      const capacitor = (globalThis.window as any).Capacitor;
      capacitor.platform = 'ios';

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.IOS);
    });

    it('should return OperatingSystem.ANDROID when in Capacitor Android environment', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Set the mock Capacitor to Android platform
      const capacitor = (globalThis.window as any).Capacitor;
      capacitor.platform = 'android';

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.ANDROID);
    });

    it('should return OperatingSystem.UNKNOWN when not in Capacitor environment', () => {
      cleanup = () => webEnvironment.cleanup();
      webEnvironment.setup();

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.UNKNOWN);
    });

    it('should return OperatingSystem.UNKNOWN when in Electron environment', () => {
      cleanup = () => electronEnvironment.cleanup();
      electronEnvironment.setup();

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.UNKNOWN);
    });

    it('should return OperatingSystem.UNKNOWN when window.Capacitor is not available', () => {
      cleanup = () => unknownEnvironment.cleanup();
      unknownEnvironment.setup();

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.UNKNOWN);
    });

    it('should return OperatingSystem.UNKNOWN when Capacitor.platform is not set', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Remove the platform property
      const capacitor = (globalThis.window as any).Capacitor;
      delete capacitor.platform;

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.UNKNOWN);
    });

    it('should return OperatingSystem.UNKNOWN for unknown platform values', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Set an unknown platform value
      const capacitor = (globalThis.window as any).Capacitor;
      capacitor.platform = 'unknown-platform';

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.UNKNOWN);
    });

    it('should handle edge case when Capacitor is null', () => {
      cleanup = () => webEnvironment.cleanup();
      webEnvironment.setup();

      // Add Capacitor but set it to null
      (globalThis.window as any).Capacitor = null;

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.UNKNOWN);
    });

    it('should handle edge case when window is not available', () => {
      cleanup = () => unknownEnvironment.cleanup();
      unknownEnvironment.setup();

      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.UNKNOWN);
    });
  });

  describe('Integration with existing Capacitor detection', () => {
    it('should be consistent with isCapacitorPlatform() results', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      // Set iOS platform
      const capacitor = (globalThis.window as any).Capacitor;
      capacitor.platform = 'ios';

      // If we detect iOS, we should also detect Capacitor
      if (isCapacitorIOS()) {
        expect(isCapacitorPlatform()).toBe(true);
      }
    });

    it('should handle platform transitions correctly', () => {
      cleanup = () => capacitorEnvironment.cleanup();
      capacitorEnvironment.setup();

      const capacitor = (globalThis.window as any).Capacitor;

      // Start with iOS
      capacitor.platform = 'ios';
      expect(isCapacitorIOS()).toBe(true);
      expect(isCapacitorAndroid()).toBe(false);
      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.IOS);

      // Switch to Android
      capacitor.platform = 'android';
      expect(isCapacitorIOS()).toBe(false);
      expect(isCapacitorAndroid()).toBe(true);
      expect(getCapacitorOperatingSystem()).toBe(OperatingSystem.ANDROID);
    });
  });
});

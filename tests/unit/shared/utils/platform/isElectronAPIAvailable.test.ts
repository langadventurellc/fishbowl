import { describe, it, expect } from 'vitest';
import { isElectronAPIAvailable } from '../../../../../src/renderer/hooks/useIpc/isElectronAPIAvailable';
import {
  electronEnvironment,
  webEnvironment,
  capacitorEnvironment,
  mixedEnvironment,
  withMockEnvironment,
} from './mock-environments';
import { setupPlatformTests } from './test-setup';

/**
 * Test suite for isElectronAPIAvailable function
 * Validates platform detection logic across different environments
 * and demonstrates usage of platform mock environments
 */

// Setup platform test environment
setupPlatformTests();

describe('isElectronAPIAvailable', () => {
  describe('Function Properties', () => {
    it('should be defined and be a function', () => {
      expect(isElectronAPIAvailable).toBeDefined();
      expect(typeof isElectronAPIAvailable).toBe('function');
    });

    it('should return a boolean value', () => {
      const result = isElectronAPIAvailable();
      expect(typeof result).toBe('boolean');
    });

    it('should not throw errors when called', () => {
      expect(() => isElectronAPIAvailable()).not.toThrow();
    });
  });

  describe('Electron Environment Detection', () => {
    it('should return true when electronAPI is available on window', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const result = isElectronAPIAvailable();
        expect(result).toBe(true);
      });
    });

    it('should detect electronAPI with all expected methods', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        expect(window.electronAPI).toBeDefined();
        expect(window.electronAPI.getVersion).toBeDefined();
        expect(window.electronAPI.minimize).toBeDefined();
        expect(window.electronAPI.dbAgentsList).toBeDefined();

        const result = isElectronAPIAvailable();
        expect(result).toBe(true);
      });
    });

    it('should be consistent across multiple calls', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const results = [];
        for (let i = 0; i < 5; i++) {
          results.push(isElectronAPIAvailable());
        }
        expect(results.every(r => r === true)).toBe(true);
      });
    });
  });

  describe('Web Environment Detection', () => {
    it('should return false when electronAPI is not available', async () => {
      await withMockEnvironment(webEnvironment, () => {
        const result = isElectronAPIAvailable();
        expect(result).toBe(false);
      });
    });

    it('should handle undefined window object', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Temporarily remove window to test edge case
        const originalWindow = globalThis.window;
        delete (globalThis as any).window;

        try {
          const result = isElectronAPIAvailable();
          expect(result).toBe(false);
        } finally {
          // Restore window
          globalThis.window = originalWindow;
        }
      });
    });

    it('should be consistent across multiple calls', async () => {
      await withMockEnvironment(webEnvironment, () => {
        const results = [];
        for (let i = 0; i < 5; i++) {
          results.push(isElectronAPIAvailable());
        }
        expect(results.every(r => r === false)).toBe(true);
      });
    });
  });

  describe('Capacitor Environment Detection', () => {
    it('should return false when only Capacitor is available (no electronAPI)', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        // Verify Capacitor is available but electronAPI is not
        expect((window as any).Capacitor).toBeDefined();
        expect(window.electronAPI).toBeUndefined();

        const result = isElectronAPIAvailable();
        expect(result).toBe(false);
      });
    });
  });

  describe('Mixed Environment Detection', () => {
    it('should return true when both electronAPI and Capacitor are available', async () => {
      await withMockEnvironment(mixedEnvironment, () => {
        // Verify both APIs are available
        expect(window.electronAPI).toBeDefined();
        expect((window as any).Capacitor).toBeDefined();

        // Function should prioritize electronAPI detection
        const result = isElectronAPIAvailable();
        expect(result).toBe(true);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle corrupted window.electronAPI object', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // Set electronAPI to null (which is !== undefined, so actually returns true)
        (window as any).electronAPI = null;

        const result = isElectronAPIAvailable();
        expect(result).toBe(true); // null !== undefined is true
      });
    });

    it('should handle window.electronAPI as different types', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Test with values that should return false (only undefined)
        (window as any).electronAPI = undefined;
        const undefinedResult = isElectronAPIAvailable();
        expect(undefinedResult).toBe(false);

        // Test with values that should return true (anything except undefined)
        const definedValues = [null, false, 0, '', NaN, {}, []];
        definedValues.forEach(value => {
          (window as any).electronAPI = value;
          const result = isElectronAPIAvailable();
          expect(result).toBe(true);
        });
      });
    });
  });

  describe('Performance Requirements', () => {
    it('should execute quickly', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const start = performance.now();
        const result = isElectronAPIAvailable();
        const end = performance.now();

        expect(result).toBe(true);
        expect(end - start).toBeLessThan(10); // 10ms is generous for this simple function
      });
    });
  });

  describe('Type Guard Functionality', () => {
    it('should act as a proper type guard for conditional logic', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        if (isElectronAPIAvailable()) {
          // In this block, we know electronAPI is available
          expect(window.electronAPI).toBeDefined();
          expect(typeof window.electronAPI.getVersion).toBe('function');
        }
      });
    });

    it('should handle type guard in conditional rendering patterns', async () => {
      await withMockEnvironment(webEnvironment, () => {
        const renderElectronFeature = () => {
          return isElectronAPIAvailable() ? 'electron-feature' : 'web-fallback';
        };

        expect(renderElectronFeature()).toBe('web-fallback');
      });

      await withMockEnvironment(electronEnvironment, () => {
        const renderElectronFeature = () => {
          return isElectronAPIAvailable() ? 'electron-feature' : 'web-fallback';
        };

        expect(renderElectronFeature()).toBe('electron-feature');
      });
    });
  });

  describe('Environment Cleanup and Isolation', () => {
    it('should properly isolate test environments', async () => {
      // Test in Electron environment
      await withMockEnvironment(electronEnvironment, () => {
        expect(isElectronAPIAvailable()).toBe(true);
      });

      // Should be back to default (web) environment
      expect(isElectronAPIAvailable()).toBe(false);

      // Test in Capacitor environment
      await withMockEnvironment(capacitorEnvironment, () => {
        expect(isElectronAPIAvailable()).toBe(false);
        expect((window as any).Capacitor).toBeDefined();
      });

      // Should be back to default environment
      expect(isElectronAPIAvailable()).toBe(false);
      expect((window as any).Capacitor).toBeUndefined();
    });
  });
});

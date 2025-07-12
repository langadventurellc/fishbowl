import { describe, it, expect, vi } from 'vitest';
import {
  isWebPlatform,
  hasDocument,
  hasWebNavigator,
  hasWebAPIs,
  hasWebLocation,
} from '../../../../../src/shared/utils/platform';
import {
  electronEnvironment,
  webEnvironment,
  capacitorEnvironment,
  withMockEnvironment,
} from './mock-environments';
import { setupPlatformTests } from './test-setup';

/**
 * Test suite for enhanced web platform detection with comprehensive fallback logic
 * Validates the multi-layer detection system implemented in task 2.4
 */

// Setup platform test environment
setupPlatformTests();

describe('Enhanced Web Platform Detection with Fallback Logic', () => {
  describe('hasDocument', () => {
    it('should be defined and be a function', () => {
      expect(hasDocument).toBeDefined();
      expect(typeof hasDocument).toBe('function');
    });

    it('should return true when document has web browser features', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock document with browser features
        Object.defineProperty(globalThis, 'document', {
          value: {
            createElement: vi.fn(),
            querySelector: vi.fn(),
            addEventListener: vi.fn(),
            cookie: '',
            referrer: 'https://example.com',
          },
          writable: true,
          configurable: true,
        });

        expect(hasDocument()).toBe(true);
      });
    });

    it('should return false when document is missing browser features', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock incomplete document
        Object.defineProperty(globalThis, 'document', {
          value: {
            // Missing essential methods
          },
          writable: true,
          configurable: true,
        });

        expect(hasDocument()).toBe(false);
      });
    });

    it('should handle missing document gracefully', () => {
      // Test without mock environment
      expect(() => hasDocument()).not.toThrow();
      expect(typeof hasDocument()).toBe('boolean');
    });
  });

  describe('hasWebNavigator', () => {
    it('should be defined and be a function', () => {
      expect(hasWebNavigator).toBeDefined();
      expect(typeof hasWebNavigator).toBe('function');
    });

    it('should return true for complete web navigator', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock navigator with web features
        Object.defineProperty(globalThis, 'navigator', {
          value: {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) WebKit Chrome Safari',
            platform: 'MacIntel',
            language: 'en-US',
            geolocation: {},
            serviceWorker: {},
            onLine: true,
            cookieEnabled: true,
          },
          writable: true,
          configurable: true,
        });

        expect(hasWebNavigator()).toBe(true);
      });
    });

    it('should return false for incomplete navigator', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock navigator missing browser features
        Object.defineProperty(globalThis, 'navigator', {
          value: {
            userAgent: 'Test',
            platform: 'Test',
            language: 'en',
            // Missing browser features
          },
          writable: true,
          configurable: true,
        });

        expect(hasWebNavigator()).toBe(false);
      });
    });

    it('should handle missing navigator gracefully', () => {
      expect(() => hasWebNavigator()).not.toThrow();
      expect(typeof hasWebNavigator()).toBe('boolean');
    });
  });

  describe('hasWebAPIs', () => {
    it('should be defined and be a function', () => {
      expect(hasWebAPIs).toBeDefined();
      expect(typeof hasWebAPIs).toBe('function');
    });

    it('should return true when sufficient web APIs are available', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock web APIs
        Object.assign(globalThis, {
          fetch: vi.fn(),
          localStorage: {},
          sessionStorage: {},
          history: { pushState: vi.fn() },
          requestAnimationFrame: vi.fn(),
          URL: vi.fn(),
          FormData: vi.fn(),
        });

        expect(hasWebAPIs()).toBe(true);
      });
    });

    it('should return false when insufficient web APIs are available', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Clear existing APIs first
        delete (globalThis as any).fetch;
        delete (globalThis as any).localStorage;
        delete (globalThis as any).sessionStorage;
        delete (globalThis as any).history;
        delete (globalThis as any).requestAnimationFrame;
        delete (globalThis as any).URL;
        delete (globalThis as any).FormData;

        // Mock only few APIs (less than required threshold of 3)
        Object.assign(globalThis, {
          fetch: vi.fn(),
          localStorage: {},
          // Only 2 APIs available, should be insufficient
        });

        expect(hasWebAPIs()).toBe(false);
      });
    });

    it('should handle missing APIs gracefully', () => {
      expect(() => hasWebAPIs()).not.toThrow();
      expect(typeof hasWebAPIs()).toBe('boolean');
    });
  });

  describe('hasWebLocation', () => {
    it('should be defined and be a function', () => {
      expect(hasWebLocation).toBeDefined();
      expect(typeof hasWebLocation).toBe('function');
    });

    it('should return true for web location with https protocol', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock web location with https
        Object.defineProperty(globalThis, 'location', {
          value: {
            href: 'https://example.com/page',
            protocol: 'https:',
            hostname: 'example.com',
            reload: vi.fn(),
          },
          writable: true,
          configurable: true,
        });

        expect(hasWebLocation()).toBe(true);
      });
    });

    it('should return true for web location with real hostname', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock web location with real hostname (even if localhost)
        Object.defineProperty(globalThis, 'location', {
          value: {
            href: 'http://myapp.com:3000/page',
            protocol: 'http:',
            hostname: 'myapp.com',
            reload: vi.fn(),
          },
          writable: true,
          configurable: true,
        });

        expect(hasWebLocation()).toBe(true);
      });
    });

    it('should return false for file protocol location', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock file protocol (typical for Electron)
        Object.defineProperty(globalThis, 'location', {
          value: {
            href: 'file:///path/to/file.html',
            protocol: 'file:',
            hostname: '',
            reload: vi.fn(),
          },
          writable: true,
          configurable: true,
        });

        expect(hasWebLocation()).toBe(false);
      });
    });

    it('should handle missing location gracefully', () => {
      expect(() => hasWebLocation()).not.toThrow();
      expect(typeof hasWebLocation()).toBe('boolean');
    });
  });

  describe('Enhanced isWebPlatform with fallback logic', () => {
    it('should use primary detection for complete web environment', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock complete web environment
        Object.assign(globalThis, {
          document: {
            createElement: vi.fn(),
            querySelector: vi.fn(),
            addEventListener: vi.fn(),
            cookie: '',
            referrer: 'https://example.com',
          },
          navigator: {
            userAgent: 'Mozilla/5.0 Chrome',
            platform: 'MacIntel',
            language: 'en-US',
            geolocation: {},
            onLine: true,
          },
          location: {
            href: 'https://example.com/page',
            protocol: 'https:',
            hostname: 'example.com',
            reload: vi.fn(),
          },
          fetch: vi.fn(),
          localStorage: {},
          sessionStorage: {},
          history: { pushState: vi.fn() },
        });

        expect(isWebPlatform()).toBe(true);
      });
    });

    it('should fall back to secondary detection for partial web environment', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock partial web environment - only basic features
        Object.assign(globalThis, {
          document: {
            createElement: vi.fn(),
            querySelector: vi.fn(),
            addEventListener: vi.fn(),
            cookie: '',
            referrer: '',
          },
          // Missing some features but still recognizable as web
        });

        expect(isWebPlatform()).toBe(true);
      });
    });

    it('should return false in Electron environment even with web features', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // Even if Electron has web-like features, should be detected as not web
        expect(isWebPlatform()).toBe(false);
      });
    });

    it('should return false in Capacitor environment even with web features', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        // Even if Capacitor has web-like features, should be detected as not web
        expect(isWebPlatform()).toBe(false);
      });
    });

    it('should handle errors gracefully across all detection layers', () => {
      // Test error handling without mock environment
      expect(() => isWebPlatform()).not.toThrow();
      expect(typeof isWebPlatform()).toBe('boolean');
    });

    it('should return false when no sufficient web characteristics are present', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Mock environment with minimal features - insufficient for web detection
        delete (globalThis as any).document;
        delete (globalThis as any).navigator;
        delete (globalThis as any).location;

        expect(isWebPlatform()).toBe(false);
      });
    });
  });

  describe('Comprehensive fallback behavior', () => {
    it('should prioritize strong web indicators over process of elimination', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Create environment with strong web indicators
        Object.assign(globalThis, {
          document: {
            createElement: vi.fn(),
            querySelector: vi.fn(),
            addEventListener: vi.fn(),
            cookie: '',
            referrer: 'https://example.com',
          },
          navigator: {
            userAgent: 'Mozilla/5.0 Chrome',
            platform: 'MacIntel',
            language: 'en-US',
            geolocation: {},
          },
          location: {
            href: 'https://example.com',
            protocol: 'https:',
            hostname: 'example.com',
            reload: vi.fn(),
          },
          fetch: vi.fn(),
          localStorage: {},
          sessionStorage: {},
          history: { pushState: vi.fn() },
        });

        expect(isWebPlatform()).toBe(true);
      });
    });

    it('should validate minimal web features in secondary detection', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Environment that passes basic checks but lacks strong indicators
        Object.defineProperty(globalThis, 'document', {
          value: {
            createElement: vi.fn(),
            querySelector: vi.fn(),
            addEventListener: vi.fn(),
            cookie: '',
            referrer: '',
          },
          writable: true,
          configurable: true,
        });

        // Should still detect as web due to minimal features present
        expect(isWebPlatform()).toBe(true);
      });
    });
  });
});

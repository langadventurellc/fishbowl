/**
 * Platform Validation Schema Tests
 *
 * Comprehensive test suite for all platform detection validation schemas
 * to ensure security, type safety, and proper error handling.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ZodError } from 'zod';

// Extend global type to include our test flag
declare global {
  var __VITEST_VALIDATION_TEST__: boolean | undefined;
}
import {
  PlatformTypeSchema,
  OperatingSystemSchema,
  RuntimeEnvironmentSchema,
  PlatformCacheConfigSchema,
  PartialPlatformCacheConfigSchema,
  PlatformInfoSchema,
  PlatformCacheEntrySchema,
  WindowPropertyNameSchema,
  TimestampSchema,
} from '../../../../../src/shared/types/validation/platformSchema';

describe('Platform Validation Schemas', () => {
  beforeAll(() => {
    // Set global flag to indicate these are validation schema tests
    // This allows schemas to use full validation even in test environment
    global.__VITEST_VALIDATION_TEST__ = true;
  });

  afterAll(() => {
    // Clean up global flag
    delete global.__VITEST_VALIDATION_TEST__;
  });
  describe('PlatformTypeSchema', () => {
    it('should validate valid platform types', () => {
      expect(PlatformTypeSchema.parse('electron')).toBe('electron');
      expect(PlatformTypeSchema.parse('capacitor')).toBe('capacitor');
      expect(PlatformTypeSchema.parse('web')).toBe('web');
      expect(PlatformTypeSchema.parse('unknown')).toBe('unknown');
    });

    it('should reject invalid platform types', () => {
      expect(() => PlatformTypeSchema.parse('invalid')).toThrow(ZodError);
      expect(() => PlatformTypeSchema.parse('')).toThrow(ZodError);
      expect(() => PlatformTypeSchema.parse(null)).toThrow(ZodError);
      expect(() => PlatformTypeSchema.parse(123)).toThrow(ZodError);
    });

    it('should provide helpful error messages', () => {
      try {
        PlatformTypeSchema.parse('invalid');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        expect((error as ZodError).issues[0].message).toContain('Invalid platform type');
      }
    });
  });

  describe('OperatingSystemSchema', () => {
    it('should validate valid operating systems', () => {
      expect(OperatingSystemSchema.parse('win32')).toBe('win32');
      expect(OperatingSystemSchema.parse('darwin')).toBe('darwin');
      expect(OperatingSystemSchema.parse('linux')).toBe('linux');
      expect(OperatingSystemSchema.parse('ios')).toBe('ios');
      expect(OperatingSystemSchema.parse('android')).toBe('android');
      expect(OperatingSystemSchema.parse('unknown')).toBe('unknown');
    });

    it('should reject invalid operating systems', () => {
      expect(() => OperatingSystemSchema.parse('windows')).toThrow(ZodError);
      expect(() => OperatingSystemSchema.parse('mac')).toThrow(ZodError);
      expect(() => OperatingSystemSchema.parse('')).toThrow(ZodError);
    });
  });

  describe('RuntimeEnvironmentSchema', () => {
    it('should validate valid runtime environments', () => {
      expect(RuntimeEnvironmentSchema.parse('main')).toBe('main');
      expect(RuntimeEnvironmentSchema.parse('renderer')).toBe('renderer');
      expect(RuntimeEnvironmentSchema.parse('native')).toBe('native');
      expect(RuntimeEnvironmentSchema.parse('browser')).toBe('browser');
    });

    it('should reject invalid runtime environments', () => {
      expect(() => RuntimeEnvironmentSchema.parse('node')).toThrow(ZodError);
      expect(() => RuntimeEnvironmentSchema.parse('electron')).toThrow(ZodError);
      expect(() => RuntimeEnvironmentSchema.parse('')).toThrow(ZodError);
    });
  });

  describe('WindowPropertyNameSchema', () => {
    it('should validate safe property names', () => {
      expect(WindowPropertyNameSchema.parse('electronAPI')).toBe('electronAPI');
      expect(WindowPropertyNameSchema.parse('Capacitor')).toBe('Capacitor');
      expect(WindowPropertyNameSchema.parse('myProperty123')).toBe('myProperty123');
      expect(WindowPropertyNameSchema.parse('valid$Property')).toBe('valid$Property');
    });

    it('should reject dangerous property names', () => {
      expect(() => WindowPropertyNameSchema.parse('__proto__')).toThrow(ZodError);
      expect(() => WindowPropertyNameSchema.parse('constructor')).toThrow(ZodError);
      expect(() => WindowPropertyNameSchema.parse('prototype')).toThrow(ZodError);
      expect(() => WindowPropertyNameSchema.parse('valueOf')).toThrow(ZodError);
    });

    it('should reject invalid property names', () => {
      expect(() => WindowPropertyNameSchema.parse('')).toThrow(ZodError);
      expect(() => WindowPropertyNameSchema.parse('   ')).toThrow(ZodError);
      expect(() => WindowPropertyNameSchema.parse('123invalid')).toThrow(ZodError);
      expect(() => WindowPropertyNameSchema.parse('_private')).toThrow(ZodError);
      expect(() => WindowPropertyNameSchema.parse('invalid-name')).toThrow(ZodError);
      expect(() => WindowPropertyNameSchema.parse('invalid.name')).toThrow(ZodError);
    });

    it('should trim whitespace', () => {
      expect(WindowPropertyNameSchema.parse('  electronAPI  ')).toBe('electronAPI');
    });

    it('should enforce length limits', () => {
      const longName = 'a'.repeat(256);
      expect(() => WindowPropertyNameSchema.parse(longName)).toThrow(ZodError);
    });
  });

  describe('TimestampSchema', () => {
    it('should validate valid timestamps', () => {
      const now = Date.now();
      expect(TimestampSchema.parse(now)).toBe(now);
      expect(TimestampSchema.parse(1577836800000)).toBe(1577836800000); // 2020-01-01
    });

    it('should reject invalid timestamps', () => {
      expect(() => TimestampSchema.parse(-1)).toThrow(ZodError);
      expect(() => TimestampSchema.parse(0)).toThrow(ZodError);
      expect(() => TimestampSchema.parse(946684799999)).toThrow(ZodError); // Before 2000
      expect(() => TimestampSchema.parse(1.5)).toThrow(ZodError); // Not integer
      expect(() => TimestampSchema.parse('123')).toThrow(ZodError); // Not number
    });

    it('should reject future timestamps', () => {
      const farFuture = Date.now() + 25 * 60 * 60 * 1000; // 25 hours in future
      expect(() => TimestampSchema.parse(farFuture)).toThrow(ZodError);
    });

    it('should accept near-future timestamps (clock skew tolerance)', () => {
      const nearFuture = Date.now() + 30 * 60 * 1000; // 30 minutes in future
      expect(TimestampSchema.parse(nearFuture)).toBe(nearFuture);
    });
  });

  describe('PlatformCacheConfigSchema', () => {
    it('should validate valid cache configurations', () => {
      const config = {
        cacheDurationMs: 3600000,
        enableDebugLogging: false,
      };
      expect(PlatformCacheConfigSchema.parse(config)).toEqual(config);
    });

    it('should apply defaults for missing values', () => {
      const result = PlatformCacheConfigSchema.parse({});
      expect(result.cacheDurationMs).toBe(3600000); // 1 hour default
      expect(result.enableDebugLogging).toBe(false);
    });

    it('should reject invalid cache durations', () => {
      expect(() =>
        PlatformCacheConfigSchema.parse({
          cacheDurationMs: -1,
          enableDebugLogging: false,
        }),
      ).toThrow(ZodError);

      expect(() =>
        PlatformCacheConfigSchema.parse({
          cacheDurationMs: 999, // Too short
          enableDebugLogging: false,
        }),
      ).toThrow(ZodError);

      expect(() =>
        PlatformCacheConfigSchema.parse({
          cacheDurationMs: 25 * 60 * 60 * 1000, // Too long (25 hours)
          enableDebugLogging: false,
        }),
      ).toThrow(ZodError);
    });

    it('should reject invalid debug logging flags', () => {
      expect(() =>
        PlatformCacheConfigSchema.parse({
          cacheDurationMs: 3600000,
          enableDebugLogging: 'true', // String instead of boolean
        }),
      ).toThrow(ZodError);
    });
  });

  describe('PartialPlatformCacheConfigSchema', () => {
    it('should accept partial configurations', () => {
      expect(PartialPlatformCacheConfigSchema.parse({})).toEqual({});
      expect(
        PartialPlatformCacheConfigSchema.parse({
          cacheDurationMs: 1800000,
        }),
      ).toEqual({ cacheDurationMs: 1800000 });
      expect(
        PartialPlatformCacheConfigSchema.parse({
          enableDebugLogging: true,
        }),
      ).toEqual({ enableDebugLogging: true });
    });
  });

  describe('PlatformInfoSchema', () => {
    const validPlatformInfo = {
      platformType: 'electron' as const,
      detections: {
        isElectron: true,
        isCapacitor: false,
        isWeb: false,
      },
      environment: {
        hasWindow: true,
        hasElectronAPI: true,
        hasCapacitorAPI: false,
        hasNavigator: true,
      },
      timestamp: Date.now(),
    };

    it('should validate consistent platform info', () => {
      expect(PlatformInfoSchema.parse(validPlatformInfo)).toEqual(validPlatformInfo);
    });

    it('should validate web platform info', () => {
      const webPlatformInfo = {
        platformType: 'web' as const,
        detections: {
          isElectron: false,
          isCapacitor: false,
          isWeb: true,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: false,
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };
      expect(PlatformInfoSchema.parse(webPlatformInfo)).toEqual(webPlatformInfo);
    });

    it('should reject inconsistent platform type and detections', () => {
      const inconsistentInfo = {
        ...validPlatformInfo,
        platformType: 'web' as const, // Says web but detections say electron
      };
      expect(() => PlatformInfoSchema.parse(inconsistentInfo)).toThrow(ZodError);
    });

    it('should reject inconsistent environment flags', () => {
      const inconsistentInfo = {
        ...validPlatformInfo,
        environment: {
          hasWindow: true,
          hasElectronAPI: false, // Electron platform should have electronAPI
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
      };
      expect(() => PlatformInfoSchema.parse(inconsistentInfo)).toThrow(ZodError);
    });

    it('should reject multiple positive detections', () => {
      const conflictingInfo = {
        ...validPlatformInfo,
        detections: {
          isElectron: true,
          isCapacitor: true, // Both can't be true
          isWeb: false,
        },
      };
      expect(() => PlatformInfoSchema.parse(conflictingInfo)).toThrow(ZodError);
    });
  });

  describe('PlatformCacheEntrySchema', () => {
    const validCacheEntry = {
      platformType: 'electron' as const,
      platformInfo: {
        platformType: 'electron' as const,
        detections: {
          isElectron: true,
          isCapacitor: false,
          isWeb: false,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: true,
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    it('should validate consistent cache entries', () => {
      expect(PlatformCacheEntrySchema.parse(validCacheEntry)).toEqual(validCacheEntry);
    });

    it('should reject inconsistent platform types', () => {
      const inconsistentEntry = {
        ...validCacheEntry,
        platformType: 'web' as const, // Different from platformInfo
      };
      expect(() => PlatformCacheEntrySchema.parse(inconsistentEntry)).toThrow(ZodError);
    });

    it('should reject timestamps that are too far apart', () => {
      const timestamp = Date.now();
      const oldTimestamp = timestamp - 2000; // 2 seconds difference
      const inconsistentEntry = {
        ...validCacheEntry,
        timestamp,
        platformInfo: {
          ...validCacheEntry.platformInfo,
          timestamp: oldTimestamp,
        },
      };
      expect(() => PlatformCacheEntrySchema.parse(inconsistentEntry)).toThrow(ZodError);
    });
  });
});

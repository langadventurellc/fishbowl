/**
 * Platform Detection Validation Schema Tests
 *
 * Comprehensive test suite for platform detection validation schemas
 * ensuring data integrity, security, and consistency validation.
 */

import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import {
  PlatformDetectionResultSchema,
  PlatformDetectionContextSchema,
  PlatformMethodResultSchema,
  PlatformErrorSchema,
  PlatformErrorTypeSchema,
  RecoveryActionSchema,
  PlatformPerformanceMetricsSchema,
  PlatformCapabilitySchema,
  CapabilityCategorySchema,
  PermissionLevelSchema,
  CapabilityDetectionResultSchema,
  DetectionStatusSchema,
} from '../../../../../src/shared/types/validation/platformSchema';

describe('Platform Detection Result Schema', () => {
  const validResult = {
    platformType: PlatformType.ELECTRON,
    success: true,
    confidence: 95,
    timestamp: Date.now(),
    detectionMethod: 'electronAPI-check',
    metadata: { apiVersion: '1.0.0' },
  };

  it('should validate valid platform detection result', () => {
    expect(() => PlatformDetectionResultSchema.parse(validResult)).not.toThrow();
  });

  it('should reject invalid confidence levels', () => {
    expect(() =>
      PlatformDetectionResultSchema.parse({
        ...validResult,
        confidence: 150,
      }),
    ).toThrow(ZodError);

    expect(() =>
      PlatformDetectionResultSchema.parse({
        ...validResult,
        confidence: -10,
      }),
    ).toThrow(ZodError);
  });

  it('should enforce logical consistency between success and confidence', () => {
    expect(() =>
      PlatformDetectionResultSchema.parse({
        ...validResult,
        success: false,
        confidence: 90,
      }),
    ).toThrow(ZodError);
  });

  it('should validate detection method format', () => {
    expect(() =>
      PlatformDetectionResultSchema.parse({
        ...validResult,
        detectionMethod: 'invalid method!',
      }),
    ).toThrow(ZodError);
  });

  it('should limit metadata size', () => {
    const largeMetadata: Record<string, string> = {};
    for (let i = 0; i < 60; i++) {
      largeMetadata[`key${i}`] = `value${i}`;
    }

    expect(() =>
      PlatformDetectionResultSchema.parse({
        ...validResult,
        metadata: largeMetadata,
      }),
    ).toThrow(ZodError);
  });
});

describe('Platform Detection Context Schema', () => {
  const validContext = {
    hasWindow: true,
    hasDocument: true,
    hasNavigator: true,
    hasElectronAPI: true,
    hasCapacitorAPI: false,
    userAgent: 'Mozilla/5.0 (compatible; Test)',
    navigatorPlatform: 'Win32',
    runtimeProperties: { hasLocalStorage: true },
  };

  it('should validate valid platform detection context', () => {
    expect(() => PlatformDetectionContextSchema.parse(validContext)).not.toThrow();
  });

  it('should enforce logical consistency for window dependencies', () => {
    expect(() =>
      PlatformDetectionContextSchema.parse({
        ...validContext,
        hasWindow: false,
        hasNavigator: true,
      }),
    ).toThrow(ZodError);

    expect(() =>
      PlatformDetectionContextSchema.parse({
        ...validContext,
        hasWindow: false,
        hasDocument: true,
      }),
    ).toThrow(ZodError);
  });

  it('should validate user agent security', () => {
    expect(() =>
      PlatformDetectionContextSchema.parse({
        ...validContext,
        userAgent: 'Mozilla/5.0\nInjection attempt',
      }),
    ).toThrow(ZodError);
  });

  it('should validate navigator platform security', () => {
    expect(() =>
      PlatformDetectionContextSchema.parse({
        ...validContext,
        navigatorPlatform: 'Win32<script>alert(1)</script>',
      }),
    ).toThrow(ZodError);
  });

  it('should limit runtime properties', () => {
    const largeProps: Record<string, boolean> = {};
    for (let i = 0; i < 110; i++) {
      largeProps[`prop${i}`] = true;
    }

    expect(() =>
      PlatformDetectionContextSchema.parse({
        ...validContext,
        runtimeProperties: largeProps,
      }),
    ).toThrow(ZodError);
  });

  it('should validate runtime property names', () => {
    // Test double underscore prefix (using __test__ instead of __proto__ due to JS prototype behavior)
    expect(() =>
      PlatformDetectionContextSchema.parse({
        ...validContext,
        runtimeProperties: { __test__: true },
      }),
    ).toThrow(ZodError);

    expect(() =>
      PlatformDetectionContextSchema.parse({
        ...validContext,
        runtimeProperties: { 'invalid-name!': true },
      }),
    ).toThrow(ZodError);
  });
});

describe('Platform Method Result Schema', () => {
  const validMethodResult = {
    methodName: 'isElectronPlatform',
    result: true,
    confidence: 100,
    executionTime: 0.5,
    evidence: ['window.electronAPI exists'],
    timestamp: Date.now(),
  };

  it('should validate valid method result', () => {
    expect(() => PlatformMethodResultSchema.parse(validMethodResult)).not.toThrow();
  });

  it('should validate method name format', () => {
    expect(() =>
      PlatformMethodResultSchema.parse({
        ...validMethodResult,
        methodName: 'invalid-method-name!',
      }),
    ).toThrow(ZodError);
  });

  it('should validate execution time bounds', () => {
    expect(() =>
      PlatformMethodResultSchema.parse({
        ...validMethodResult,
        executionTime: -1,
      }),
    ).toThrow(ZodError);

    expect(() =>
      PlatformMethodResultSchema.parse({
        ...validMethodResult,
        executionTime: 2000,
      }),
    ).toThrow(ZodError);
  });

  it('should validate evidence format and security', () => {
    expect(() =>
      PlatformMethodResultSchema.parse({
        ...validMethodResult,
        evidence: ['evidence with <script>'],
      }),
    ).toThrow(ZodError);

    expect(() =>
      PlatformMethodResultSchema.parse({
        ...validMethodResult,
        evidence: ['evidence\nwith\nnewlines'],
      }),
    ).toThrow(ZodError);
  });

  it('should enforce high confidence negative results need evidence', () => {
    expect(() =>
      PlatformMethodResultSchema.parse({
        ...validMethodResult,
        result: false,
        confidence: 95,
        evidence: [],
      }),
    ).toThrow(ZodError);
  });

  it('should enforce error conditions have lower confidence', () => {
    expect(() =>
      PlatformMethodResultSchema.parse({
        ...validMethodResult,
        confidence: 90,
        error: 'Some error occurred',
      }),
    ).toThrow(ZodError);
  });
});

describe('Platform Error Schema', () => {
  const validError = {
    type: 'DETECTION_FAILED' as const,
    message: 'Platform detection failed',
    code: 'PLAT_001',
    timestamp: Date.now(),
    severity: 'ERROR' as const,
    recoverable: true,
    suggestions: ['Check environment'],
  };

  it('should validate valid platform error', () => {
    expect(() => PlatformErrorSchema.parse(validError)).not.toThrow();
  });

  it('should enforce critical errors are not recoverable', () => {
    expect(() =>
      PlatformErrorSchema.parse({
        ...validError,
        severity: 'CRITICAL',
        recoverable: true,
      }),
    ).toThrow(ZodError);
  });

  it('should enforce recoverable errors have suggestions', () => {
    expect(() =>
      PlatformErrorSchema.parse({
        ...validError,
        recoverable: true,
        suggestions: [],
      }),
    ).toThrow(ZodError);
  });

  it('should validate error code format', () => {
    expect(() =>
      PlatformErrorSchema.parse({
        ...validError,
        code: 'invalid-code!',
      }),
    ).toThrow(ZodError);
  });

  it('should validate message security', () => {
    expect(() =>
      PlatformErrorSchema.parse({
        ...validError,
        message: 'Error with <script>',
      }),
    ).toThrow(ZodError);
  });
});

describe('Platform Performance Metrics Schema', () => {
  const validMetrics = {
    detectionTime: 0.5,
    cacheHitTime: 0.1,
    cacheMissTime: 2.0,
    totalMemoryUsage: 512,
    cacheMemoryUsage: 256,
    operationCount: 100,
    cacheHitRate: 0.95,
    averageDetectionTime: 0.8,
    maxDetectionTime: 5.0,
    minDetectionTime: 0.05,
  };

  it('should validate valid performance metrics', () => {
    expect(() => PlatformPerformanceMetricsSchema.parse(validMetrics)).not.toThrow();
  });

  it('should enforce cache hit time performance requirement', () => {
    expect(() =>
      PlatformPerformanceMetricsSchema.parse({
        ...validMetrics,
        cacheHitTime: 2.0, // > 1ms limit
      }),
    ).toThrow(ZodError);
  });

  it('should enforce cache memory performance requirement', () => {
    expect(() =>
      PlatformPerformanceMetricsSchema.parse({
        ...validMetrics,
        cacheMemoryUsage: 2048, // > 1KB limit
      }),
    ).toThrow(ZodError);
  });

  it('should enforce logical relationships between metrics', () => {
    // Cache memory should not exceed total memory
    expect(() =>
      PlatformPerformanceMetricsSchema.parse({
        ...validMetrics,
        totalMemoryUsage: 100,
        cacheMemoryUsage: 200,
      }),
    ).toThrow(ZodError);

    // Min should not exceed max
    expect(() =>
      PlatformPerformanceMetricsSchema.parse({
        ...validMetrics,
        minDetectionTime: 10.0,
        maxDetectionTime: 5.0,
      }),
    ).toThrow(ZodError);

    // Average should be between min and max
    expect(() =>
      PlatformPerformanceMetricsSchema.parse({
        ...validMetrics,
        averageDetectionTime: 15.0,
        maxDetectionTime: 10.0,
      }),
    ).toThrow(ZodError);
  });
});

describe('Platform Capability Schema', () => {
  const validCapability = {
    name: 'secure-storage',
    description: 'Access to secure credential storage',
    category: 'STORAGE' as const,
    available: true,
    permissionLevel: 'READ' as const,
    requiresUserConsent: false,
    platformSupport: {
      electron: true,
      web: false,
      capacitor: true,
    },
    version: '1.0.0',
  };

  it('should validate valid platform capability', () => {
    expect(() => PlatformCapabilitySchema.parse(validCapability)).not.toThrow();
  });

  it('should validate capability name format', () => {
    expect(() =>
      PlatformCapabilitySchema.parse({
        ...validCapability,
        name: 'InvalidName!',
      }),
    ).toThrow(ZodError);
  });

  it('should enforce high permission levels require consent', () => {
    expect(() =>
      PlatformCapabilitySchema.parse({
        ...validCapability,
        permissionLevel: 'ADMIN',
        requiresUserConsent: false,
      }),
    ).toThrow(ZodError);
  });

  it('should enforce unavailable capabilities have no platform support', () => {
    expect(() =>
      PlatformCapabilitySchema.parse({
        ...validCapability,
        available: false,
        platformSupport: {
          electron: true,
          web: false,
          capacitor: false,
        },
      }),
    ).toThrow(ZodError);
  });

  it('should validate version format', () => {
    expect(() =>
      PlatformCapabilitySchema.parse({
        ...validCapability,
        version: 'invalid-version',
      }),
    ).toThrow(ZodError);
  });
});

describe('Capability Detection Result Schema', () => {
  const validDetectionResult = {
    capabilityName: 'secure-storage',
    status: 'AVAILABLE' as const,
    available: true,
    permissionGranted: true,
    currentPermissionLevel: 'READ' as const,
    evidence: ['keytar module loaded'],
    detectionTime: 1.5,
    timestamp: Date.now(),
  };

  it('should validate valid capability detection result', () => {
    expect(() => CapabilityDetectionResultSchema.parse(validDetectionResult)).not.toThrow();
  });

  it('should enforce status consistency with availability', () => {
    expect(() =>
      CapabilityDetectionResultSchema.parse({
        ...validDetectionResult,
        status: 'AVAILABLE',
        available: false,
      }),
    ).toThrow(ZodError);

    expect(() =>
      CapabilityDetectionResultSchema.parse({
        ...validDetectionResult,
        status: 'UNAVAILABLE',
        available: true,
      }),
    ).toThrow(ZodError);
  });

  it('should enforce permission denied status consistency', () => {
    expect(() =>
      CapabilityDetectionResultSchema.parse({
        ...validDetectionResult,
        status: 'PERMISSION_DENIED',
        permissionGranted: true,
      }),
    ).toThrow(ZodError);
  });

  it('should require evidence for available capabilities with permissions', () => {
    expect(() =>
      CapabilityDetectionResultSchema.parse({
        ...validDetectionResult,
        available: true,
        permissionGranted: true,
        evidence: [],
      }),
    ).toThrow(ZodError);
  });

  it('should enforce error status for error messages', () => {
    expect(() =>
      CapabilityDetectionResultSchema.parse({
        ...validDetectionResult,
        status: 'AVAILABLE',
        error: 'Some error occurred',
      }),
    ).toThrow(ZodError);
  });
});

describe('Schema Export Validation', () => {
  it('should export all enum schemas', () => {
    expect(PlatformErrorTypeSchema).toBeDefined();
    expect(CapabilityCategorySchema).toBeDefined();
    expect(PermissionLevelSchema).toBeDefined();
    expect(DetectionStatusSchema).toBeDefined();
  });

  it('should export recovery action schema', () => {
    expect(RecoveryActionSchema).toBeDefined();

    const validAction = {
      name: 'retry-detection',
      description: 'Retry the detection operation',
      automated: true,
      priority: 'HIGH' as const,
    };

    expect(() => RecoveryActionSchema.parse(validAction)).not.toThrow();
  });
});

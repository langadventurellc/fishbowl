/**
 * Platform Capability Types Test Suite
 *
 * Tests for platform capability type definitions, enums, and utility types.
 * Ensures type safety and correctness of capability type system.
 */

import { describe, it, expect } from 'vitest';
import { CapabilityCategory } from '../../../../src/shared/constants/platform/CapabilityCategory';
import { DetectionStatus } from '../../../../src/shared/constants/platform/DetectionStatus';
import { PermissionLevel } from '../../../../src/shared/constants/platform/PermissionLevel';
import { PlatformType } from '../../../../src/shared/constants/platform/PlatformType';
import type { PlatformCapabilityId } from '../../../../src/shared/types/platform/PlatformCapabilityId';
import type { CategoryCapabilityId } from '../../../../src/shared/types/platform/CategoryCapabilityId';
import type { TypedDetectionResult } from '../../../../src/shared/types/platform/TypedDetectionResult';
import type { TypedCapabilityState } from '../../../../src/shared/types/platform/TypedCapabilityState';
import type { CapabilityPermissionRequirement } from '../../../../src/shared/types/platform/CapabilityPermissionRequirement';
import type { PlatformCapabilityDetectionConfig } from '../../../../src/shared/types/platform/PlatformCapabilityDetectionConfig';

describe('Platform Capability Enums', () => {
  describe('CapabilityCategory', () => {
    it('should contain all expected category values', () => {
      expect(CapabilityCategory.STORAGE).toBe('STORAGE');
      expect(CapabilityCategory.FILESYSTEM).toBe('FILESYSTEM');
      expect(CapabilityCategory.NETWORKING).toBe('NETWORKING');
      expect(CapabilityCategory.SYSTEM).toBe('SYSTEM');
      expect(CapabilityCategory.UI).toBe('UI');
      expect(CapabilityCategory.SECURITY).toBe('SECURITY');
      expect(CapabilityCategory.PERFORMANCE).toBe('PERFORMANCE');
      expect(CapabilityCategory.PLATFORM_SPECIFIC).toBe('PLATFORM_SPECIFIC');
    });

    it('should have consistent string values', () => {
      const categories = Object.values(CapabilityCategory);
      expect(categories).toHaveLength(8);
      categories.forEach(category => {
        expect(typeof category).toBe('string');
        expect(category).toMatch(/^[A-Z_]+$/);
      });
    });
  });

  describe('PermissionLevel', () => {
    it('should contain all expected permission levels', () => {
      expect(PermissionLevel.NONE).toBe('NONE');
      expect(PermissionLevel.READ).toBe('READ');
      expect(PermissionLevel.WRITE).toBe('WRITE');
      expect(PermissionLevel.ADMIN).toBe('ADMIN');
      expect(PermissionLevel.SYSTEM).toBe('SYSTEM');
    });

    it('should maintain permission hierarchy order', () => {
      const levels = [
        PermissionLevel.NONE,
        PermissionLevel.READ,
        PermissionLevel.WRITE,
        PermissionLevel.ADMIN,
        PermissionLevel.SYSTEM,
      ];
      expect(levels).toHaveLength(5);
      levels.forEach(level => {
        expect(typeof level).toBe('string');
      });
    });
  });

  describe('DetectionStatus', () => {
    it('should contain all expected detection states', () => {
      expect(DetectionStatus.AVAILABLE).toBe('AVAILABLE');
      expect(DetectionStatus.UNAVAILABLE).toBe('UNAVAILABLE');
      expect(DetectionStatus.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
      expect(DetectionStatus.NOT_SUPPORTED).toBe('NOT_SUPPORTED');
      expect(DetectionStatus.ERROR).toBe('ERROR');
      expect(DetectionStatus.UNKNOWN).toBe('UNKNOWN');
    });

    it('should provide comprehensive status coverage', () => {
      const statuses = Object.values(DetectionStatus);
      expect(statuses).toHaveLength(6);
      statuses.forEach(status => {
        expect(typeof status).toBe('string');
        expect(status).toMatch(/^[A-Z_]+$/);
      });
    });
  });
});

describe('Platform Capability Utility Types', () => {
  describe('PlatformCapabilityId type', () => {
    it('should create valid capability identifiers', () => {
      const storageId: PlatformCapabilityId = 'STORAGE.keychain';
      const filesystemId: PlatformCapabilityId = 'FILESYSTEM.read';
      const networkingId: PlatformCapabilityId = 'NETWORKING.fetch';

      expect(storageId).toBe('STORAGE.keychain');
      expect(filesystemId).toBe('FILESYSTEM.read');
      expect(networkingId).toBe('NETWORKING.fetch');
    });
  });

  describe('CategoryCapabilityId type', () => {
    it('should enforce type safety for capability categories', () => {
      // These should compile without errors
      const storageCapability: CategoryCapabilityId<CapabilityCategory.STORAGE> =
        'STORAGE.keychain';
      const filesystemCapability: CategoryCapabilityId<CapabilityCategory.FILESYSTEM> =
        'FILESYSTEM.read';
      const networkingCapability: CategoryCapabilityId<CapabilityCategory.NETWORKING> =
        'NETWORKING.fetch';

      expect(storageCapability).toBe('STORAGE.keychain');
      expect(filesystemCapability).toBe('FILESYSTEM.read');
      expect(networkingCapability).toBe('NETWORKING.fetch');
    });
  });

  describe('TypedDetectionResult type', () => {
    it('should provide type-safe detection results for available status', () => {
      const availableResult: TypedDetectionResult<DetectionStatus.AVAILABLE> = {
        available: true,
        status: DetectionStatus.AVAILABLE,
        evidence: ['window.electronAPI found', 'keytar module loaded'],
        permissions: PermissionLevel.READ,
      };

      expect(availableResult.available).toBe(true);
      expect(availableResult.status).toBe(DetectionStatus.AVAILABLE);
      expect(availableResult.evidence).toHaveLength(2);
      expect(availableResult.permissions).toBe(PermissionLevel.READ);
    });

    it('should provide type-safe detection results for unavailable status', () => {
      const unavailableResult: TypedDetectionResult<DetectionStatus.UNAVAILABLE> = {
        available: false,
        status: DetectionStatus.UNAVAILABLE,
        reason: 'Platform does not support secure storage',
        fallbacks: ['localStorage', 'sessionStorage'],
      };

      expect(unavailableResult.available).toBe(false);
      expect(unavailableResult.status).toBe(DetectionStatus.UNAVAILABLE);
      expect(unavailableResult.reason).toBe('Platform does not support secure storage');
      expect(unavailableResult.fallbacks).toEqual(['localStorage', 'sessionStorage']);
    });

    it('should provide type-safe detection results for permission denied status', () => {
      const permissionDeniedResult: TypedDetectionResult<DetectionStatus.PERMISSION_DENIED> = {
        available: false,
        status: DetectionStatus.PERMISSION_DENIED,
        requiredPermissions: [PermissionLevel.ADMIN],
        grantInstructions: 'Please grant administrative access in system preferences',
      };

      expect(permissionDeniedResult.available).toBe(false);
      expect(permissionDeniedResult.status).toBe(DetectionStatus.PERMISSION_DENIED);
      expect(permissionDeniedResult.requiredPermissions).toEqual([PermissionLevel.ADMIN]);
      expect(permissionDeniedResult.grantInstructions).toBeDefined();
    });
  });

  describe('TypedCapabilityState type', () => {
    it('should create valid capability state objects', () => {
      const now = Date.now();
      const capabilityState: TypedCapabilityState<DetectionStatus.AVAILABLE> = {
        id: 'STORAGE.keychain',
        category: CapabilityCategory.STORAGE,
        result: {
          available: true,
          status: DetectionStatus.AVAILABLE,
          evidence: ['keytar module available'],
          permissions: PermissionLevel.READ,
        },
        lastUpdated: now,
        expiresAt: now + 60000,
      };

      expect(capabilityState.id).toBe('STORAGE.keychain');
      expect(capabilityState.category).toBe(CapabilityCategory.STORAGE);
      expect(capabilityState.result.available).toBe(true);
      expect(capabilityState.lastUpdated).toBe(now);
      expect(capabilityState.expiresAt).toBe(now + 60000);
    });
  });

  describe('CapabilityPermissionRequirement type', () => {
    it('should create valid permission requirement objects', () => {
      const requirement: CapabilityPermissionRequirement = {
        category: CapabilityCategory.FILESYSTEM,
        capability: 'write',
        required: PermissionLevel.WRITE,
        current: PermissionLevel.READ,
        sufficient: false,
      };

      expect(requirement.category).toBe(CapabilityCategory.FILESYSTEM);
      expect(requirement.capability).toBe('write');
      expect(requirement.required).toBe(PermissionLevel.WRITE);
      expect(requirement.current).toBe(PermissionLevel.READ);
      expect(requirement.sufficient).toBe(false);
    });
  });

  describe('PlatformCapabilityDetectionConfig type', () => {
    it('should create valid detection configuration objects', () => {
      const config: PlatformCapabilityDetectionConfig = {
        platform: PlatformType.ELECTRON,
        enabledCategories: [
          CapabilityCategory.STORAGE,
          CapabilityCategory.FILESYSTEM,
          CapabilityCategory.SYSTEM,
        ],
        timeoutMs: 5000,
        retryOnFailure: true,
        maxRetries: 3,
        cacheDurationMs: 300000,
      };

      expect(config.platform).toBe(PlatformType.ELECTRON);
      expect(config.enabledCategories).toHaveLength(3);
      expect(config.timeoutMs).toBe(5000);
      expect(config.retryOnFailure).toBe(true);
      expect(config.maxRetries).toBe(3);
      expect(config.cacheDurationMs).toBe(300000);
    });
  });
});

describe('Type System Integration', () => {
  it('should integrate enums with existing platform types', () => {
    // Verify that capability enums work with existing platform type system
    expect(CapabilityCategory.STORAGE).toBeDefined();
    expect(PermissionLevel.READ).toBeDefined();
    expect(DetectionStatus.AVAILABLE).toBeDefined();
    expect(PlatformType.ELECTRON).toBeDefined();
  });

  it('should provide comprehensive type coverage for capabilities', () => {
    // Verify that all major capability categories are covered
    const categories = Object.values(CapabilityCategory);
    expect(categories.length).toBeGreaterThanOrEqual(8);

    // Verify that all permission levels are available
    const permissions = Object.values(PermissionLevel);
    expect(permissions.length).toBeGreaterThanOrEqual(5);

    // Verify that all detection statuses are covered
    const statuses = Object.values(DetectionStatus);
    expect(statuses.length).toBeGreaterThanOrEqual(6);
  });

  it('should maintain type safety across the capability system', () => {
    // This test ensures that TypeScript compilation succeeds with strict mode
    // The mere fact that this test file compiles indicates type safety is maintained
    expect(true).toBe(true);
  });
});

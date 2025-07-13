import { PlatformType } from '../../../../constants/platform/PlatformType';
import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import type { DegradationMapping } from './DegradationMapping';

/**
 * Predefined degradation mappings for common platform capabilities.
 * These mappings define how capabilities should gracefully degrade when unavailable
 * to maintain application functionality with reduced features.
 */
export const gracefulDegradationMappings: DegradationMapping[] = [
  // Secure Storage degradation mappings
  {
    capabilityId: 'storage.secure' as PlatformCapabilityId,
    supportedPlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
    degradedFeatures: {
      storageType: 'localStorage',
      encryption: false,
      securityLevel: 'basic',
      persistenceGuarantee: false,
      maxStorageSize: '5MB',
      warningRequired: true,
    },
    description: 'Use localStorage with warning about reduced security',
    impactLevel: 'high',
    productionSafe: false,
  },

  // File System Access degradation mappings
  {
    capabilityId: 'filesystem.read' as PlatformCapabilityId,
    supportedPlatforms: [PlatformType.WEB],
    degradedFeatures: {
      accessMethod: 'file-input',
      multipleFiles: false,
      directoryAccess: false,
      watchCapability: false,
      maxFileSize: '10MB',
    },
    description: 'Use HTML file input for limited file access',
    impactLevel: 'medium',
    productionSafe: true,
  },

  {
    capabilityId: 'filesystem.write' as PlatformCapabilityId,
    supportedPlatforms: [PlatformType.WEB],
    degradedFeatures: {
      accessMethod: 'download-link',
      atomicWrites: false,
      directoryCreation: false,
      backupSupport: false,
      progressTracking: false,
    },
    description: 'Use download links for file saving',
    impactLevel: 'medium',
    productionSafe: true,
  },

  // Network capabilities degradation
  {
    capabilityId: 'networking.offline' as PlatformCapabilityId,
    supportedPlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
    degradedFeatures: {
      offlineMode: false,
      cacheStrategy: 'none',
      syncCapability: false,
      queuedRequests: false,
      statusIndicator: 'connection-required',
    },
    description: 'Disable offline functionality and require active connection',
    impactLevel: 'medium',
    productionSafe: true,
  },

  // System capabilities degradation
  {
    capabilityId: 'system.notifications' as PlatformCapabilityId,
    supportedPlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
    degradedFeatures: {
      notificationType: 'in-app-banner',
      persistentNotifications: false,
      soundNotifications: false,
      badgeSupport: false,
      interactiveNotifications: false,
    },
    description: 'Use in-app banner notifications instead of system notifications',
    impactLevel: 'low',
    productionSafe: true,
  },

  // UI capabilities degradation
  {
    capabilityId: 'ui.window-controls' as PlatformCapabilityId,
    supportedPlatforms: [PlatformType.WEB],
    degradedFeatures: {
      windowResizing: false,
      windowMinimize: false,
      windowMaximize: false,
      customTitleBar: false,
      multiWindowSupport: false,
    },
    description: 'Use browser default window controls',
    impactLevel: 'low',
    productionSafe: true,
  },

  // Performance capabilities degradation
  {
    capabilityId: 'performance.background-tasks' as PlatformCapabilityId,
    supportedPlatforms: [PlatformType.WEB, PlatformType.CAPACITOR],
    degradedFeatures: {
      backgroundProcessing: false,
      taskScheduling: 'foreground-only',
      resourceIntensiveTasks: false,
      batchProcessing: false,
      progressiveExecution: true,
    },
    description: 'Execute tasks only when application is in foreground',
    impactLevel: 'medium',
    productionSafe: true,
  },
];

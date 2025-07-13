/**
 * File System Capability Detector
 *
 * Detects file system access capabilities across different platforms:
 * - Electron: Node.js file system access via IPC
 * - Web: File System Access API and Origin Private File System (OPFS)
 * - Capacitor: Filesystem plugin for mobile platforms
 * - Unknown: No file system access support
 *
 * Provides comprehensive file system capability detection following established patterns.
 */

import { PLATFORM_CAPABILITIES } from '../../../constants/platform/PLATFORM_CAPABILITIES';
import { PlatformType } from '../../../constants/platform/PlatformType';
import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';
import { PlatformCapability } from '../../../types/platform/PlatformCapability';
import { detectPlatformType } from '../detectPlatformType';
import { hasWindow } from '../hasWindow';
import { hasWindowProperty } from '../hasWindowProperty';
import { BaseCapabilityDetector } from './BaseCapabilityDetector';

/**
 * File System Capability Detector
 *
 * Detects availability of file system access capabilities across platforms.
 * Supports read, write, delete, and watch operations where available.
 */
export class FileSystemCapabilityDetector extends BaseCapabilityDetector {
  constructor() {
    super('FileSystemCapabilityDetector', [PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS]);
  }

  /**
   * Perform platform-specific file system capability detection
   */
  protected performDetection(
    capability: PlatformCapability,
  ): Promise<Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'>> {
    const platformType = detectPlatformType();

    switch (platformType) {
      case PlatformType.ELECTRON:
        return Promise.resolve(this.detectElectronFileSystemCapability(capability));

      case PlatformType.WEB:
        return Promise.resolve(this.detectWebFileSystemCapability(capability));

      case PlatformType.CAPACITOR:
        return Promise.resolve(this.detectCapacitorFileSystemCapability(capability));

      case PlatformType.UNKNOWN:
      default:
        return Promise.resolve(
          this.createFailureResult(
            capability,
            'File system access not supported on unknown platform',
            [
              'Use a supported platform (Electron, Web, or Capacitor)',
              'Consider using platform-specific storage APIs',
            ],
          ),
        );
    }
  }

  /**
   * Detect Electron file system capability via IPC
   */
  private detectElectronFileSystemCapability(
    capability: PlatformCapability,
  ): Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'> {
    if (!hasWindow()) {
      return this.createFailureResult(
        capability,
        'Window object not available in Electron context',
        ['Ensure running in Electron renderer process'],
      );
    }

    if (!hasWindowProperty('electronAPI')) {
      return this.createFailureResult(capability, 'Electron API not exposed to renderer process', [
        'Configure context bridge to expose file system APIs',
      ]);
    }

    // Check if electronAPI has file system operations
    // Note: This assumes file system IPC methods would be exposed when implemented
    const windowObj = (globalThis as unknown as { window: Record<string, unknown> })
      .window as unknown as Record<string, unknown> | undefined;
    const electronAPI = windowObj?.electronAPI as Record<string, unknown> | undefined;

    if (!electronAPI) {
      return this.createFailureResult(capability, 'Electron API object not accessible', [
        'Verify preload script configuration',
      ]);
    }

    // In the current implementation, file system IPC operations are not yet exposed
    // This detector prepares for future file system IPC implementation
    const hasFileSystemMethods = Boolean(
      electronAPI.readFile ??
        electronAPI.writeFile ??
        electronAPI.deleteFile ??
        electronAPI.watchFile ??
        electronAPI.filesystem,
    );

    if (hasFileSystemMethods) {
      return this.createSuccessResult(capability, [
        'Electron file system API available via IPC',
        'Platform: Electron',
        'Access method: IPC',
        'Security context: sandboxed renderer process',
      ]);
    }

    return this.createFailureResult(
      capability,
      'File system operations not exposed in Electron IPC',
      [
        'Implement file system IPC handlers in main process',
        'Expose file system methods via context bridge',
      ],
    );
  }

  /**
   * Detect Web file system capability (File System Access API and OPFS)
   */
  private detectWebFileSystemCapability(
    capability: PlatformCapability,
  ): Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'> {
    if (!hasWindow()) {
      return this.createFailureResult(capability, 'Window object not available in web context', [
        'Ensure running in browser environment',
      ]);
    }

    const windowObj = (globalThis as unknown as { window: Record<string, unknown> })
      .window as unknown as Record<string, unknown> | undefined;
    const navigatorObj = (globalThis as unknown as { navigator: Record<string, unknown> })
      .navigator as unknown as Record<string, unknown> | undefined;

    const hasFileSystemAccessAPI = Boolean(
      windowObj?.showOpenFilePicker && windowObj?.showSaveFilePicker,
    );

    const storageObj = navigatorObj?.storage as Record<string, unknown> | undefined;
    const hasOPFS = Boolean(storageObj?.getDirectory);

    if (hasFileSystemAccessAPI || hasOPFS) {
      const evidence: string[] = ['Web file system APIs available', 'Platform: Web'];

      if (hasFileSystemAccessAPI) {
        evidence.push('File System Access API available');
        evidence.push('Operations: read, write');
      }

      if (hasOPFS) {
        evidence.push('Origin Private File System (OPFS) available');
        evidence.push('Operations: read, write, delete');
        evidence.push('Performance: high-performance OPFS available');
      }

      return this.createSuccessResult(capability, evidence);
    }

    return this.createFailureResult(capability, 'No web file system APIs available', [
      'Use modern browser with File System Access API support',
      'Consider alternative storage APIs like IndexedDB',
    ]);
  }

  /**
   * Detect Capacitor file system capability via Filesystem plugin
   */
  private detectCapacitorFileSystemCapability(
    capability: PlatformCapability,
  ): Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'> {
    if (!hasWindow()) {
      return this.createFailureResult(
        capability,
        'Window object not available in Capacitor context',
        ['Ensure running in Capacitor environment'],
      );
    }

    if (!hasWindowProperty('Capacitor')) {
      return this.createFailureResult(capability, 'Capacitor not available in current context', [
        'Ensure running in Capacitor mobile app environment',
      ]);
    }

    const windowObj = (globalThis as unknown as { window: Record<string, unknown> })
      .window as unknown as Record<string, unknown> | undefined;
    const capacitor = windowObj?.Capacitor as Record<string, unknown> | undefined;

    if (!capacitor) {
      return this.createFailureResult(capability, 'Capacitor object not accessible', [
        'Verify Capacitor initialization',
      ]);
    }

    // Check for Filesystem plugin availability
    const pluginsObj = capacitor.Plugins as Record<string, unknown> | undefined;
    const isPluginAvailableFn = capacitor.isPluginAvailable as
      | ((plugin: string) => boolean)
      | undefined;

    const hasFilesystemPlugin = Boolean(
      pluginsObj?.Filesystem ?? isPluginAvailableFn?.('Filesystem'),
    );

    if (hasFilesystemPlugin) {
      const pluginVersion =
        ((pluginsObj?.Filesystem as Record<string, unknown>)?.version as string) ?? 'unknown';

      return this.createSuccessResult(capability, [
        'Capacitor Filesystem plugin available',
        'Platform: Capacitor',
        'Operations: read, write, delete',
        'Access method: Capacitor Filesystem Plugin',
        'Security context: mobile app sandboxed access',
        `Plugin version: ${pluginVersion}`,
      ]);
    }

    return this.createFailureResult(capability, 'Capacitor Filesystem plugin not available', [
      'Install and configure @capacitor/filesystem plugin',
    ]);
  }
}

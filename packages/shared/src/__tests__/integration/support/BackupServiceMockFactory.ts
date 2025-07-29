/**
 * @fileoverview Backup Service Mock Factory
 *
 * Mock factory for backup service following established patterns in the project.
 * Creates mocked instances that simulate backup lifecycle operations.
 */

import type {
  BackupService,
  BackupMetadata,
  RestoreOptions,
} from "../../../types/services";
import type { ConfigurationData } from "../utilities/TemporaryDirectoryManager";

/**
 * Configuration for service mock responses
 */
interface ServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  returnValue?: unknown;
  latency?: number;
}

/**
 * Backup Service Mock Factory
 * Creates mocked backup service instances with configurable behavior
 */
export class BackupServiceMockFactory {
  private static defaultConfig: ServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
  };

  static create(config: ServiceMockConfig = {}): jest.Mocked<BackupService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    const simulateOperation = async <T>(operation: () => T): Promise<T> => {
      // Simulate network latency
      if (mergedConfig.latency && mergedConfig.latency > 0) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, mergedConfig.latency),
        );
      }

      // Simulate failures
      if (!mergedConfig.shouldSucceed) {
        throw new Error(
          mergedConfig.errorMessage ?? "Backup service operation failed",
        );
      }

      return operation();
    };

    const createMockBackupMetadata = (
      filePath: string,
      reason = "backup",
    ): BackupMetadata => ({
      id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filePath,
      createdAt: new Date().toISOString(),
      size: 1024,
      checksum: `checksum-${filePath.replace(/[^a-zA-Z0-9]/g, "-")}`,
      version: "1.0",
      reason,
      retentionDays: 30,
    });

    return {
      createBackup: jest
        .fn()
        .mockImplementation(
          async (
            filePath: string,
            metadata?: BackupMetadata,
          ): Promise<string> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue) {
                return mergedConfig.returnValue as string;
              }
              const backupId = metadata?.id ?? `backup-${Date.now()}`;
              return backupId;
            });
          },
        ),

      listBackups: jest
        .fn()
        .mockImplementation(
          async (filePath: string): Promise<BackupMetadata[]> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue) {
                return mergedConfig.returnValue as BackupMetadata[];
              }
              const backups = [
                createMockBackupMetadata(filePath, "initial"),
                createMockBackupMetadata(filePath, "pre-update"),
              ];
              return backups;
            });
          },
        ),

      restoreFromBackup: jest
        .fn()
        .mockImplementation(
          async (
            _backupId: string,
            _targetPath: string,
            _options?: RestoreOptions,
          ): Promise<boolean> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue !== undefined) {
                return mergedConfig.returnValue as boolean;
              }
              return true;
            });
          },
        ),

      getBackupContent: jest
        .fn()
        .mockImplementation(
          async (_backupId: string): Promise<ConfigurationData> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue) {
                return mergedConfig.returnValue as ConfigurationData;
              }
              const mockData: ConfigurationData = {
                version: "1.0",
                format: "json",
                encoding: "utf-8",
                metadata: {
                  createdAt: new Date().toISOString(),
                  createdBy: "backup-system",
                  description: "Restored from backup",
                  operation: "restore",
                },
                data: {
                  agents: [],
                  personalities: [],
                  roles: [],
                },
              };
              return mockData;
            });
          },
        ),

      deleteBackup: jest
        .fn()
        .mockImplementation(async (_backupId: string): Promise<boolean> => {
          return simulateOperation(() => {
            if (mergedConfig.returnValue !== undefined) {
              return mergedConfig.returnValue as boolean;
            }
            return true;
          });
        }),

      cleanupOldBackups: jest
        .fn()
        .mockImplementation(
          async (
            _filePath: string,
            _retentionDays?: number,
          ): Promise<number> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue !== undefined) {
                return mergedConfig.returnValue as number;
              }
              return 2; // Mock cleanup of 2 old backups
            });
          },
        ),

      verifyBackupIntegrity: jest
        .fn()
        .mockImplementation(async (_backupId: string): Promise<boolean> => {
          return simulateOperation(() => {
            if (mergedConfig.returnValue !== undefined) {
              return mergedConfig.returnValue as boolean;
            }
            return true;
          });
        }),
    } as jest.Mocked<BackupService>;
  }

  static createSuccess(returnValue?: unknown) {
    return this.create({ shouldSucceed: true, returnValue });
  }

  static createFailure(errorMessage: string) {
    return this.create({ shouldSucceed: false, errorMessage });
  }

  static createWithLatency(latency: number) {
    return this.create({ shouldSucceed: true, latency });
  }
}

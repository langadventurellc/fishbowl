/**
 * @fileoverview File Service Mock Factory
 *
 * Mock factory for file service following established patterns in the project.
 * Creates mocked instances that simulate file lifecycle operations.
 */

import type {
  FileService,
  FileCreateOptions,
  FileUpdateOptions,
  FileDeleteOptions,
  FileOperationResult,
  FileMetadata,
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
 * File Service Mock Factory
 * Creates mocked file service instances with configurable behavior
 */
export class FileServiceMockFactory {
  private static defaultConfig: ServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
  };

  static create(config: ServiceMockConfig = {}): jest.Mocked<FileService> {
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
          mergedConfig.errorMessage ?? "File service operation failed",
        );
      }

      return operation();
    };

    const createMockMetadata = (path: string): FileMetadata => ({
      size: 1024,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      permissions: "644",
      checksum: `checksum-${path.replace(/[^a-zA-Z0-9]/g, "-")}`,
      version: "1.0",
    });

    return {
      createFile: jest
        .fn()
        .mockImplementation(
          async (
            path: string,
            _data: ConfigurationData,
            _options?: FileCreateOptions,
          ): Promise<FileOperationResult> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue) {
                return mergedConfig.returnValue as FileOperationResult;
              }
              const result: FileOperationResult = {
                success: true,
                path,
                operation: "create",
                timestamp: new Date().toISOString(),
              };
              return result;
            });
          },
        ),

      updateFile: jest
        .fn()
        .mockImplementation(
          async (
            path: string,
            _data: ConfigurationData,
            _options?: FileUpdateOptions,
          ): Promise<FileOperationResult> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue) {
                return mergedConfig.returnValue as FileOperationResult;
              }
              const result: FileOperationResult = {
                success: true,
                path,
                operation: "update",
                timestamp: new Date().toISOString(),
                backupCreated: _options?.createBackup ?? false,
              };
              return result;
            });
          },
        ),

      deleteFile: jest
        .fn()
        .mockImplementation(
          async (
            path: string,
            _options?: FileDeleteOptions,
          ): Promise<FileOperationResult> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue) {
                return mergedConfig.returnValue as FileOperationResult;
              }
              const result: FileOperationResult = {
                success: true,
                path,
                operation: "delete",
                timestamp: new Date().toISOString(),
              };
              return result;
            });
          },
        ),

      readFile: jest
        .fn()
        .mockImplementation(
          async (path: string): Promise<ConfigurationData> => {
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
                  createdBy: "test-user",
                  lastModified: new Date().toISOString(),
                  description: `Mock configuration from ${path}`,
                  operation: "read",
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

      exists: jest
        .fn()
        .mockImplementation(async (path: string): Promise<boolean> => {
          return simulateOperation(() => {
            if (mergedConfig.returnValue !== undefined) {
              return mergedConfig.returnValue as boolean;
            }
            if (path.includes("non-existent")) return false;
            return true;
          });
        }),

      getMetadata: jest
        .fn()
        .mockImplementation(async (path: string): Promise<FileMetadata> => {
          return simulateOperation(() => {
            if (mergedConfig.returnValue) {
              return mergedConfig.returnValue as FileMetadata;
            }
            const metadata = createMockMetadata(path);
            return metadata;
          });
        }),

      setPermissions: jest
        .fn()
        .mockImplementation(
          async (_path: string, _permissions: string): Promise<void> => {
            return simulateOperation(() => {
              // Mock successful permission setting
            });
          },
        ),

      validateFileIntegrity: jest.fn().mockImplementation(
        async (
          path: string,
        ): Promise<{
          isValid: boolean;
          errors: string[];
          checksum?: string;
        }> => {
          return simulateOperation(() => {
            if (mergedConfig.returnValue) {
              return mergedConfig.returnValue as {
                isValid: boolean;
                errors: string[];
                checksum?: string;
              };
            }
            const result = {
              isValid: true,
              errors: [],
              checksum: `checksum-${path.replace(/[^a-zA-Z0-9]/g, "-")}`,
            };
            return result;
          });
        },
      ),
    } as jest.Mocked<FileService>;
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

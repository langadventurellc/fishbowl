/**
 * @fileoverview File Validation Service Mock Factory
 *
 * Enhanced mock factory for file validation integration tests,
 * providing file format validation, atomic operations, and
 * error context preservation capabilities.
 */

import type { ValidationResult } from "../../../types/role";

/**
 * Enhanced File Service interface for validation integration tests
 */
export interface FileValidationService {
  // Basic file operations
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  listFiles(directory: string): Promise<string[]>;
  createDirectory(path: string): Promise<void>;

  // Validation-specific operations
  validateFileFormat(path: string): Promise<ValidationResult>;
  readConfigurationFile(path: string): Promise<unknown>;
  saveConfigurationFile(path: string, config: unknown): Promise<void>;
  validateAndPrepareForSave(config: unknown): Promise<{
    isValid: boolean;
    errors: Array<{
      field: string;
      message: string;
      code: string;
      context?: unknown;
    }>;
  }>;

  // Atomic operations
  createAtomicWrite(path: string, content: string): Promise<string>;
  rollback(): Promise<void>;
}

/**
 * Configuration for file validation service mock
 */
interface FileValidationMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  latency?: number;
  validationErrors?: Array<{ field: string; message: string; code: string }>;
  simulateFormatError?: boolean;
  simulateAtomicFailure?: boolean;
  preserveErrorContext?: boolean;
}

/**
 * Mock factory for FileValidationService with comprehensive validation scenarios
 */
export class FileValidationServiceMockFactory {
  private static defaultConfig: FileValidationMockConfig = {
    shouldSucceed: true,
    latency: 5,
    simulateFormatError: false,
    simulateAtomicFailure: false,
    preserveErrorContext: true,
  };

  /**
   * Create successful file validation service mock
   */
  static createSuccess(): jest.Mocked<FileValidationService> {
    return this.createWithConfig({
      shouldSucceed: true,
    });
  }

  /**
   * Create file validation service mock with validation failures
   */
  static createValidationFailure(
    errors: Array<{ field: string; message: string; code: string }>,
  ): jest.Mocked<FileValidationService> {
    return this.createWithConfig({
      shouldSucceed: false,
      validationErrors: errors,
      errorMessage: "Validation failed",
    });
  }

  /**
   * Create file validation service mock with format errors
   */
  static createFormatError(): jest.Mocked<FileValidationService> {
    return this.createWithConfig({
      shouldSucceed: false,
      simulateFormatError: true,
      errorMessage: "Invalid JSON format",
    });
  }

  /**
   * Create file validation service mock with atomic operation failures
   */
  static createAtomicFailure(): jest.Mocked<FileValidationService> {
    return this.createWithConfig({
      shouldSucceed: false,
      simulateAtomicFailure: true,
      errorMessage: "Atomic operation failed during commit",
    });
  }

  /**
   * Create file validation service mock with configurable behavior
   */
  static createWithConfig(
    config: FileValidationMockConfig = {},
  ): jest.Mocked<FileValidationService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    const simulateOperation = async <T>(
      operation: () => T,
      context?: { filePath?: string; operation?: string },
    ): Promise<T> => {
      if (mergedConfig.latency && mergedConfig.latency > 0) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, mergedConfig.latency),
        );
      }

      if (!mergedConfig.shouldSucceed) {
        const error = new Error(
          mergedConfig.errorMessage ?? "Operation failed",
        ) as Error & {
          context?: unknown;
        };

        if (mergedConfig.preserveErrorContext && context) {
          error.context = {
            ...context,
            validationErrors: mergedConfig.validationErrors,
          };
        }

        throw error;
      }

      return operation();
    };

    return {
      // Basic file operations
      readFile: jest.fn().mockImplementation(async (path: string) => {
        return simulateOperation(
          () => '{"id": "mock-config", "name": "Mock Configuration"}',
          { filePath: path, operation: "read" },
        );
      }),

      writeFile: jest
        .fn()
        .mockImplementation(async (path: string, _content: string) => {
          return simulateOperation(() => undefined, {
            filePath: path,
            operation: "write",
          });
        }),

      exists: jest.fn().mockImplementation(async (path: string) => {
        return simulateOperation(() => true, {
          filePath: path,
          operation: "exists",
        });
      }),

      listFiles: jest.fn().mockImplementation(async (directory: string) => {
        return simulateOperation(() => ["config.json"], {
          filePath: directory,
          operation: "list",
        });
      }),

      createDirectory: jest.fn().mockImplementation(async (path: string) => {
        return simulateOperation(() => undefined, {
          filePath: path,
          operation: "createDirectory",
        });
      }),

      // Validation-specific operations
      validateFileFormat: jest.fn().mockImplementation(async (path: string) => {
        if (mergedConfig.simulateFormatError) {
          return simulateOperation(
            () => ({
              isValid: false,
              errors: [
                {
                  field: "format",
                  message: "Invalid JSON format",
                  code: "FORMAT_ERROR",
                },
              ],
            }),
            { filePath: path, operation: "validateFormat" },
          );
        }

        return simulateOperation(() => ({ isValid: true, errors: [] }), {
          filePath: path,
          operation: "validateFormat",
        });
      }),

      readConfigurationFile: jest
        .fn()
        .mockImplementation(async (path: string) => {
          if (mergedConfig.simulateFormatError) {
            const error = new Error("Invalid JSON format") as Error & {
              context?: unknown;
            };
            error.context = { filePath: path, operation: "readConfiguration" };
            throw error;
          }

          return simulateOperation(
            () => ({ id: "mock-config", name: "Mock Configuration" }),
            { filePath: path, operation: "readConfiguration" },
          );
        }),

      saveConfigurationFile: jest
        .fn()
        .mockImplementation(async (path: string, _config: unknown) => {
          return simulateOperation(() => undefined, {
            filePath: path,
            operation: "saveConfiguration",
          });
        }),

      validateAndPrepareForSave: jest
        .fn()
        .mockImplementation(async (_config: unknown) => {
          return simulateOperation(() => ({
            isValid: mergedConfig.shouldSucceed ?? true,
            errors: mergedConfig.shouldSucceed
              ? []
              : (mergedConfig.validationErrors ?? [
                  {
                    field: "config",
                    message: "Validation failed",
                    code: "VALIDATION_ERROR",
                  },
                ]),
          }));
        }),

      // Atomic operations
      createAtomicWrite: jest
        .fn()
        .mockImplementation(async (path: string, _content: string) => {
          if (mergedConfig.simulateAtomicFailure) {
            const error = new Error(
              "Atomic operation failed during commit",
            ) as Error & { context?: unknown };
            error.context = {
              filePath: path,
              operation: "atomicWrite",
              stage: "commit",
            };
            throw error;
          }

          return simulateOperation(() => path, {
            filePath: path,
            operation: "atomicWrite",
          });
        }),

      rollback: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => undefined, { operation: "rollback" });
      }),
    };
  }
}

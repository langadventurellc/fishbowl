/**
 * @fileoverview Dependency Service Mock Factory
 *
 * Mock factory for dependency service following established patterns in the project.
 * Creates mocked instances that simulate dependency management operations.
 */

import type {
  DependencyService,
  DependencyCheckResult,
  DependencyInfo,
} from "../../../types/services";

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
 * Dependency Service Mock Factory
 * Creates mocked dependency service instances with configurable behavior
 */
export class DependencyServiceMockFactory {
  private static defaultConfig: ServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
  };

  static create(
    config: ServiceMockConfig = {},
  ): jest.Mocked<DependencyService> {
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
          mergedConfig.errorMessage ?? "Dependency service operation failed",
        );
      }

      return operation();
    };

    return {
      checkDependencies: jest
        .fn()
        .mockImplementation(
          async (filePath: string): Promise<DependencyCheckResult> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue) {
                return mergedConfig.returnValue as DependencyCheckResult;
              }
              const result: DependencyCheckResult = {
                canDelete: !filePath.includes("has-dependencies"),
                dependentFiles: filePath.includes("has-dependencies")
                  ? [`dependent-of-${filePath}`]
                  : [],
                blockingDependencies: filePath.includes("has-dependencies")
                  ? [`blocking-${filePath}`]
                  : [],
                warnings: [],
                errors: [],
              };
              return result;
            });
          },
        ),

      getDependentFiles: jest
        .fn()
        .mockImplementation(async (filePath: string): Promise<string[]> => {
          return simulateOperation(() => {
            if (mergedConfig.returnValue) {
              return mergedConfig.returnValue as string[];
            }
            return filePath.includes("has-dependents")
              ? [`dependent-${filePath}-1`, `dependent-${filePath}-2`]
              : [];
          });
        }),

      getDependencies: jest
        .fn()
        .mockImplementation(async (filePath: string): Promise<string[]> => {
          return simulateOperation(() => {
            if (mergedConfig.returnValue) {
              return mergedConfig.returnValue as string[];
            }
            return filePath.includes("has-deps")
              ? [`dependency-${filePath}-1`, `dependency-${filePath}-2`]
              : [];
          });
        }),

      addDependency: jest
        .fn()
        .mockImplementation(
          async (
            _dependentFile: string,
            _dependencyFile: string,
          ): Promise<boolean> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue !== undefined) {
                return mergedConfig.returnValue as boolean;
              }
              return true;
            });
          },
        ),

      removeDependency: jest
        .fn()
        .mockImplementation(
          async (
            _dependentFile: string,
            _dependencyFile: string,
          ): Promise<boolean> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue !== undefined) {
                return mergedConfig.returnValue as boolean;
              }
              return true;
            });
          },
        ),

      getDependencyInfo: jest
        .fn()
        .mockImplementation(
          async (filePath: string): Promise<DependencyInfo> => {
            return simulateOperation(() => {
              if (mergedConfig.returnValue) {
                return mergedConfig.returnValue as DependencyInfo;
              }
              const info: DependencyInfo = {
                filePath,
                dependencies: [`dependency-${filePath}`],
                dependents: [`dependent-${filePath}`],
                circularDependencies: [],
                isValid: true,
                validationErrors: [],
              };
              return info;
            });
          },
        ),

      validateDependencies: jest
        .fn()
        .mockImplementation(async (filePath: string): Promise<boolean> => {
          return simulateOperation(() => {
            if (mergedConfig.returnValue !== undefined) {
              return mergedConfig.returnValue as boolean;
            }
            return !filePath.includes("invalid-deps");
          });
        }),
    } as jest.Mocked<DependencyService>;
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

  static createWithDependencies(filePath: string) {
    return this.create({
      shouldSucceed: true,
      returnValue: {
        canDelete: false,
        dependentFiles: [`dependent-${filePath}`],
        blockingDependencies: [`blocking-${filePath}`],
        warnings: ["File has active dependencies"],
        errors: [],
      },
    });
  }
}

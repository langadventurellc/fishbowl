/**
 * @fileoverview Validation Service Mock Factory for Cross-Service Coordination
 *
 * Enhanced mock factory for ValidationService supporting cross-service coordination,
 * rollback scenarios, and communication error simulation for agent configuration testing.
 */

import type { ValidationService } from "../../../types/services/ValidationServiceInterface";
import type {
  ValidationResult,
  BusinessRule,
  SecurityContext,
} from "../../../types/role";

/**
 * Configuration for validation service mock responses with cross-service coordination capabilities
 */
interface ValidationServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  latency?: number;
  simulateDelay?: boolean;
  crossServiceCoordination?: boolean;
  rollbackScenarios?: boolean;
  communicationErrors?: boolean;
  validationErrors?: Array<{ field: string; message: string; code?: string }>;
  coordinationFailureRate?: number;
}

/**
 * Mock factory for ValidationService with cross-service coordination capabilities
 * Supports complex workflow testing including rollback and error handling scenarios
 */
export class ValidationServiceMockFactory {
  private static defaultConfig: ValidationServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
    simulateDelay: true,
    crossServiceCoordination: false,
    rollbackScenarios: false,
    communicationErrors: false,
    coordinationFailureRate: 0,
  };

  /**
   * Create ValidationService mock with cross-service coordination capabilities
   */
  static createCrossServiceCoordination(
    config: ValidationServiceMockConfig = {},
  ): jest.Mocked<ValidationService> {
    const mergedConfig = {
      ...this.defaultConfig,
      crossServiceCoordination: true,
      ...config,
    };

    return this.createMockWithConfig(mergedConfig);
  }

  /**
   * Create ValidationService mock with rollback scenario simulation
   */
  static createWithRollbackScenarios(
    config: ValidationServiceMockConfig = {},
  ): jest.Mocked<ValidationService> {
    const mergedConfig = {
      ...this.defaultConfig,
      rollbackScenarios: true,
      shouldSucceed: false,
      errorMessage: "Service coordination failed - Rollback completed",
      ...config,
    };

    return this.createMockWithConfig(mergedConfig);
  }

  /**
   * Create ValidationService mock with communication error simulation
   */
  static createWithCommunicationErrors(
    config: ValidationServiceMockConfig = {},
  ): jest.Mocked<ValidationService> {
    const mergedConfig = {
      ...this.defaultConfig,
      communicationErrors: true,
      shouldSucceed: false,
      errorMessage: "Communication error - ValidationService connection failed",
      ...config,
    };

    return this.createMockWithConfig(mergedConfig);
  }

  /**
   * Create basic successful ValidationService mock
   */
  static createSuccess(
    config: ValidationServiceMockConfig = {},
  ): jest.Mocked<ValidationService> {
    const mergedConfig = {
      ...this.defaultConfig,
      shouldSucceed: true,
      ...config,
    };

    return this.createMockWithConfig(mergedConfig);
  }

  /**
   * Create ValidationService mock with configurable failure scenarios
   */
  static createWithFailures(
    config: ValidationServiceMockConfig = {},
  ): jest.Mocked<ValidationService> {
    const mergedConfig = {
      ...this.defaultConfig,
      shouldSucceed: false,
      ...config,
    };

    return this.createMockWithConfig(mergedConfig);
  }

  /**
   * Internal method to create mock with specific configuration
   */
  private static createMockWithConfig(
    config: ValidationServiceMockConfig,
  ): jest.Mocked<ValidationService> {
    const simulateOperation = async <T>(operation: () => T): Promise<T> => {
      if (config.simulateDelay && config.latency && config.latency > 0) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, config.latency),
        );
      }

      // Simulate coordination failures if configured
      if (
        config.coordinationFailureRate &&
        config.coordinationFailureRate > 0
      ) {
        const shouldFail = Math.random() < config.coordinationFailureRate;
        if (shouldFail) {
          throw new Error("Random coordination failure for testing");
        }
      }

      if (!config.shouldSucceed) {
        if (config.communicationErrors) {
          throw new Error(
            config.errorMessage ??
              "Communication error - ValidationService connection failed",
          );
        }
        if (config.rollbackScenarios) {
          throw new Error(
            config.errorMessage ??
              "Service coordination failed - Rollback completed",
          );
        }
        throw new Error(
          config.errorMessage ?? "Validation service operation failed",
        );
      }

      return operation();
    };

    return {
      validateEntity: jest
        .fn()
        .mockImplementation(async <T>(_entity: T, _schema: unknown) => {
          return simulateOperation(() => {
            const result: ValidationResult = {
              isValid: config.shouldSucceed ?? true,
              errors: config.shouldSucceed
                ? []
                : (config.validationErrors ?? [
                    { field: "entity", message: "Validation failed" },
                  ]),
            };
            return result;
          });
        }),

      validateBusinessRules: jest
        .fn()
        .mockImplementation(async <T>(_entity: T, _rules: BusinessRule[]) => {
          return simulateOperation(() => {
            const result: ValidationResult = {
              isValid: config.shouldSucceed ?? true,
              errors: config.shouldSucceed
                ? []
                : [
                    {
                      field: "businessRules",
                      message: "Business rule validation failed",
                    },
                  ],
            };
            return result;
          });
        }),

      validateSecurityConstraints: jest
        .fn()
        .mockImplementation(
          async <T>(_entity: T, _context: SecurityContext) => {
            return simulateOperation(() => {
              const result: ValidationResult = {
                isValid: config.shouldSucceed ?? true,
                errors: config.shouldSucceed
                  ? []
                  : [
                      {
                        field: "securityConstraints",
                        message: "Security constraint validation failed",
                      },
                    ],
              };
              return result;
            });
          },
        ),

      validateUniqueness: jest
        .fn()
        .mockImplementation(
          async (
            _entityType: string,
            _field: string,
            _value: string,
            _excludeId?: string,
          ) => {
            return simulateOperation(() => {
              const result: ValidationResult = {
                isValid: config.shouldSucceed ?? true,
                errors: config.shouldSucceed
                  ? []
                  : [
                      {
                        field: _field,
                        message: `Uniqueness validation failed for ${_field}=${_value}`,
                      },
                    ],
              };
              return result;
            });
          },
        ),

      validateDependencies: jest
        .fn()
        .mockImplementation(async (_entityId: string, _entityType: string) => {
          return simulateOperation(() => {
            const result: ValidationResult = {
              isValid: config.shouldSucceed ?? true,
              errors: config.shouldSucceed
                ? []
                : [
                    {
                      field: "dependencies",
                      message: `Dependency validation failed for ${_entityType}:${_entityId}`,
                    },
                  ],
            };
            return result;
          });
        }),
    };
  }
}

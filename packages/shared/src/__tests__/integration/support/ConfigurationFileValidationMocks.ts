/**
 * @fileoverview Configuration File Validation Mock Utilities
 *
 * Specialized mock utilities for configuration file validation integration tests,
 * providing coordinated mocking between ConfigurationService, ValidationService,
 * and FileService with proper error context preservation.
 */

import type { PersonalityConfiguration } from "../../../types/personality";
import type { ValidationResult } from "../../../types/role";
import type { PersistenceService } from "../../../types/services/PersistenceServiceInterface";
import { ValidationServiceMockFactory } from "./ValidationServiceMockFactory";
import { FileValidationServiceMockFactory } from "./FileValidationServiceMockFactory";

/**
 * Mock implementation of ConfigurationService for file validation tests
 */
export interface ConfigurationFileService {
  savePersonalityConfiguration(
    config: PersonalityConfiguration,
  ): Promise<PersonalityConfiguration>;
  loadPersonalityConfiguration(
    id: string,
  ): Promise<PersonalityConfiguration | null>;
  validateConfigurationIntegrity(config: unknown): Promise<ValidationResult>;
  createUnifiedConfiguration(config: unknown): Promise<{
    personality: PersonalityConfiguration;
    success: boolean;
  }>;
}

/**
 * Configuration for configuration file service mock
 */
interface ConfigurationFileServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  validationShouldSucceed?: boolean;
  fileShouldSucceed?: boolean;
  preserveErrorContext?: boolean;
}

/**
 * Mock factory for ConfigurationFileService
 */
export class ConfigurationFileServiceMockFactory {
  /**
   * Create successful configuration file service mock
   */
  static createSuccess(): jest.Mocked<ConfigurationFileService> {
    return this.createWithConfig({ shouldSucceed: true });
  }

  /**
   * Create configuration file service mock with validation failures
   */
  static createValidationFailure(): jest.Mocked<ConfigurationFileService> {
    return this.createWithConfig({
      shouldSucceed: false,
      validationShouldSucceed: false,
      errorMessage: "Configuration validation failed",
    });
  }

  /**
   * Create configuration file service mock with file operation failures
   */
  static createFileFailure(): jest.Mocked<ConfigurationFileService> {
    return this.createWithConfig({
      shouldSucceed: false,
      fileShouldSucceed: false,
      errorMessage: "File operation failed",
    });
  }

  /**
   * Create mock with specific configuration
   */
  static createWithConfig(
    config: ConfigurationFileServiceMockConfig = {},
  ): jest.Mocked<ConfigurationFileService> {
    const defaultConfig = {
      shouldSucceed: true,
      validationShouldSucceed: true,
      fileShouldSucceed: true,
      preserveErrorContext: true,
      ...config,
    };

    return {
      savePersonalityConfiguration: jest
        .fn()
        .mockImplementation(
          async (personalityConfig: PersonalityConfiguration) => {
            if (!defaultConfig.shouldSucceed) {
              const error = new Error(
                defaultConfig.errorMessage ?? "Save failed",
              ) as Error & {
                context?: unknown;
              };
              if (defaultConfig.preserveErrorContext) {
                error.context = {
                  operation: "save",
                  entityType: "personality",
                  entityId: personalityConfig.id,
                };
              }
              throw error;
            }
            return personalityConfig;
          },
        ),

      loadPersonalityConfiguration: jest
        .fn()
        .mockImplementation(async (id: string) => {
          if (!defaultConfig.shouldSucceed) {
            const error = new Error(
              defaultConfig.errorMessage ?? "Load failed",
            ) as Error & {
              context?: unknown;
            };
            if (defaultConfig.preserveErrorContext) {
              error.context = {
                operation: "load",
                entityType: "personality",
                entityId: id,
              };
            }
            throw error;
          }
          return {
            id,
            name: "Mock Personality",
            openness: 50,
            conscientiousness: 50,
            extraversion: 50,
            agreeableness: 50,
            neuroticism: 50,
            formality: 50,
            humor: 50,
            assertiveness: 50,
            empathy: 50,
            storytelling: 50,
            brevity: 50,
            imagination: 50,
            playfulness: 50,
            dramaticism: 50,
            analyticalDepth: 50,
            contrarianism: 50,
            encouragement: 50,
            curiosity: 50,
            patience: 50,
            isTemplate: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as PersonalityConfiguration;
        }),

      validateConfigurationIntegrity: jest
        .fn()
        .mockImplementation(async (_config: unknown) => {
          return {
            isValid: defaultConfig.validationShouldSucceed ?? true,
            errors: defaultConfig.validationShouldSucceed
              ? []
              : [
                  {
                    field: "config",
                    message: "Validation failed",
                    code: "VALIDATION_ERROR",
                  },
                ],
          };
        }),

      createUnifiedConfiguration: jest
        .fn()
        .mockImplementation(async (_config: unknown) => {
          if (!defaultConfig.shouldSucceed) {
            const error = new Error(
              "Unified configuration creation failed",
            ) as Error & {
              context?: unknown;
            };
            if (defaultConfig.preserveErrorContext) {
              error.context = {
                operation: "createUnified",
                validationSuccess: defaultConfig.validationShouldSucceed,
                fileOperationSuccess: defaultConfig.fileShouldSucceed,
              };
            }
            throw error;
          }

          return {
            personality: {
              id: "mock-personality",
              name: "Mock Personality",
              openness: 50,
              conscientiousness: 50,
              extraversion: 50,
              agreeableness: 50,
              neuroticism: 50,
              formality: 50,
              humor: 50,
              assertiveness: 50,
              empathy: 50,
              storytelling: 50,
              brevity: 50,
              imagination: 50,
              playfulness: 50,
              dramaticism: 50,
              analyticalDepth: 50,
              contrarianism: 50,
              encouragement: 50,
              curiosity: 50,
              patience: 50,
              isTemplate: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as PersonalityConfiguration,
            success: true,
          };
        }),
    };
  }
}

/**
 * Mock factory for PersistenceService with file validation support
 */
export class PersistenceServiceMockFactory {
  /**
   * Create successful persistence service mock
   */
  static createSuccess(): jest.Mocked<PersistenceService> {
    return {
      save: jest
        .fn()
        .mockImplementation(async <T>(entity: T, _entityType: string) => {
          return entity;
        }),
      findById: jest.fn().mockResolvedValue(null),
      update: jest
        .fn()
        .mockImplementation(
          async <T>(_id: string, updates: Partial<T>, _entityType: string) => {
            return updates as T;
          },
        ),
      delete: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
      exists: jest.fn().mockResolvedValue(true),
      count: jest.fn().mockResolvedValue(0),
    };
  }

  /**
   * Create persistence service mock with failures
   */
  static createFailure(
    errorMessage = "Persistence operation failed",
  ): jest.Mocked<PersistenceService> {
    const error = new Error(errorMessage);
    return {
      save: jest.fn().mockRejectedValue(error),
      findById: jest.fn().mockRejectedValue(error),
      update: jest.fn().mockRejectedValue(error),
      delete: jest.fn().mockRejectedValue(error),
      findAll: jest.fn().mockRejectedValue(error),
      exists: jest.fn().mockRejectedValue(error),
      count: jest.fn().mockRejectedValue(error),
    };
  }
}

/**
 * Coordinated mock setup for file validation integration tests
 */
export class FileValidationMockCoordinator {
  /**
   * Create coordinated mocks for successful file validation flow
   */
  static createSuccessfulFlow() {
    return {
      validationService: ValidationServiceMockFactory.createSuccess(),
      fileService: FileValidationServiceMockFactory.createSuccess(),
      configurationService: ConfigurationFileServiceMockFactory.createSuccess(),
      persistenceService: PersistenceServiceMockFactory.createSuccess(),
    };
  }

  /**
   * Create coordinated mocks for validation failure scenarios
   */
  static createValidationFailureFlow(
    validationErrors: Array<{ field: string; message: string; code: string }>,
  ) {
    return {
      validationService: ValidationServiceMockFactory.createWithFailures({
        shouldSucceed: false,
        validationErrors,
      }),
      fileService:
        FileValidationServiceMockFactory.createValidationFailure(
          validationErrors,
        ),
      configurationService:
        ConfigurationFileServiceMockFactory.createValidationFailure(),
      persistenceService: PersistenceServiceMockFactory.createSuccess(),
    };
  }

  /**
   * Create coordinated mocks for file operation failure scenarios
   */
  static createFileFailureFlow() {
    return {
      validationService: ValidationServiceMockFactory.createSuccess(),
      fileService: FileValidationServiceMockFactory.createAtomicFailure(),
      configurationService:
        ConfigurationFileServiceMockFactory.createFileFailure(),
      persistenceService: PersistenceServiceMockFactory.createFailure(
        "File operation failed",
      ),
    };
  }

  /**
   * Create coordinated mocks for format error scenarios
   */
  static createFormatErrorFlow() {
    return {
      validationService: ValidationServiceMockFactory.createSuccess(),
      fileService: FileValidationServiceMockFactory.createFormatError(),
      configurationService:
        ConfigurationFileServiceMockFactory.createFileFailure(),
      persistenceService: PersistenceServiceMockFactory.createSuccess(),
    };
  }
}

/**
 * @fileoverview Personality Service Mock Factory
 *
 * Mock factory for personality services following established patterns in the project.
 * Supports personality reference validation, dependency tracking, and cross-service coordination.
 */

import type { PersonalityConfiguration } from "../../../types/personality";
import type { ValidationResult } from "../../../types/role";

/**
 * Personality Service Interface
 * Based on patterns observed in the test files and service coordination requirements
 */
export interface PersonalityService {
  /**
   * Retrieve personality configuration by ID for reference validation
   */
  getPersonalityById(
    personalityId: string,
  ): Promise<PersonalityConfiguration | null>;

  /**
   * Validate personality configuration for cross-service coordination
   */
  validatePersonalityConfiguration(
    config: PersonalityConfiguration,
  ): Promise<ValidationResult>;

  /**
   * List available personalities with optional filtering
   */
  listPersonalities(
    filters?: PersonalityFilters,
  ): Promise<PersonalityConfiguration[]>;

  /**
   * Check if personality exists and is accessible for reference validation
   */
  isPersonalityAccessible(personalityId: string): Promise<boolean>;

  /**
   * Validate personality ID format and existence
   */
  validatePersonalityReference(
    personalityId: string,
  ): Promise<ValidationResult>;
}

/**
 * Filters for personality listing
 */
export interface PersonalityFilters {
  isTemplate?: boolean;
  includeInactive?: boolean;
  category?: string;
}

/**
 * Configuration for PersonalityService mock responses
 */
interface PersonalityServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  returnValue?: unknown;
  latency?: number;
  availablePersonalities?: PersonalityConfiguration[];
  validationErrors?: Array<{ field: string; message: string; code?: string }>;
  crossServiceFailures?: boolean;
  simulateDelay?: boolean;
  referenceValidationFailures?: boolean;
}

/**
 * Enhanced personality service with transaction rollback support
 */
interface PersonalityServiceWithTransaction
  extends jest.Mocked<PersonalityService> {
  rollbackPersonality: jest.MockedFunction<
    (personalityId?: string) => Promise<void>
  > & {
    lastCallTime?: number;
    lastCallId?: string;
  };
  createPersonality: jest.MockedFunction<
    (personalityData: unknown) => Promise<PersonalityConfiguration>
  > & {
    lastCallTime?: number;
  };
}

/**
 * Personality Service Mock Factory
 * Creates mocked personality service instances with configurable behavior for cross-service testing
 */
export class PersonalityServiceMockFactory {
  private static defaultConfig: PersonalityServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
    simulateDelay: true,
    crossServiceFailures: false,
    referenceValidationFailures: false,
  };

  /**
   * Create a configurable PersonalityService mock
   */
  static create(
    config: PersonalityServiceMockConfig = {},
  ): jest.Mocked<PersonalityService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    const simulateOperation = async <T>(operation: () => T): Promise<T> => {
      // Simulate network latency
      if (
        mergedConfig.simulateDelay &&
        mergedConfig.latency &&
        mergedConfig.latency > 0
      ) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, mergedConfig.latency),
        );
      }

      // Simulate failures
      if (!mergedConfig.shouldSucceed) {
        if (mergedConfig.crossServiceFailures) {
          throw new Error(
            mergedConfig.errorMessage ??
              "PersonalityService cross-service coordination failed",
          );
        }
        throw new Error(
          mergedConfig.errorMessage ?? "PersonalityService operation failed",
        );
      }

      return operation();
    };

    return {
      getPersonalityById: jest
        .fn()
        .mockImplementation(async (personalityId: string) => {
          return simulateOperation(() => {
            if (
              personalityId === "not-found" ||
              personalityId === "personality-non-existent"
            ) {
              return null;
            }

            if (personalityId === "personality-invalid-reference") {
              return null;
            }

            const personality: PersonalityConfiguration = {
              id: personalityId,
              name: `Mock Personality ${personalityId}`,
              description: "Mock personality for cross-service testing",
              isTemplate: personalityId.includes("template"),
              // Big Five traits
              openness: 75,
              conscientiousness: 80,
              extraversion: 65,
              agreeableness: 85,
              neuroticism: 35,
              // Behavioral traits
              formality: 60,
              humor: 70,
              assertiveness: 65,
              empathy: 80,
              storytelling: 55,
              brevity: 45,
              imagination: 75,
              playfulness: 60,
              dramaticism: 40,
              analyticalDepth: 85,
              contrarianism: 30,
              encouragement: 90,
              curiosity: 80,
              patience: 70,
              customInstructions: "Mock custom instructions for testing",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            return mergedConfig.returnValue ?? personality;
          });
        }),

      validatePersonalityConfiguration: jest
        .fn()
        .mockImplementation(async (_config: PersonalityConfiguration) => {
          return simulateOperation(() => {
            const result: ValidationResult = {
              isValid: mergedConfig.shouldSucceed ?? true,
              errors: mergedConfig.shouldSucceed
                ? []
                : mergedConfig.validationErrors || [
                    {
                      field: "personalityId",
                      message:
                        mergedConfig.errorMessage ??
                        "Invalid personality configuration",
                      code: "INVALID_PERSONALITY_CONFIG",
                    },
                  ],
            };
            return mergedConfig.returnValue ?? result;
          });
        }),

      listPersonalities: jest
        .fn()
        .mockImplementation(async (filters?: PersonalityFilters) => {
          return simulateOperation(() => {
            const defaultPersonalities: PersonalityConfiguration[] = [
              {
                id: "personality-creative",
                name: "Creative Personality",
                description: "Highly creative and imaginative",
                isTemplate: true,
                openness: 90,
                conscientiousness: 60,
                extraversion: 70,
                agreeableness: 75,
                neuroticism: 45,
                formality: 40,
                humor: 80,
                assertiveness: 70,
                empathy: 85,
                storytelling: 90,
                brevity: 30,
                imagination: 95,
                playfulness: 85,
                dramaticism: 70,
                analyticalDepth: 60,
                contrarianism: 40,
                encouragement: 80,
                curiosity: 95,
                patience: 60,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: "personality-analytical",
                name: "Analytical Personality",
                description: "Highly analytical and detail-oriented",
                isTemplate: true,
                openness: 60,
                conscientiousness: 95,
                extraversion: 40,
                agreeableness: 65,
                neuroticism: 25,
                formality: 80,
                humor: 30,
                assertiveness: 80,
                empathy: 60,
                storytelling: 20,
                brevity: 90,
                imagination: 40,
                playfulness: 20,
                dramaticism: 10,
                analyticalDepth: 95,
                contrarianism: 70,
                encouragement: 60,
                curiosity: 85,
                patience: 95,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];

            let personalities =
              mergedConfig.availablePersonalities ?? defaultPersonalities;

            // Apply filters if provided
            if (filters) {
              if (filters.isTemplate !== undefined) {
                personalities = personalities.filter(
                  (p) => p.isTemplate === filters.isTemplate,
                );
              }
              if (filters.category) {
                personalities = personalities.filter((p) =>
                  p.description
                    ?.toLowerCase()
                    .includes(filters.category!.toLowerCase()),
                );
              }
            }

            return mergedConfig.returnValue ?? personalities;
          });
        }),

      isPersonalityAccessible: jest
        .fn()
        .mockImplementation(async (personalityId: string) => {
          return simulateOperation(() => {
            if (
              personalityId === "not-found" ||
              personalityId === "personality-non-existent"
            ) {
              return false;
            }
            if (personalityId === "personality-inaccessible") {
              return false;
            }
            return mergedConfig.returnValue ?? true;
          });
        }),

      validatePersonalityReference: jest
        .fn()
        .mockImplementation(async (personalityId: string) => {
          return simulateOperation(() => {
            const isValid =
              !mergedConfig.referenceValidationFailures &&
              personalityId !== "not-found" &&
              personalityId !== "personality-non-existent" &&
              personalityId !== "personality-invalid-reference";

            const result: ValidationResult = {
              isValid,
              errors: isValid
                ? []
                : [
                    {
                      field: "personalityId",
                      message: `Personality '${personalityId}' not found in PersonalityService`,
                      code: "PERSONALITY_REFERENCE_NOT_FOUND",
                    },
                  ],
            };
            return mergedConfig.returnValue ?? result;
          });
        }),
    } as jest.Mocked<PersonalityService>;
  }

  /**
   * Create PersonalityService mock that succeeds
   */
  static createSuccess(returnValue?: unknown) {
    return this.create({ shouldSucceed: true, returnValue });
  }

  /**
   * Create PersonalityService mock that fails with error message
   */
  static createFailure(errorMessage: string) {
    return this.create({ shouldSucceed: false, errorMessage });
  }

  /**
   * Create PersonalityService mock with network latency simulation
   */
  static createWithLatency(latency: number) {
    return this.create({ shouldSucceed: true, latency });
  }

  /**
   * Create PersonalityService mock with specific validation errors
   */
  static createWithValidationErrors(
    errors: Array<{ field: string; message: string; code?: string }>,
  ) {
    return this.create({ shouldSucceed: false, validationErrors: errors });
  }

  /**
   * Create PersonalityService mock that simulates cross-service coordination failures
   */
  static createWithCrossServiceFailures() {
    return this.create({
      shouldSucceed: false,
      crossServiceFailures: true,
      errorMessage: "PersonalityService cross-service coordination failed",
    });
  }

  /**
   * Create PersonalityService mock with reference validation failures
   */
  static createWithReferenceValidationFailures() {
    return this.create({
      shouldSucceed: true,
      referenceValidationFailures: true,
    });
  }

  /**
   * Create PersonalityService mock with custom available personalities
   */
  static createWithPersonalities(personalities: PersonalityConfiguration[]) {
    return this.create({
      shouldSucceed: true,
      availablePersonalities: personalities,
    });
  }

  /**
   * Create PersonalityService mock that simulates timeout scenarios
   */
  static createWithTimeout(timeoutMs: number = 5000) {
    return this.create({
      shouldSucceed: false,
      latency: timeoutMs,
      errorMessage: "PersonalityService operation timed out",
    });
  }

  /**
   * Create PersonalityService mock with rollback capabilities for transaction testing
   * Adds rollback and timing-aware creation methods for transaction consistency testing
   */
  static createWithRollbackSupport(
    config: PersonalityServiceMockConfig = {},
  ): PersonalityServiceWithTransaction {
    const baseService = this.create(config);

    // Add rollback method for transaction consistency
    const rollbackMock = jest
      .fn()
      .mockImplementation(async (personalityId?: string) => {
        if (!config.shouldSucceed) {
          throw new Error(config.errorMessage ?? "Personality rollback failed");
        }
        // Track rollback calls for verification
        const typedRollback = rollbackMock as jest.MockedFunction<
          (personalityId?: string) => Promise<void>
        > & {
          lastCallTime?: number;
          lastCallId?: string;
        };
        typedRollback.lastCallTime = Date.now();
        typedRollback.lastCallId = personalityId;
      });

    // Add timing-aware createPersonality method
    const createMock = jest
      .fn()
      .mockImplementation(async (personalityData: unknown) => {
        const startTime = Date.now();
        // Simulate personality creation
        const result = {
          ...(personalityData as PersonalityConfiguration),
          id: `personality-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as PersonalityConfiguration;
        const typedCreate = createMock as jest.MockedFunction<
          (personalityData: unknown) => Promise<PersonalityConfiguration>
        > & {
          lastCallTime?: number;
        };
        typedCreate.lastCallTime = startTime;
        return result;
      });

    const enhancedService =
      baseService as unknown as PersonalityServiceWithTransaction;
    enhancedService.rollbackPersonality =
      rollbackMock as PersonalityServiceWithTransaction["rollbackPersonality"];
    enhancedService.createPersonality =
      createMock as PersonalityServiceWithTransaction["createPersonality"];

    return enhancedService;
  }
}

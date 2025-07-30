/**
 * @fileoverview Model Service Mock Factory
 *
 * Mock factory for model services following established patterns in the project.
 * Supports model configuration validation, compatibility checking, and availability testing.
 */

import type { ModelService } from "../../../types/services";
import type { ValidationResult } from "../../../types/role";
import type {
  ModelConfiguration,
  ModelCapabilities,
  CompatibilityResult,
  ModelFilters,
  ModelConstraints,
} from "../../../types/model";
import type { PersonalityConfiguration } from "../../../types/personality";
import type { CustomRole } from "../../../types/role";

/**
 * Configuration for ModelService mock responses
 */
interface ModelServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  returnValue?: unknown;
  latency?: number;
  availableModels?: ModelConfiguration[];
  compatibilityResults?: CompatibilityResult[];
  simulateDelay?: boolean;
  constraintViolations?: boolean;
  validationErrors?: Array<{ field: string; message: string; code?: string }>;
  crossServiceFailures?: boolean;
}

/**
 * Model Service Mock Factory
 * Creates mocked model service instances with configurable behavior
 */
export class ModelServiceMockFactory {
  private static defaultConfig: ModelServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
    simulateDelay: true,
    constraintViolations: false,
    crossServiceFailures: false,
  };

  /**
   * Create a configurable ModelService mock
   */
  static create(
    config: ModelServiceMockConfig = {},
  ): jest.Mocked<ModelService> {
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
            mergedConfig.errorMessage ?? "Cross-service coordination failed",
          );
        }
        throw new Error(
          mergedConfig.errorMessage ?? "Model service operation failed",
        );
      }

      return operation();
    };

    return {
      validateModelConfiguration: jest
        .fn()
        .mockImplementation(async (_config: ModelConfiguration) => {
          return simulateOperation(() => {
            const result: ValidationResult = {
              isValid: mergedConfig.shouldSucceed ?? true,
              errors: mergedConfig.shouldSucceed
                ? []
                : mergedConfig.validationErrors || [
                    {
                      field: "modelId",
                      message:
                        mergedConfig.errorMessage ??
                        "Invalid model configuration",
                      code: "INVALID_MODEL_CONFIG",
                    },
                  ],
            };
            return mergedConfig.returnValue ?? result;
          });
        }),

      checkModelCompatibility: jest
        .fn()
        .mockImplementation(
          async (
            _modelConfig: ModelConfiguration,
            _personalityConfig: PersonalityConfiguration,
            _roleConfig: CustomRole,
          ) => {
            return simulateOperation(() => {
              const compatibilityResult: CompatibilityResult = {
                isCompatible: mergedConfig.shouldSucceed ?? true,
                compatibilityScore: mergedConfig.shouldSucceed ? 85 : 35,
                analysis: {
                  personalityAlignment: {
                    score: mergedConfig.shouldSucceed ? 90 : 40,
                    issues: mergedConfig.shouldSucceed
                      ? []
                      : ["Personality traits mismatch"],
                    recommendations: mergedConfig.shouldSucceed
                      ? ["Optimal configuration"]
                      : ["Consider alternative model"],
                  },
                  roleAlignment: {
                    score: mergedConfig.shouldSucceed ? 80 : 30,
                    issues: mergedConfig.shouldSucceed
                      ? []
                      : ["Role capabilities insufficient"],
                    recommendations: mergedConfig.shouldSucceed
                      ? ["Configuration optimized for role"]
                      : ["Upgrade to higher tier model"],
                  },
                  performance: {
                    expectedResponseTime: 150,
                    estimatedCost: 0.002,
                    resourceRequirements: ["standard-tier", "text-processing"],
                  },
                  risks: mergedConfig.shouldSucceed
                    ? []
                    : [
                        {
                          type: "capability",
                          severity: "high",
                          description: "Model lacks required capabilities",
                          mitigation: "Upgrade to premium tier model",
                        },
                      ],
                },
                recommendations: mergedConfig.shouldSucceed
                  ? ["Current configuration is optimal"]
                  : [
                      "Consider model upgrade",
                      "Review capability requirements",
                    ],
                alternatives: mergedConfig.shouldSucceed
                  ? []
                  : [
                      {
                        modelId: "gpt-4-turbo",
                        reason: "Better capability alignment",
                        improvementScore: 95,
                      },
                    ],
              };
              return mergedConfig.returnValue ?? compatibilityResult;
            });
          },
        ),

      getModelCapabilities: jest
        .fn()
        .mockImplementation(async (modelId: string) => {
          return simulateOperation(() => {
            if (modelId === "not-found") return null;

            const capabilities: ModelCapabilities = {
              maxContextLength: 128000,
              maxOutputLength: 4096,
              inputModalities: ["text"],
              outputModalities: ["text"],
              supportsFunctionCalling: true,
              supportsStreaming: true,
              performance: {
                avgResponseTime: 150,
                rpmLimit: 10000,
                tpmLimit: 1000000,
              },
              cost: {
                inputTokenCost: 0.000003,
                outputTokenCost: 0.000015,
                currency: "USD",
              },
              specializations: ["general", "coding", "analysis"],
            };
            return mergedConfig.returnValue ?? capabilities;
          });
        }),

      listAvailableModels: jest
        .fn()
        .mockImplementation(async (filters?: ModelFilters) => {
          return simulateOperation(() => {
            const defaultModels: ModelConfiguration[] = [
              {
                id: "gpt-4-turbo",
                name: "GPT-4 Turbo",
                provider: "openai",
                version: "gpt-4-turbo-preview",
                description: "Advanced reasoning and coding model",
                isAvailable: true,
                tier: "premium",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              {
                id: "claude-3-sonnet",
                name: "Claude 3 Sonnet",
                provider: "anthropic",
                version: "claude-3-sonnet-20240229",
                description: "Balanced performance and capability",
                isAvailable: true,
                tier: "standard",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              {
                id: "gpt-3-5-turbo",
                name: "GPT-3.5 Turbo",
                provider: "openai",
                version: "gpt-3.5-turbo-0125",
                description: "Fast and efficient model for general tasks",
                isAvailable: true,
                tier: "basic",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];

            let models = mergedConfig.availableModels ?? defaultModels;

            // Apply filters if provided
            if (filters) {
              if (filters.tier) {
                models = models.filter((model) => model.tier === filters.tier);
              }
              if (filters.provider) {
                models = models.filter(
                  (model) => model.provider === filters.provider,
                );
              }
              if (filters.isAvailable !== undefined) {
                models = models.filter(
                  (model) => model.isAvailable === filters.isAvailable,
                );
              }
            }

            return mergedConfig.returnValue ?? models;
          });
        }),

      validateModelConstraints: jest
        .fn()
        .mockImplementation(
          async (
            _modelConfig: ModelConfiguration,
            _constraints: ModelConstraints,
          ) => {
            return simulateOperation(() => {
              const result: ValidationResult = {
                isValid: !mergedConfig.constraintViolations,
                errors: mergedConfig.constraintViolations
                  ? [
                      {
                        field: "constraints",
                        message: "Model does not meet performance constraints",
                        code: "CONSTRAINT_VIOLATION",
                      },
                    ]
                  : [],
              };
              return mergedConfig.returnValue ?? result;
            });
          },
        ),
    } as jest.Mocked<ModelService>;
  }

  /**
   * Create ModelService mock that succeeds
   */
  static createSuccess(returnValue?: unknown) {
    return this.create({ shouldSucceed: true, returnValue });
  }

  /**
   * Create ModelService mock that fails with error message
   */
  static createFailure(errorMessage: string) {
    return this.create({ shouldSucceed: false, errorMessage });
  }

  /**
   * Create ModelService mock with network latency simulation
   */
  static createWithLatency(latency: number) {
    return this.create({ shouldSucceed: true, latency });
  }

  /**
   * Create ModelService mock with specific validation errors
   */
  static createWithValidationErrors(
    errors: Array<{ field: string; message: string; code?: string }>,
  ) {
    return this.create({ shouldSucceed: false, validationErrors: errors });
  }

  /**
   * Create ModelService mock that simulates constraint violations
   */
  static createWithConstraintViolations() {
    return this.create({
      shouldSucceed: true,
      constraintViolations: true,
    });
  }

  /**
   * Create ModelService mock with custom available models
   */
  static createWithModels(models: ModelConfiguration[]) {
    return this.create({
      shouldSucceed: true,
      availableModels: models,
    });
  }

  /**
   * Create ModelService mock that simulates cross-service coordination failures
   */
  static createWithCrossServiceFailures() {
    return this.create({
      shouldSucceed: false,
      crossServiceFailures: true,
      errorMessage: "Cross-service coordination failed",
    });
  }

  /**
   * Create ModelService mock with realistic model incompatibility scenario
   */
  static createIncompatibleModels() {
    return this.create({
      shouldSucceed: true,
      returnValue: {
        isCompatible: false,
        compatibilityScore: 25,
        analysis: {
          personalityAlignment: {
            score: 30,
            issues: [
              "Model lacks creative capabilities for high openness personality",
            ],
            recommendations: ["Consider GPT-4 or Claude for creative tasks"],
          },
          roleAlignment: {
            score: 20,
            issues: ["Insufficient reasoning capabilities for analyst role"],
            recommendations: ["Upgrade to premium tier model"],
          },
          performance: {
            expectedResponseTime: 300,
            estimatedCost: 0.001,
            resourceRequirements: ["basic-tier", "text-only"],
          },
          risks: [
            {
              type: "capability",
              severity: "critical",
              description: "Model cannot meet role requirements",
              mitigation: "Select higher-capability model",
            },
            {
              type: "performance",
              severity: "medium",
              description: "Slower response times expected",
              mitigation: "Consider performance tier upgrade",
            },
          ],
        },
        recommendations: [
          "Select a premium tier model",
          "Consider GPT-4 Turbo for better capability alignment",
          "Review personality and role requirements",
        ],
        alternatives: [
          {
            modelId: "gpt-4-turbo",
            reason: "Superior reasoning and creative capabilities",
            improvementScore: 95,
          },
          {
            modelId: "claude-3-opus",
            reason: "Excellent for analysis and creative tasks",
            improvementScore: 92,
          },
        ],
      },
    });
  }
}

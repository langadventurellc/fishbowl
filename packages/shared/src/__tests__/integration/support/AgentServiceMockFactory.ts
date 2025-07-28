/**
 * @fileoverview Agent Service Mock Factory
 *
 * Mock factory for agent services following established patterns in the project.
 * Supports comprehensive agent configuration testing with cross-service coordination simulation.
 */

import type {
  AgentCreateRequest,
  AgentUpdateRequest,
  Agent as ServiceAgent,
} from "../../../types/agent";
import type { ValidationResult } from "../../../types/role";
import type { AgentService } from "../../../types/services";

/**
 * Configuration for agent service mock responses
 */
interface AgentServiceMockConfig {
  shouldSucceed?: boolean;
  errorMessage?: string;
  returnValue?: unknown;
  latency?: number;
  validationErrors?: Array<{ field: string; message: string; code?: string }>;
  crossServiceFailures?: boolean;
  simulateDelay?: boolean;
}

/**
 * Enhanced agent service with transaction rollback support
 */
interface AgentServiceWithTransaction extends jest.Mocked<AgentService> {
  rollbackAgent: jest.MockedFunction<(agentId?: string) => Promise<void>> & {
    lastCallTime?: number;
    lastCallId?: string;
  };
}

/**
 * Mock factory for AgentService following established patterns
 * Supports agent configuration creation, validation, and management testing
 */
export class AgentServiceMockFactory {
  private static defaultConfig: AgentServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
    crossServiceFailures: false,
    simulateDelay: true,
  };

  /**
   * Create a configurable AgentService mock
   */
  static create(
    config: AgentServiceMockConfig = {},
  ): jest.Mocked<AgentService> {
    const mergedConfig = { ...this.defaultConfig, ...config };

    const simulateOperation = async <T>(operation: () => T): Promise<T> => {
      if (
        mergedConfig.simulateDelay &&
        mergedConfig.latency &&
        mergedConfig.latency > 0
      ) {
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, mergedConfig.latency),
        );
      }

      if (!mergedConfig.shouldSucceed) {
        if (mergedConfig.crossServiceFailures) {
          throw new Error(
            mergedConfig.errorMessage ?? "Cross-service coordination failed",
          );
        }
        throw new Error(
          mergedConfig.errorMessage ?? "Agent service operation failed",
        );
      }

      return operation();
    };

    return {
      createAgent: jest
        .fn()
        .mockImplementation(async (config: AgentCreateRequest) => {
          return simulateOperation(() => {
            const createdAgent: ServiceAgent = {
              ...config,
              id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              metadata: {
                version: "1.0",
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                tags: config.tags || [],
              },
            };
            return mergedConfig.returnValue ?? createdAgent;
          });
        }),

      validateAgentConfiguration: jest
        .fn()
        .mockImplementation(async (_: AgentCreateRequest) => {
          return simulateOperation(() => {
            const result: ValidationResult = {
              isValid: mergedConfig.shouldSucceed ?? true,
              errors: mergedConfig.shouldSucceed
                ? []
                : mergedConfig.validationErrors || [
                    {
                      field: "configuration",
                      message:
                        mergedConfig.errorMessage ??
                        "Invalid agent configuration",
                    },
                  ],
            };
            return mergedConfig.returnValue ?? result;
          });
        }),

      updateAgentConfiguration: jest
        .fn()
        .mockImplementation(
          async (agentId: string, updates: AgentUpdateRequest) => {
            return simulateOperation(() => {
              const updatedAgent: ServiceAgent = {
                id: agentId,
                name: updates.name ?? `Test Agent ${agentId}`,
                description:
                  updates.description ?? "Updated test agent configuration",
                role: updates.role ?? "test-role",
                personalityId: updates.personalityId ?? "test-personality-id",
                modelId: updates.modelId ?? "test-model-id",
                capabilities: updates.capabilities ?? ["test-capability"],
                constraints: updates.constraints ?? [],
                settings: updates.settings ?? {},
                metadata: {
                  version: "1.1",
                  createdAt: new Date(Date.now() - 86400000), // 1 day ago
                  updatedAt: new Date(),
                  isActive: updates.isActive ?? true,
                  tags: updates.tags ?? [],
                },
              };
              return mergedConfig.returnValue ?? updatedAgent;
            });
          },
        ),

      getAgentConfiguration: jest
        .fn()
        .mockImplementation(async (agentId: string) => {
          return simulateOperation(() => {
            if (agentId === "not-found") return null;

            const agent: ServiceAgent = {
              id: agentId,
              name: `Test Agent ${agentId}`,
              description: "Test agent configuration",
              role: "test-role",
              personalityId: "test-personality-id",
              modelId: "test-model-id",
              capabilities: ["test-capability"],
              constraints: [],
              settings: {},
              metadata: {
                version: "1.0",
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
                updatedAt: new Date(),
                isActive: true,
                tags: [],
              },
            };
            return mergedConfig.returnValue ?? agent;
          });
        }),

      deleteAgent: jest.fn().mockImplementation(async (agentId: string) => {
        return simulateOperation(() => {
          if (agentId === "not-found") {
            throw new Error("Agent not found");
          }
          // Successful deletion returns void
          return;
        });
      }),
    } as jest.Mocked<AgentService>;
  }

  /**
   * Create agent service mock that succeeds
   */
  static createSuccess(returnValue?: unknown) {
    return this.create({ shouldSucceed: true, returnValue });
  }

  /**
   * Create agent service mock that fails with error message
   */
  static createFailure(errorMessage: string) {
    return this.create({ shouldSucceed: false, errorMessage });
  }

  /**
   * Create agent service mock with network latency simulation
   */
  static createWithLatency(latency: number) {
    return this.create({ shouldSucceed: true, latency });
  }

  /**
   * Create agent service mock with specific validation errors
   */
  static createWithValidationErrors(
    errors: Array<{ field: string; message: string; code?: string }>,
  ) {
    return this.create({ shouldSucceed: false, validationErrors: errors });
  }

  /**
   * Create agent service mock that simulates cross-service coordination failures
   */
  static createWithCrossServiceFailures() {
    return this.create({
      shouldSucceed: false,
      crossServiceFailures: true,
      errorMessage: "Cross-service coordination failed",
    });
  }

  /**
   * Create AgentService mock with rollback capabilities for transaction testing
   * Adds rollback method for transaction consistency testing
   */
  static createWithRollbackSupport(
    config: AgentServiceMockConfig = {},
  ): AgentServiceWithTransaction {
    const baseService = this.create(config);

    // Add rollback method for transaction consistency
    const rollbackMock = jest
      .fn()
      .mockImplementation(async (agentId?: string) => {
        if (!config.shouldSucceed) {
          throw new Error(config.errorMessage ?? "Agent rollback failed");
        }
        // Track rollback calls for verification
        const typedRollback = rollbackMock as jest.MockedFunction<
          (agentId?: string) => Promise<void>
        > & {
          lastCallTime?: number;
          lastCallId?: string;
        };
        typedRollback.lastCallTime = Date.now();
        typedRollback.lastCallId = agentId;
      });

    const enhancedService =
      baseService as unknown as AgentServiceWithTransaction;
    enhancedService.rollbackAgent =
      rollbackMock as AgentServiceWithTransaction["rollbackAgent"];

    return enhancedService;
  }
}

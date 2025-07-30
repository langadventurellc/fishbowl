/**
 * @fileoverview Configuration Service Mock Factory
 *
 * Mock factory for configuration service following established patterns in the project.
 * Creates mocked instances that simulate cross-service coordination.
 */

import type {
  ConfigurationService,
  UnifiedConfigurationRequest,
  UnifiedConfigurationUpdateRequest,
} from "../../../types/services";
import type { Agent } from "../../../types/agent";
import type { PersonalityConfiguration } from "../../../types/personality";
import type { CustomRole } from "../../../types/role";

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
 * Workflow step definition for multi-service coordination
 */
interface WorkflowStep {
  service: string;
  operation: string;
  input: Record<string, unknown>;
  expectedDuration?: number;
  dependencies: string[];
  canRunInParallel?: boolean;
  expectedOutput?: Record<string, unknown>;
}

/**
 * Workflow state tracking for coordination testing
 */
interface WorkflowState {
  currentStep: number;
  completedServices: string[];
  failedServices: string[];
  startTime: number;
  compensation: string[];
  status: "running" | "completed" | "failed" | "rolled_back";
}

/**
 * Enhanced configuration service with transaction support
 */
interface ConfigurationServiceWithTransaction
  extends jest.Mocked<ConfigurationService> {
  rollbackConfiguration: jest.MockedFunction<() => Promise<void>> & {
    lastCallTime?: number;
  };
}

/**
 * Configuration service with workflow coordination capabilities
 */
interface ConfigurationServiceWithWorkflow
  extends ConfigurationServiceWithTransaction {
  coordinateWorkflow: jest.MockedFunction<
    (
      workflowId: string,
      steps: WorkflowStep[],
    ) => Promise<{
      workflowId: string;
      status: string;
      duration: number;
      completedServices: string[];
    }>
  >;
  getWorkflowState: jest.MockedFunction<
    (workflowId: string) => WorkflowState | undefined
  >;
  simulateCircuitBreaker: jest.MockedFunction<
    (serviceName: string, operation: () => Promise<unknown>) => Promise<unknown>
  >;
}

/**
 * Configuration Service Mock Factory
 * Creates mocked configuration service instances with configurable behavior
 */
export class ConfigurationServiceMockFactory {
  private static defaultConfig: ServiceMockConfig = {
    shouldSucceed: true,
    latency: 10,
  };

  static create(
    config: ServiceMockConfig = {},
  ): jest.Mocked<ConfigurationService> {
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
          mergedConfig.errorMessage ?? "Configuration service operation failed",
        );
      }

      return operation();
    };

    const createMockPersonality = (): PersonalityConfiguration => ({
      id: `personality-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "Mock Personality",
      description: "Mock personality for testing",
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Big Five Traits
      openness: 75,
      conscientiousness: 85,
      extraversion: 60,
      agreeableness: 70,
      neuroticism: 30,
      // Behavioral Traits
      formality: 50,
      humor: 60,
      assertiveness: 65,
      empathy: 75,
      storytelling: 55,
      brevity: 70,
      imagination: 80,
      playfulness: 45,
      dramaticism: 40,
      analyticalDepth: 85,
      contrarianism: 35,
      encouragement: 80,
      curiosity: 90,
      patience: 75,
    });

    const createMockRole = (): CustomRole => ({
      id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "Mock Role",
      description: "Mock role for testing",
      capabilities: ["mock-capability"],
      constraints: [],
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      metadata: {
        domain: "test",
        tags: ["mock"],
        templateSource: "mock",
      },
    });

    const createMockAgent = (
      personalityId: string,
      _roleId: string,
    ): Agent => ({
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "Mock Agent",
      role: "mock-role",
      personalityId,
      modelId: "model-mock",
      capabilities: ["mock-capability"],
      constraints: [],
      settings: {},
      metadata: {
        version: "1.0",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        tags: ["mock"],
      },
    });

    return {
      createUnifiedConfiguration: jest
        .fn()
        .mockImplementation(
          async (_configRequest: UnifiedConfigurationRequest) => {
            return simulateOperation(() => {
              const personality = createMockPersonality();
              const role = createMockRole();
              const agent = createMockAgent(personality.id, role.id);

              const result = { personality, role, agent };
              return mergedConfig.returnValue ?? result;
            });
          },
        ),

      getUnifiedConfiguration: jest
        .fn()
        .mockImplementation(async (agentId: string) => {
          return simulateOperation(() => {
            if (agentId === "not-found") return null;

            const personality = createMockPersonality();
            const role = createMockRole();
            const agent = createMockAgent(personality.id, role.id);
            agent.id = agentId;

            const result = { personality, role, agent };
            return mergedConfig.returnValue ?? result;
          });
        }),

      updateUnifiedConfiguration: jest
        .fn()
        .mockImplementation(
          async (
            agentId: string,
            _updates: UnifiedConfigurationUpdateRequest,
          ) => {
            return simulateOperation(() => {
              const personality = createMockPersonality();
              personality.name = "Updated Personality";

              const role = createMockRole();
              role.name = "Updated Role";
              role.version = 2;

              const agent = createMockAgent(personality.id, role.id);
              agent.id = agentId;
              agent.name = "Updated Agent";

              const result = { personality, role, agent };
              return mergedConfig.returnValue ?? result;
            });
          },
        ),

      deleteUnifiedConfiguration: jest
        .fn()
        .mockImplementation(async (agentId: string) => {
          return simulateOperation(() => {
            if (agentId === "has-dependencies") {
              throw new Error(
                "Cannot delete configuration: Active dependencies exist",
              );
            }
            // Success - no return value
          });
        }),

      listUnifiedConfigurations: jest.fn().mockImplementation(async () => {
        return simulateOperation(() => {
          const configurations = [
            {
              personality: createMockPersonality(),
              role: createMockRole(),
              agent: createMockAgent("personality-1", "role-1"),
            },
            {
              personality: createMockPersonality(),
              role: createMockRole(),
              agent: createMockAgent("personality-2", "role-2"),
            },
          ];

          configurations[0]!.personality.id = "personality-1";
          configurations[0]!.personality.name = "Personality 1";
          configurations[0]!.role.id = "role-1";
          configurations[0]!.role.name = "Role 1";
          configurations[0]!.agent.id = "agent-1";
          configurations[0]!.agent.name = "Agent 1";

          configurations[1]!.personality.id = "personality-2";
          configurations[1]!.personality.name = "Personality 2";
          configurations[1]!.role.id = "role-2";
          configurations[1]!.role.name = "Role 2";
          configurations[1]!.agent.id = "agent-2";
          configurations[1]!.agent.name = "Agent 2";

          return mergedConfig.returnValue ?? configurations;
        });
      }),

      validateUnifiedConfiguration: jest
        .fn()
        .mockImplementation(async (_config: UnifiedConfigurationRequest) => {
          return simulateOperation(() => {
            const result = {
              isValid: mergedConfig.shouldSucceed ?? true,
              errors: mergedConfig.shouldSucceed
                ? []
                : [
                    {
                      service: "ConfigurationService",
                      field: "general",
                      message:
                        mergedConfig.errorMessage ??
                        "Configuration validation failed",
                    },
                  ],
            };
            return mergedConfig.returnValue ?? result;
          });
        }),
    } as jest.Mocked<ConfigurationService>;
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

  static createWithCrossServiceFailures(errorMessage: string) {
    return this.create({
      shouldSucceed: false,
      errorMessage,
      returnValue: {
        isValid: false,
        errors: [
          {
            service: "PersonalityService",
            field: "validation",
            message: "Personality validation failed",
          },
          {
            service: "RoleService",
            field: "capabilities",
            message: "Role capabilities invalid",
          },
          {
            service: "AgentService",
            field: "references",
            message: "Agent reference validation failed",
          },
        ],
      },
    });
  }

  /**
   * Create ConfigurationService mock with transaction rollback capabilities
   * Adds rollback method for transaction consistency testing
   */
  static createWithTransactionSupport(
    config: ServiceMockConfig = {},
  ): ConfigurationServiceWithTransaction {
    const baseService = this.create(config);

    // Add rollback method for transaction consistency testing
    const rollbackMock = jest.fn().mockImplementation(async () => {
      if (!config.shouldSucceed) {
        throw new Error(config.errorMessage ?? "Configuration rollback failed");
      }
      // Successful rollback returns void - track call time for ordering verification
      (
        rollbackMock as jest.MockedFunction<() => Promise<void>> & {
          lastCallTime?: number;
        }
      ).lastCallTime = Date.now();
    });

    const enhancedService =
      baseService as unknown as ConfigurationServiceWithTransaction;
    enhancedService.rollbackConfiguration = rollbackMock as jest.MockedFunction<
      () => Promise<void>
    > & { lastCallTime?: number };

    return enhancedService;
  }

  /**
   * Create service that tracks call ordering for transaction boundary testing
   * Enhanced mocks that record timing information for transaction sequence verification
   */
  static createWithCallOrderingTracking(): ConfigurationServiceWithTransaction {
    const service = this.createWithTransactionSupport({ shouldSucceed: true });

    // Enhanced mocks that track call timing for transaction boundary enforcement
    const originalCreate = service.createUnifiedConfiguration;
    const createMock = jest.fn().mockImplementation(async (request) => {
      const startTime = Date.now();
      const result = await originalCreate(request);
      (
        createMock as jest.MockedFunction<typeof originalCreate> & {
          lastCallTime?: number;
        }
      ).lastCallTime = startTime;
      return result;
    });
    service.createUnifiedConfiguration = createMock as jest.MockedFunction<
      typeof originalCreate
    >;

    const originalGet = service.getUnifiedConfiguration;
    const getMock = jest.fn().mockImplementation(async (agentId) => {
      const startTime = Date.now();
      const result = await originalGet(agentId);
      (
        getMock as jest.MockedFunction<typeof originalGet> & {
          lastCallTime?: number;
        }
      ).lastCallTime = startTime;
      return result;
    });
    service.getUnifiedConfiguration = getMock as jest.MockedFunction<
      typeof originalGet
    >;

    const originalUpdate = service.updateUnifiedConfiguration;
    const updateMock = jest
      .fn()
      .mockImplementation(async (agentId, updates) => {
        const startTime = Date.now();
        const result = await originalUpdate(agentId, updates);
        (
          updateMock as jest.MockedFunction<typeof originalUpdate> & {
            lastCallTime?: number;
          }
        ).lastCallTime = startTime;
        return result;
      });
    service.updateUnifiedConfiguration = updateMock as jest.MockedFunction<
      typeof originalUpdate
    >;

    return service;
  }

  /**
   * Create ConfigurationService mock with multi-service workflow coordination
   * Supports workflow state tracking, service communication simulation, and consistency validation
   */
  static createWithWorkflowCoordination(
    config: ServiceMockConfig = {},
  ): ConfigurationServiceWithWorkflow {
    const baseService = this.createWithTransactionSupport(config);

    // Add workflow state tracking
    const workflowState = new Map<string, WorkflowState>();

    // Enhanced coordination method
    const coordinateWorkflow = jest
      .fn()
      .mockImplementation(async (workflowId: string, steps: WorkflowStep[]) => {
        const state: WorkflowState = {
          currentStep: 0,
          completedServices: [],
          failedServices: [],
          startTime: Date.now(),
          compensation: [],
          status: "running",
        };
        workflowState.set(workflowId, state);

        for (let i = 0; i < steps.length; i++) {
          state.currentStep = i;
          const step = steps[i];
          if (!step) continue;

          try {
            // Simulate step execution with realistic latency
            await new Promise((resolve) =>
              globalThis.setTimeout(resolve, step.expectedDuration || 100),
            );
            state.completedServices.push(step.service);
          } catch (error) {
            state.failedServices.push(step.service);
            state.status = "failed";
            // Execute compensation workflow
            for (const service of state.completedServices.reverse()) {
              state.compensation.push(`rollback${service}`);
            }
            state.status = "rolled_back";
            throw error;
          }
        }

        state.status = "completed";
        return {
          workflowId,
          status: "completed",
          duration: Date.now() - state.startTime,
          completedServices: state.completedServices,
        };
      });

    const getWorkflowState = jest
      .fn()
      .mockImplementation((workflowId: string) => {
        return workflowState.get(workflowId);
      });

    // Circuit breaker simulation
    const circuitBreakers = new Map<
      string,
      {
        state: "closed" | "open" | "half-open";
        failures: number;
        lastFailureTime: number;
        threshold: number;
      }
    >();

    const simulateCircuitBreaker = jest
      .fn()
      .mockImplementation(
        (serviceName: string, operation: () => Promise<unknown>) => {
          const breaker = circuitBreakers.get(serviceName) || {
            state: "closed" as const,
            failures: 0,
            lastFailureTime: 0,
            threshold: 3,
          };

          if (
            breaker.state === "open" &&
            Date.now() - breaker.lastFailureTime < 5000
          ) {
            throw new Error(`Circuit breaker open for ${serviceName}`);
          }

          return operation().catch((error) => {
            breaker.failures++;
            breaker.lastFailureTime = Date.now();
            if (breaker.failures >= breaker.threshold) {
              breaker.state = "open";
            }
            circuitBreakers.set(serviceName, breaker);
            throw error;
          });
        },
      );

    const enhancedService = baseService as ConfigurationServiceWithWorkflow;
    enhancedService.coordinateWorkflow = coordinateWorkflow;
    enhancedService.getWorkflowState = getWorkflowState;
    enhancedService.simulateCircuitBreaker = simulateCircuitBreaker;

    return enhancedService;
  }

  /**
   * Create mock with communication pattern simulation
   * Includes circuit breaker, retry patterns, and bulkhead isolation
   */
  static createWithCommunicationPatterns(
    config: ServiceMockConfig = {},
  ): ConfigurationServiceWithWorkflow {
    return this.createWithWorkflowCoordination(config);
  }
}

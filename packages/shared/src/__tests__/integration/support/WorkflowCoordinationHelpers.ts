/**
 * @fileoverview Workflow Coordination Test Helpers
 *
 * Specialized utilities for testing multi-service workflow orchestration
 * with ConfigurationService coordination patterns
 */

/**
 * Workflow step definition for multi-service coordination testing
 */
export interface WorkflowStep {
  service: string;
  operation: string;
  input: Record<string, unknown>;
  expectedDuration?: number;
  dependencies: string[];
  canRunInParallel?: boolean;
  expectedOutput?: Record<string, unknown>;
}

/**
 * Workflow test scenario definition
 */
export interface WorkflowTestScenario {
  name: string;
  description: string;
  steps: WorkflowStep[];
  totalExpectedDuration: number;
  failureScenarios: Record<
    string,
    {
      failingStep: number;
      expectedCompensation: string[];
      errorType?: string;
      errorMessage?: string;
    }
  >;
  successCriteria?: Record<string, boolean>;
}

/**
 * Service communication scenario definition
 */
export interface ServiceCommunicationScenario {
  name: string;
  description?: string;
  communicationFlow: Array<{
    from: string;
    to: string;
    operation: string;
    payload: Record<string, unknown>;
    expectedResponse: Record<string, unknown>;
    timeout: number;
    retryCount?: number;
  }>;
  expectedTotalDuration?: number;
  successCriteria?: Record<string, boolean>;
}

/**
 * Consistency validation scenario definition
 */
export interface ConsistencyScenario {
  name: string;
  description: string;
  initialState: Record<string, unknown>;
  configurationChange: {
    type: string;
    changes: Record<string, unknown>;
    timestamp?: string;
  };
  expectedFinalState: Record<string, unknown>;
  consistencyChecks: Array<{
    service: string;
    validation: string;
    description: string;
  }>;
}

/**
 * Workflow Coordination Test Builder
 * Fluent API for building complex multi-service workflow test scenarios
 */
export class WorkflowCoordinationTestBuilder {
  private scenario: Partial<WorkflowTestScenario> = {};
  private steps: WorkflowStep[] = [];

  static create(): WorkflowCoordinationTestBuilder {
    return new WorkflowCoordinationTestBuilder();
  }

  withName(name: string): WorkflowCoordinationTestBuilder {
    this.scenario.name = name;
    return this;
  }

  withDescription(description: string): WorkflowCoordinationTestBuilder {
    this.scenario.description = description;
    return this;
  }

  addStep(step: WorkflowStep): WorkflowCoordinationTestBuilder {
    this.steps.push(step);
    return this;
  }

  addPersonalityValidation(
    personalityId: string,
    expectedDuration = 150,
  ): WorkflowCoordinationTestBuilder {
    return this.addStep({
      service: "PersonalityService",
      operation: "validatePersonalityConfiguration",
      input: {
        personalityId,
        requiresValidation: true,
      },
      expectedDuration,
      dependencies: [],
      expectedOutput: {
        isValid: true,
        personalityData: {
          id: personalityId,
          name: "Mock Personality",
          creativity: 75,
        },
      },
    });
  }

  addRoleValidation(
    roleId: string,
    dependencies: string[] = ["PersonalityService"],
    expectedDuration = 100,
  ): WorkflowCoordinationTestBuilder {
    return this.addStep({
      service: "RoleService",
      operation: "validateRoleCapabilities",
      input: {
        roleId,
        requiredCapabilities: ["technical-guidance", "problem-solving"],
      },
      expectedDuration,
      dependencies,
      expectedOutput: {
        isValid: true,
        roleData: {
          id: roleId,
          name: "Mock Role",
          capabilities: ["technical-guidance", "problem-solving"],
        },
      },
    });
  }

  addAgentCreation(
    agentData: Record<string, unknown>,
    dependencies: string[] = ["PersonalityService", "RoleService"],
    expectedDuration = 200,
  ): WorkflowCoordinationTestBuilder {
    return this.addStep({
      service: "AgentService",
      operation: "createAgent",
      input: {
        name: "Test Agent",
        ...agentData,
      },
      expectedDuration,
      dependencies,
      expectedOutput: {
        agentId: "agent-test-001",
        status: "created",
        configuration: agentData,
      },
    });
  }

  addFileOperation(
    filePath: string,
    dependencies: string[] = ["AgentService"],
    expectedDuration = 75,
  ): WorkflowCoordinationTestBuilder {
    return this.addStep({
      service: "FileService",
      operation: "createFile",
      input: {
        path: filePath,
        content: "agent-configuration-data",
        metadata: {
          version: "1.0.0",
        },
      },
      expectedDuration,
      dependencies,
      expectedOutput: {
        filePath,
        status: "created",
        checksum: "mock-checksum-123",
      },
    });
  }

  addModelValidation(
    modelConfig: Record<string, unknown>,
    expectedDuration = 120,
  ): WorkflowCoordinationTestBuilder {
    return this.addStep({
      service: "ModelService",
      operation: "validateModelConfiguration",
      input: modelConfig,
      expectedDuration,
      dependencies: [],
      canRunInParallel: true,
      expectedOutput: {
        isValid: true,
        modelInfo: {
          provider: modelConfig.provider,
          modelId: modelConfig.modelId,
          isCompatible: true,
        },
      },
    });
  }

  withFailureScenarios(
    scenarios: WorkflowTestScenario["failureScenarios"],
  ): WorkflowCoordinationTestBuilder {
    this.scenario.failureScenarios = scenarios;
    return this;
  }

  withSuccessCriteria(
    criteria: Record<string, boolean>,
  ): WorkflowCoordinationTestBuilder {
    this.scenario.successCriteria = criteria;
    return this;
  }

  build(): WorkflowTestScenario {
    const totalExpectedDuration = this.steps.reduce(
      (sum, step) => sum + (step.expectedDuration || 0),
      0,
    );

    return {
      name: this.scenario.name || "Unnamed Workflow",
      description:
        this.scenario.description || "Workflow coordination test scenario",
      steps: this.steps,
      totalExpectedDuration,
      failureScenarios: this.scenario.failureScenarios || {},
      successCriteria: this.scenario.successCriteria,
    } as WorkflowTestScenario;
  }
}

/**
 * Service Communication Pattern Test Builder
 * Builds service communication test scenarios with various patterns
 */
export class ServiceCommunicationTestBuilder {
  private scenario: Partial<ServiceCommunicationScenario> = {};
  private communicationFlow: ServiceCommunicationScenario["communicationFlow"] =
    [];

  static create(): ServiceCommunicationTestBuilder {
    return new ServiceCommunicationTestBuilder();
  }

  withName(name: string): ServiceCommunicationTestBuilder {
    this.scenario.name = name;
    return this;
  }

  withDescription(description: string): ServiceCommunicationTestBuilder {
    this.scenario.description = description;
    return this;
  }

  addCommunication(
    communication: ServiceCommunicationScenario["communicationFlow"][0],
  ): ServiceCommunicationTestBuilder {
    this.communicationFlow.push(communication);
    return this;
  }

  addValidationRequest(
    from: string,
    to: string,
    validationData: Record<string, unknown>,
    timeout = 1000,
  ): ServiceCommunicationTestBuilder {
    return this.addCommunication({
      from,
      to,
      operation: "validate",
      payload: validationData,
      expectedResponse: {
        isValid: true,
        errors: [],
        validationTimestamp: new Date().toISOString(),
      },
      timeout,
    });
  }

  addCrossServiceRequest(
    from: string,
    to: string,
    operation: string,
    payload: Record<string, unknown>,
    expectedResponse: Record<string, unknown>,
    timeout = 1500,
  ): ServiceCommunicationTestBuilder {
    return this.addCommunication({
      from,
      to,
      operation,
      payload,
      expectedResponse,
      timeout,
    });
  }

  withSuccessCriteria(
    criteria: Record<string, boolean>,
  ): ServiceCommunicationTestBuilder {
    this.scenario.successCriteria = criteria;
    return this;
  }

  build(): ServiceCommunicationScenario {
    const totalDuration = this.communicationFlow.reduce(
      (sum, comm) => sum + comm.timeout,
      0,
    );

    return {
      name: this.scenario.name || "Unnamed Communication Pattern",
      description: this.scenario.description,
      communicationFlow: this.communicationFlow,
      expectedTotalDuration: totalDuration,
      successCriteria: this.scenario.successCriteria,
    };
  }
}

/**
 * Consistency Validation Helper
 * Utilities for testing system-wide configuration consistency
 */
export class ConsistencyValidationHelper {
  /**
   * Validate configuration consistency across services
   */
  static async validateConsistency(
    services: Record<string, unknown>,
    consistencyChecks: Array<{
      service: string;
      validation: string;
      description: string;
    }>,
  ): Promise<{ isConsistent: boolean; violations: string[] }> {
    const violations: string[] = [];

    for (const check of consistencyChecks) {
      const service = services[check.service];
      if (!service) {
        violations.push(
          `Service ${check.service} not found for consistency check`,
        );
        continue;
      }

      try {
        // Simple validation evaluation for test scenarios
        const isValid = this.evaluateValidation(check.validation, service);
        if (!isValid) {
          violations.push(
            `Consistency violation in ${check.service}: ${check.description}`,
          );
        }
      } catch (error) {
        violations.push(
          `Consistency check failed for ${check.service}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }

    return {
      isConsistent: violations.length === 0,
      violations,
    };
  }

  /**
   * Simple validation evaluation for test scenarios
   * In production, use a safer evaluation method
   */
  private static evaluateValidation(
    validation: string,
    service: unknown,
  ): boolean {
    // This is a simplified validation for test fixtures
    // In real implementation, use a safer evaluation approach
    if (typeof service !== "object" || service === null) {
      return false;
    }

    const serviceObj = service as Record<string, unknown>;

    // Basic checks for common validation patterns
    if (validation.includes("version")) {
      const version = serviceObj.version;
      return typeof version === "number" && version >= 1;
    }

    if (validation.includes("isValid")) {
      return Boolean(serviceObj.isValid);
    }

    if (validation.includes("errors")) {
      const errors = serviceObj.errors;
      return Array.isArray(errors) && errors.length === 0;
    }

    return true; // Default to valid for unhandled cases
  }

  /**
   * Create conflict resolution scenario
   */
  static createConflictScenario(
    operations: Array<{
      operation: string;
      timestamp: string;
      changes: Record<string, unknown>;
      expectedPriority: number;
    }>,
    resolutionStrategy:
      | "last-write-wins"
      | "first-write-wins"
      | "merge" = "last-write-wins",
  ) {
    return {
      concurrentOperations: operations,
      resolutionStrategy,
      expectedOutcome: this.resolveConflict(operations, resolutionStrategy),
    };
  }

  /**
   * Resolve conflict based on strategy
   */
  private static resolveConflict(
    operations: Array<{
      operation: string;
      timestamp: string;
      changes: Record<string, unknown>;
      expectedPriority: number;
    }>,
    strategy: string,
  ): Record<string, unknown> {
    switch (strategy) {
      case "last-write-wins": {
        const latest = operations.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )[0];
        return latest?.changes || {};
      }
      case "first-write-wins": {
        const first = operations.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )[0];
        return first?.changes || {};
      }
      case "merge": {
        // Simple merge strategy - combine all changes
        return operations.reduce(
          (merged, op) => ({ ...merged, ...op.changes }),
          {},
        );
      }
      default:
        return {};
    }
  }

  /**
   * Create consistency scenario from fixture data
   */
  static createConsistencyScenario(
    scenarioData: ConsistencyScenario,
  ): ConsistencyScenario {
    return {
      ...scenarioData,
      configurationChange: {
        ...scenarioData.configurationChange,
        timestamp:
          scenarioData.configurationChange.timestamp ||
          new Date().toISOString(),
      },
    };
  }
}

/**
 * Performance Testing Helper for Multi-Service Coordination
 */
export class PerformanceCoordinationHelper {
  /**
   * Measure workflow execution performance
   */
  static async measureWorkflowPerformance(
    workflow: WorkflowTestScenario,
    executor: (scenario: WorkflowTestScenario) => Promise<unknown>,
  ): Promise<{
    totalDuration: number;
    expectedDuration: number;
    performanceRatio: number;
    stepDurations: Record<string, number>;
  }> {
    const startTime = Date.now();
    const stepDurations: Record<string, number> = {};

    try {
      // Track step execution for detailed performance metrics
      for (const step of workflow.steps) {
        const stepStart = Date.now();
        stepDurations[`${step.service}-${step.operation}`] = stepStart;
      }

      await executor(workflow);

      const totalDuration = Date.now() - startTime;
      const performanceRatio = totalDuration / workflow.totalExpectedDuration;

      // Update step durations with actual execution times
      for (const [stepKey, stepStart] of Object.entries(stepDurations)) {
        stepDurations[stepKey] = Date.now() - stepStart;
      }

      return {
        totalDuration,
        expectedDuration: workflow.totalExpectedDuration,
        performanceRatio,
        stepDurations,
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      throw new Error(
        `Workflow performance test failed after ${totalDuration}ms: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Validate performance thresholds for coordination workflows
   */
  static validatePerformanceThresholds(
    actualDuration: number,
    expectedDuration: number,
    tolerancePercent = 20,
  ): {
    isWithinThreshold: boolean;
    actualRatio: number;
    threshold: number;
  } {
    const threshold = expectedDuration * (1 + tolerancePercent / 100);
    const actualRatio = actualDuration / expectedDuration;

    return {
      isWithinThreshold: actualDuration <= threshold,
      actualRatio,
      threshold: 1 + tolerancePercent / 100,
    };
  }

  /**
   * Create performance test scenario
   */
  static createPerformanceScenario(
    baseScenario: WorkflowTestScenario,
    performanceConfig: {
      maxDurationMs?: number;
      tolerancePercent?: number;
      concurrentExecutions?: number;
    } = {},
  ) {
    return {
      ...baseScenario,
      performanceConfig: {
        maxDurationMs:
          performanceConfig.maxDurationMs ||
          baseScenario.totalExpectedDuration * 2,
        tolerancePercent: performanceConfig.tolerancePercent || 20,
        concurrentExecutions: performanceConfig.concurrentExecutions || 1,
      },
    };
  }
}

/**
 * Fixture Loader Helper
 * Utilities for loading and validating test fixtures
 */
export class FixtureLoaderHelper {
  /**
   * Load workflow fixture from JSON
   */
  static loadWorkflowFixture(
    _fixturePath: string,
  ): Promise<WorkflowTestScenario[]> {
    // In a real implementation, this would load from file system
    // For now, return a mock implementation
    return Promise.resolve([]);
  }

  /**
   * Load communication pattern fixture from JSON
   */
  static loadCommunicationFixture(
    _fixturePath: string,
  ): Promise<ServiceCommunicationScenario[]> {
    // In a real implementation, this would load from file system
    // For now, return a mock implementation
    return Promise.resolve([]);
  }

  /**
   * Load consistency scenario fixture from JSON
   */
  static loadConsistencyFixture(
    _fixturePath: string,
  ): Promise<ConsistencyScenario[]> {
    // In a real implementation, this would load from file system
    // For now, return a mock implementation
    return Promise.resolve([]);
  }

  /**
   * Validate fixture structure
   */
  static validateFixtureStructure(
    fixture: unknown,
    expectedType: "workflow" | "communication" | "consistency",
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!fixture || typeof fixture !== "object") {
      errors.push("Fixture must be an object");
      return { isValid: false, errors };
    }

    const fixtureObj = fixture as Record<string, unknown>;

    switch (expectedType) {
      case "workflow":
        if (!fixtureObj.steps || !Array.isArray(fixtureObj.steps)) {
          errors.push("Workflow fixture must have steps array");
        }
        if (typeof fixtureObj.totalExpectedDuration !== "number") {
          errors.push(
            "Workflow fixture must have totalExpectedDuration number",
          );
        }
        break;
      case "communication":
        if (
          !fixtureObj.communicationFlow ||
          !Array.isArray(fixtureObj.communicationFlow)
        ) {
          errors.push(
            "Communication fixture must have communicationFlow array",
          );
        }
        break;
      case "consistency":
        if (
          !fixtureObj.consistencyChecks ||
          !Array.isArray(fixtureObj.consistencyChecks)
        ) {
          errors.push("Consistency fixture must have consistencyChecks array");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

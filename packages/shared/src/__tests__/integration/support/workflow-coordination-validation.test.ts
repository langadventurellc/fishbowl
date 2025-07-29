/**
 * @fileoverview Validation tests for workflow coordination infrastructure
 *
 * Ensures new workflow coordination features work correctly and maintain
 * backward compatibility with existing mock factories
 */

import { ConfigurationServiceMockFactory } from "./ConfigurationServiceMockFactory";
import {
  WorkflowCoordinationTestBuilder,
  ServiceCommunicationTestBuilder,
  ConsistencyValidationHelper,
  PerformanceCoordinationHelper,
} from "./WorkflowCoordinationHelpers";

describe("Workflow Coordination Infrastructure Validation", () => {
  describe("ConfigurationServiceMockFactory enhancements", () => {
    it("should maintain backward compatibility with existing factory methods", () => {
      // Test existing methods still work
      const basicMock = ConfigurationServiceMockFactory.create();
      expect(basicMock.createUnifiedConfiguration).toBeDefined();
      expect(basicMock.getUnifiedConfiguration).toBeDefined();
      expect(basicMock.updateUnifiedConfiguration).toBeDefined();
      expect(basicMock.deleteUnifiedConfiguration).toBeDefined();

      const successMock = ConfigurationServiceMockFactory.createSuccess();
      expect(successMock.createUnifiedConfiguration).toBeDefined();

      const failureMock =
        ConfigurationServiceMockFactory.createFailure("Test error");
      expect(failureMock.createUnifiedConfiguration).toBeDefined();

      const latencyMock =
        ConfigurationServiceMockFactory.createWithLatency(100);
      expect(latencyMock.createUnifiedConfiguration).toBeDefined();
    });

    it("should create workflow coordination mock with enhanced methods", () => {
      const workflowMock =
        ConfigurationServiceMockFactory.createWithWorkflowCoordination();

      // Should have all original methods
      expect(workflowMock.createUnifiedConfiguration).toBeDefined();
      expect(workflowMock.getUnifiedConfiguration).toBeDefined();
      expect(workflowMock.rollbackConfiguration).toBeDefined();

      // Should have new workflow methods
      expect(workflowMock.coordinateWorkflow).toBeDefined();
      expect(workflowMock.getWorkflowState).toBeDefined();
      expect(workflowMock.simulateCircuitBreaker).toBeDefined();
    });

    it("should create communication patterns mock", () => {
      const communicationMock =
        ConfigurationServiceMockFactory.createWithCommunicationPatterns();

      // Should have all workflow coordination features
      expect(communicationMock.coordinateWorkflow).toBeDefined();
      expect(communicationMock.getWorkflowState).toBeDefined();
      expect(communicationMock.simulateCircuitBreaker).toBeDefined();
    });
  });

  describe("WorkflowCoordinationTestBuilder", () => {
    it("should build workflow scenarios with fluent API", () => {
      const workflow = WorkflowCoordinationTestBuilder.create()
        .withName("Test Workflow")
        .withDescription("Test workflow for validation")
        .addPersonalityValidation("personality-001")
        .addRoleValidation("role-001")
        .addAgentCreation({
          personalityId: "personality-001",
          roleId: "role-001",
        })
        .addFileOperation("/test/agent.json")
        .withSuccessCriteria({
          allStepsCompleted: true,
          performanceWithinThreshold: true,
        })
        .build();

      expect(workflow.name).toBe("Test Workflow");
      expect(workflow.description).toBe("Test workflow for validation");
      expect(workflow.steps).toHaveLength(4);
      expect(workflow.totalExpectedDuration).toBeGreaterThan(0);
      expect(workflow.successCriteria).toEqual({
        allStepsCompleted: true,
        performanceWithinThreshold: true,
      });

      // Validate step structure
      const personalityStep = workflow.steps[0];
      expect(personalityStep?.service).toBe("PersonalityService");
      expect(personalityStep?.operation).toBe(
        "validatePersonalityConfiguration",
      );
      expect(personalityStep?.expectedDuration).toBe(150);
    });

    it("should build workflow with failure scenarios", () => {
      const workflow = WorkflowCoordinationTestBuilder.create()
        .withName("Failure Test Workflow")
        .addPersonalityValidation("personality-001")
        .addRoleValidation("role-001")
        .withFailureScenarios({
          personalityFailure: {
            failingStep: 0,
            expectedCompensation: ["rollbackPersonality"],
            errorType: "ValidationError",
          },
        })
        .build();

      expect(workflow.failureScenarios).toHaveProperty("personalityFailure");
      expect(workflow.failureScenarios.personalityFailure?.failingStep).toBe(0);
    });
  });

  describe("ServiceCommunicationTestBuilder", () => {
    it("should build communication scenarios", () => {
      const scenario = ServiceCommunicationTestBuilder.create()
        .withName("Test Communication")
        .withDescription("Test communication scenario")
        .addValidationRequest("ConfigurationService", "PersonalityService", {
          personalityId: "personality-001",
        })
        .addCrossServiceRequest(
          "ConfigurationService",
          "RoleService",
          "validateRole",
          { roleId: "role-001" },
          { isValid: true },
        )
        .build();

      expect(scenario.name).toBe("Test Communication");
      expect(scenario.communicationFlow).toHaveLength(2);
      expect(scenario.expectedTotalDuration).toBeGreaterThan(0);

      const validationRequest = scenario.communicationFlow[0];
      expect(validationRequest?.from).toBe("ConfigurationService");
      expect(validationRequest?.to).toBe("PersonalityService");
      expect(validationRequest?.operation).toBe("validate");
    });
  });

  describe("ConsistencyValidationHelper", () => {
    it("should validate service consistency", async () => {
      const services = {
        PersonalityService: {
          version: 2,
          isValid: true,
          errors: [],
        },
        AgentService: {
          version: 2,
          isValid: true,
          errors: [],
        },
      };

      const consistencyChecks = [
        {
          service: "PersonalityService",
          validation: "version >= 1",
          description: "Version should be at least 1",
        },
        {
          service: "AgentService",
          validation: "isValid === true",
          description: "Service should be valid",
        },
      ];

      const result = await ConsistencyValidationHelper.validateConsistency(
        services,
        consistencyChecks,
      );

      expect(result.isConsistent).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should detect consistency violations", async () => {
      const services = {
        PersonalityService: {
          version: 0, // Invalid version
          isValid: false,
          errors: ["Test error"],
        },
      };

      const consistencyChecks = [
        {
          service: "PersonalityService",
          validation: "version >= 1",
          description: "Version should be at least 1",
        },
        {
          service: "PersonalityService",
          validation: "errors.length === 0",
          description: "Should have no errors",
        },
      ];

      const result = await ConsistencyValidationHelper.validateConsistency(
        services,
        consistencyChecks,
      );

      expect(result.isConsistent).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it("should create conflict resolution scenarios", () => {
      const operations = [
        {
          operation: "updatePersonality",
          timestamp: "2024-01-01T10:00:00.000Z",
          changes: { creativity: 80 },
          expectedPriority: 1,
        },
        {
          operation: "updatePersonality",
          timestamp: "2024-01-01T10:00:01.000Z",
          changes: { creativity: 90 },
          expectedPriority: 2,
        },
      ];

      const scenario = ConsistencyValidationHelper.createConflictScenario(
        operations,
        "last-write-wins",
      );

      expect(scenario.concurrentOperations).toHaveLength(2);
      expect(scenario.resolutionStrategy).toBe("last-write-wins");
      expect(scenario.expectedOutcome).toEqual({ creativity: 90 });
    });
  });

  describe("PerformanceCoordinationHelper", () => {
    it("should validate performance thresholds", () => {
      const result =
        PerformanceCoordinationHelper.validatePerformanceThresholds(
          1200, // actual duration
          1000, // expected duration
          20, // tolerance percent
        );

      expect(result.isWithinThreshold).toBe(true);
      expect(result.actualRatio).toBe(1.2);
      expect(result.threshold).toBe(1.2);
    });

    it("should detect performance threshold violations", () => {
      const result =
        PerformanceCoordinationHelper.validatePerformanceThresholds(
          2500, // actual duration - exceeds threshold
          1000, // expected duration
          20, // tolerance percent
        );

      expect(result.isWithinThreshold).toBe(false);
      expect(result.actualRatio).toBe(2.5);
      expect(result.threshold).toBe(1.2);
    });

    it("should create performance test scenarios", () => {
      const baseScenario = WorkflowCoordinationTestBuilder.create()
        .withName("Performance Test")
        .addPersonalityValidation("personality-001")
        .build();

      const performanceScenario =
        PerformanceCoordinationHelper.createPerformanceScenario(baseScenario, {
          maxDurationMs: 2000,
          tolerancePercent: 15,
          concurrentExecutions: 3,
        });

      expect(performanceScenario.name).toBe("Performance Test");
      expect(performanceScenario.performanceConfig).toEqual({
        maxDurationMs: 2000,
        tolerancePercent: 15,
        concurrentExecutions: 3,
      });
    });
  });

  describe("Integration validation", () => {
    it("should integrate workflow coordination with mock factory", async () => {
      const mockService =
        ConfigurationServiceMockFactory.createWithWorkflowCoordination();

      const workflow = WorkflowCoordinationTestBuilder.create()
        .withName("Integration Test")
        .addPersonalityValidation("personality-001", 100)
        .addRoleValidation("role-001", ["PersonalityService"], 50)
        .build();

      // Test workflow coordination
      const result = await mockService.coordinateWorkflow(
        "test-workflow-001",
        workflow.steps,
      );

      expect(result.workflowId).toBe("test-workflow-001");
      expect(result.status).toBe("completed");
      expect(result.duration).toBeGreaterThan(0);
      expect(result.completedServices).toEqual([
        "PersonalityService",
        "RoleService",
      ]);

      // Test workflow state tracking
      const state = mockService.getWorkflowState("test-workflow-001");
      expect(state).toBeDefined();
      expect(state?.completedServices).toEqual([
        "PersonalityService",
        "RoleService",
      ]);
      expect(state?.status).toBe("completed");
    });
  });
});

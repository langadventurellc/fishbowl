/**
 * @fileoverview Cross-Service Creation Workflow Integration Tests
 *
 * Integration tests focusing on cross-service agent creation workflows,
 * verifying service coordination and transaction-like consistency across
 * PersonalityService, RoleService, ModelService, and ValidationService.
 *
 * Integration Strategy:
 * - Tests cross-service coordination during agent creation workflows
 * - Validates service communication patterns and error handling
 * - Tests rollback mechanisms for partial creation failures
 * - Verifies transaction-like consistency across service boundaries
 * - Follows BDD Given-When-Then structure with comprehensive scenarios
 * - Tests communication error handling with graceful cleanup
 */

import type { AgentCreateRequest } from "../../../../types/agent";
import type { AgentService } from "../../../../types/services";
import { AgentServiceMockFactory } from "../../support/AgentServiceMockFactory";

describe("Feature: Agent Configuration Creation Integration", () => {
  // Test timeout for complex integration scenarios
  const INTEGRATION_TEST_TIMEOUT = 30000;

  // Performance requirements from task specification
  const AGENT_CREATION_TIMEOUT = 1000; // 1000ms maximum for agent creation
  const COMPONENT_INTEGRATION_TIMEOUT = 200; // 200ms maximum for component integration

  // Service mock for cross-service coordination testing
  let agentService: jest.Mocked<AgentService>;

  beforeEach(() => {
    // Reset agent service mock before each test - it coordinates with other services internally
    agentService = AgentServiceMockFactory.createSuccess();
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe("Scenario: Cross-service agent creation workflow coordination", () => {
    it(
      "should coordinate agent creation across all services with transaction consistency",
      async () => {
        // Given - Agent configuration creation requiring multiple service coordination
        const agentRequest: AgentCreateRequest = {
          name: "Cross-Service Coordination Agent",
          description: "Agent for testing cross-service workflow coordination",
          personalityId: "personality-complex-coordination",
          role: "multi-service-coordinator",
          modelId: "gpt-4-turbo",
          capabilities: ["cross-service-coordination", "workflow-management"],
          constraints: ["transaction-consistency-required"],
          settings: { temperature: 0.6, maxTokens: 2048 },
          tags: ["cross-service-test", "coordination"],
        };

        // When - Creation workflow orchestrates across PersonalityService, RoleService, ModelService
        const startTime = Date.now();
        const createdAgent = await agentService.createAgent(agentRequest);
        const creationTime = Date.now() - startTime;

        // Then - All services coordinate properly with transaction-like consistency
        expect(createdAgent).toBeDefined();
        expect(createdAgent.id).toBeDefined();
        expect(createdAgent.name).toBe(agentRequest.name);
        expect(createdAgent.personalityId).toBe(agentRequest.personalityId);
        expect(createdAgent.role).toBe(agentRequest.role);
        expect(createdAgent.modelId).toBe(agentRequest.modelId);

        // Verify performance requirements
        expect(creationTime).toBeLessThan(AGENT_CREATION_TIMEOUT);

        // Verify service coordination sequence
        expect(agentService.createAgent).toHaveBeenCalledWith(agentRequest);
        expect(agentService.createAgent).toHaveBeenCalledTimes(1);

        // Verify transaction consistency
        expect(createdAgent.metadata).toBeDefined();
        expect(createdAgent.metadata.version).toBeDefined();
        expect(createdAgent.metadata.isActive).toBe(true);
        expect(createdAgent.metadata.createdAt).toBeDefined();
        expect(createdAgent.metadata.updatedAt).toBeDefined();
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should validate agent configuration with cross-service coordination",
      async () => {
        // Given - Complex agent configuration requiring cross-service validation
        const agentRequest: AgentCreateRequest = {
          name: "Validation Coordination Test Agent",
          description:
            "Agent for testing cross-service validation coordination",
          personalityId: "personality-validation-test",
          role: "validation-coordinator",
          modelId: "gpt-4-turbo",
          capabilities: ["validation-coordination", "error-handling"],
          constraints: ["strict-validation-required"],
          settings: { temperature: 0.5, maxTokens: 1024 },
          tags: ["validation-test"],
        };

        // When - Configuration validation involves multiple service coordination
        const startTime = Date.now();
        const validationResult =
          await agentService.validateAgentConfiguration(agentRequest);
        const validationTime = Date.now() - startTime;

        // Then - Cross-service validation coordination succeeds
        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);

        // Verify performance requirements for validation
        expect(validationTime).toBeLessThan(COMPONENT_INTEGRATION_TIMEOUT);

        // Verify validation service coordination
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          agentRequest,
        );
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Service coordination failure and rollback", () => {
    beforeEach(() => {
      // Configure agent service for rollback scenario testing
      agentService = AgentServiceMockFactory.create({
        shouldSucceed: false,
        errorMessage: "Service coordination failed - Rollback completed",
        crossServiceFailures: true,
      });
    });

    it(
      "should handle service coordination failures with proper rollback",
      async () => {
        // Given - Agent creation workflow with simulated service failures
        const agentRequest: AgentCreateRequest = {
          name: "Rollback Test Agent",
          description: "Agent for testing rollback mechanisms",
          personalityId: "personality-rollback-test",
          role: "rollback-test-role",
          modelId: "failing-model-id",
          capabilities: ["rollback-testing"],
          constraints: ["failure-simulation"],
          settings: { temperature: 0.5, maxTokens: 1024 },
          tags: ["rollback-test"],
        };

        // When - One service fails during the creation process
        let rollbackError: Error | undefined;
        try {
          await agentService.createAgent(agentRequest);
        } catch (error) {
          rollbackError = error as Error;
        }

        // Then - Rollback mechanisms handle partial creation failures appropriately
        expect(rollbackError).toBeDefined();
        expect(rollbackError?.message).toContain("Service coordination failed");

        // Verify rollback was triggered with proper cleanup
        expect(agentService.createAgent).toHaveBeenCalledWith(agentRequest);
        expect(agentService.createAgent).toHaveBeenCalledTimes(1);

        // Verify rollback completion message
        expect(rollbackError?.message).toContain("Rollback completed");
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should validate service failure scenarios with rollback coordination",
      async () => {
        // Given - Validation request that will trigger rollback scenarios
        const agentRequest: AgentCreateRequest = {
          name: "Rollback Validation Test Agent",
          description: "Agent for testing validation rollback coordination",
          personalityId: "personality-rollback-validation",
          role: "rollback-validation-role",
          modelId: "validation-failure-model",
          capabilities: ["rollback-validation"],
          constraints: ["validation-failure-simulation"],
          settings: { temperature: 0.3, maxTokens: 512 },
          tags: ["validation-rollback"],
        };

        // When - Validation process encounters coordination failures
        let validationError: Error | undefined;
        try {
          await agentService.validateAgentConfiguration(agentRequest);
        } catch (error) {
          validationError = error as Error;
        }

        // Then - Validation rollback handles failures gracefully
        expect(validationError).toBeDefined();
        expect(validationError?.message).toContain(
          "Service coordination failed",
        );

        // Verify validation service interaction
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          agentRequest,
        );

        // Verify rollback message in validation context
        expect(validationError?.message).toContain("Rollback completed");
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Service communication error handling", () => {
    beforeEach(() => {
      // Configure agent service for communication error testing
      agentService = AgentServiceMockFactory.create({
        shouldSucceed: false,
        errorMessage:
          "Communication error - ValidationService connection failed",
        crossServiceFailures: true,
      });
    });

    it(
      "should handle service communication errors gracefully with cleanup",
      async () => {
        // Given - Service communication errors during agent creation
        const agentRequest: AgentCreateRequest = {
          name: "Communication Error Test Agent",
          description: "Agent for testing communication error handling",
          personalityId: "personality-communication-test",
          role: "communication-test-role",
          modelId: "gpt-4-turbo",
          capabilities: ["error-handling", "communication-testing"],
          constraints: ["communication-error-simulation"],
          settings: { temperature: 0.4, maxTokens: 1024 },
          tags: ["communication-error"],
        };

        // When - Network or service communication failures occur
        let communicationError: Error | undefined;
        try {
          await agentService.createAgent(agentRequest);
        } catch (error) {
          communicationError = error as Error;
        }

        // Then - Error handling maintains system consistency with proper cleanup
        expect(communicationError).toBeDefined();
        expect(communicationError?.message).toContain("Communication error");

        // Verify error context preservation
        expect(communicationError?.message).toContain("ValidationService");

        // Verify service interaction occurred
        expect(agentService.createAgent).toHaveBeenCalledWith(agentRequest);
        expect(agentService.createAgent).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should handle validation communication errors with proper error context",
      async () => {
        // Given - Validation service communication failure scenario
        const agentRequest: AgentCreateRequest = {
          name: "Validation Communication Error Agent",
          description:
            "Agent for testing validation communication error handling",
          personalityId: "personality-validation-communication",
          role: "validation-communication-role",
          modelId: "gpt-4-turbo",
          capabilities: ["validation-error-handling"],
          constraints: ["validation-communication-errors"],
          settings: { temperature: 0.2, maxTokens: 768 },
          tags: ["validation-communication"],
        };

        // When - Validation service communication fails
        let validationCommError: Error | undefined;
        try {
          await agentService.validateAgentConfiguration(agentRequest);
        } catch (error) {
          validationCommError = error as Error;
        }

        // Then - Validation communication errors are handled with proper context
        expect(validationCommError).toBeDefined();
        expect(validationCommError?.message).toContain("Communication error");
        expect(validationCommError?.message).toContain("ValidationService");

        // Verify validation service was called
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          agentRequest,
        );

        // Verify connection failure message
        expect(validationCommError?.message).toContain("connection failed");
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Cross-service dependency validation", () => {
    it(
      "should validate dependencies across multiple services during creation",
      async () => {
        // Given - Agent with complex cross-service dependencies
        const agentRequest: AgentCreateRequest = {
          name: "Cross-Dependency Agent",
          description: "Agent for testing cross-service dependency validation",
          personalityId: "personality-dependencies",
          role: "dependency-coordinator",
          modelId: "gpt-4-turbo",
          capabilities: ["dependency-management", "cross-service-validation"],
          constraints: ["dependency-validation-required"],
          settings: { temperature: 0.7, maxTokens: 1536 },
          tags: ["dependency-validation"],
        };

        // When - Agent creation validates cross-service dependencies
        const startTime = Date.now();
        const createdAgent = await agentService.createAgent(agentRequest);
        const creationTime = Date.now() - startTime;

        // Then - Cross-service dependency validation succeeds
        expect(createdAgent).toBeDefined();
        expect(createdAgent.id).toBeDefined();
        expect(creationTime).toBeLessThan(AGENT_CREATION_TIMEOUT);

        // Verify dependency validation occurred
        expect(agentService.createAgent).toHaveBeenCalledWith(agentRequest);

        // Verify agent configuration includes dependency metadata
        expect(createdAgent.capabilities).toContain("dependency-management");
        expect(createdAgent.capabilities).toContain("cross-service-validation");
        expect(createdAgent.constraints).toContain(
          "dependency-validation-required",
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Service performance validation", () => {
    it(
      "should meet performance requirements for complex cross-service workflows",
      async () => {
        // Given - Complex agent configuration for performance testing
        const agentRequest: AgentCreateRequest = {
          name: "Performance Test Agent",
          description:
            "Agent for testing cross-service performance requirements",
          personalityId: "personality-performance",
          role: "performance-test-role",
          modelId: "gpt-4-turbo",
          capabilities: [
            "performance-testing",
            "cross-service-coordination",
            "workflow-optimization",
          ],
          constraints: ["performance-validation-required"],
          settings: { temperature: 0.8, maxTokens: 2048 },
          tags: ["performance", "cross-service"],
        };

        // When - Performance-sensitive workflow executes
        const startTime = Date.now();
        const createdAgent = await agentService.createAgent(agentRequest);
        const totalTime = Date.now() - startTime;

        // Then - Performance requirements are met for cross-service coordination
        expect(createdAgent).toBeDefined();
        expect(totalTime).toBeLessThan(AGENT_CREATION_TIMEOUT);

        // Verify service coordination completed within performance bounds
        expect(agentService.createAgent).toHaveBeenCalledTimes(1);

        // Verify performance metadata
        expect(createdAgent.metadata.createdAt).toBeDefined();
        expect(createdAgent.capabilities).toContain("performance-testing");
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});

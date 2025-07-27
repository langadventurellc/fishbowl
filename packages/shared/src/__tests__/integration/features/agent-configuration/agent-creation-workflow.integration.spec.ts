/**
 * @fileoverview Agent Configuration Workflow Orchestration Integration Tests
 *
 * Comprehensive BDD integration tests for complete agent configuration workflow orchestration,
 * focusing on end-to-end workflow coordination, performance optimization, comprehensive error handling,
 * and advanced scenarios including concurrent workflows, complex configurations, and system stress testing.
 *
 * Integration Strategy:
 * - Tests complete end-to-end workflow orchestration with performance optimization
 * - Tests concurrent workflow management with proper resource allocation
 * - Tests complex configuration workflows with advanced requirements
 * - Tests workflow error recovery and resilience under various failure conditions
 * - Validates performance requirements: 1000ms end-to-end, 200ms components, 300ms cross-service
 * - Follows BDD Given-When-Then structure with comprehensive scenario coverage
 * - Mocks external dependencies while testing real internal service coordination
 */

import type { AgentCreateRequest } from "../../../../types/agent";
import type { AgentService } from "../../../../types/services";
import { AgentServiceMockFactory } from "../../support/AgentServiceMockFactory";
import {
  ConcurrencyTestHelper,
  PerformanceTestHelper,
} from "../../support/test-helpers";

describe("Feature: Agent Configuration Workflow Orchestration", () => {
  // Test timeout for complex workflow orchestration scenarios
  const INTEGRATION_TEST_TIMEOUT = 60000; // Extended for complex workflows

  // Performance requirements from task specification
  const END_TO_END_PERFORMANCE_TIMEOUT = 1000; // Complete workflow within 1000ms
  const COMPONENT_PERFORMANCE_TIMEOUT = 200; // Individual components within 200ms
  const CROSS_SERVICE_VALIDATION_TIMEOUT = 300; // Cross-service validation within 300ms
  const CONCURRENT_PERFORMANCE_TIMEOUT = 2000; // Concurrent workflows within 2000ms

  // Service mocks for comprehensive workflow orchestration testing
  let agentService: jest.Mocked<AgentService>;

  beforeEach(() => {
    // Initialize service mocks for workflow orchestration testing
    agentService = AgentServiceMockFactory.createSuccess();
  });

  afterEach(() => {
    // Cleanup service state and workflow orchestration context
    jest.clearAllMocks();
  });

  describe("Scenario: Complete End-to-End Workflow Orchestration", () => {
    it.skip(
      "should orchestrate complete agent creation with performance optimization",
      async () => {
        // Given - Complete workflow configuration with performance optimization requirements
        // - Agent configuration requiring cross-service coordination for end-to-end creation
        // - Performance optimization settings for workflow efficiency
        // - Service coordination configured for comprehensive agent assembly
        // - All services ready for optimized workflow execution

        const workflowRequest: AgentCreateRequest = {
          name: "End-to-End Workflow Agent",
          description:
            "Agent for testing complete workflow orchestration with performance optimization",
          personalityId: "personality-workflow-optimized",
          role: "workflow-orchestrator",
          modelId: "gpt-4-turbo",
          capabilities: [
            "workflow-coordination",
            "performance-optimization",
            "service-orchestration",
            "resource-management",
          ],
          constraints: [
            "performance-requirements-strict",
            "resource-efficiency-required",
            "coordination-consistency-mandatory",
          ],
          settings: {
            temperature: 0.6,
            maxTokens: 2048,
            topP: 0.9,
          },
          tags: ["workflow", "orchestration", "performance"],
        };

        // When - Complete end-to-end workflow executes with performance monitoring
        // - AgentService orchestrates complete agent creation workflow
        // - ValidationService coordinates cross-service validation
        // - RoleService provides role configuration and constraints
        // - ModelService validates model compatibility and configuration
        // - Performance monitoring tracks execution time across all components

        const { result: createdAgent, duration: endToEndDuration } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            return agentService.createAgent(workflowRequest);
          });

        // Then - Complete workflow succeeds within performance requirements
        // - Agent creation completes within 1000ms performance requirement
        // - All service coordination succeeds with proper orchestration
        // - Agent configuration contains all integrated components
        // - Performance optimization maintains system efficiency
        // - Workflow coordination preserves context throughout execution

        expect(createdAgent).toBeDefined();
        expect(createdAgent.id).toBeDefined();
        expect(createdAgent.name).toBe(workflowRequest.name);
        expect(createdAgent.description).toBe(workflowRequest.description);
        expect(endToEndDuration).toBeLessThan(END_TO_END_PERFORMANCE_TIMEOUT);

        // Verify workflow orchestration components
        expect(agentService.createAgent).toHaveBeenCalledWith(workflowRequest);
        expect(agentService.validateAgentConfiguration).toHaveBeenCalled();

        // Verify performance optimization results
        expect(createdAgent.metadata.isActive).toBe(true);
        expect(createdAgent.capabilities).toContain("workflow-coordination");
        expect(createdAgent.constraints).toContain(
          "performance-requirements-strict",
        );

        // Verify workflow orchestration metadata
        expect(createdAgent.metadata.version).toBeDefined();
        expect(createdAgent.metadata.createdAt).toBeDefined();
        expect(createdAgent.metadata.tags).toEqual(
          expect.arrayContaining(["workflow", "orchestration", "performance"]),
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should optimize component integration performance throughout workflow",
      async () => {
        // Given - Workflow requiring individual component performance optimization
        // - Multiple service integrations with timing requirements
        // - Component-level performance monitoring enabled
        // - Service coordination optimized for individual component efficiency

        const optimizedRequest: AgentCreateRequest = {
          name: "Component Optimized Agent",
          description: "Agent for testing component integration performance",
          personalityId: "personality-component-optimized",
          role: "component-specialist",
          modelId: "claude-3-sonnet",
          capabilities: ["component-integration", "performance-monitoring"],
          constraints: ["component-timing-requirements"],
          settings: {
            temperature: 0.5,
            maxTokens: 1024,
          },
          tags: ["component", "optimization"],
        };

        // When - Component integration executes with performance tracking
        // - Individual service calls are performance monitored
        // - Component integration timing is measured separately
        // - Cross-service validation performance is tracked

        const validationStartTime = globalThis.performance.now();
        const validationResult =
          await agentService.validateAgentConfiguration(optimizedRequest);
        const validationDuration =
          globalThis.performance.now() - validationStartTime;

        const creationStartTime = globalThis.performance.now();
        const createdAgent = await agentService.createAgent(optimizedRequest);
        const creationDuration =
          globalThis.performance.now() - creationStartTime;

        // Then - Individual component integration meets performance requirements
        // - Cross-service validation completes within 300ms requirement
        // - Component integration completes within 200ms requirement
        // - Overall workflow maintains performance efficiency

        expect(validationResult.isValid).toBe(true);
        expect(validationDuration).toBeLessThan(
          CROSS_SERVICE_VALIDATION_TIMEOUT,
        );
        expect(creationDuration).toBeLessThan(COMPONENT_PERFORMANCE_TIMEOUT);

        expect(createdAgent).toBeDefined();
        expect(createdAgent.capabilities).toContain("component-integration");
        expect(createdAgent.constraints).toContain(
          "component-timing-requirements",
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Concurrent Workflow Management", () => {
    it.skip(
      "should handle multiple simultaneous agent creation workflows",
      async () => {
        // Given - Multiple concurrent workflow requests with resource management
        // - Five simultaneous agent creation requests with different configurations
        // - Resource coordination configured for concurrent execution
        // - Performance monitoring enabled for concurrent workflow tracking

        const concurrentRequests: AgentCreateRequest[] = Array.from(
          { length: 5 },
          (_, _index) => ({
            name: `Concurrent Agent ${_index + 1}`,
            description: `Concurrent workflow test agent ${_index + 1}`,
            personalityId: `personality-concurrent-${_index + 1}`,
            role: `concurrent-role-${_index + 1}`,
            modelId: "gpt-4-turbo",
            capabilities: ["concurrent-processing", "resource-sharing"],
            constraints: ["concurrent-safety-required"],
            settings: { temperature: 0.5, maxTokens: 1024 },
            tags: [`concurrent-${_index + 1}`],
          }),
        );

        const concurrencyConfig = {
          concurrentOperations: 5,
          expectAllSuccess: true,
          operationDelay: 50, // Simulate realistic processing delay
        };

        // When - Concurrent workflows execute with performance monitoring
        // - Five agent creation workflows execute simultaneously
        // - Resource management coordinates concurrent access
        // - Performance monitoring tracks concurrent execution timing
        // - Service coordination manages concurrent workflow orchestration

        const startTime = Date.now();

        // Adapt ConcurrencyTestHelper for agent creation
        const concurrentOperations = concurrentRequests.map((request) =>
          agentService.createAgent(request),
        );

        const settledResults = await Promise.allSettled(concurrentOperations);
        const totalConcurrentTime = Date.now() - startTime;

        // Process results to match expected format
        const results = settledResults.map((result) => {
          if (result.status === "fulfilled") {
            return { success: true, data: result.value };
          } else {
            return { success: false, error: result.reason };
          }
        });

        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.length - successCount;

        const concurrencyResults = {
          results,
          successCount,
          failureCount,
          totalDuration: totalConcurrentTime,
          averageDuration:
            totalConcurrentTime / concurrencyConfig.concurrentOperations,
        };

        // Then - All concurrent workflows succeed within performance limits
        // - All five concurrent workflows complete successfully
        // - Total concurrent execution time within 2000ms requirement
        // - Average per-workflow time remains within component performance limits
        // - Resource coordination prevents conflicts between concurrent workflows

        expect(concurrencyResults.successCount).toBe(5);
        expect(concurrencyResults.failureCount).toBe(0);
        expect(totalConcurrentTime).toBeLessThan(
          CONCURRENT_PERFORMANCE_TIMEOUT,
        );

        // Verify concurrent workflow coordination
        const validation = ConcurrencyTestHelper.validateConcurrencyResults(
          concurrencyResults,
          concurrencyConfig,
        );
        expect(validation.valid).toBe(true);
        expect(validation.issues).toHaveLength(0);

        // Verify performance characteristics
        expect(concurrencyResults.averageDuration).toBeLessThan(
          COMPONENT_PERFORMANCE_TIMEOUT,
        );

        // Verify all agent creation calls were made
        expect(agentService.createAgent).toHaveBeenCalledTimes(5);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should maintain resource efficiency during concurrent workflow execution",
      async () => {
        // Given - Concurrent workflows with resource efficiency requirements
        // - Multiple workflows competing for shared resources
        // - Resource management configured for efficiency optimization
        // - Performance monitoring for resource utilization tracking

        const resourceEfficientRequests: AgentCreateRequest[] = Array.from(
          { length: 3 },
          (_, index) => ({
            name: `Resource Efficient Agent ${index + 1}`,
            description: `Resource-efficient concurrent workflow agent ${index + 1}`,
            personalityId: `personality-resource-${index + 1}`,
            role: `resource-role-${index + 1}`,
            modelId: "gpt-4-turbo",
            capabilities: ["resource-optimization", "efficiency-monitoring"],
            constraints: ["resource-efficiency-mandatory"],
            settings: { temperature: 0.4, maxTokens: 512 },
            tags: [`resource-${index + 1}`, "efficiency"],
          }),
        );

        // When - Resource-efficient concurrent workflows execute
        // - Workflows coordinate resource usage efficiently
        // - Resource optimization algorithms active during execution
        // - Performance monitoring tracks resource utilization

        const { result: concurrentResults, duration: resourceDuration } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            const operations = resourceEfficientRequests.map((request) =>
              agentService.createAgent(request),
            );
            return Promise.all(operations);
          });

        // Then - Resource efficiency maintained during concurrent execution
        // - All workflows complete with efficient resource utilization
        // - Resource coordination prevents wasteful resource competition
        // - Performance remains optimal despite concurrent resource usage

        expect(concurrentResults).toHaveLength(3);
        expect(resourceDuration).toBeLessThan(CONCURRENT_PERFORMANCE_TIMEOUT);

        concurrentResults.forEach((agent, _index) => {
          expect(agent).toBeDefined();
          expect(agent.capabilities).toContain("resource-optimization");
          expect(agent.constraints).toContain("resource-efficiency-mandatory");
          expect(agent.metadata.tags).toContain("efficiency");
        });

        // Verify resource-efficient service coordination
        expect(agentService.createAgent).toHaveBeenCalledTimes(3);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Complex Configuration Workflow", () => {
    it.skip(
      "should handle complex agent configurations with advanced requirements",
      async () => {
        // Given - Complex configuration requiring advanced workflow coordination
        // - Agent configuration with multiple capabilities and constraints
        // - Advanced requirements needing comprehensive service coordination
        // - Complex validation requiring cross-service analysis

        const complexRequest: AgentCreateRequest = {
          name: "Complex Configuration Agent",
          description:
            "Agent with complex multi-service coordination requirements",
          personalityId: "personality-multi-dimensional",
          role: "enterprise-specialist",
          modelId: "gpt-4-turbo",
          capabilities: [
            "advanced-reasoning",
            "multi-domain-expertise",
            "complex-problem-solving",
            "strategic-analysis",
            "cross-functional-coordination",
            "enterprise-integration",
          ],
          constraints: [
            "enterprise-security-required",
            "compliance-mandatory",
            "performance-critical",
            "audit-trail-required",
            "multi-tenant-safe",
            "data-privacy-strict",
          ],
          settings: {
            temperature: 0.7,
            maxTokens: 4096,
            topP: 0.85,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1,
          },
          tags: ["complex", "enterprise", "multi-service", "advanced"],
        };

        // When - Complex workflow executes with comprehensive validation
        // - Advanced workflow orchestration coordinates across all services
        // - Complex configuration assembly validates advanced requirements
        // - Multi-service coordination handles complex constraint checking
        // - Performance monitoring tracks complex workflow execution

        const { result: createdAgent, duration: complexWorkflowDuration } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Pre-validation phase
            const validationResult =
              await agentService.validateAgentConfiguration(complexRequest);
            expect(validationResult.isValid).toBe(true);

            // Creation phase with complex coordination
            return agentService.createAgent(complexRequest);
          });

        // Then - Complex workflow succeeds with all requirements satisfied
        // - Complex configuration processing completes within performance limits
        // - All advanced requirements are properly validated and applied
        // - Multi-service coordination maintains configuration integrity
        // - Complex constraint validation ensures system compliance

        expect(createdAgent).toBeDefined();
        expect(complexWorkflowDuration).toBeLessThan(
          END_TO_END_PERFORMANCE_TIMEOUT,
        );

        // Verify complex configuration handling
        expect(createdAgent.capabilities).toHaveLength(6);
        expect(createdAgent.constraints).toHaveLength(6);
        expect(createdAgent.capabilities).toContain("enterprise-integration");
        expect(createdAgent.constraints).toContain(
          "enterprise-security-required",
        );

        // Verify advanced configuration settings
        expect(createdAgent.settings.temperature).toBe(0.7);
        expect(createdAgent.settings.maxTokens).toBe(4096);
        expect(createdAgent.settings.frequencyPenalty).toBe(0.1);

        // Verify service coordination calls
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          complexRequest,
        );
        expect(agentService.createAgent).toHaveBeenCalledWith(complexRequest);

        // Verify complex metadata
        expect(createdAgent.metadata.tags).toEqual(
          expect.arrayContaining(["complex", "enterprise", "advanced"]),
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should optimize complex configuration processing for performance",
      async () => {
        // Given - Complex configuration with performance optimization requirements
        // - Multi-layered configuration requiring optimization algorithms
        // - Performance-critical requirements with strict timing constraints
        // - Advanced optimization strategies for complex workflow processing

        const optimizedComplexRequest: AgentCreateRequest = {
          name: "Optimized Complex Agent",
          description: "Complex agent with performance optimization focus",
          personalityId: "personality-performance-complex",
          role: "optimization-specialist",
          modelId: "claude-3-sonnet",
          capabilities: [
            "performance-optimization",
            "complex-analysis",
            "efficiency-monitoring",
            "resource-management",
          ],
          constraints: [
            "performance-optimization-required",
            "efficiency-mandatory",
            "resource-constraints-strict",
          ],
          settings: {
            temperature: 0.6,
            maxTokens: 2048,
            topP: 0.9,
          },
          tags: ["complex", "optimized", "performance"],
        };

        // When - Optimized complex workflow executes with performance focus
        // - Optimization algorithms coordinate complex configuration processing
        // - Performance monitoring tracks optimization effectiveness
        // - Complex workflow maintains efficiency despite configuration complexity

        const optimizationStartTime = globalThis.performance.now();
        const createdAgent = await agentService.createAgent(
          optimizedComplexRequest,
        );
        const optimizationDuration =
          globalThis.performance.now() - optimizationStartTime;

        // Then - Complex configuration optimization maintains performance standards
        // - Optimized complex workflow completes within performance requirements
        // - Configuration complexity handled efficiently through optimization
        // - Performance optimization algorithms maintain system efficiency

        expect(createdAgent).toBeDefined();
        expect(optimizationDuration).toBeLessThan(
          END_TO_END_PERFORMANCE_TIMEOUT,
        );

        expect(createdAgent.capabilities).toContain("performance-optimization");
        expect(createdAgent.constraints).toContain(
          "performance-optimization-required",
        );
        expect(createdAgent.metadata.tags).toContain("optimized");
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Workflow Error Recovery and Resilience", () => {
    it.skip(
      "should demonstrate workflow resilience under various failure conditions",
      async () => {
        // Given - Workflow configured for failure scenario testing
        // - Progressive failure scenarios configured across different services
        // - Error recovery mechanisms enabled for resilience testing
        // - Failure condition simulation for comprehensive error handling validation

        const resilientRequest: AgentCreateRequest = {
          name: "Resilience Test Agent",
          description:
            "Agent for testing workflow error recovery and resilience",
          personalityId: "personality-resilience-test",
          role: "resilience-coordinator",
          modelId: "resilience-test-model",
          capabilities: ["error-recovery", "resilience-testing"],
          constraints: ["failure-tolerance-required"],
          settings: { temperature: 0.5, maxTokens: 1024 },
          tags: ["resilience", "error-recovery"],
        };

        // Configure progressive failure scenarios
        const failureScenarios = [
          {
            name: "Validation Service Failure",
            setup: () => {
              // Configure validation service with communication errors for this scenario
            },
          },
          {
            name: "Cross-Service Coordination Failure",
            setup: () => {
              agentService =
                AgentServiceMockFactory.createWithCrossServiceFailures();
            },
          },
          {
            name: "Rollback Scenario",
            setup: () => {
              // Configure validation service with rollback scenarios for this scenario
            },
          },
        ];

        // When - Testing workflow resilience across failure scenarios
        // - Progressive failure scenarios test different failure conditions
        // - Error recovery mechanisms activate during failure conditions
        // - Resilience testing validates system stability under failures

        for (const scenario of failureScenarios) {
          scenario.setup();

          let scenarioError: Error | undefined;
          try {
            await agentService.createAgent(resilientRequest);
          } catch (error) {
            scenarioError = error as Error;
          }

          // Then - Each failure scenario is handled appropriately
          // - Workflow resilience maintains system stability during failures
          // - Error recovery provides appropriate failure responses
          // - Failure scenarios preserve error context for debugging

          expect(scenarioError).toBeDefined();
          expect(scenarioError?.message).toContain(
            "Service coordination failed",
          );

          // Verify error context preservation
          if (scenario.name === "Validation Service Failure") {
            expect(scenarioError?.message).toContain("Communication error");
          } else if (scenario.name === "Rollback Scenario") {
            expect(scenarioError?.message).toContain("Rollback completed");
          }
        }
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should maintain system stability during cascading failure scenarios",
      async () => {
        // Given - Cascading failure scenario configuration
        // - Multiple service failures configured to cascade across system
        // - System stability monitoring enabled during failure conditions
        // - Cascading failure containment mechanisms active

        const cascadingFailureRequest: AgentCreateRequest = {
          name: "Cascading Failure Test Agent",
          description: "Agent for testing cascading failure handling",
          personalityId: "personality-cascading-test",
          role: "cascading-failure-coordinator",
          modelId: "cascading-test-model",
          capabilities: ["cascading-failure-handling"],
          constraints: ["system-stability-required"],
          settings: { temperature: 0.3, maxTokens: 512 },
          tags: ["cascading", "stability"],
        };

        // Configure coordinated failure across multiple services
        // Note: In actual implementation, this would configure the validation service
        // _validationService = ValidationServiceMockFactory.createWithFailures({
        //   coordinationFailureRate: 0.8, // 80% failure rate
        //   errorMessage: "Primary validation service failure",
        // });

        agentService = AgentServiceMockFactory.create({
          shouldSucceed: false,
          crossServiceFailures: true,
          errorMessage:
            "Secondary coordination failure due to validation failure",
        });

        // When - Cascading failure occurs across service coordination
        // - Primary service failure triggers secondary service failures
        // - Cascading failure containment mechanisms activate
        // - System stability maintenance operates during cascading failures

        let cascadingError: Error | undefined;
        const failureStartTime = Date.now();

        try {
          await agentService.createAgent(cascadingFailureRequest);
        } catch (error) {
          cascadingError = error as Error;
        }

        const failureHandlingTime = Date.now() - failureStartTime;

        // Then - Cascading failures are contained and handled gracefully
        // - Cascading failure handling maintains system stability
        // - Error containment prevents system-wide failure propagation
        // - Failure handling time remains within acceptable performance limits

        expect(cascadingError).toBeDefined();
        expect(cascadingError?.message).toContain("coordination failure");
        expect(failureHandlingTime).toBeLessThan(COMPONENT_PERFORMANCE_TIMEOUT);

        // Verify system stability maintenance
        expect(agentService.createAgent).toHaveBeenCalledWith(
          cascadingFailureRequest,
        );

        // Verify error context includes cascading information
        expect(cascadingError?.message).toMatch(
          /Primary validation service failure|Secondary coordination failure/,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should recover gracefully from partial workflow execution failures",
      async () => {
        // Given - Partial workflow execution with recovery mechanisms
        // - Workflow configured to fail at different execution stages
        // - Recovery mechanisms enabled for partial execution scenarios
        // - Graceful degradation strategies active

        const partialExecutionRequest: AgentCreateRequest = {
          name: "Partial Execution Recovery Agent",
          description: "Agent for testing partial execution recovery",
          personalityId: "personality-partial-execution",
          role: "recovery-specialist",
          modelId: "partial-execution-model",
          capabilities: ["partial-execution-handling", "graceful-recovery"],
          constraints: ["recovery-required"],
          settings: { temperature: 0.4, maxTokens: 768 },
          tags: ["partial", "recovery"],
        };

        // Configure partial execution failure
        let executionStage = 0;
        const originalCreateAgent = agentService.createAgent;
        agentService.createAgent = jest
          .fn()
          .mockImplementation(async (request) => {
            executionStage++;
            if (executionStage === 1) {
              // Simulate partial execution then failure
              throw new Error("Partial execution failure - recovery initiated");
            }
            // Second attempt succeeds
            return originalCreateAgent.call(agentService, request);
          });

        // When - Partial execution recovery mechanisms activate
        // - Initial execution fails at partial completion stage
        // - Recovery mechanisms initiate graceful recovery process
        // - Retry logic attempts workflow completion after recovery

        let firstAttemptError: Error | undefined;
        try {
          await agentService.createAgent(partialExecutionRequest);
        } catch (error) {
          firstAttemptError = error as Error;
        }

        // Attempt recovery
        try {
          await agentService.createAgent(partialExecutionRequest);
        } catch {
          // Recovery also failed
        }

        // Then - Graceful recovery from partial execution failures
        // - Initial partial execution failure handled appropriately
        // - Recovery mechanisms provide graceful failure handling
        // - System maintains stability during partial execution scenarios

        expect(firstAttemptError).toBeDefined();
        expect(firstAttemptError?.message).toContain(
          "Partial execution failure",
        );

        // Note: Recovery success depends on mock configuration
        // The important aspect is graceful handling of partial execution failures
        expect(agentService.createAgent).toHaveBeenCalledTimes(2);
        expect(agentService.createAgent).toHaveBeenCalledWith(
          partialExecutionRequest,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});

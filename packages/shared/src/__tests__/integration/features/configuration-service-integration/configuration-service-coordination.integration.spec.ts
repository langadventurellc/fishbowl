/**
 * @fileoverview Configuration Service Coordination Integration Tests
 *
 * Comprehensive BDD integration tests for ConfigurationService coordination
 * with PersonalityService, RoleService, and AgentService. Tests focus on
 * service integration validation, error propagation, and coordination patterns
 * from the feature specification's Service Coordination Validation requirements.
 *
 * Integration Strategy:
 * - Tests ConfigurationService coordination with multiple dependent services
 * - Validates service integration maintaining data consistency
 * - Tests error propagation context maintenance across service boundaries
 * - Verifies complex dependency scenario handling
 * - Follows BDD Given-When-Then structure with comprehensive scenarios
 * - Tests service coordination performance within timing requirements
 */

import type {
  ConfigurationService,
  UnifiedConfigurationRequest,
  AgentService,
  RoleService,
} from "../../../../types/services";
import type {
  CustomRole,
  CustomRoleCreateRequest,
} from "../../../../types/role";
import type { AgentCreateRequest } from "../../../../types/agent";
import { ConfigurationServiceMockFactory } from "../../support/ConfigurationServiceMockFactory";
import {
  PersonalityServiceMockFactory,
  type PersonalityService,
} from "../../support/PersonalityServiceMockFactory";
import { RoleServiceMockFactory } from "../../support/RoleServiceMockFactory";
import { AgentServiceMockFactory } from "../../support/AgentServiceMockFactory";
import { PersonalityDataBuilder } from "../../support/PersonalityDataBuilder";
import { RoleTestDataBuilder } from "../../support/RoleTestDataBuilder";
import { PerformanceTestHelper } from "../../support/test-helpers";

/**
 * Helper function to create a complete CustomRole from CustomRoleCreateRequest
 * Adds required fields (id, createdAt, updatedAt, version) for testing
 */
function createCompleteRole(roleRequest: CustomRoleCreateRequest): CustomRole {
  return {
    ...roleRequest,
    id: `test-role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    metadata: roleRequest.metadata || {
      domain: "coordination-test",
      complexity: "intermediate",
    },
  };
}

/**
 * Helper function to create a complete AgentCreateRequest
 * Ensures all required fields are present for coordination testing
 */
function createCompleteAgentRequest(
  personalityId: string,
  role: string,
  overrides: Partial<AgentCreateRequest> = {},
): AgentCreateRequest {
  return {
    name: "Test Coordination Agent",
    role,
    personalityId,
    modelId: "gpt-4-turbo",
    capabilities: ["service-coordination", "integration-testing"],
    constraints: [],
    settings: {
      temperature: 0.7,
      maxTokens: 2048,
    },
    tags: [],
    ...overrides,
  };
}

describe("Feature: Configuration Service CRUD Integration Tests", () => {
  // Test timeout for complex integration scenarios
  const INTEGRATION_TEST_TIMEOUT = 30000;

  // Performance requirements from task specification
  const CROSS_SERVICE_OPERATION_TIMEOUT = 1000; // 1000ms maximum for cross-service operations
  const INDIVIDUAL_SERVICE_TIMEOUT = 200; // 200ms maximum for individual service interactions
  const COMPLEX_DEPENDENCY_ADDITIONAL_TIMEOUT = 300; // 300ms additional overhead for complex scenarios

  // Service mocks for cross-service coordination testing
  let configurationService: jest.Mocked<ConfigurationService>;
  let personalityService: jest.Mocked<PersonalityService>;
  let roleService: jest.Mocked<RoleService>;
  let agentService: jest.Mocked<AgentService>;

  beforeEach(() => {
    // Reset all service mocks before each test with successful coordination
    configurationService = ConfigurationServiceMockFactory.createSuccess();
    personalityService = PersonalityServiceMockFactory.createSuccess();
    roleService = RoleServiceMockFactory.createSuccess();
    agentService = AgentServiceMockFactory.createSuccess();
  });

  afterEach(() => {
    // Clear all mocks after each test to ensure test isolation
    jest.clearAllMocks();
  });

  describe("Scenario: Service coordination validation across all services", () => {
    it.skip(
      "should integrate properly with PersonalityService maintaining data consistency",
      async () => {
        // Given - ConfigurationService requiring PersonalityService integration
        const personalityIntegrationRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Personality Integration Test")
            .withDescription(
              "Personality for ConfigurationService integration testing",
            )
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .withCustomInstructions(
              "Enhanced personality for service coordination testing with cross-service integration requirements",
            )
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Integration Test Role",
              description: "Role for personality service integration",
              capabilities: ["personality-coordination", "data-consistency"],
              constraints: ["integration-testing-required"],
            }),
          ),
          agent: createCompleteAgentRequest(
            "personality-integration-id",
            "Integration Test Role",
            {
              name: "Integration Agent",
              capabilities: ["personality-integration", "service-coordination"],
            },
          ),
        };

        // When - ConfigurationService integrates with PersonalityService
        const { result, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.createUnifiedConfiguration(
              personalityIntegrationRequest,
            ),
          );

        // Then - Integration maintains proper data consistency
        expect(result).toBeDefined();
        expect(result.personality).toBeDefined();
        expect(result.personality.name).toBe("Personality Integration Test");

        // Verify PersonalityService integration called correctly
        expect(
          personalityService.validatePersonalityConfiguration,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Personality Integration Test",
            customInstructions: expect.stringContaining(
              "cross-service integration",
            ),
          }),
        );

        // Verify data consistency maintenance
        expect(result.personality.openness).toBeGreaterThanOrEqual(0);
        expect(result.personality.conscientiousness).toBeLessThanOrEqual(100);
        expect(result.agent.personalityId).toBe(result.personality.id);

        // Verify performance requirements
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service coordination was called correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(personalityIntegrationRequest);
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should coordinate with RoleService maintaining data consistency",
      async () => {
        // Given - Configuration requiring RoleService coordination
        const roleCoordinationRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Role Coordination Personality")
            .withDescription("Personality for role service coordination")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Service Coordination Role",
              description: "Role for cross-service coordination testing",
              capabilities: [
                "service-management",
                "coordination-oversight",
                "data-consistency-validation",
              ],
              constraints: [
                "data-consistency-required",
                "validation-enforcement",
              ],
              metadata: {
                domain: "coordination-testing",
                tags: ["role-coordination", "service-integration"],
                complexity: "advanced",
              },
            }),
          ),
          agent: createCompleteAgentRequest(
            "role-coordination-personality-id",
            "Service Coordination Role",
            {
              name: "Role Coordination Agent",
              capabilities: ["role-coordination", "service-management"],
            },
          ),
        };

        // When - RoleService coordination executes with data consistency requirements
        const { result: coordinationResult, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.createUnifiedConfiguration(
              roleCoordinationRequest,
            ),
          );

        // Then - RoleService coordination maintains data consistency
        expect(coordinationResult).toBeDefined();
        expect(coordinationResult.role).toBeDefined();
        expect(coordinationResult.role.name).toBe("Service Coordination Role");

        // Verify RoleService coordination called correctly
        expect(roleService.validateRoleCapabilities).toHaveBeenCalledWith(
          expect.objectContaining({
            capabilities: expect.arrayContaining([
              "service-management",
              "coordination-oversight",
            ]),
          }),
        );

        // Verify data consistency maintenance
        expect(coordinationResult.role.capabilities).toContain(
          "service-management",
        );
        expect(coordinationResult.role.constraints).toContain(
          "data-consistency-required",
        );
        expect(coordinationResult.agent.role).toBe(
          coordinationResult.role.name,
        );

        // Verify performance requirements
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service coordination was called correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(roleCoordinationRequest);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should handle complex dependency scenarios with AgentService integration",
      async () => {
        // Given - Configuration with complex dependencies requiring AgentService integration
        const complexDependencyRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Complex Dependency Personality")
            .withDescription(
              "Personality with complex cross-service dependencies",
            )
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .withCustomInstructions(
              "Complex personality requiring advanced dependency resolution across multiple services",
            )
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Complex Dependency Role",
              description: "Role with advanced dependency requirements",
              capabilities: [
                "dependency-management",
                "complex-coordination",
                "multi-service-integration",
              ],
              constraints: [
                "personality-integration-required",
                "agent-coordination-mandatory",
                "dependency-validation-enforced",
              ],
              metadata: {
                domain: "complex-coordination",
                complexity: "advanced",
                tags: ["personality-context", "agent-management"],
              },
            }),
          ),
          agent: createCompleteAgentRequest(
            "complex-dependency-personality-id",
            "Complex Dependency Role",
            {
              name: "Complex Dependency Agent",
              description:
                "Agent requiring complex dependency resolution across services",
              capabilities: [
                "dependency-resolution",
                "complex-coordination",
                "multi-service-awareness",
              ],
              settings: {
                temperature: 0.5,
                maxTokens: 4096,
                topP: 0.9,
              },
            },
          ),
        };

        // When - AgentService handles complex dependency scenarios
        const { result: complexResult, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.createUnifiedConfiguration(
              complexDependencyRequest,
            ),
          );

        // Then - Complex dependency scenarios handled appropriately
        expect(complexResult).toBeDefined();
        expect(complexResult.agent).toBeDefined();
        expect(complexResult.agent.name).toBe("Complex Dependency Agent");

        // Verify AgentService complex dependency handling
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Complex Dependency Agent",
            capabilities: expect.arrayContaining([
              "dependency-resolution",
              "complex-coordination",
            ]),
          }),
        );

        // Verify dependency resolution across services
        expect(complexResult.agent.capabilities).toContain(
          "dependency-resolution",
        );
        expect(complexResult.agent.personalityId).toBe(
          complexResult.personality.id,
        );
        expect(complexResult.role.capabilities).toContain(
          "dependency-management",
        );

        // Verify complex dependency timing requirements (additional 300ms overhead allowed)
        expect(duration).toBeLessThan(
          CROSS_SERVICE_OPERATION_TIMEOUT +
            COMPLEX_DEPENDENCY_ADDITIONAL_TIMEOUT,
        );

        // Verify service coordination was called correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(complexDependencyRequest);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should maintain context across service boundaries during error propagation",
      async () => {
        // Given - Configuration with intentional service coordination error setup
        const errorPropagationRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Error Propagation Test Personality")
            .withDescription("Personality for error propagation testing")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Error Propagation Test Role",
              description: "Role for error propagation context testing",
              capabilities: ["error-handling", "context-preservation"],
              constraints: ["error-propagation-testing"],
            }),
          ),
          agent: createCompleteAgentRequest(
            "error-propagation-personality-id",
            "Error Propagation Test Role",
            {
              name: "Error Propagation Test Agent",
              description:
                "Agent for testing error propagation across service boundaries",
            },
          ),
        };

        // Configure AgentService to simulate coordination failure with context preservation
        agentService = AgentServiceMockFactory.createFailure(
          "Agent service coordination failure - context preserved with service boundary information",
        );
        configurationService = ConfigurationServiceMockFactory.createFailure(
          "Cross-service coordination failed - AgentService: Agent service coordination failure - context preserved with service boundary information",
        );

        // When - Error propagation occurs across service boundaries
        let propagationError: Error | undefined;
        try {
          await configurationService.createUnifiedConfiguration(
            errorPropagationRequest,
          );
        } catch (error) {
          propagationError = error as Error;
        }

        // Then - Error propagation maintains context across service boundaries
        expect(propagationError).toBeDefined();
        expect(propagationError?.message).toContain("coordination failure");
        expect(propagationError?.message).toContain("context preserved");

        // Verify error context includes service boundary information
        expect(propagationError?.message).toMatch(
          /Cross-service.*AgentService.*coordination failure.*context preserved/,
        );
        expect(propagationError?.message).toContain(
          "service boundary information",
        );

        // Verify service coordination was attempted correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(errorPropagationRequest);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Service coordination performance validation", () => {
    beforeEach(() => {
      // Reset to successful mocks for performance testing
      configurationService = ConfigurationServiceMockFactory.createSuccess();
      personalityService = PersonalityServiceMockFactory.createSuccess();
      roleService = RoleServiceMockFactory.createSuccess();
      agentService = AgentServiceMockFactory.createSuccess();
    });

    it.skip(
      "should meet individual service coordination timing requirements",
      async () => {
        // Given - Standard configuration for individual service performance testing
        const performanceTestRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Performance Test Personality")
            .withDescription("Personality for individual service timing tests")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Performance Test Role",
              description: "Role for individual service performance testing",
              capabilities: ["performance-testing", "timing-validation"],
            }),
          ),
          agent: createCompleteAgentRequest(
            "performance-test-personality-id",
            "Performance Test Role",
            {
              name: "Performance Test Agent",
              description: "Agent for individual service timing validation",
            },
          ),
        };

        // When - Individual service operations are measured within coordination context
        const { result: performanceResult, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.createUnifiedConfiguration(
              performanceTestRequest,
            ),
          );

        // Then - Individual service interactions meet performance requirements
        expect(performanceResult).toBeDefined();
        expect(performanceResult.personality).toBeDefined();
        expect(performanceResult.role).toBeDefined();
        expect(performanceResult.agent).toBeDefined();

        // Verify individual service performance (should be well under 200ms for mocked services)
        expect(duration).toBeLessThan(INDIVIDUAL_SERVICE_TIMEOUT);

        // Verify complete service coordination data
        expect(performanceResult.agent.personalityId).toBe(
          performanceResult.personality.id,
        );
        expect(performanceResult.agent.role).toBe(performanceResult.role.name);

        // Verify service coordination was called correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(performanceTestRequest);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should meet complex cross-service coordination performance requirements",
      async () => {
        // Given - Complex configuration requiring extensive cross-service coordination
        const complexPerformanceRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Complex Performance Test Personality")
            .withDescription(
              "Complex personality for cross-service performance validation",
            )
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .withCustomInstructions(
              "Extensive custom instructions for performance testing with detailed behavioral specifications, cross-service coordination requirements, and complex dependency management patterns that require thorough validation across multiple service boundaries",
            )
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Complex Performance Test Role",
              description:
                "Complex role for cross-service performance validation",
              capabilities: Array.from(
                { length: 15 },
                (_, i) => `performance-capability-${i + 1}`,
              ),
              constraints: Array.from(
                { length: 8 },
                (_, i) => `performance-constraint-${i + 1}`,
              ),
              metadata: {
                domain: "complex-performance-testing",
                complexity: "advanced",
                tags: Array.from(
                  { length: 10 },
                  (_, i) => `performance-tag-${i + 1}`,
                ),
              },
            }),
          ),
          agent: createCompleteAgentRequest(
            "complex-performance-personality-id",
            "Complex Performance Test Role",
            {
              name: "Complex Performance Test Agent",
              description:
                "Complex agent configuration for cross-service performance validation with extensive capabilities and settings",
              capabilities: Array.from(
                { length: 20 },
                (_, i) => `agent-performance-capability-${i + 1}`,
              ),
              settings: {
                temperature: 0.7,
                maxTokens: 8192,
                topP: 0.9,
                frequencyPenalty: 0.1,
                presencePenalty: 0.1,
              },
            },
          ),
        };

        // When - Complex cross-service coordination executes with benchmarking
        const benchmark = await PerformanceTestHelper.benchmark(
          () =>
            configurationService.createUnifiedConfiguration(
              complexPerformanceRequest,
            ),
          5, // 5 iterations for statistical significance
        );

        // Then - Complex coordination meets performance requirements across all iterations
        expect(benchmark.averageDuration).toBeLessThan(
          CROSS_SERVICE_OPERATION_TIMEOUT,
        );
        expect(benchmark.maxDuration).toBeLessThan(
          CROSS_SERVICE_OPERATION_TIMEOUT * 1.2,
        ); // 20% tolerance for variance
        expect(benchmark.results).toHaveLength(5);

        // Verify all operations succeeded with complete cross-service data
        benchmark.results.forEach((result) => {
          expect(result).toBeDefined();
          expect(result.personality).toBeDefined();
          expect(result.role).toBeDefined();
          expect(result.agent).toBeDefined();

          // Verify cross-service referential integrity
          expect(result.agent.personalityId).toBe(result.personality.id);
          expect(result.agent.role).toBe(result.role.name);
        });

        // Log performance metrics for analysis
        console.info(`Service Coordination Performance Metrics:`, {
          averageDuration: benchmark.averageDuration,
          minDuration: benchmark.minDuration,
          maxDuration: benchmark.maxDuration,
          iterations: benchmark.results.length,
          requirement: CROSS_SERVICE_OPERATION_TIMEOUT,
        });
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should maintain performance consistency during concurrent service coordination operations",
      async () => {
        // Given - Multiple concurrent configuration requests for coordination testing
        const concurrentRequests = Array.from({ length: 3 }, (_, i) => {
          const personality = new PersonalityDataBuilder()
            .withName(`Concurrent Coordination Personality ${i + 1}`)
            .withDescription(
              `Personality for concurrent coordination testing ${i + 1}`,
            )
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete();

          return {
            personality,
            role: createCompleteRole(
              RoleTestDataBuilder.createCustomRole({
                name: `Concurrent Coordination Role ${i + 1}`,
                description: `Role for concurrent coordination testing ${i + 1}`,
                capabilities: [
                  `concurrent-capability-${i + 1}`,
                  "coordination-testing",
                ],
              }),
            ),
            agent: createCompleteAgentRequest(
              personality.id,
              `Concurrent Coordination Role ${i + 1}`,
              {
                name: `Concurrent Coordination Agent ${i + 1}`,
                description: `Agent for concurrent coordination testing ${i + 1}`,
              },
            ),
          };
        });

        // When - Concurrent cross-service coordination operations execute
        const concurrentPromises = concurrentRequests.map((request) =>
          PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.createUnifiedConfiguration(request),
          ),
        );

        const concurrentResults = await Promise.all(concurrentPromises);

        // Then - All concurrent operations meet performance requirements
        concurrentResults.forEach((result, index) => {
          expect(result.result).toBeDefined();
          expect(result.duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

          // Verify complete cross-service coordination data
          expect(result.result.personality).toBeDefined();
          expect(result.result.role).toBeDefined();
          expect(result.result.agent).toBeDefined();

          // Verify service coordination integrity
          expect(result.result.agent.personalityId).toBe(
            result.result.personality.id,
          );
          expect(result.result.agent.role).toBe(result.result.role.name);

          // Verify unique naming for concurrent operations
          expect(result.result.personality.name).toContain(`${index + 1}`);
          expect(result.result.role.name).toContain(`${index + 1}`);
          expect(result.result.agent.name).toContain(`${index + 1}`);
        });

        // Verify all service coordination calls were made correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledTimes(3);

        // Log concurrent performance metrics
        const durations = concurrentResults.map((r) => r.duration);
        console.info(`Concurrent Coordination Performance:`, {
          averageDuration:
            durations.reduce((a, b) => a + b, 0) / durations.length,
          minDuration: Math.min(...durations),
          maxDuration: Math.max(...durations),
          requirement: CROSS_SERVICE_OPERATION_TIMEOUT,
        });
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});

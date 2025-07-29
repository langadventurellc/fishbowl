/**
 * @fileoverview Cross-Service Configuration CRUD Integration Tests
 *
 * Comprehensive BDD integration tests for ConfigurationService CRUD operations
 * that coordinate with PersonalityService, RoleService, and AgentService.
 * Tests focus on AC-1: Cross-Service CRUD Integration from feature specification.
 *
 * Integration Strategy:
 * - Tests cross-service coordination for all CRUD operations
 * - Validates transaction-like consistency across service boundaries
 * - Tests error handling and rollback mechanisms
 * - Verifies performance requirements for cross-service operations
 * - Follows BDD Given-When-Then structure with comprehensive scenarios
 * - Tests service communication patterns and data aggregation
 */

import type {
  ConfigurationService,
  UnifiedConfigurationRequest,
  UnifiedConfigurationUpdateRequest,
} from "../../../../types/services";
import type { PersonalityConfiguration } from "../../../../types/personality";
import type {
  CustomRole,
  CustomRoleCreateRequest,
} from "../../../../types/role";
import { ConfigurationServiceMockFactory } from "../../support/ConfigurationServiceMockFactory";
import { PersonalityDataBuilder } from "../../support/PersonalityDataBuilder";
import { RoleTestDataBuilder } from "../../support/RoleTestDataBuilder";
import { AgentTestDataBuilder } from "../../support/AgentTestDataBuilder";
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
      domain: "test",
      complexity: "intermediate",
    },
  };
}

describe("Feature: Configuration Service CRUD Integration Tests", () => {
  // Test timeout for complex integration scenarios
  const INTEGRATION_TEST_TIMEOUT = 30000;

  // Performance requirements from task specification
  const CROSS_SERVICE_OPERATION_TIMEOUT = 1000; // 1000ms maximum for cross-service operations
  const INDIVIDUAL_SERVICE_TIMEOUT = 200; // 200ms maximum for individual service interactions

  // Service mock for cross-service coordination testing
  let configurationService: jest.Mocked<ConfigurationService>;

  beforeEach(() => {
    // Reset configuration service mock before each test with successful cross-service coordination
    configurationService = ConfigurationServiceMockFactory.createSuccess();
  });

  afterEach(() => {
    // Clear all mocks after each test to ensure test isolation
    jest.clearAllMocks();
  });

  describe("Scenario: Cross-service configuration creation coordination", () => {
    it.skip(
      "should create unified configuration coordinating across PersonalityService, RoleService, and AgentService",
      async () => {
        // Given - Complex unified configuration requiring cross-service coordination
        const personality = new PersonalityDataBuilder()
          .withName("Cross-Service Test Personality")
          .withDescription("Personality for cross-service coordination testing")
          .withValidBigFiveTraits()
          .withValidBehavioralTraits()
          .withCustomInstructions(
            "Enhanced cross-service coordination instructions",
          )
          .buildComplete();

        const role = createCompleteRole(
          RoleTestDataBuilder.createCustomRole({
            name: "Cross-Service Test Role",
            description: "Role for cross-service coordination testing",
            capabilities: [
              "cross-service-coordination",
              "transaction-management",
              "consistency-validation",
            ],
            constraints: ["consistency-required", "rollback-capable"],
          }),
        );

        const agent = AgentTestDataBuilder.createValidAgentConfig({
          name: "Cross-Service Test Agent",
          description: "Agent for cross-service coordination testing",
          personalityId: personality.id,
          role: role.name,
          capabilities: ["multi-service-integration", "transaction-awareness"],
          settings: {
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
          },
        });

        const unifiedRequest: UnifiedConfigurationRequest = {
          personality,
          role,
          agent,
        };

        // When - Unified configuration creation coordinates across all services
        const { result: createdConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.createUnifiedConfiguration(unifiedRequest),
          );

        // Then - Cross-service coordination succeeds with transaction consistency
        expect(createdConfig).toBeDefined();
        expect(createdConfig.personality).toBeDefined();
        expect(createdConfig.role).toBeDefined();
        expect(createdConfig.agent).toBeDefined();

        // Verify referential integrity across services
        expect(createdConfig.personality.id).toBe(personality.id);
        expect(createdConfig.role.id).toBe(role.id);
        expect(createdConfig.agent.personalityId).toBe(personality.id);

        // Verify performance requirements
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service coordination was called correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(unifiedRequest);
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should validate cross-service consistency during configuration creation",
      async () => {
        // Given - Configuration with potential cross-service consistency issues
        const personality = new PersonalityDataBuilder()
          .withName("Consistency Validation Personality")
          .withValidBigFiveTraits()
          .withValidBehavioralTraits()
          .buildComplete();

        const role = createCompleteRole(
          RoleTestDataBuilder.createCustomRole({
            name: "Consistency Validation Role",
            capabilities: ["validation-testing", "consistency-checking"],
          }),
        );

        const agent = AgentTestDataBuilder.createValidAgentConfig({
          name: "Consistency Validation Agent",
          personalityId: personality.id,
          role: role.name,
        });

        const unifiedRequest: UnifiedConfigurationRequest = {
          personality,
          role,
          agent,
        };

        // When - Configuration validation checks cross-service consistency
        const { result: validationResult, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.validateUnifiedConfiguration(unifiedRequest),
          );

        // Then - Cross-service validation succeeds with proper consistency checking
        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);
        expect(duration).toBeLessThan(INDIVIDUAL_SERVICE_TIMEOUT);

        // Verify validation was called correctly
        expect(
          configurationService.validateUnifiedConfiguration,
        ).toHaveBeenCalledWith(unifiedRequest);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Cross-service configuration retrieval with data aggregation", () => {
    it.skip(
      "should retrieve unified configuration aggregating data from multiple services",
      async () => {
        // Given - Existing unified configuration across multiple services
        const testAgentId = "test-agent-cross-service-read";

        // When - Unified configuration retrieval aggregates cross-service data
        const { result: retrievedConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.getUnifiedConfiguration(testAgentId),
          );

        // Then - Data aggregation succeeds from all service sources
        expect(retrievedConfig).toBeDefined();
        expect(retrievedConfig!.personality).toBeDefined();
        expect(retrievedConfig!.role).toBeDefined();
        expect(retrievedConfig!.agent).toBeDefined();

        // Verify data consistency across services
        expect(retrievedConfig!.agent.id).toBe(testAgentId);
        expect(retrievedConfig!.agent.personalityId).toBe(
          retrievedConfig!.personality.id,
        );

        // Verify performance requirements
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service coordination was called correctly
        expect(
          configurationService.getUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId);
        expect(
          configurationService.getUnifiedConfiguration,
        ).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should handle non-existent configuration gracefully across services",
      async () => {
        // Given - Non-existent configuration ID
        const nonExistentAgentId = "non-existent-agent-id";

        // When - Attempting to retrieve non-existent configuration
        const { result: retrievedConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.getUnifiedConfiguration(nonExistentAgentId),
          );

        // Then - Service gracefully returns null without errors
        expect(retrievedConfig).toBeNull();
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service was called correctly
        expect(
          configurationService.getUnifiedConfiguration,
        ).toHaveBeenCalledWith(nonExistentAgentId);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should list all unified configurations with cross-service data aggregation",
      async () => {
        // Given - Multiple existing unified configurations

        // When - Listing all configurations with cross-service data
        const { result: allConfigurations, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.listUnifiedConfigurations(),
          );

        // Then - All configurations are retrieved with complete cross-service data
        expect(allConfigurations).toBeDefined();
        expect(Array.isArray(allConfigurations)).toBe(true);

        // Verify each configuration has complete cross-service data
        allConfigurations.forEach((config) => {
          expect(config.personality).toBeDefined();
          expect(config.role).toBeDefined();
          expect(config.agent).toBeDefined();
          expect(config.agent.personalityId).toBe(config.personality.id);
        });

        // Verify performance requirements
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service was called correctly
        expect(
          configurationService.listUnifiedConfigurations,
        ).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Cross-service configuration updates with consistency maintenance", () => {
    it.skip(
      "should update unified configuration maintaining consistency across multiple services",
      async () => {
        // Given - Existing configuration and cross-service updates
        const testAgentId = "test-agent-cross-service-update";
        const updates: UnifiedConfigurationUpdateRequest = {
          personality: {
            name: "Updated Cross-Service Personality",
            openness: 85,
            conscientiousness: 90,
            extraversion: 75,
            customInstructions:
              "Updated cross-service coordination instructions",
          },
          role: {
            name: "Updated Cross-Service Role",
            capabilities: [
              "enhanced-coordination",
              "advanced-transaction-management",
              "multi-service-orchestration",
            ],
            constraints: ["enhanced-consistency-required"],
            version: 2,
          },
          agent: {
            name: "Updated Cross-Service Agent",
            description:
              "Enhanced agent with updated cross-service capabilities",
            settings: {
              temperature: 0.8,
              maxTokens: 4096,
              topP: 0.95,
            },
            capabilities: ["enhanced-integration", "advanced-coordination"],
          },
        };

        // When - Updates are applied with cross-service consistency
        const { result: updatedConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.updateUnifiedConfiguration(
              testAgentId,
              updates,
            ),
          );

        // Then - Cross-service updates maintain consistency
        expect(updatedConfig).toBeDefined();
        expect(updatedConfig.personality.name).toBe(
          "Updated Cross-Service Personality",
        );
        expect(updatedConfig.personality.openness).toBe(85);
        expect(updatedConfig.role.name).toBe("Updated Cross-Service Role");
        expect(updatedConfig.role.version).toBe(2);
        expect(updatedConfig.agent.name).toBe("Updated Cross-Service Agent");

        // Verify referential integrity maintained across services
        expect(updatedConfig.agent.personalityId).toBe(
          updatedConfig.personality.id,
        );

        // Verify performance requirements
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service coordination was called correctly
        expect(
          configurationService.updateUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId, updates);
        expect(
          configurationService.updateUnifiedConfiguration,
        ).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should handle partial updates across services with consistency validation",
      async () => {
        // Given - Existing configuration and partial updates affecting multiple services
        const testAgentId = "test-agent-partial-update";
        const partialUpdates: UnifiedConfigurationUpdateRequest = {
          personality: {
            openness: 95,
            customInstructions: "Partially updated instructions",
          },
          // Role intentionally omitted to test partial updates
          agent: {
            settings: {
              temperature: 0.6,
            },
          },
        };

        // When - Partial updates are applied with cross-service coordination
        const { result: updatedConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.updateUnifiedConfiguration(
              testAgentId,
              partialUpdates,
            ),
          );

        // Then - Partial updates succeed while maintaining cross-service consistency
        expect(updatedConfig).toBeDefined();
        expect(updatedConfig.personality.openness).toBe(95);
        expect(updatedConfig.agent.settings.temperature).toBe(0.6);

        // Verify non-updated fields are preserved
        expect(updatedConfig.role).toBeDefined(); // Role should still exist
        expect(updatedConfig.agent.personalityId).toBe(
          updatedConfig.personality.id,
        );

        // Verify performance requirements
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service was called correctly
        expect(
          configurationService.updateUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId, partialUpdates);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Cross-service configuration deletion with dependency handling", () => {
    it.skip(
      "should delete unified configuration handling dependencies and cascading deletions",
      async () => {
        // Given - Configuration with no active dependencies
        const testAgentId = "test-agent-safe-delete";

        // When - Deletion processes dependencies across services
        const { duration } = await PerformanceTestHelper.measureExecutionTime(
          () => configurationService.deleteUnifiedConfiguration(testAgentId),
        );

        // Then - Cascading deletion handles dependencies appropriately
        expect(duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

        // Verify service coordination was called correctly
        expect(
          configurationService.deleteUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId);
        expect(
          configurationService.deleteUnifiedConfiguration,
        ).toHaveBeenCalledTimes(1);

        // Verify configuration is no longer retrievable
        const deletedConfig =
          await configurationService.getUnifiedConfiguration(testAgentId);
        expect(deletedConfig).toBeNull();
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should prevent deletion when dependencies exist with proper error handling",
      async () => {
        // Given - Configuration with active dependencies requiring special mock setup
        const testAgentId = "agent-with-dependencies";

        // Setup mock to simulate dependency constraint violations
        configurationService = ConfigurationServiceMockFactory.create({
          shouldSucceed: false,
          errorMessage:
            "Cannot delete configuration: Active dependencies exist (conversations: 3, templates: 2)",
        });

        // When - Deletion is attempted with existing dependencies
        let deletionError: Error | undefined;
        try {
          await configurationService.deleteUnifiedConfiguration(testAgentId);
        } catch (error) {
          deletionError = error as Error;
        }

        // Then - Deletion is prevented with dependency information
        expect(deletionError).toBeDefined();
        expect(deletionError!.message).toContain("Active dependencies exist");
        expect(deletionError!.message).toContain("conversations");
        expect(deletionError!.message).toContain("templates");

        // Verify service was called correctly
        expect(
          configurationService.deleteUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Cross-service error handling and rollback coordination", () => {
    beforeEach(() => {
      // Setup mock for cross-service failure scenarios
      configurationService = ConfigurationServiceMockFactory.create({
        shouldSucceed: false,
        errorMessage:
          "Cross-service coordination failed - PersonalityService validation error: Invalid trait values detected",
      });
    });

    it.skip(
      "should handle cross-service failures with proper rollback mechanisms",
      async () => {
        // Given - Configuration request that will trigger cross-service failures
        const faultyRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Faulty Cross-Service Personality")
            .withInvalidTrait("openness", 150) // Invalid value exceeding range
            .withInvalidTrait("conscientiousness", -10) // Invalid negative value
            .build() as PersonalityConfiguration,
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Faulty Cross-Service Role",
              capabilities: [], // Invalid - empty capabilities array
              constraints: ["invalid-constraint-type"],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: "Faulty Cross-Service Agent",
            personalityId: "non-existent-personality-id", // Invalid reference
            role: "non-existent-role",
            settings: {
              temperature: 3.0, // Invalid value exceeding range
            },
          }),
        };

        // When - Cross-service operation encounters failures
        let operationError: Error | undefined;
        try {
          await configurationService.createUnifiedConfiguration(faultyRequest);
        } catch (error) {
          operationError = error as Error;
        }

        // Then - Rollback mechanisms handle failures gracefully
        expect(operationError).toBeDefined();
        expect(operationError!.message).toContain(
          "Cross-service coordination failed",
        );
        expect(operationError!.message).toContain(
          "PersonalityService validation error",
        );

        // Verify service was called correctly despite failure
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(faultyRequest);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should propagate service-specific errors with proper context across services",
      async () => {
        // Given - Request that will trigger service-specific validation errors
        const serviceErrorRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Service Error Test Personality")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Service Error Test Role",
              capabilities: ["invalid-capability-format"],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: "Service Error Test Agent",
            personalityId: "valid-personality-id",
            role: "valid-role",
          }),
        };

        // When - Service-specific errors occur during cross-service coordination
        let serviceError: Error | undefined;
        try {
          await configurationService.createUnifiedConfiguration(
            serviceErrorRequest,
          );
        } catch (error) {
          serviceError = error as Error;
        }

        // Then - Service errors are propagated with proper context
        expect(serviceError).toBeDefined();
        expect(serviceError!.message).toContain(
          "Cross-service coordination failed",
        );

        // Verify error context includes service information
        expect(serviceError!.message).toContain("PersonalityService");

        // Verify service was called correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(serviceErrorRequest);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Cross-service performance validation and optimization", () => {
    beforeEach(() => {
      // Reset to successful mock for performance testing
      configurationService = ConfigurationServiceMockFactory.createSuccess();
    });

    it.skip(
      "should meet performance requirements for complex cross-service operations",
      async () => {
        // Given - Complex configuration for performance testing
        const performanceTestConfig: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Performance Test Cross-Service Personality")
            .withDescription("Complex personality for performance validation")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .withCustomInstructions(
              "Extensive custom instructions for performance testing with detailed behavioral specifications and cross-service coordination requirements",
            )
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Performance Test Cross-Service Role",
              description: "Complex role for performance validation",
              capabilities: Array.from(
                { length: 15 },
                (_, i) => `performance-capability-${i + 1}`,
              ),
              constraints: Array.from(
                { length: 8 },
                (_, i) => `performance-constraint-${i + 1}`,
              ),
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: "Performance Test Cross-Service Agent",
            description:
              "Complex agent configuration for performance validation",
            capabilities: Array.from(
              { length: 20 },
              (_, i) => `agent-performance-capability-${i + 1}`,
            ),
            settings: {
              temperature: 0.7,
              maxTokens: 4096,
              topP: 0.9,
              frequencyPenalty: 0.1,
              presencePenalty: 0.1,
            },
          }),
        };

        // When - Performance-sensitive operations execute with benchmarking
        const benchmark = await PerformanceTestHelper.benchmark(
          () =>
            configurationService.createUnifiedConfiguration(
              performanceTestConfig,
            ),
          5, // 5 iterations for statistical significance
        );

        // Then - Performance requirements are met across all iterations
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
        });

        // Log performance metrics for analysis
        console.info(`Cross-Service Performance Metrics:`, {
          averageDuration: benchmark.averageDuration,
          minDuration: benchmark.minDuration,
          maxDuration: benchmark.maxDuration,
          iterations: benchmark.results.length,
        });
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should optimize individual service interaction performance within cross-service operations",
      async () => {
        // Given - Standard configuration for individual service performance testing
        const testAgentId = "performance-test-agent-individual-services";

        // When - Individual service operations are measured within cross-service context
        const { result: retrievedConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.getUnifiedConfiguration(testAgentId),
          );

        // Then - Individual service interactions meet performance requirements
        expect(retrievedConfig).toBeDefined();
        expect(duration).toBeLessThan(INDIVIDUAL_SERVICE_TIMEOUT);

        // Verify complete cross-service data retrieval
        expect(retrievedConfig!.personality).toBeDefined();
        expect(retrievedConfig!.role).toBeDefined();
        expect(retrievedConfig!.agent).toBeDefined();

        // Verify service was called correctly
        expect(
          configurationService.getUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should maintain performance consistency across concurrent cross-service operations",
      async () => {
        // Given - Multiple concurrent configuration requests
        const concurrentRequests = Array.from({ length: 3 }, (_, i) => {
          return new PersonalityDataBuilder()
            .withName(`Concurrent Test Personality ${i + 1}`)
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete();
        }).map((personality, i) => ({
          personality,
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: `Concurrent Test Role ${i + 1}`,
              capabilities: [`concurrent-capability-${i + 1}`],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: `Concurrent Test Agent ${i + 1}`,
            personalityId: personality.id,
            role: `concurrent-role-${i + 1}`,
          }),
        }));

        // When - Concurrent cross-service operations execute
        const concurrentPromises = concurrentRequests.map((request) =>
          PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.createUnifiedConfiguration(request),
          ),
        );

        const concurrentResults = await Promise.all(concurrentPromises);

        // Then - All concurrent operations meet performance requirements
        concurrentResults.forEach((result) => {
          expect(result.result).toBeDefined();
          expect(result.duration).toBeLessThan(CROSS_SERVICE_OPERATION_TIMEOUT);

          // Verify complete cross-service data creation
          expect(result.result.personality).toBeDefined();
          expect(result.result.role).toBeDefined();
          expect(result.result.agent).toBeDefined();
        });

        // Verify all service calls were made correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledTimes(3);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});

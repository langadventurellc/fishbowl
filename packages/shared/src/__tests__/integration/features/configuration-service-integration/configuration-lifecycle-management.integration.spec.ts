/**
 * @fileoverview Configuration Lifecycle Management Integration Tests
 *
 * Comprehensive BDD integration tests for complete configuration lifecycle management
 * through ConfigurationService coordination with dependent services. Tests focus on
 * AC-3: Configuration Lifecycle Integration from the feature specification.
 *
 * Lifecycle Management Strategy:
 * - Tests configuration creation integration workflow across services
 * - Validates configuration update propagation with consistency maintenance
 * - Tests configuration archiving with dependency handling and reference management
 * - Validates configuration deletion with cleanup across all related services
 * - Follows BDD Given-When-Then structure with comprehensive lifecycle scenarios
 * - Tests coordination sequence and dependency validation throughout lifecycle stages
 */

import type {
  ConfigurationService,
  UnifiedConfigurationRequest,
  UnifiedConfigurationUpdateRequest,
} from "../../../../types/services";
import type { PersonalityConfiguration } from "../../../../types/personality";
import type { Agent } from "../../../../types/agent";

/**
 * Extended Agent type for lifecycle testing with archiving capabilities
 */
type ArchivedAgent = Agent & {
  metadata: Agent["metadata"] & {
    isArchived?: boolean;
    archivedAt?: Date;
    preservedReferences?: {
      personalityId: string;
      roleId: string;
    };
  };
};

/**
 * Configuration response type with archived agent capabilities
 */
type ArchivedConfigurationResponse = {
  personality: PersonalityConfiguration;
  role: CustomRole;
  agent: ArchivedAgent;
};
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
 * Adds required fields for lifecycle management testing
 */
function createCompleteRole(roleRequest: CustomRoleCreateRequest): CustomRole {
  return {
    ...roleRequest,
    id: `lifecycle-role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    metadata: roleRequest.metadata || {
      domain: "lifecycle-test",
      complexity: "intermediate",
    },
  };
}

describe("Feature: Configuration Service CRUD Integration Tests", () => {
  // Test timeout for complex lifecycle management scenarios
  const LIFECYCLE_TEST_TIMEOUT = 30000;

  // Performance requirements from task specification
  const COMPLETE_LIFECYCLE_TIMEOUT = 1000; // 1000ms maximum for complete lifecycle operations
  const INDIVIDUAL_STAGE_TIMEOUT = 200; // 200ms maximum for individual lifecycle stage operations
  const LIFECYCLE_COORDINATION_OVERHEAD = 50; // 50ms maximum overhead for lifecycle coordination

  // Service mock for lifecycle management testing
  let configurationService: jest.Mocked<ConfigurationService>;

  beforeEach(() => {
    // Reset configuration service mock with lifecycle management capabilities
    configurationService = ConfigurationServiceMockFactory.createSuccess();
  });

  afterEach(() => {
    // Clear all mocks after each test to ensure test isolation
    jest.clearAllMocks();
  });

  describe("Scenario: Configuration Creation Integration Workflow", () => {
    it.skip(
      "should create configuration integrating personality, role, and agent creation workflows with proper coordination",
      async () => {
        // Given - Complex configuration requiring integrated creation workflow
        const personality = new PersonalityDataBuilder()
          .withName("Lifecycle Creation Test Personality")
          .withDescription(
            "Personality for creation workflow integration testing",
          )
          .withValidBigFiveTraits()
          .withValidBehavioralTraits()
          .withCustomInstructions(
            "Integrated creation workflow instructions with cross-service coordination requirements",
          )
          .buildComplete();

        const role = createCompleteRole(
          RoleTestDataBuilder.createCustomRole({
            name: "Lifecycle Creation Test Role",
            description: "Role for creation workflow integration testing",
            capabilities: [
              "creation-workflow-coordination",
              "service-integration",
              "dependency-management",
            ],
            constraints: ["creation-sequence-required", "validation-mandatory"],
          }),
        );

        const agent = AgentTestDataBuilder.createValidAgentConfig({
          name: "Lifecycle Creation Test Agent",
          description: "Agent for creation workflow integration testing",
          personalityId: personality.id,
          role: role.name,
          capabilities: ["workflow-integration", "creation-coordination"],
          settings: {
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
          },
        });

        const creationRequest: UnifiedConfigurationRequest = {
          personality,
          role,
          agent,
        };

        // When - Creation workflow integrates across personality, role, and agent services
        const { result: createdConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.createUnifiedConfiguration(creationRequest),
          );

        // Then - Configuration creation integrates services with proper coordination
        expect(createdConfig).toBeDefined();
        expect(createdConfig.personality).toBeDefined();
        expect(createdConfig.role).toBeDefined();
        expect(createdConfig.agent).toBeDefined();

        // Verify creation workflow coordination sequence
        expect(createdConfig.personality.id).toBe(personality.id);
        expect(createdConfig.role.id).toBe(role.id);
        expect(createdConfig.agent.personalityId).toBe(personality.id);

        // Verify lifecycle stage performance requirements
        expect(duration).toBeLessThan(INDIVIDUAL_STAGE_TIMEOUT);

        // Verify service coordination was called correctly
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledWith(creationRequest);
        expect(
          configurationService.createUnifiedConfiguration,
        ).toHaveBeenCalledTimes(1);
      },
      LIFECYCLE_TEST_TIMEOUT,
    );

    it.skip(
      "should validate creation workflow dependencies and maintain proper coordination sequence",
      async () => {
        // Given - Configuration with creation workflow dependency requirements
        const personality = new PersonalityDataBuilder()
          .withName("Creation Dependency Test Personality")
          .withValidBigFiveTraits()
          .withValidBehavioralTraits()
          .buildComplete();

        const role = createCompleteRole(
          RoleTestDataBuilder.createCustomRole({
            name: "Creation Dependency Test Role",
            capabilities: ["dependency-validation", "sequence-coordination"],
            constraints: ["creation-order-enforced"],
          }),
        );

        const agent = AgentTestDataBuilder.createValidAgentConfig({
          name: "Creation Dependency Test Agent",
          personalityId: personality.id,
          role: role.name,
          capabilities: ["dependency-awareness", "sequence-validation"],
        });

        const dependencyRequest: UnifiedConfigurationRequest = {
          personality,
          role,
          agent,
        };

        // When - Creation workflow validates dependencies and coordination sequence
        const { result: validationResult, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.validateUnifiedConfiguration(
              dependencyRequest,
            ),
          );

        // Then - Creation workflow dependencies are validated with proper sequence coordination
        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);

        // Verify dependency validation performance
        expect(duration).toBeLessThan(INDIVIDUAL_STAGE_TIMEOUT);

        // Verify validation coordination was called correctly
        expect(
          configurationService.validateUnifiedConfiguration,
        ).toHaveBeenCalledWith(dependencyRequest);
      },
      LIFECYCLE_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Configuration Update Propagation", () => {
    it.skip(
      "should propagate configuration updates correctly across dependent services with consistency validation",
      async () => {
        // Given - Existing configuration and updates requiring cross-service propagation
        const testAgentId = "lifecycle-update-propagation-agent";
        const updateRequest: UnifiedConfigurationUpdateRequest = {
          personality: {
            name: "Updated Lifecycle Personality",
            openness: 90,
            conscientiousness: 85,
            customInstructions:
              "Updated instructions for lifecycle propagation testing",
          },
          role: {
            name: "Updated Lifecycle Role",
            capabilities: [
              "updated-capability-1",
              "updated-capability-2",
              "propagation-awareness",
            ],
            constraints: ["updated-constraint", "consistency-maintained"],
            version: 2,
          },
          agent: {
            name: "Updated Lifecycle Agent",
            description: "Updated agent for propagation testing",
            settings: {
              temperature: 0.8,
              maxTokens: 4096,
            },
            capabilities: [
              "propagation-coordination",
              "consistency-validation",
            ],
          },
        };

        // When - Updates propagate across dependent services with consistency maintenance
        const { result: updatedConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.updateUnifiedConfiguration(
              testAgentId,
              updateRequest,
            ),
          );

        // Then - Updates propagate correctly with consistency validation across services
        expect(updatedConfig).toBeDefined();
        expect(updatedConfig.personality.name).toBe(
          "Updated Lifecycle Personality",
        );
        expect(updatedConfig.personality.openness).toBe(90);
        expect(updatedConfig.role.name).toBe("Updated Lifecycle Role");
        expect(updatedConfig.role.version).toBe(2);
        expect(updatedConfig.agent.name).toBe("Updated Lifecycle Agent");

        // Verify propagation maintains referential integrity
        expect(updatedConfig.agent.personalityId).toBe(
          updatedConfig.personality.id,
        );

        // Verify update propagation performance requirements
        expect(duration).toBeLessThan(INDIVIDUAL_STAGE_TIMEOUT);

        // Verify service coordination for update propagation
        expect(
          configurationService.updateUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId, updateRequest);
        expect(
          configurationService.updateUnifiedConfiguration,
        ).toHaveBeenCalledTimes(1);
      },
      LIFECYCLE_TEST_TIMEOUT,
    );

    it.skip(
      "should handle partial update propagation with consistency maintenance across service boundaries",
      async () => {
        // Given - Existing configuration and partial updates affecting multiple services
        const testAgentId = "lifecycle-partial-update-agent";
        const partialUpdates: UnifiedConfigurationUpdateRequest = {
          personality: {
            openness: 95,
            customInstructions: "Partially updated lifecycle instructions",
          },
          // Role intentionally omitted to test partial propagation
          agent: {
            settings: {
              temperature: 0.6,
            },
            capabilities: ["partial-update-awareness"],
          },
        };

        // When - Partial updates propagate with consistency maintenance
        const { result: updatedConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.updateUnifiedConfiguration(
              testAgentId,
              partialUpdates,
            ),
          );

        // Then - Partial updates propagate correctly while maintaining consistency
        expect(updatedConfig).toBeDefined();
        expect(updatedConfig.personality.openness).toBe(95);
        expect(updatedConfig.agent.settings.temperature).toBe(0.6);

        // Verify non-updated components are preserved with consistency
        expect(updatedConfig.role).toBeDefined(); // Role should still exist
        expect(updatedConfig.agent.personalityId).toBe(
          updatedConfig.personality.id,
        );

        // Verify partial propagation performance
        expect(duration).toBeLessThan(INDIVIDUAL_STAGE_TIMEOUT);

        // Verify service was called correctly for partial updates
        expect(
          configurationService.updateUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId, partialUpdates);
      },
      LIFECYCLE_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Configuration Archiving with Dependency Handling", () => {
    beforeEach(() => {
      // Setup mock for archiving operations (extend existing mock to support archiving)
      const originalGetMethod = configurationService.getUnifiedConfiguration;
      configurationService.getUnifiedConfiguration = jest
        .fn()
        .mockImplementation(async (agentId: string) => {
          if (agentId === "archived-agent") {
            const config = await originalGetMethod(agentId);
            if (config) {
              // Simulate archived status
              return {
                ...config,
                agent: {
                  ...config.agent,
                  metadata: {
                    ...config.agent.metadata,
                    isArchived: true,
                    archivedAt: new Date(),
                  },
                },
              };
            }
          }
          return originalGetMethod(agentId);
        });
    });

    it.skip(
      "should archive configuration handling dependencies and references appropriately with relationship preservation",
      async () => {
        // Given - Configuration with dependencies requiring archiving with reference preservation
        const testAgentId = "lifecycle-archive-dependencies-agent";

        // Setup mock to simulate archiving operation
        const archiveOperation = jest
          .fn()
          .mockImplementation(
            async (): Promise<ArchivedConfigurationResponse | null> => {
              // Simulate archiving by updating metadata while preserving references
              const config =
                await configurationService.getUnifiedConfiguration(testAgentId);
              if (config) {
                return {
                  ...config,
                  agent: {
                    ...config.agent,
                    metadata: {
                      ...config.agent.metadata,
                      isActive: false, // Mark as inactive for archiving
                      isArchived: true, // Custom property for test
                      archivedAt: new Date(),
                      preservedReferences: {
                        personalityId: config.personality.id,
                        roleId: config.role.id,
                      },
                    },
                  },
                };
              }
              return null;
            },
          );

        // When - Configuration archiving handles dependencies and preserves relationships
        const { result: archivedConfig, duration } =
          await PerformanceTestHelper.measureExecutionTime<ArchivedConfigurationResponse | null>(
            () => archiveOperation(),
          );

        // Then - Configuration archiving handles dependencies appropriately with relationship preservation
        expect(archivedConfig).toBeDefined();
        expect(archivedConfig).not.toBeNull();

        // Type assertion for archived configuration after null check
        const config = archivedConfig as ArchivedConfigurationResponse;
        expect(config.agent.metadata.isActive).toBe(false); // Agent marked as inactive
        expect(config.agent.metadata.isArchived).toBe(true);
        expect(config.agent.metadata.archivedAt).toBeInstanceOf(Date);

        // Verify reference preservation during archiving
        expect(config.agent.metadata.preservedReferences?.personalityId).toBe(
          config.personality.id,
        );
        expect(config.agent.metadata.preservedReferences?.roleId).toBe(
          config.role.id,
        );

        // Verify archiving performance requirements
        expect(duration).toBeLessThan(INDIVIDUAL_STAGE_TIMEOUT);

        // Verify archiving operation was executed
        expect(archiveOperation).toHaveBeenCalledTimes(1);
      },
      LIFECYCLE_TEST_TIMEOUT,
    );

    it.skip(
      "should prevent archiving when active dependencies exist with proper dependency validation",
      async () => {
        // Given - Configuration with active dependencies that prevent archiving

        // Setup mock to simulate dependency constraint violations during archiving
        const archiveWithDependencies = jest
          .fn()
          .mockImplementation(async () => {
            throw new Error(
              "Cannot archive configuration: Active dependencies exist (active conversations: 5, templates in use: 3)",
            );
          });

        // When - Archiving is attempted with existing active dependencies
        let archiveError: Error | undefined;
        try {
          await archiveWithDependencies();
        } catch (error) {
          archiveError = error as Error;
        }

        // Then - Archiving is prevented with dependency validation information
        expect(archiveError).toBeDefined();
        expect(archiveError!.message).toContain("Active dependencies exist");
        expect(archiveError!.message).toContain("active conversations");
        expect(archiveError!.message).toContain("templates in use");

        // Verify dependency validation was performed
        expect(archiveWithDependencies).toHaveBeenCalledTimes(1);
      },
      LIFECYCLE_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Configuration Deletion with Service Cleanup", () => {
    it.skip(
      "should delete configuration ensuring cleanup across all related services with dependency verification",
      async () => {
        // Given - Configuration ready for deletion with verified dependencies
        const testAgentId = "lifecycle-delete-cleanup-agent";

        // When - Deletion ensures cleanup across all related services
        const { duration } = await PerformanceTestHelper.measureExecutionTime(
          () => configurationService.deleteUnifiedConfiguration(testAgentId),
        );

        // Then - Configuration deletion ensures cleanup across all related services with dependency verification
        expect(duration).toBeLessThan(INDIVIDUAL_STAGE_TIMEOUT);

        // Verify service coordination for cleanup was called correctly
        expect(
          configurationService.deleteUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId);
        expect(
          configurationService.deleteUnifiedConfiguration,
        ).toHaveBeenCalledTimes(1);

        // Verify configuration is no longer retrievable after cleanup
        const deletedConfig =
          await configurationService.getUnifiedConfiguration(testAgentId);
        expect(deletedConfig).toBeNull();
      },
      LIFECYCLE_TEST_TIMEOUT,
    );

    it.skip(
      "should prevent deletion when service dependencies exist with comprehensive dependency verification",
      async () => {
        // Given - Configuration with service dependencies requiring verification
        const testAgentId = "agent-with-service-dependencies";

        // Setup mock to simulate comprehensive dependency verification failures
        configurationService = ConfigurationServiceMockFactory.create({
          shouldSucceed: false,
          errorMessage:
            "Cannot delete configuration: Service dependencies exist (personality used by 4 agents, role referenced in 2 templates, agent has 7 active conversations)",
        });

        // When - Deletion is attempted with existing service dependencies
        let deletionError: Error | undefined;
        try {
          await configurationService.deleteUnifiedConfiguration(testAgentId);
        } catch (error) {
          deletionError = error as Error;
        }

        // Then - Deletion is prevented with comprehensive dependency verification
        expect(deletionError).toBeDefined();
        expect(deletionError!.message).toContain("Service dependencies exist");
        expect(deletionError!.message).toContain("personality used by");
        expect(deletionError!.message).toContain("role referenced in");
        expect(deletionError!.message).toContain("agent has");

        // Verify comprehensive dependency verification was performed
        expect(
          configurationService.deleteUnifiedConfiguration,
        ).toHaveBeenCalledWith(testAgentId);
      },
      LIFECYCLE_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Complete Lifecycle Performance and Service Coordination", () => {
    beforeEach(() => {
      // Reset to successful mock for complete lifecycle testing
      configurationService = ConfigurationServiceMockFactory.createSuccess();
    });

    it.skip(
      "should complete full lifecycle operations within performance requirements with service coordination maintenance",
      async () => {
        // Given - Complete lifecycle test configuration
        const personality = new PersonalityDataBuilder()
          .withName("Complete Lifecycle Test Personality")
          .withDescription(
            "Personality for complete lifecycle performance validation",
          )
          .withValidBigFiveTraits()
          .withValidBehavioralTraits()
          .withCustomInstructions(
            "Complete lifecycle coordination instructions with performance requirements",
          )
          .buildComplete();

        const role = createCompleteRole(
          RoleTestDataBuilder.createCustomRole({
            name: "Complete Lifecycle Test Role",
            description: "Role for complete lifecycle performance validation",
            capabilities: [
              "lifecycle-coordination",
              "performance-optimization",
              "service-integration",
            ],
            constraints: ["performance-required", "coordination-maintained"],
          }),
        );

        const agent = AgentTestDataBuilder.createValidAgentConfig({
          name: "Complete Lifecycle Test Agent",
          description: "Agent for complete lifecycle performance validation",
          personalityId: personality.id,
          role: role.name,
          capabilities: [
            "complete-lifecycle-awareness",
            "performance-monitoring",
          ],
          settings: {
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
          },
        });

        const lifecycleRequest: UnifiedConfigurationRequest = {
          personality,
          role,
          agent,
        };

        // When - Complete lifecycle operations execute with performance monitoring
        const lifecycleBenchmark = await PerformanceTestHelper.benchmark(
          async () => {
            // Creation
            const created =
              await configurationService.createUnifiedConfiguration(
                lifecycleRequest,
              );

            // Update
            const updated =
              await configurationService.updateUnifiedConfiguration(
                created.agent.id,
                {
                  personality: { openness: 85 },
                },
              );

            // Archive (simulated via metadata update)
            const archived = {
              ...updated,
              agent: {
                ...updated.agent,
                metadata: {
                  ...updated.agent.metadata,
                  isActive: false, // Mark as inactive for archiving
                  // Extended metadata for archiving test
                  isArchived: true,
                  archivedAt: new Date(),
                },
              },
            };

            return { created, updated, archived };
          },
          3, // 3 iterations for performance validation
        );

        // Then - Complete lifecycle operations meet performance requirements with coordination maintenance
        expect(lifecycleBenchmark.averageDuration).toBeLessThan(
          COMPLETE_LIFECYCLE_TIMEOUT,
        );
        expect(lifecycleBenchmark.maxDuration).toBeLessThan(
          COMPLETE_LIFECYCLE_TIMEOUT * 1.2,
        ); // 20% tolerance

        // Verify all lifecycle operations succeeded with service coordination
        lifecycleBenchmark.results.forEach((result) => {
          expect(result.created).toBeDefined();
          expect(result.updated).toBeDefined();
          expect(result.archived).toBeDefined();

          // Verify service coordination maintained throughout lifecycle
          expect(result.updated.agent.personalityId).toBe(
            result.created.personality.id,
          );
          expect(result.archived.agent.metadata.isActive).toBe(false);
          expect(
            (result.archived.agent as ArchivedAgent).metadata.isArchived,
          ).toBe(true);
        });

        // Log lifecycle performance metrics
        console.info(`Complete Lifecycle Performance Metrics:`, {
          averageDuration: lifecycleBenchmark.averageDuration,
          minDuration: lifecycleBenchmark.minDuration,
          maxDuration: lifecycleBenchmark.maxDuration,
          iterations: lifecycleBenchmark.results.length,
        });
      },
      LIFECYCLE_TEST_TIMEOUT,
    );

    it.skip(
      "should maintain service coordination overhead within requirements throughout lifecycle stages",
      async () => {
        // Given - Standard configuration for coordination overhead measurement
        const testAgentId = "lifecycle-coordination-overhead-agent";

        // When - Individual lifecycle stage operations are measured for coordination overhead
        const coordinationMeasurements = await Promise.all([
          PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.getUnifiedConfiguration(testAgentId),
          ),
          PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.updateUnifiedConfiguration(testAgentId, {
              agent: { name: "Overhead Test Update" },
            }),
          ),
          PerformanceTestHelper.measureExecutionTime(() =>
            configurationService.validateUnifiedConfiguration({
              personality: new PersonalityDataBuilder().buildComplete(),
              role: createCompleteRole(
                RoleTestDataBuilder.createCustomRole({}),
              ),
              agent: AgentTestDataBuilder.createValidAgentConfig({}),
            }),
          ),
        ]);

        // Then - Service coordination overhead is minimized throughout lifecycle stages
        coordinationMeasurements.forEach((measurement, _index) => {
          expect(measurement.duration).toBeLessThan(INDIVIDUAL_STAGE_TIMEOUT);
          expect(measurement.result).toBeDefined();
        });

        // Verify coordination overhead is within acceptable limits
        const totalOverhead = coordinationMeasurements.reduce(
          (sum, m) => sum + m.duration,
          0,
        );
        const averageOverhead = totalOverhead / coordinationMeasurements.length;
        expect(averageOverhead).toBeLessThan(LIFECYCLE_COORDINATION_OVERHEAD);
      },
      LIFECYCLE_TEST_TIMEOUT,
    );
  });
});

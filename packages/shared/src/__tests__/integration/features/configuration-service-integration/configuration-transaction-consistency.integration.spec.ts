/**
 * @fileoverview Configuration Transaction Consistency Integration Tests
 *
 * Comprehensive BDD integration tests for ConfigurationService transaction-like consistency
 * across service boundaries. Tests focus on AC-2: Configuration Transaction Consistency
 * from the feature specification, ensuring CRUD operations maintain consistency with
 * proper rollback mechanisms.
 *
 * Transaction Strategy:
 * - Tests transaction boundary enforcement across multiple services
 * - Validates atomic operations and rollback mechanisms
 * - Tests consistency validation during concurrent operations
 * - Verifies performance requirements for transaction coordination
 * - Follows BDD Given-When-Then structure with comprehensive scenarios
 * - Tests rollback operation ordering and error handling
 */

import type { UnifiedConfigurationRequest } from "../../../../types/services";
import type {
  CustomRole,
  CustomRoleCreateRequest,
} from "../../../../types/role";
import { ConfigurationServiceMockFactory } from "../../support/ConfigurationServiceMockFactory";
import { PersonalityServiceMockFactory } from "../../support/PersonalityServiceMockFactory";
import { RoleServiceMockFactory } from "../../support/RoleServiceMockFactory";
import { AgentServiceMockFactory } from "../../support/AgentServiceMockFactory";
import { PersonalityDataBuilder } from "../../support/PersonalityDataBuilder";
import { RoleTestDataBuilder } from "../../support/RoleTestDataBuilder";
import { AgentTestDataBuilder } from "../../support/AgentTestDataBuilder";
import {
  TransactionTestHelpers,
  TransactionAwareService,
} from "../../support/TransactionTestHelpers";

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
  // Test timeout for complex transaction scenarios
  const TRANSACTION_TEST_TIMEOUT = 30000;

  // Performance requirements from task specification
  const TRANSACTION_CONSISTENCY_OVERHEAD = 50; // 50ms maximum overhead for transaction consistency
  const ROLLBACK_OPERATION_TIMEOUT = 500; // 500ms maximum for rollback operations
  const CONCURRENT_TRANSACTION_TIMEOUT = 1000; // 1000ms maximum for concurrent transaction handling

  // Service mocks for transaction consistency testing
  let configurationService: ReturnType<
    typeof ConfigurationServiceMockFactory.createWithTransactionSupport
  >;
  let personalityService: ReturnType<
    typeof PersonalityServiceMockFactory.createWithRollbackSupport
  >;
  let roleService: ReturnType<
    typeof RoleServiceMockFactory.createWithRollbackSupport
  >;
  let agentService: ReturnType<
    typeof AgentServiceMockFactory.createWithRollbackSupport
  >;

  beforeEach(() => {
    // Create transaction-aware service mocks
    configurationService =
      ConfigurationServiceMockFactory.createWithTransactionSupport();
    personalityService =
      PersonalityServiceMockFactory.createWithRollbackSupport();
    roleService = RoleServiceMockFactory.createWithRollbackSupport();
    agentService = AgentServiceMockFactory.createWithRollbackSupport();
  });

  afterEach(() => {
    // Clear all mocks after each test to ensure test isolation
    jest.clearAllMocks();
  });

  describe("Scenario: Configuration transaction consistency across services", () => {
    it.skip(
      "should maintain transaction consistency across service boundaries",
      async () => {
        // Given - Configuration requiring coordinated transaction across services
        const transactionRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Transaction Consistency Test Personality")
            .withDescription("Personality for transaction boundary testing")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .withCustomInstructions(
              "Transaction consistency validation instructions",
            )
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Transaction Consistency Test Role",
              description: "Role for transaction boundary testing",
              capabilities: [
                "transaction-coordination",
                "consistency-validation",
              ],
              constraints: ["atomic-operations", "boundary-enforcement"],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: "Transaction Consistency Test Agent",
            modelId: "gpt-4-turbo",
            description: "Agent for transaction boundary testing",
          }),
        };

        // When - Transaction executes across multiple service boundaries
        const transactionStartTime = Date.now();
        const result =
          await configurationService.createUnifiedConfiguration(
            transactionRequest,
          );
        const transactionDuration = Date.now() - transactionStartTime;

        // Then - Transaction consistency maintained with proper coordination
        expect(result).toBeDefined();
        expect(result.personality).toBeDefined();
        expect(result.role).toBeDefined();
        expect(result.agent).toBeDefined();

        // Verify transaction performance meets requirements
        TransactionTestHelpers.expectTransactionPerformance(
          transactionDuration,
          CONCURRENT_TRANSACTION_TIMEOUT,
        );

        // Verify transaction boundary enforcement using TransactionTestHelpers
        TransactionTestHelpers.expectCalledBefore(
          personalityService.createPersonality as jest.MockedFunction<
            (...args: unknown[]) => unknown
          > & { lastCallTime?: number },
          roleService.createRole as jest.MockedFunction<
            (...args: unknown[]) => unknown
          > & { lastCallTime?: number },
        );
        TransactionTestHelpers.expectCalledBefore(
          roleService.createRole as jest.MockedFunction<
            (...args: unknown[]) => unknown
          > & { lastCallTime?: number },
          agentService.createAgent as jest.MockedFunction<
            (...args: unknown[]) => unknown
          > & { lastCallTime?: number },
        );
      },
      TRANSACTION_TEST_TIMEOUT,
    );

    it.skip(
      "should enforce transaction boundaries with performance monitoring",
      async () => {
        // Given - Transaction request with performance monitoring enabled
        const performanceRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Performance Monitoring Test Personality")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Performance Monitoring Test Role",
              capabilities: ["performance-tracking", "boundary-enforcement"],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: "Performance Monitoring Test Agent",
            modelId: "gpt-4",
          }),
        };

        // When - Transaction executes with performance monitoring
        const { result, duration } =
          await TransactionTestHelpers.measureTransactionTime(() =>
            configurationService.createUnifiedConfiguration(performanceRequest),
          );

        // Then - Transaction boundaries enforced with acceptable performance overhead
        expect(result).toBeDefined();
        TransactionTestHelpers.expectTransactionPerformance(
          duration,
          TRANSACTION_CONSISTENCY_OVERHEAD,
        );

        // Verify service call timing coordination
        const serviceCallTimes = {
          personality:
            (
              personalityService.createPersonality as jest.MockedFunction<
                (...args: unknown[]) => unknown
              > & { lastCallTime?: number }
            ).lastCallTime || 0,
          role:
            (
              roleService.createRole as jest.MockedFunction<
                (...args: unknown[]) => unknown
              > & { lastCallTime?: number }
            ).lastCallTime || 0,
          agent:
            (
              agentService.createAgent as jest.MockedFunction<
                (...args: unknown[]) => unknown
              > & { lastCallTime?: number }
            ).lastCallTime || 0,
        };

        TransactionTestHelpers.expectTransactionBoundaryEnforcement(
          serviceCallTimes,
          TRANSACTION_CONSISTENCY_OVERHEAD,
        );
      },
      TRANSACTION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Transaction rollback mechanism validation", () => {
    it.skip(
      "should trigger appropriate rollback across affected services on partial failures",
      async () => {
        // Given - Configuration with intentional failure at specific service coordination point
        const failureRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Rollback Test Personality")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Rollback Test Role",
              capabilities: ["rollback-testing"],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: "Rollback Test Agent",
            modelId: "gpt-4",
          }),
        };

        // Configure role service to fail at specific coordination point
        roleService.createRole = jest
          .fn()
          .mockRejectedValue(new Error("Role service coordination failure"));

        // When - Partial operation failure occurs during multi-service coordination
        let rollbackError: Error | undefined;
        try {
          await configurationService.createUnifiedConfiguration(failureRequest);
        } catch (error) {
          rollbackError = error as Error;
        }

        // Then - Appropriate rollback triggered across affected services
        expect(rollbackError).toBeDefined();
        TransactionTestHelpers.expectRollbackErrorContext(
          rollbackError!,
          "coordination failure",
        );

        // Verify rollback coordination across services
        TransactionTestHelpers.expectRollbackOrder(
          personalityService as unknown as TransactionAwareService,
          roleService as unknown as TransactionAwareService,
          configurationService as unknown as TransactionAwareService,
        );
      },
      TRANSACTION_TEST_TIMEOUT,
    );

    it.skip(
      "should complete rollback operations within performance requirements",
      async () => {
        // Given - Configuration designed to trigger rollback with performance monitoring
        const rollbackPerformanceRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Rollback Performance Test Personality")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Rollback Performance Test Role",
              capabilities: ["performance-rollback-testing"],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: "Rollback Performance Test Agent",
            modelId: "gpt-4",
          }),
        };

        // Configure agent service to fail for rollback testing
        agentService.createAgent = jest
          .fn()
          .mockRejectedValue(
            new Error("Agent service failure for rollback testing"),
          );

        // When - Rollback operation executes with performance timing
        let rollbackDuration = 0;
        const rollbackStartTime = Date.now();

        try {
          await configurationService.createUnifiedConfiguration(
            rollbackPerformanceRequest,
          );
        } catch {
          rollbackDuration = Date.now() - rollbackStartTime;
        }

        // Then - Rollback operations complete within performance requirements
        TransactionTestHelpers.expectTransactionPerformance(
          rollbackDuration,
          ROLLBACK_OPERATION_TIMEOUT,
        );

        // Verify complete rollback verification across all affected services
        TransactionTestHelpers.expectServiceStateAfterRollback(
          personalityService as unknown as TransactionAwareService,
          roleService as unknown as TransactionAwareService,
          agentService as unknown as TransactionAwareService,
          configurationService as unknown as TransactionAwareService,
        );
      },
      TRANSACTION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Concurrent operation handling with conflict resolution", () => {
    it.skip(
      "should maintain data consistency during concurrent operations with conflict resolution",
      async () => {
        // Given - Multiple concurrent configuration requests with potential conflicts
        const concurrentRequests = Array.from({ length: 3 }, (_, index) => ({
          personality: new PersonalityDataBuilder()
            .withName(`Concurrent Test Personality ${index + 1}`)
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: `Concurrent Test Role ${index + 1}`,
              capabilities: ["concurrent-processing", "conflict-resolution"],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: `Concurrent Test Agent ${index + 1}`,
            modelId: "gpt-4",
          }),
        }));

        // When - Concurrent operations execute with conflict resolution
        const concurrentStartTime = Date.now();
        const results = await Promise.all(
          concurrentRequests.map((request) =>
            configurationService.createUnifiedConfiguration(request),
          ),
        );
        const concurrentDuration = Date.now() - concurrentStartTime;

        // Then - Data consistency maintained during concurrent operations
        const resultsWithId = results.map((result) => ({
          id: result.agent.id || "unknown",
          ...result,
        }));
        TransactionTestHelpers.expectConcurrentOperationConsistency(
          resultsWithId,
          concurrentRequests.length,
        );

        // Verify concurrent transaction handling maintains system performance
        TransactionTestHelpers.expectTransactionPerformance(
          concurrentDuration,
          CONCURRENT_TRANSACTION_TIMEOUT,
        );

        // Verify each concurrent operation completed successfully
        results.forEach((result, index) => {
          expect(result).toBeDefined();
          expect(result.agent).toBeDefined();
          expect(result.personality.name).toContain(
            `Concurrent Test Personality ${index + 1}`,
          );
        });
      },
      TRANSACTION_TEST_TIMEOUT,
    );

    it.skip(
      "should handle service communication failures with proper cleanup mechanisms",
      async () => {
        // Given - Configuration with simulated service communication failure
        const communicationFailureRequest: UnifiedConfigurationRequest = {
          personality: new PersonalityDataBuilder()
            .withName("Communication Failure Test Personality")
            .withValidBigFiveTraits()
            .withValidBehavioralTraits()
            .buildComplete(),
          role: createCompleteRole(
            RoleTestDataBuilder.createCustomRole({
              name: "Communication Failure Test Role",
              capabilities: ["communication-failure-handling"],
            }),
          ),
          agent: AgentTestDataBuilder.createValidAgentConfig({
            name: "Communication Failure Test Agent",
            modelId: "gpt-4",
          }),
        };

        // Configure personality service to simulate communication failure
        personalityService.createPersonality = jest
          .fn()
          .mockRejectedValue(new Error("Service communication failure"));

        // When - Service communication failure occurs during transaction execution
        let communicationError: Error | undefined;
        try {
          await configurationService.createUnifiedConfiguration(
            communicationFailureRequest,
          );
        } catch (error) {
          communicationError = error as Error;
        }

        // Then - Service communication failures handled with proper cleanup mechanisms
        expect(communicationError).toBeDefined();
        TransactionTestHelpers.expectRollbackErrorContext(
          communicationError!,
          "communication failure",
        );

        // Verify proper cleanup mechanisms activated
        expect(configurationService.rollbackConfiguration).toHaveBeenCalled();

        // Verify comprehensive failure context provided
        expect(communicationError!.message).toContain(
          "Service communication failure",
        );
      },
      TRANSACTION_TEST_TIMEOUT,
    );
  });
});

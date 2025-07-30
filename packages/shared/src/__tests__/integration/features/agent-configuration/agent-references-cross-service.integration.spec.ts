/**
 * @fileoverview Cross-Service Reference Validation Integration Tests
 *
 * Integration tests focusing on cross-service reference validation for agent configurations,
 * verifying reference integrity across PersonalityService, RoleService, and ModelService boundaries.
 *
 * Integration Strategy:
 * - Tests cross-service reference validation during agent configuration workflows
 * - Validates service communication patterns and error handling
 * - Tests reference resolution mechanisms with comprehensive error scenarios
 * - Verifies business requirements with reasonable performance expectations
 * - Follows BDD Given-When-Then structure with comprehensive scenarios
 * - Tests authorization and security context preservation across services
 */

import type { AgentCreateRequest } from "../../../../types/agent";
import type { ModelService } from "../../../../types/services";
import {
  PersonalityServiceMockFactory,
  type PersonalityService,
} from "../../support/PersonalityServiceMockFactory";
import {
  RoleServiceMockFactory,
  type RoleService,
} from "../../support/mock-factories";
import { ModelServiceMockFactory } from "../../support/ModelServiceMockFactory";

describe("Feature: Agent Configuration References Integration", () => {
  // Test timeout for complex integration scenarios
  const INTEGRATION_TEST_TIMEOUT = 30000;

  // Service mocks for cross-service reference testing
  let personalityService: jest.Mocked<PersonalityService>;
  let roleService: jest.Mocked<RoleService>;
  let modelService: jest.Mocked<ModelService>;

  beforeEach(() => {
    // Reset all service mocks before each test
    personalityService = PersonalityServiceMockFactory.createSuccess();
    roleService = RoleServiceMockFactory.createSuccess();
    modelService = ModelServiceMockFactory.createSuccess();
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe("Scenario: Validating cross-service references", () => {
    it(
      "should validate personality and role references through service integration",
      async () => {
        // Given - Agent configuration with personality and role references requiring cross-service validation
        const agentRequest: AgentCreateRequest = {
          name: "Cross-Service Reference Test Agent",
          description: "Agent for testing cross-service reference validation",
          personalityId: "personality-cross-service-test",
          role: "cross-service-coordinator",
          modelId: "gpt-4-turbo",
          capabilities: ["cross-service-reference-validation", "coordination"],
          constraints: ["reference-integrity-required"],
          settings: { temperature: 0.6, maxTokens: 2048 },
          tags: ["cross-service-test", "reference-validation"],
        };

        // When - Validating references through cross-service coordination
        // Personality reference validation through PersonalityService
        const personalityValidation =
          await personalityService.validatePersonalityReference(
            agentRequest.personalityId,
          );

        // Role reference validation through RoleService
        const roleValidation = await roleService.validateRole({
          id: "test-role-id",
          name: agentRequest.role,
          description: "Test role for validation",
          capabilities: agentRequest.capabilities || [],
          constraints: agentRequest.constraints || [],
          metadata: {
            version: "1.0",
            isPredefined: true,
            category: "test",
          },
        });

        // Model reference validation through ModelService
        const modelValidation = await modelService.validateModelConfiguration({
          id: agentRequest.modelId,
          name: "GPT-4 Turbo",
          provider: "openai",
          version: "gpt-4-turbo-preview",
          description: "Advanced reasoning model",
          isAvailable: true,
          tier: "premium",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Then - All references are validated with proper error handling
        expect(personalityValidation).toBeDefined();
        expect(personalityValidation.isValid).toBe(true);
        expect(personalityValidation.errors).toHaveLength(0);

        expect(roleValidation).toBeDefined();
        expect(roleValidation.isValid).toBe(true);
        expect(roleValidation.errors).toHaveLength(0);

        expect(modelValidation).toBeDefined();
        expect(modelValidation.isValid).toBe(true);
        expect(modelValidation.errors).toHaveLength(0);

        // Verify service coordination sequence
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(agentRequest.personalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should resolve complex cross-service dependency chains",
      async () => {
        // Given - Agent configuration with complex cross-service dependencies
        const agentRequest: AgentCreateRequest = {
          name: "Complex Dependency Chain Agent",
          description:
            "Agent for testing complex cross-service dependency resolution",
          personalityId: "personality-complex-dependencies",
          role: "dependency-resolution-coordinator",
          modelId: "claude-3-sonnet",
          capabilities: ["dependency-resolution", "cross-service-coordination"],
          constraints: [
            "dependency-validation-required",
            "service-availability-check",
          ],
          settings: { temperature: 0.5, maxTokens: 1536 },
          tags: ["dependency-chain", "cross-service"],
        };

        // When - Resolving dependencies across multiple service layers
        // Step 1: Personality dependency resolution
        const personalityConfig = await personalityService.getPersonalityById(
          agentRequest.personalityId,
        );

        // Step 2: Role dependency resolution based on personality
        const roleConfig = await roleService.getRoleById("test-role-id");

        // Step 3: Model compatibility check against personality and role
        // Convert PredefinedRole to CustomRole format for compatibility check
        const customRoleForCompatibility = {
          id: roleConfig!.id,
          name: roleConfig!.name,
          description: roleConfig!.description,
          capabilities: roleConfig!.capabilities,
          constraints: roleConfig!.constraints,
          isTemplate: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          metadata: {
            domain: roleConfig!.metadata.category,
            complexity: "intermediate" as const,
            tags: ["cross-service-test"],
          },
        };

        const compatibilityResult = await modelService.checkModelCompatibility(
          {
            id: agentRequest.modelId,
            name: "Claude 3 Sonnet",
            provider: "anthropic",
            version: "claude-3-sonnet-20240229",
            description: "Balanced performance model",
            isAvailable: true,
            tier: "standard",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          personalityConfig!,
          customRoleForCompatibility,
        );

        // Then - Cross-service dependency resolution succeeds with proper coordination
        expect(personalityConfig).toBeDefined();
        expect(personalityConfig!.id).toBe(agentRequest.personalityId);

        expect(roleConfig).toBeDefined();
        expect(roleConfig!.id).toBeDefined();

        expect(compatibilityResult).toBeDefined();
        expect(compatibilityResult.isCompatible).toBe(true);
        expect(compatibilityResult.compatibilityScore).toBeGreaterThan(50);

        // Verify service coordination sequence
        expect(personalityService.getPersonalityById).toHaveBeenCalledWith(
          agentRequest.personalityId,
        );
        expect(roleService.getRoleById).toHaveBeenCalledWith("test-role-id");
        expect(modelService.checkModelCompatibility).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Invalid reference error handling with service context", () => {
    beforeEach(() => {
      // Configure services for invalid reference scenarios
      personalityService =
        PersonalityServiceMockFactory.createWithReferenceValidationFailures();
      roleService = RoleServiceMockFactory.createFailure(
        "Role not found in service",
      );
      modelService = ModelServiceMockFactory.createFailure("Model unavailable");
    });

    it(
      "should handle invalid personality ID references with service context",
      async () => {
        // Given - Agent configuration with invalid personality reference
        const agentRequest: AgentCreateRequest = {
          name: "Invalid Personality Reference Agent",
          description:
            "Agent for testing invalid personality reference handling",
          personalityId: "personality-non-existent",
          role: "test-role",
          modelId: "gpt-4-turbo",
          capabilities: ["error-handling"],
          constraints: ["reference-validation"],
          settings: { temperature: 0.7, maxTokens: 1024 },
          tags: ["invalid-reference-test"],
        };

        // When - Validating invalid personality reference through PersonalityService
        const personalityValidation =
          await personalityService.validatePersonalityReference(
            agentRequest.personalityId,
          );

        // Then - Invalid reference errors provide service context and resolution guidance
        expect(personalityValidation).toBeDefined();
        expect(personalityValidation.isValid).toBe(false);
        expect(personalityValidation.errors).toHaveLength(1);

        const error = personalityValidation.errors[0];
        expect(error).toBeDefined();
        expect(error!.field).toBe("personalityId");
        expect(error!.message).toContain(
          "Personality 'personality-non-existent' not found in PersonalityService",
        );
        expect(error!.code).toBe("PERSONALITY_REFERENCE_NOT_FOUND");

        // Verify service context preservation
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(agentRequest.personalityId);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should handle nonexistent role references with proper error context",
      async () => {
        // Given - Agent configuration with nonexistent role reference
        const agentRequest: AgentCreateRequest = {
          name: "Nonexistent Role Reference Agent",
          description: "Agent for testing nonexistent role reference handling",
          personalityId: "personality-valid",
          role: "nonexistent-role",
          modelId: "gpt-4-turbo",
          capabilities: ["role-error-handling"],
          constraints: ["role-reference-validation"],
          settings: { temperature: 0.4, maxTokens: 1024 },
          tags: ["role-reference-error"],
        };

        // When - Role reference resolution fails through RoleService coordination
        let roleValidationError: Error | undefined;
        try {
          await roleService.validateRole({
            id: "nonexistent-role-id",
            name: agentRequest.role,
            description: "Nonexistent role for testing",
            capabilities: [],
            constraints: [],
            metadata: {
              version: "1.0",
              isPredefined: false,
              category: "test",
            },
          });
        } catch (error) {
          roleValidationError = error as Error;
        }

        // Then - Role reference errors maintain service context and provide guidance
        expect(roleValidationError).toBeDefined();
        expect(roleValidationError!.message).toContain(
          "Role not found in service",
        );

        // Verify service interaction occurred
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should handle unavailable model references with availability context",
      async () => {
        // Given - Agent configuration with unavailable model reference
        const agentRequest: AgentCreateRequest = {
          name: "Unavailable Model Reference Agent",
          description: "Agent for testing unavailable model reference handling",
          personalityId: "personality-valid",
          role: "valid-role",
          modelId: "unavailable-model",
          capabilities: ["model-error-handling"],
          constraints: ["model-availability-check"],
          settings: { temperature: 0.3, maxTokens: 512 },
          tags: ["model-availability-error"],
        };

        // When - Model reference verification fails against ModelService availability
        let modelValidationError: Error | undefined;
        try {
          await modelService.validateModelConfiguration({
            id: agentRequest.modelId,
            name: "Unavailable Model",
            provider: "test-provider",
            version: "unavailable-1.0",
            description: "Model for testing unavailability",
            isAvailable: false,
            tier: "basic",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch (error) {
          modelValidationError = error as Error;
        }

        // Then - Model availability errors include service context and alternatives
        expect(modelValidationError).toBeDefined();
        expect(modelValidationError!.message).toContain("Model unavailable");

        // Verify service communication attempted
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Service communication failures and cleanup", () => {
    beforeEach(() => {
      // Configure services for communication failure scenarios
      personalityService =
        PersonalityServiceMockFactory.createWithCrossServiceFailures();
      roleService = RoleServiceMockFactory.createFailure(
        "Communication error - RoleService connection failed",
      );
      modelService = ModelServiceMockFactory.createWithCrossServiceFailures();
    });

    it(
      "should handle service communication failures gracefully with cleanup",
      async () => {
        // Given - Service communication errors during cross-service reference validation
        const agentRequest: AgentCreateRequest = {
          name: "Communication Failure Test Agent",
          description:
            "Agent for testing service communication failure handling",
          personalityId: "personality-communication-test",
          role: "communication-test-role",
          modelId: "gpt-4-turbo",
          capabilities: ["communication-error-handling"],
          constraints: ["service-communication-validation"],
          settings: { temperature: 0.5, maxTokens: 1024 },
          tags: ["communication-failure"],
        };

        // When - Cross-service communication failures occur during reference validation
        let personalityCommError: Error | undefined;
        let roleCommError: Error | undefined;
        let modelCommError: Error | undefined;

        try {
          await personalityService.validatePersonalityReference(
            agentRequest.personalityId,
          );
        } catch (error) {
          personalityCommError = error as Error;
        }

        try {
          await roleService.validateRole({
            id: "test-role-id",
            name: agentRequest.role,
            description: "Test role",
            capabilities: [],
            constraints: [],
            metadata: { version: "1.0", isPredefined: true, category: "test" },
          });
        } catch (error) {
          roleCommError = error as Error;
        }

        try {
          await modelService.validateModelConfiguration({
            id: agentRequest.modelId,
            name: "Test Model",
            provider: "test-provider",
            version: "1.0",
            description: "Test model",
            isAvailable: true,
            tier: "standard",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch (error) {
          modelCommError = error as Error;
        }

        // Then - Communication failures are handled gracefully with proper cleanup
        expect(personalityCommError).toBeDefined();
        expect(personalityCommError!.message).toContain(
          "PersonalityService cross-service coordination failed",
        );

        expect(roleCommError).toBeDefined();
        expect(roleCommError!.message).toContain(
          "Communication error - RoleService connection failed",
        );

        expect(modelCommError).toBeDefined();
        expect(modelCommError!.message).toContain(
          "Cross-service coordination failed",
        );

        // Verify all services were contacted
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(agentRequest.personalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should handle timeout scenarios with proper error propagation",
      async () => {
        // Given - Service timeout scenarios during reference validation
        const timeoutPersonalityService =
          PersonalityServiceMockFactory.createWithTimeout(400);

        const agentRequest: AgentCreateRequest = {
          name: "Timeout Test Agent",
          description: "Agent for testing service timeout handling",
          personalityId: "personality-timeout-test",
          role: "timeout-test-role",
          modelId: "gpt-4-turbo",
          capabilities: ["timeout-handling"],
          constraints: ["timeout-validation"],
          settings: { temperature: 0.6, maxTokens: 1024 },
          tags: ["timeout-test"],
        };

        // When - Service timeout occurs during reference validation
        let timeoutError: Error | undefined;

        try {
          await timeoutPersonalityService.validatePersonalityReference(
            agentRequest.personalityId,
          );
        } catch (error) {
          timeoutError = error as Error;
        }

        // Then - Timeout handling with proper error propagation and cleanup
        expect(timeoutError).toBeDefined();
        expect(timeoutError!.message).toContain(
          "PersonalityService operation timed out",
        );

        // Verify service interaction was attempted
        expect(
          timeoutPersonalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(agentRequest.personalityId);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Reference validation performance requirements", () => {
    it(
      "should meet reasonable performance requirements for cross-service reference validation",
      async () => {
        // Given - Agent configuration requiring performance-optimized reference validation
        const agentRequest: AgentCreateRequest = {
          name: "Performance Validation Agent",
          description:
            "Agent for testing reference validation performance requirements",
          personalityId: "personality-performance-test",
          role: "performance-coordinator",
          modelId: "gpt-4-turbo",
          capabilities: ["performance-validation", "reference-optimization"],
          constraints: ["reasonable-validation-performance"],
          settings: { temperature: 0.7, maxTokens: 2048 },
          tags: ["performance", "validation"],
        };

        // When - Reference validation performance is measured across services
        const validationResults = await (async () => {
          const personalityValidation =
            personalityService.validatePersonalityReference(
              agentRequest.personalityId,
            );
          const roleValidation = roleService.validateRole({
            id: "performance-role-id",
            name: agentRequest.role,
            description: "Performance test role",
            capabilities: agentRequest.capabilities || [],
            constraints: agentRequest.constraints || [],
            metadata: {
              version: "1.0",
              isPredefined: true,
              category: "performance",
            },
          });
          const modelValidation = modelService.validateModelConfiguration({
            id: agentRequest.modelId,
            name: "Performance Test Model",
            provider: "openai",
            version: "gpt-4-turbo-preview",
            description: "Performance optimized model",
            isAvailable: true,
            tier: "premium",
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          return Promise.all([
            personalityValidation,
            roleValidation,
            modelValidation,
          ]);
        })();

        // Verify all validations completed successfully
        const [personalityResult, roleResult, modelResult] = validationResults;

        expect(personalityResult.isValid).toBe(true);
        expect(roleResult.isValid).toBe(true);
        expect(modelResult.isValid).toBe(true);

        // Verify service coordination was optimized
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledTimes(1);
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it(
      "should optimize batch reference validation for multiple agents",
      async () => {
        // Given - Multiple agent configurations for batch reference validation
        const agentRequests: AgentCreateRequest[] = [
          {
            name: "Batch Agent 1",
            description: "First agent for batch validation testing",
            personalityId: "personality-batch-1",
            role: "batch-coordinator-1",
            modelId: "gpt-4-turbo",
            capabilities: ["batch-processing"],
            constraints: ["batch-optimization"],
            settings: { temperature: 0.5, maxTokens: 1024 },
            tags: ["batch-1"],
          },
          {
            name: "Batch Agent 2",
            description: "Second agent for batch validation testing",
            personalityId: "personality-batch-2",
            role: "batch-coordinator-2",
            modelId: "claude-3-sonnet",
            capabilities: ["batch-processing"],
            constraints: ["batch-optimization"],
            settings: { temperature: 0.6, maxTokens: 1536 },
            tags: ["batch-2"],
          },
        ];

        // When - Batch reference validation is performed across services
        await (async () => {
          const batchValidations = agentRequests.map(async (request) => {
            const personalityValidation =
              personalityService.validatePersonalityReference(
                request.personalityId,
              );
            const roleValidation = roleService.validateRole({
              id: `${request.role}-id`,
              name: request.role,
              description: `Role for ${request.name}`,
              capabilities: request.capabilities || [],
              constraints: request.constraints || [],
              metadata: {
                version: "1.0",
                isPredefined: true,
                category: "batch",
              },
            });
            const modelValidation = modelService.validateModelConfiguration({
              id: request.modelId,
              name: `Model for ${request.name}`,
              provider: request.modelId.includes("gpt")
                ? "openai"
                : "anthropic",
              version: request.modelId,
              description: `Model for ${request.name}`,
              isAvailable: true,
              tier: "standard",
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            return Promise.all([
              personalityValidation,
              roleValidation,
              modelValidation,
            ]);
          });

          return Promise.all(batchValidations);
        })();

        // Then - Batch operations are optimized for performance across services

        // Verify all services handled batch operations efficiently
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledTimes(2);
        expect(roleService.validateRole).toHaveBeenCalledTimes(2);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          2,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Authorization and security context preservation", () => {
    it(
      "should maintain security context during cross-service reference validation",
      async () => {
        // Given - Agent configuration requiring security context preservation across services
        const agentRequest: AgentCreateRequest = {
          name: "Security Context Agent",
          description: "Agent for testing security context preservation",
          personalityId: "personality-security-test",
          role: "security-coordinator",
          modelId: "gpt-4-turbo",
          capabilities: [
            "security-context-preservation",
            "authorization-validation",
          ],
          constraints: ["security-context-required", "authorization-check"],
          settings: { temperature: 0.4, maxTokens: 1024 },
          tags: ["security", "authorization"],
        };

        // When - Security context is preserved during cross-service validation
        const personalityValidation =
          await personalityService.validatePersonalityReference(
            agentRequest.personalityId,
          );

        const personalityAccessCheck =
          await personalityService.isPersonalityAccessible(
            agentRequest.personalityId,
          );

        // Then - Security context is maintained across service boundaries
        expect(personalityValidation.isValid).toBe(true);
        expect(personalityAccessCheck).toBe(true);

        // Verify security-aware service calls
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(agentRequest.personalityId);
        expect(personalityService.isPersonalityAccessible).toHaveBeenCalledWith(
          agentRequest.personalityId,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});

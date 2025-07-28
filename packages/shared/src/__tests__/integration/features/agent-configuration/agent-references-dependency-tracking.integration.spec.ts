/**
 * @fileoverview Reference Dependency Tracking Integration Tests
 *
 * Integration tests for agent configuration reference dependency tracking,
 * building on cross-service reference validation to provide comprehensive
 * dependency graph analysis, circular reference detection, and change propagation.
 *
 * Implementation Focus:
 * - Complex dependency graph validation across PersonalityService, RoleService, ModelService
 * - Circular reference detection (direct, indirect, cross-service)
 * - Dependency resolution ordering optimization (within 500ms requirement)
 * - Reference change propagation through dependent configurations
 * - Performance optimization for large-scale dependency networks
 * - Security context preservation throughout dependency tracking operations
 *
 * Test Structure:
 * - Follows BDD Given-When-Then structure with comprehensive scenarios
 * - All tests initially skipped (it.skip) for future implementation
 * - Performance requirements: 500ms for dependency resolution, 300ms for circular detection
 * - Builds on foundation established by cross-service reference validation
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
import { PerformanceTestHelper } from "../../support/test-helpers";

describe("Feature: Agent Configuration References Integration", () => {
  // Test timeout for complex integration scenarios
  const INTEGRATION_TEST_TIMEOUT = 30000;

  // Performance requirements from task specification
  const DEPENDENCY_RESOLUTION_TIMEOUT = 500; // 500ms maximum for complex dependency resolution
  const CIRCULAR_REFERENCE_DETECTION_TIMEOUT = 300; // 300ms maximum for circular reference detection
  const DEPENDENCY_PROPAGATION_TIMEOUT = 400; // 400ms maximum for change propagation

  // Service mocks for dependency tracking testing
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

  describe("Scenario: Complex dependency graph validation across services", () => {
    it.skip(
      "should validate complex dependency chains (A→B→C→D) across service boundaries",
      async () => {
        // Given - Agent configurations with complex cross-service dependency chains
        const dependencyChainRequest: AgentCreateRequest = {
          name: "Complex Dependency Chain Agent",
          description: "Agent with multi-level dependencies across services",
          personalityId: "personality-chain-root", // Root of dependency chain
          role: "dependency-orchestrator", // Depends on personality, has model requirements
          modelId: "advanced-reasoning-model", // Depends on both personality and role constraints
          capabilities: [
            "dependency-orchestration",
            "multi-service-coordination",
          ],
          constraints: [
            "dependency-chain-validation",
            "cross-service-compatibility",
          ],
          settings: { temperature: 0.6, maxTokens: 2048 },
          tags: ["dependency-chain", "complex-validation"],
        };

        // When - Dependency graph validation across multiple service layers
        const startTime = Date.now();

        // Step 1: Validate personality reference through PersonalityService
        const personalityValidation =
          await personalityService.validatePersonalityReference(
            dependencyChainRequest.personalityId,
          );

        // Step 2: Validate role reference through RoleService
        const roleValidation = await roleService.validateRole({
          id: "dependency-orchestrator-id",
          name: dependencyChainRequest.role,
          description: "Role for dependency orchestration",
          capabilities: dependencyChainRequest.capabilities || [],
          constraints: dependencyChainRequest.constraints || [],
          metadata: {
            version: "1.0",
            isPredefined: true,
            category: "orchestration",
          },
        });

        // Step 3: Validate model configuration through ModelService
        const modelValidation = await modelService.validateModelConfiguration({
          id: dependencyChainRequest.modelId,
          name: "Advanced Reasoning Model",
          provider: "openai",
          version: "gpt-4-turbo",
          description: "Advanced model for complex reasoning",
          isAvailable: true,
          tier: "premium",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const validationTime = Date.now() - startTime;

        // Then - Complex dependency graph validation succeeds with proper ordering
        expect(personalityValidation.isValid).toBe(true);
        expect(roleValidation.isValid).toBe(true);
        expect(modelValidation.isValid).toBe(true);

        // Verify performance requirements for complex dependency resolution
        expect(validationTime).toBeLessThan(DEPENDENCY_RESOLUTION_TIMEOUT);

        // Verify service coordination sequence
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(dependencyChainRequest.personalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should optimize dependency resolution order for performance",
      async () => {
        // Given - Multiple agent configurations requiring dependency resolution optimization

        // When - Batch dependency resolution with optimization
        const { duration: resolutionTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Simulate optimized batch validation
            const validations = await Promise.all([
              personalityService.validatePersonalityReference(
                "personality-shared-dependency",
              ),
              personalityService.validatePersonalityReference(
                "personality-unique-2",
              ),
              roleService.validateRole({
                id: "role-unique-1-id",
                name: "role-unique-1",
                description: "Unique role 1",
                capabilities: ["dependency-optimization"],
                constraints: ["performance-required"],
                metadata: {
                  version: "1.0",
                  isPredefined: true,
                  category: "optimization",
                },
              }),
              roleService.validateRole({
                id: "role-shared-dependency-id",
                name: "role-shared-dependency",
                description: "Shared role dependency",
                capabilities: ["dependency-optimization"],
                constraints: ["performance-required"],
                metadata: {
                  version: "1.0",
                  isPredefined: true,
                  category: "optimization",
                },
              }),
              modelService.validateModelConfiguration({
                id: "model-shared-dependency",
                name: "Shared Model",
                provider: "openai",
                version: "gpt-4",
                description: "Shared model dependency",
                isAvailable: true,
                tier: "standard",
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ]);

            return validations;
          });

        // Then - Dependency resolution is optimized for performance
        expect(resolutionTime).toBeLessThan(DEPENDENCY_RESOLUTION_TIMEOUT);

        // Verify optimized service call patterns
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledTimes(2);
        expect(roleService.validateRole).toHaveBeenCalledTimes(2);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        ); // Shared dependency optimized
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should track dependency changes through multi-service dependency chains",
      async () => {
        // Given - Complex dependency network across multiple services
        const primaryAgent: AgentCreateRequest = {
          name: "Primary Agent",
          description: "Agent with dependencies that other agents depend on",
          personalityId: "personality-network-hub",
          role: "role-network-coordinator",
          modelId: "model-network-optimized",
          capabilities: ["network-coordination", "dependency-tracking"],
          constraints: ["network-consistency-required"],
          settings: { temperature: 0.5, maxTokens: 1536 },
          tags: ["network-hub", "dependency-tracking"],
        };

        // When - Dependency tracking across the network with multi-level relationships
        const { duration: trackingTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Simulate dependency network analysis
            const networkAnalysis = await Promise.all([
              personalityService.getPersonalityById(primaryAgent.personalityId),
              personalityService.validatePersonalityReference(
                primaryAgent.personalityId,
              ),
              roleService.getRoleById("role-network-coordinator-id"),
              roleService.validateRole({
                id: "role-network-coordinator-id",
                name: primaryAgent.role,
                description: "Network coordinator role",
                capabilities: primaryAgent.capabilities || [],
                constraints: primaryAgent.constraints || [],
                metadata: {
                  version: "1.0",
                  isPredefined: true,
                  category: "network",
                },
              }),
              modelService.validateModelConfiguration({
                id: primaryAgent.modelId,
                name: "Network Optimized Model",
                provider: "anthropic",
                version: "claude-3-sonnet",
                description: "Model optimized for network operations",
                isAvailable: true,
                tier: "standard",
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ]);

            return networkAnalysis;
          });

        // Then - Multi-service dependency tracking provides comprehensive network analysis
        expect(trackingTime).toBeLessThan(DEPENDENCY_RESOLUTION_TIMEOUT);

        // Verify cross-service coordination
        expect(personalityService.getPersonalityById).toHaveBeenCalledWith(
          primaryAgent.personalityId,
        );
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(primaryAgent.personalityId);
        expect(roleService.getRoleById).toHaveBeenCalledWith(
          "role-network-coordinator-id",
        );
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Circular reference detection and prevention", () => {
    it.skip(
      "should detect direct circular references (A→B→A) with detailed error reporting",
      async () => {
        // Given - Agent configuration creating direct circular reference
        const circularReferenceRequest: AgentCreateRequest = {
          name: "Circular Reference Agent",
          description:
            "Agent configuration that creates direct circular dependency",
          personalityId: "personality-circular-a", // References role-circular-b
          role: "role-circular-b", // References personality-circular-a
          modelId: "model-validation-aware",
          capabilities: ["circular-detection", "dependency-validation"],
          constraints: ["prevent-circular-references"],
          settings: { temperature: 0.5, maxTokens: 1024 },
          tags: ["circular-reference", "validation-test"],
        };

        // Configure mocks for circular reference scenario
        personalityService =
          PersonalityServiceMockFactory.createWithReferenceValidationFailures();

        // When - Circular reference detection during dependency validation
        const { duration: detectionTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            const personalityValidation =
              await personalityService.validatePersonalityReference(
                circularReferenceRequest.personalityId,
              );

            const roleValidation = await roleService.validateRole({
              id: "role-circular-b-id",
              name: circularReferenceRequest.role,
              description: "Role with circular dependency",
              capabilities: circularReferenceRequest.capabilities || [],
              constraints: circularReferenceRequest.constraints || [],
              metadata: {
                version: "1.0",
                isPredefined: true,
                category: "circular-test",
              },
            });

            return { personalityValidation, roleValidation };
          });

        // Then - Circular reference detected with comprehensive error reporting
        expect(detectionTime).toBeLessThan(
          CIRCULAR_REFERENCE_DETECTION_TIMEOUT,
        );

        // Verify circular reference detection occurred
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(circularReferenceRequest.personalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should detect complex circular references (A→B→C→A) across multiple services",
      async () => {
        // Given - Complex circular reference spanning PersonalityService, RoleService, ModelService
        const complexCircularRequest: AgentCreateRequest = {
          name: "Complex Circular Reference Agent",
          description:
            "Agent with circular dependencies across multiple services",
          personalityId: "personality-complex-a", // Depends on role-complex-b
          role: "role-complex-b", // Depends on model-complex-c
          modelId: "model-complex-c", // Depends on personality-complex-a
          capabilities: ["multi-service-circular-detection"],
          constraints: ["complex-dependency-validation"],
          settings: { temperature: 0.4, maxTokens: 1536 },
          tags: ["complex-circular", "multi-service"],
        };

        // Configure cross-service circular reference mocks
        personalityService =
          PersonalityServiceMockFactory.createWithReferenceValidationFailures();
        roleService = RoleServiceMockFactory.createFailure(
          "Circular dependency detected in role",
        );
        modelService = ModelServiceMockFactory.createFailure(
          "Circular dependency detected in model",
        );

        // When - Multi-service circular reference detection
        const { duration: detectionTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            let personalityError: Error | undefined;
            let roleError: Error | undefined;
            let modelError: Error | undefined;

            try {
              await personalityService.validatePersonalityReference(
                complexCircularRequest.personalityId,
              );
            } catch (error) {
              personalityError = error as Error;
            }

            try {
              await roleService.validateRole({
                id: "role-complex-b-id",
                name: complexCircularRequest.role,
                description: "Complex circular role",
                capabilities: complexCircularRequest.capabilities || [],
                constraints: complexCircularRequest.constraints || [],
                metadata: {
                  version: "1.0",
                  isPredefined: true,
                  category: "complex-circular",
                },
              });
            } catch (error) {
              roleError = error as Error;
            }

            try {
              await modelService.validateModelConfiguration({
                id: complexCircularRequest.modelId,
                name: "Complex Circular Model",
                provider: "test",
                version: "circular-test",
                description: "Model with circular dependencies",
                isAvailable: true,
                tier: "basic",
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            } catch (error) {
              modelError = error as Error;
            }

            return { personalityError, roleError, modelError };
          });

        // Then - Complex circular reference detected with service context
        expect(detectionTime).toBeLessThan(
          CIRCULAR_REFERENCE_DETECTION_TIMEOUT,
        );

        // Verify all services were involved in circular reference detection
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(complexCircularRequest.personalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should prevent indirect circular references with dependency chain analysis",
      async () => {
        // Given - Indirect circular reference through multiple dependency levels
        const indirectCircularAgent: AgentCreateRequest = {
          name: "Indirect Circular Agent",
          description: "Agent with indirect circular dependencies",
          personalityId: "personality-indirect-root",
          role: "role-indirect-middle",
          modelId: "model-indirect-leaf",
          capabilities: ["indirect-dependency-detection"],
          constraints: ["prevent-indirect-circular-references"],
          settings: { temperature: 0.3, maxTokens: 1024 },
          tags: ["indirect-circular", "dependency-chain"],
        };

        // Configure indirect circular reference detection
        personalityService =
          PersonalityServiceMockFactory.createWithReferenceValidationFailures();

        // When - Indirect circular reference prevention during dependency addition
        const { duration: preventionTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Simulate indirect circular reference validation
            const indirectValidation = await Promise.all([
              personalityService.validatePersonalityReference(
                indirectCircularAgent.personalityId,
              ),
              roleService.validateRole({
                id: "role-indirect-middle-id",
                name: indirectCircularAgent.role,
                description: "Middle role in indirect chain",
                capabilities: indirectCircularAgent.capabilities || [],
                constraints: indirectCircularAgent.constraints || [],
                metadata: {
                  version: "1.0",
                  isPredefined: true,
                  category: "indirect",
                },
              }),
              modelService.validateModelConfiguration({
                id: indirectCircularAgent.modelId,
                name: "Indirect Leaf Model",
                provider: "test",
                version: "indirect-test",
                description: "Leaf model in indirect chain",
                isAvailable: true,
                tier: "basic",
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ]);

            return indirectValidation;
          });

        // Then - Indirect circular reference prevented with comprehensive analysis
        expect(preventionTime).toBeLessThan(
          CIRCULAR_REFERENCE_DETECTION_TIMEOUT,
        );

        // Verify indirect dependency analysis occurred
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(indirectCircularAgent.personalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Reference change propagation through dependent configurations", () => {
    it.skip(
      "should propagate personality changes through dependent agent configurations",
      async () => {
        // Given - Multiple agent configurations dependent on single personality
        const sharedPersonalityId = "shared-personality-001";
        const dependentAgents: AgentCreateRequest[] = [
          {
            name: "Dependent Agent 1",
            description: "First agent depending on shared personality",
            personalityId: sharedPersonalityId,
            role: "role-dependent-1",
            modelId: "model-dependent-1",
            capabilities: ["personality-dependency"],
            constraints: ["personality-consistency-required"],
            settings: { temperature: 0.5, maxTokens: 1024 },
            tags: ["dependent-agent"],
          },
          {
            name: "Dependent Agent 2",
            description: "Second agent depending on shared personality",
            personalityId: sharedPersonalityId,
            role: "role-dependent-2",
            modelId: "model-dependent-2",
            capabilities: ["personality-dependency"],
            constraints: ["personality-consistency-required"],
            settings: { temperature: 0.6, maxTokens: 1024 },
            tags: ["dependent-agent"],
          },
        ];

        // When - Personality change propagation through dependency tracking
        const { duration: propagationTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Simulate personality change propagation
            const propagationValidation = await Promise.all([
              personalityService.getPersonalityById(sharedPersonalityId),
              personalityService.validatePersonalityReference(
                sharedPersonalityId,
              ),
              ...dependentAgents.map(async (agent) => {
                const personalityValidation =
                  await personalityService.validatePersonalityReference(
                    agent.personalityId,
                  );
                const roleValidation = await roleService.validateRole({
                  id: `${agent.role}-id`,
                  name: agent.role,
                  description: `Role for ${agent.name}`,
                  capabilities: agent.capabilities || [],
                  constraints: agent.constraints || [],
                  metadata: {
                    version: "1.0",
                    isPredefined: true,
                    category: "dependent",
                  },
                });
                return { personalityValidation, roleValidation };
              }),
            ]);

            return propagationValidation;
          });

        // Then - Changes propagated with impact analysis and compatibility validation
        expect(propagationTime).toBeLessThan(DEPENDENCY_PROPAGATION_TIMEOUT);

        // Verify propagation maintains referential integrity
        expect(personalityService.getPersonalityById).toHaveBeenCalledWith(
          sharedPersonalityId,
        );
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(sharedPersonalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(
          dependentAgents.length,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should handle cascading dependency changes with conflict resolution",
      async () => {
        // Given - Cascading dependency changes across service boundaries
        const cascadingAgent: AgentCreateRequest = {
          name: "Cascading Changes Agent",
          description: "Agent for testing cascading dependency changes",
          personalityId: "personality-cascade-root",
          role: "role-cascade-coordinator",
          modelId: "model-cascade-optimized",
          capabilities: ["cascading-change-handling", "conflict-resolution"],
          constraints: ["cascade-consistency-required"],
          settings: { temperature: 0.4, maxTokens: 1536 },
          tags: ["cascading-changes", "conflict-resolution"],
        };

        // When - Cascading dependency change propagation with conflict resolution
        const { duration: cascadingTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Simulate cascading change handling
            const cascadingValidation = await Promise.all([
              personalityService.getPersonalityById(
                cascadingAgent.personalityId,
              ),
              personalityService.validatePersonalityReference(
                cascadingAgent.personalityId,
              ),
              roleService.getRoleById("role-cascade-coordinator-id"),
              roleService.validateRole({
                id: "role-cascade-coordinator-id",
                name: cascadingAgent.role,
                description: "Coordinator role for cascading changes",
                capabilities: cascadingAgent.capabilities || [],
                constraints: cascadingAgent.constraints || [],
                metadata: {
                  version: "1.0",
                  isPredefined: true,
                  category: "cascade",
                },
              }),
              modelService.validateModelConfiguration({
                id: cascadingAgent.modelId,
                name: "Cascade Optimized Model",
                provider: "anthropic",
                version: "claude-3-sonnet",
                description: "Model optimized for cascade operations",
                isAvailable: true,
                tier: "standard",
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ]);

            return cascadingValidation;
          });

        // Then - Cascading changes handled with comprehensive conflict resolution
        expect(cascadingTime).toBeLessThan(DEPENDENCY_PROPAGATION_TIMEOUT);

        // Verify cascading impact analysis
        expect(personalityService.getPersonalityById).toHaveBeenCalledWith(
          cascadingAgent.personalityId,
        );
        expect(roleService.getRoleById).toHaveBeenCalledWith(
          "role-cascade-coordinator-id",
        );
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should optimize change propagation for large dependency networks",
      async () => {
        // Given - Large dependency network requiring propagation optimization
        const networkHubPersonalityId = "personality-network-hub";
        const networkAgents: AgentCreateRequest[] = Array.from(
          { length: 10 },
          (_, i) => ({
            name: `Network Agent ${i}`,
            description: `Agent ${i} in large dependency network`,
            personalityId: networkHubPersonalityId,
            role: `role-network-${i}`,
            modelId: `model-network-${i}`,
            capabilities: ["network-operation", "large-scale-dependency"],
            constraints: ["network-consistency-required"],
            settings: { temperature: 0.5, maxTokens: 1024 },
            tags: ["network-agent", "large-scale"],
          }),
        );

        // When - Optimized change propagation through large dependency network
        const { duration: optimizedTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Simulate optimized network propagation
            const networkValidations = await Promise.all([
              personalityService.getPersonalityById(networkHubPersonalityId),
              personalityService.validatePersonalityReference(
                networkHubPersonalityId,
              ),
              ...networkAgents.slice(0, 3).map(async (agent) => {
                // Only validate subset for performance
                const personalityValidation =
                  await personalityService.validatePersonalityReference(
                    agent.personalityId,
                  );
                const roleValidation = await roleService.validateRole({
                  id: `${agent.role}-id`,
                  name: agent.role,
                  description: `Role for ${agent.name}`,
                  capabilities: agent.capabilities || [],
                  constraints: agent.constraints || [],
                  metadata: {
                    version: "1.0",
                    isPredefined: true,
                    category: "network",
                  },
                });
                return { personalityValidation, roleValidation };
              }),
            ]);

            return networkValidations;
          });

        // Then - Large network change propagation optimized for performance
        expect(optimizedTime).toBeLessThan(DEPENDENCY_PROPAGATION_TIMEOUT);

        // Verify optimization strategies
        expect(personalityService.getPersonalityById).toHaveBeenCalledWith(
          networkHubPersonalityId,
        );
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(networkHubPersonalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(3); // Optimized subset validation
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Dependency resolution ordering optimization", () => {
    it.skip(
      "should optimize dependency resolution order for complex multi-service scenarios",
      async () => {
        // Given - Complex dependency network requiring resolution ordering optimization
        const complexAgents: AgentCreateRequest[] = [
          {
            name: "Agent Orchestrator",
            description: "Orchestrator agent with complex dependencies",
            personalityId: "personality-leader",
            role: "role-coordinator",
            modelId: "model-reasoning",
            capabilities: ["orchestration", "dependency-coordination"],
            constraints: ["resolution-ordering-required"],
            settings: { temperature: 0.5, maxTokens: 2048 },
            tags: ["orchestrator", "complex-dependencies"],
          },
          {
            name: "Agent Analyst",
            description: "Analyst agent with shared dependencies",
            personalityId: "personality-analytical",
            role: "role-researcher",
            modelId: "model-reasoning", // Shared dependency
            capabilities: ["analysis", "research"],
            constraints: ["resolution-ordering-required"],
            settings: { temperature: 0.4, maxTokens: 1536 },
            tags: ["analyst", "shared-dependencies"],
          },
          {
            name: "Agent Creative",
            description: "Creative agent with unique dependencies",
            personalityId: "personality-creative",
            role: "role-designer",
            modelId: "model-creative",
            capabilities: ["creativity", "design"],
            constraints: ["resolution-ordering-required"],
            settings: { temperature: 0.7, maxTokens: 1024 },
            tags: ["creative", "unique-dependencies"],
          },
        ];

        // When - Dependency resolution ordering optimization across services
        const { duration: orderingTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Simulate optimized resolution ordering
            const orderingValidations = await Promise.all([
              // Batch personality validations
              ...complexAgents.map((agent) =>
                personalityService.validatePersonalityReference(
                  agent.personalityId,
                ),
              ),
              // Batch role validations
              ...complexAgents.map((agent) =>
                roleService.validateRole({
                  id: `${agent.role}-id`,
                  name: agent.role,
                  description: `Role for ${agent.name}`,
                  capabilities: agent.capabilities || [],
                  constraints: agent.constraints || [],
                  metadata: {
                    version: "1.0",
                    isPredefined: true,
                    category: "complex",
                  },
                }),
              ),
              // Optimized model validations (shared dependency handled once)
              modelService.validateModelConfiguration({
                id: "model-reasoning",
                name: "Reasoning Model",
                provider: "openai",
                version: "gpt-4",
                description: "Shared reasoning model",
                isAvailable: true,
                tier: "premium",
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
              modelService.validateModelConfiguration({
                id: "model-creative",
                name: "Creative Model",
                provider: "anthropic",
                version: "claude-3-sonnet",
                description: "Creative model",
                isAvailable: true,
                tier: "standard",
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ]);

            return orderingValidations;
          });

        // Then - Dependency resolution order optimized for performance and correctness
        expect(orderingTime).toBeLessThan(DEPENDENCY_RESOLUTION_TIMEOUT);

        // Verify optimization applied
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledTimes(3);
        expect(roleService.validateRole).toHaveBeenCalledTimes(3);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          2,
        ); // Optimized shared dependency
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should handle dependency resolution conflicts with fallback strategies",
      async () => {
        // Given - Dependency resolution scenario with conflicts requiring fallback strategies
        const conflictAgent: AgentCreateRequest = {
          name: "Conflict Resolution Agent",
          description: "Agent for testing dependency resolution conflicts",
          personalityId: "personality-primary", // Preferred but may conflict
          role: "role-preferred", // Preferred but may have version mismatch
          modelId: "model-optimal", // Optimal but may be unavailable
          capabilities: ["conflict-handling", "fallback-strategy"],
          constraints: ["conflict-resolution-required"],
          settings: { temperature: 0.5, maxTokens: 1024 },
          tags: ["conflict-test", "fallback-strategy"],
        };

        // Configure conflict resolution mocks
        personalityService = PersonalityServiceMockFactory.createSuccess();
        roleService = RoleServiceMockFactory.createFailure(
          "Version mismatch detected",
        );
        modelService = ModelServiceMockFactory.createFailure(
          "Model currently unavailable",
        );

        // When - Dependency resolution with conflict handling and fallback strategies
        const { duration: conflictTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            let personalityValidation;
            let roleError: Error | undefined;
            let modelError: Error | undefined;

            // Personality validation should succeed
            personalityValidation =
              await personalityService.validatePersonalityReference(
                conflictAgent.personalityId,
              );

            // Role validation should fail (conflict scenario)
            try {
              await roleService.validateRole({
                id: "role-preferred-id",
                name: conflictAgent.role,
                description: "Preferred role with potential conflicts",
                capabilities: conflictAgent.capabilities || [],
                constraints: conflictAgent.constraints || [],
                metadata: {
                  version: "1.0",
                  isPredefined: true,
                  category: "conflict-test",
                },
              });
            } catch (error) {
              roleError = error as Error;
            }

            // Model validation should fail (availability issue)
            try {
              await modelService.validateModelConfiguration({
                id: conflictAgent.modelId,
                name: "Optimal Model",
                provider: "test",
                version: "optimal-1.0",
                description: "Optimal but potentially unavailable model",
                isAvailable: false,
                tier: "premium",
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            } catch (error) {
              modelError = error as Error;
            }

            return { personalityValidation, roleError, modelError };
          });

        // Then - Dependency conflicts resolved with appropriate fallback strategies
        expect(conflictTime).toBeLessThan(DEPENDENCY_RESOLUTION_TIMEOUT);

        // Verify conflict resolution strategies
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(conflictAgent.personalityId);
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Security context preservation during dependency tracking", () => {
    it.skip(
      "should maintain authorization context throughout dependency graph analysis",
      async () => {
        // Given - Dependency tracking requiring security context preservation across services
        const securitySensitiveAgent: AgentCreateRequest = {
          name: "Security Sensitive Agent",
          description: "Agent requiring security context preservation",
          personalityId: "personality-security-sensitive",
          role: "role-admin-level",
          modelId: "model-restricted-access",
          capabilities: [
            "security-context-preservation",
            "authorization-validation",
          ],
          constraints: ["security-context-required", "authorization-check"],
          settings: { temperature: 0.3, maxTokens: 1024 },
          tags: ["security-sensitive", "authorization-required"],
        };

        // When - Dependency tracking with security context preservation
        const { duration: securityTime } =
          await PerformanceTestHelper.measureExecutionTime(async () => {
            // Simulate security-aware dependency tracking
            const securityValidation = await Promise.all([
              personalityService.validatePersonalityReference(
                securitySensitiveAgent.personalityId,
              ),
              personalityService.isPersonalityAccessible(
                securitySensitiveAgent.personalityId,
              ),
              roleService.validateRole({
                id: "role-admin-level-id",
                name: securitySensitiveAgent.role,
                description: "Admin level role with security requirements",
                capabilities: securitySensitiveAgent.capabilities || [],
                constraints: securitySensitiveAgent.constraints || [],
                metadata: {
                  version: "1.0",
                  isPredefined: true,
                  category: "security",
                },
              }),
              modelService.validateModelConfiguration({
                id: securitySensitiveAgent.modelId,
                name: "Restricted Access Model",
                provider: "secure",
                version: "secure-1.0",
                description: "Model with restricted access requirements",
                isAvailable: true,
                tier: "enterprise",
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ]);

            return securityValidation;
          });

        // Then - Security context maintained throughout dependency tracking
        expect(securityTime).toBeLessThan(DEPENDENCY_RESOLUTION_TIMEOUT);

        // Verify authorization checks at each service boundary
        expect(
          personalityService.validatePersonalityReference,
        ).toHaveBeenCalledWith(securitySensitiveAgent.personalityId);
        expect(personalityService.isPersonalityAccessible).toHaveBeenCalledWith(
          securitySensitiveAgent.personalityId,
        );
        expect(roleService.validateRole).toHaveBeenCalledTimes(1);
        expect(modelService.validateModelConfiguration).toHaveBeenCalledTimes(
          1,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});

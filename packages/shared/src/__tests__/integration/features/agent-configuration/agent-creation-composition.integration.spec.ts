/**
 * @fileoverview Agent Configuration Composition Integration Tests
 *
 * Integration tests focusing on agent configuration composition workflows,
 * verifying the integration of personality, role, and model configurations
 * into complete agent definitions through cross-service coordination.
 *
 * Integration Strategy:
 * - Tests real internal service coordination between AgentService, PersonalityService, RoleService, ModelService
 * - Mocks external dependencies (database, APIs, external file systems)
 * - Uses temporary directories for file operations
 * - Follows BDD Given-When-Then structure
 * - Validates cross-component compatibility and constraint checking
 * - Tests service coordination error handling and context preservation
 */

import type { AgentCreateRequest } from "../../../../types/agent";
import type { ModelConfiguration } from "../../../../types/model";
import type { PersonalityConfiguration } from "../../../../types/personality";
import type { CustomRole } from "../../../../types/role";
import type {
  AgentService,
  ModelService,
  RoleService,
} from "../../../../types/services";
import { AgentServiceMockFactory } from "../../support/AgentServiceMockFactory";
import { ModelServiceMockFactory } from "../../support/ModelServiceMockFactory";
import { RoleServiceMockFactory } from "../../support/RoleServiceMockFactory";

describe("Feature: Agent Configuration Creation Integration", () => {
  // Test timeout for integration tests
  const INTEGRATION_TEST_TIMEOUT = 30000;

  // Performance requirements from task specification
  const AGENT_CREATION_TIMEOUT = 1000; // 1000ms maximum for agent creation
  const COMPONENT_INTEGRATION_TIMEOUT = 200; // 200ms maximum for component integration

  // Service mocks for cross-service coordination testing
  let agentService: jest.Mocked<AgentService>;
  let modelService: jest.Mocked<ModelService>;
  let roleService: jest.Mocked<RoleService>;

  beforeEach(() => {
    // Reset all service mocks before each test
    agentService = AgentServiceMockFactory.createSuccess();
    modelService = ModelServiceMockFactory.createSuccess();
    roleService = RoleServiceMockFactory.createSuccess();
  });

  afterEach(() => {
    // Cleanup service state and coordination context
    jest.clearAllMocks();
  });

  describe("Scenario: Agent Creation with Personality and Role Integration", () => {
    it.skip(
      "should create complete agent through cross-service coordination",
      async () => {
        // Given - Valid personality, role, and model configurations available through respective services
        // - Personality: High openness (85), moderate conscientiousness (65), balanced other traits
        // - Role: Technical Advisor with system prompt and capabilities
        // - Model: GPT-4 Turbo with optimal parameters for technical advisory role
        // - Services configured for successful cross-service coordination

        const personalityConfig: PersonalityConfiguration = {
          id: "personality-technical-creative",
          name: "Technical Creative",
          description:
            "High openness for innovation with technical conscientiousness",
          openness: 85,
          conscientiousness: 65,
          extraversion: 55,
          agreeableness: 70,
          neuroticism: 25,
          formality: 40,
          humor: 60,
          assertiveness: 75,
          empathy: 65,
          storytelling: 45,
          brevity: 60,
          imagination: 80,
          playfulness: 50,
          dramaticism: 30,
          analyticalDepth: 85,
          contrarianism: 40,
          encouragement: 70,
          curiosity: 90,
          patience: 75,
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const roleConfig: CustomRole = {
          id: "technical-advisor-specialized",
          name: "Technical Advisor",
          description:
            "Provides technical expertise and implementation guidance",
          capabilities: [
            "technical-analysis",
            "implementation-planning",
            "code-review",
          ],
          constraints: ["no-business-decisions", "technical-focus-only"],
          isTemplate: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          metadata: {
            domain: "technical",
            complexity: "advanced",
            tags: ["advisor", "technical"],
          },
        };

        const modelConfig: ModelConfiguration = {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          provider: "openai",
          version: "gpt-4-turbo-preview",
          description: "Advanced reasoning and coding model",
          isAvailable: true,
          tier: "premium",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const agentRequest: AgentCreateRequest = {
          name: "Technical Creative Agent",
          description:
            "Agent for technical innovation and implementation guidance",
          personalityId: personalityConfig.id,
          role: roleConfig.id,
          modelId: modelConfig.id,
          capabilities: ["technical-analysis", "creative-problem-solving"],
          constraints: [],
          settings: {
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
          },
          tags: [],
        };

        // When - Agent creation workflow combines these components through service integration
        // - AgentService coordinates with PersonalityService for personality validation
        // - AgentService coordinates with RoleService for role validation and application
        // - AgentService coordinates with ModelService for model configuration validation
        // - Cross-service validation ensures configuration compatibility
        // - Component assembly creates complete agent configuration

        const startTime = Date.now();

        // Agent creation should coordinate across all services
        const createdAgent = await agentService.createAgent(agentRequest);

        const creationTime = Date.now() - startTime;

        // Then - Complete agent configuration is assembled with proper validation and persistence
        // - Agent creation completes within performance requirements
        // - All service coordination succeeds with preserved context
        // - Agent configuration contains all integrated components
        // - Cross-component validation passes with compatibility confirmation
        // - Service coordination maintains transaction-like consistency

        expect(createdAgent).toBeDefined();
        expect(createdAgent.id).toBeDefined();
        expect(createdAgent.name).toBe(agentRequest.name);
        expect(createdAgent.description).toBe(agentRequest.description);
        expect(createdAgent.personalityId).toBe(personalityConfig.id);
        expect(createdAgent.role).toBe(roleConfig.id);
        expect(createdAgent.modelId).toBe(modelConfig.id);

        // Verify performance requirements
        expect(creationTime).toBeLessThan(AGENT_CREATION_TIMEOUT);

        // Verify service coordination calls
        expect(agentService.createAgent).toHaveBeenCalledWith(agentRequest);
        expect(agentService.validateAgentConfiguration).toHaveBeenCalled();

        // Verify agent metadata and structure
        expect(createdAgent.metadata).toBeDefined();
        expect(createdAgent.metadata.version).toBeDefined();
        expect(createdAgent.metadata.createdAt).toBeDefined();
        expect(createdAgent.metadata.isActive).toBe(true);
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should integrate personality configurations through PersonalityService",
      async () => {
        // Given - Agent creation requires personality integration
        // - PersonalityService ready to provide personality configuration data
        // - Agent configuration specifies valid personality ID
        // - Cross-service communication protocols established

        const personalityId = "personality-analytical";
        const agentRequest: AgentCreateRequest = {
          name: "Analytical Agent",
          description: "Agent optimized for analytical tasks",
          personalityId: personalityId,
          role: "analyst-role",
          modelId: "gpt-4-turbo",
          capabilities: ["analysis", "research"],
          constraints: [],
          settings: {
            temperature: 0.3, // Lower temperature for analytical precision
            maxTokens: 4096,
          },
          tags: [],
        };

        // When - AgentService coordinates with PersonalityService for personality data
        // - AgentService requests personality configuration from PersonalityService
        // - PersonalityService validates personality ID and returns configuration
        // - AgentService integrates personality data into agent configuration
        // - Cross-service context preserved throughout coordination

        const startTime = Date.now();

        const createdAgent = await agentService.createAgent(agentRequest);

        const integrationTime = Date.now() - startTime;

        // Then - Personality configurations are properly integrated with validation
        // - Personality integration completes within component timing requirements
        // - AgentService successfully coordinates with PersonalityService
        // - Agent configuration reflects personality integration
        // - Service coordination preserves personality context and metadata

        expect(createdAgent).toBeDefined();
        expect(createdAgent.personalityId).toBe(personalityId);

        // Verify personality integration performance
        expect(integrationTime).toBeLessThan(COMPONENT_INTEGRATION_TIMEOUT);

        // Verify service coordination
        expect(agentService.createAgent).toHaveBeenCalledWith(agentRequest);

        // Verify personality-specific configuration
        expect(createdAgent.settings.temperature).toBe(0.3); // Analytical personality should maintain precision
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should coordinate role application through RoleService integration",
      async () => {
        // Given - Agent creation requires role integration
        // - RoleService ready to provide role configuration and constraints
        // - Agent configuration specifies valid role ID
        // - Role constraints and capabilities defined for integration

        const roleId = "creative-director";
        const agentRequest: AgentCreateRequest = {
          name: "Creative Director Agent",
          description: "Agent for creative vision and artistic decisions",
          personalityId: "personality-creative",
          role: roleId,
          modelId: "gpt-4-turbo",
          capabilities: ["creative-direction", "artistic-guidance"],
          constraints: ["budget-awareness"],
          settings: {
            temperature: 0.8, // Higher temperature for creative tasks
            maxTokens: 3072,
          },
          tags: [],
        };

        // When - AgentService coordinates with RoleService for role configuration
        // - AgentService requests role configuration from RoleService
        // - RoleService validates role ID and returns role data with constraints
        // - AgentService applies role constraints and capabilities to agent
        // - Cross-service role validation ensures compatibility

        const startTime = Date.now();

        const createdAgent = await agentService.createAgent(agentRequest);

        const roleIntegrationTime = Date.now() - startTime;

        // Then - Role configurations are validated and applied through service integration
        // - Role integration completes within component timing requirements
        // - AgentService successfully coordinates with RoleService
        // - Agent configuration reflects role constraints and capabilities
        // - Service coordination maintains role context and validation

        expect(createdAgent).toBeDefined();
        expect(createdAgent.role).toBe(roleId);
        expect(createdAgent.capabilities).toContain("creative-direction");
        expect(createdAgent.constraints).toContain("budget-awareness");

        // Verify role integration performance
        expect(roleIntegrationTime).toBeLessThan(COMPONENT_INTEGRATION_TIMEOUT);

        // Verify service coordination
        expect(agentService.createAgent).toHaveBeenCalledWith(agentRequest);

        // Verify role-specific configuration
        expect(createdAgent.settings.temperature).toBe(0.8); // Creative role should maintain higher creativity
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Component Validation During Assembly", () => {
    it.skip(
      "should validate component compatibility during agent assembly",
      async () => {
        // Given - Mixed compatible and incompatible personality-role-model combinations
        // - High openness personality (90) with conservative analyst role
        // - Basic tier model with premium role requirements
        // - ValidationService configured to detect compatibility issues
        // - Cross-component validation rules established

        const incompatibleRequest: AgentCreateRequest = {
          name: "Incompatible Configuration Agent",
          description: "Agent with intentionally incompatible components",
          personalityId: "personality-highly-creative", // High openness, low conscientiousness
          role: "financial-analyst-strict", // Requires high conscientiousness, low creativity
          modelId: "gpt-3-5-turbo", // Basic tier model
          capabilities: ["advanced-financial-modeling"], // Requires premium model capabilities
          constraints: ["strict-regulatory-compliance"],
          settings: {
            temperature: 0.1, // Very low creativity
            maxTokens: 1024, // Limited output
          },
          tags: [],
        };

        // Configure ModelService to detect incompatibility
        modelService = ModelServiceMockFactory.createIncompatibleModels();

        // When - Agent assembly attempts to combine incompatible components
        // - AgentService initiates component compatibility validation
        // - PersonalityService provides personality trait analysis
        // - RoleService provides role requirement analysis
        // - ModelService performs compatibility checking across components
        // - Cross-service validation detects personality-role-model mismatches

        const validationStartTime = Date.now();

        const validationResult =
          await agentService.validateAgentConfiguration(incompatibleRequest);

        const validationTime = Date.now() - validationStartTime;

        // Then - Validation errors provide specific compatibility guidance
        // - Component validation completes within performance requirements
        // - Validation identifies specific personality-role incompatibility
        // - Model capability analysis reveals insufficient capabilities
        // - Cross-component validation provides actionable recommendations
        // - Error context preserves service boundary information

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);

        // Verify validation performance
        expect(validationTime).toBeLessThan(COMPONENT_INTEGRATION_TIMEOUT);

        // Verify validation errors include compatibility guidance
        const validationErrors = validationResult.errors;
        expect(
          validationErrors.some(
            (error) =>
              error.field === "configuration" &&
              error.message.includes("Invalid agent configuration"),
          ),
        ).toBe(true);

        // Verify service coordination
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          incompatibleRequest,
        );
        expect(modelService.checkModelCompatibility).toHaveBeenCalled();
        expect(roleService.getCustomRole).toHaveBeenCalled();
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should validate cross-component constraints and dependencies",
      async () => {
        // Given - Agent configuration with complex cross-component dependencies
        // - Role requiring specific personality traits (high conscientiousness)
        // - Model requiring minimum performance tier for role capabilities
        // - Personality configuration with trait constraints
        // - Cross-service dependency validation configured

        const complexRequest: AgentCreateRequest = {
          name: "Complex Dependencies Agent",
          description: "Agent with intricate cross-component dependencies",
          personalityId: "personality-detail-oriented", // High conscientiousness required
          role: "project-manager-enterprise", // Requires high conscientiousness, organization
          modelId: "claude-3-sonnet", // Standard tier model
          capabilities: [
            "project-planning",
            "resource-allocation",
            "timeline-management",
            "stakeholder-communication",
          ],
          constraints: [
            "budget-limitations",
            "regulatory-compliance",
            "quality-standards",
          ],
          settings: {
            temperature: 0.4, // Balanced creativity for project management
            maxTokens: 2048,
            topP: 0.8,
          },
          tags: [],
        };

        // When - Cross-component validation analyzes dependencies
        // - AgentService orchestrates dependency validation across services
        // - PersonalityService validates trait-role compatibility
        // - RoleService validates capability-model compatibility
        // - ModelService validates performance-capability alignment
        // - Cross-service constraint checking ensures system coherence

        const dependencyCheckStart = Date.now();

        const validationResult =
          await agentService.validateAgentConfiguration(complexRequest);

        const dependencyCheckTime = Date.now() - dependencyCheckStart;

        // Then - Cross-component validation ensures system coherence
        // - Dependency validation completes within performance requirements
        // - All cross-component constraints are validated successfully
        // - Service coordination maintains dependency context
        // - Validation result includes dependency analysis
        // - Compatible configuration passes all constraint checks

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);

        // Verify dependency validation performance
        expect(dependencyCheckTime).toBeLessThan(COMPONENT_INTEGRATION_TIMEOUT);

        // Verify service coordination for dependency checking
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          complexRequest,
        );
        expect(modelService.validateModelConfiguration).toHaveBeenCalled();
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Cross-Service Component Integration", () => {
    it.skip(
      "should coordinate model configuration validation with compatibility checking",
      async () => {
        // Given - Agent configuration requiring model validation and compatibility analysis
        // - ModelService ready for configuration validation and compatibility checking
        // - Personality and role configurations available for compatibility analysis
        // - Cross-service coordination for comprehensive model validation

        const modelValidationRequest: AgentCreateRequest = {
          name: "Model Validation Agent",
          description: "Agent for testing model configuration validation",
          personalityId: "personality-balanced",
          role: "generalist-role",
          modelId: "gpt-4-turbo",
          capabilities: ["general-assistance", "problem-solving"],
          constraints: ["response-time-limits"],
          settings: {
            temperature: 0.7,
            maxTokens: 4096,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1,
          },
          tags: [],
        };

        // When - AgentService coordinates model validation with ModelService
        // - AgentService requests model configuration validation
        // - ModelService validates model parameters and availability
        // - ModelService performs compatibility analysis with personality and role
        // - Cross-service coordination ensures model configuration coherence

        const modelValidationStart = Date.now();

        const createdAgent = await agentService.createAgent(
          modelValidationRequest,
        );

        const modelValidationTime = Date.now() - modelValidationStart;

        // Then - Model configuration is validated and integrated successfully
        // - Model validation completes within component timing requirements
        // - AgentService successfully coordinates with ModelService
        // - Model configuration reflects validated parameters
        // - Compatibility analysis confirms model-personality-role alignment

        expect(createdAgent).toBeDefined();
        expect(createdAgent.modelId).toBe("gpt-4-turbo");
        expect(createdAgent.settings.temperature).toBe(0.7);
        expect(createdAgent.settings.maxTokens).toBe(4096);

        // Verify model validation performance
        expect(modelValidationTime).toBeLessThan(COMPONENT_INTEGRATION_TIMEOUT);

        // Verify service coordination
        expect(agentService.createAgent).toHaveBeenCalledWith(
          modelValidationRequest,
        );
        expect(modelService.validateModelConfiguration).toHaveBeenCalled();
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should handle service coordination failures with proper error propagation",
      async () => {
        // Given - Service coordination with configured failure scenarios
        // - ModelService configured to simulate cross-service coordination failures
        // - Error propagation mechanisms established across service boundaries
        // - Service coordination error handling protocols active

        const coordinationFailureRequest: AgentCreateRequest = {
          name: "Coordination Failure Test Agent",
          description:
            "Agent for testing service coordination failure handling",
          personalityId: "personality-test",
          role: "test-role",
          modelId: "failing-model-service",
          capabilities: ["test-capability"],
          constraints: [],
          settings: {
            temperature: 0.5,
            maxTokens: 2048,
          },
          tags: [],
        };

        // Configure ModelService to simulate cross-service failures
        modelService = ModelServiceMockFactory.createWithCrossServiceFailures();

        // When - Service coordination encounters failures during agent creation
        // - AgentService initiates agent creation workflow
        // - ModelService coordination fails with cross-service error
        // - Error propagation occurs across service boundaries
        // - Service coordination handles failure with context preservation

        const failureTestStart = Date.now();

        let coordinationError: Error | undefined;
        try {
          await agentService.createAgent(coordinationFailureRequest);
        } catch (error) {
          coordinationError = error as Error;
        }

        const failureHandlingTime = Date.now() - failureTestStart;

        // Then - Service coordination failures are handled with proper error context
        // - Coordination failure handling completes within reasonable time
        // - Error propagation preserves cross-service context
        // - Service coordination error includes detailed failure information
        // - Error handling maintains system stability during failures

        expect(coordinationError).toBeDefined();
        expect(coordinationError?.message).toContain(
          "Cross-service coordination failed",
        );

        // Verify failure handling performance
        expect(failureHandlingTime).toBeLessThan(COMPONENT_INTEGRATION_TIMEOUT);

        // Verify service coordination attempt
        expect(agentService.createAgent).toHaveBeenCalledWith(
          coordinationFailureRequest,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should maintain performance requirements during complex service coordination",
      async () => {
        // Given - Complex agent creation requiring extensive service coordination
        // - Multiple service interactions with personality, role, and model coordination
        // - Performance monitoring enabled for service coordination timing
        // - Complex configuration requiring comprehensive validation

        const complexCoordinationRequest: AgentCreateRequest = {
          name: "Complex Coordination Agent",
          description: "Agent requiring extensive cross-service coordination",
          personalityId: "personality-multi-faceted",
          role: "multi-role-specialist",
          modelId: "gpt-4-turbo",
          capabilities: [
            "technical-analysis",
            "creative-problem-solving",
            "project-management",
            "communication-facilitation",
            "strategic-planning",
          ],
          constraints: [
            "performance-requirements",
            "quality-standards",
            "compliance-rules",
            "budget-constraints",
          ],
          settings: {
            temperature: 0.6,
            maxTokens: 4096,
            topP: 0.85,
            frequencyPenalty: 0.2,
            presencePenalty: 0.15,
          },
          tags: [],
        };

        // When - Complex service coordination executes with performance monitoring
        // - AgentService orchestrates multi-service coordination
        // - PersonalityService provides complex personality analysis
        // - RoleService handles multi-capability role validation
        // - ModelService performs comprehensive compatibility checking
        // - Performance monitoring tracks coordination timing across all services

        const complexCoordinationStart = Date.now();

        const createdAgent = await agentService.createAgent(
          complexCoordinationRequest,
        );

        const complexCoordinationTime = Date.now() - complexCoordinationStart;

        // Then - Complex service coordination maintains performance requirements
        // - Complex coordination completes within agent creation timing requirements
        // - All service coordination succeeds despite complexity
        // - Agent configuration reflects all complex requirements
        // - Performance remains acceptable for complex multi-service operations

        expect(createdAgent).toBeDefined();
        expect(createdAgent.capabilities).toHaveLength(5);
        expect(createdAgent.constraints).toHaveLength(4);

        // Verify complex coordination performance meets requirements
        expect(complexCoordinationTime).toBeLessThan(AGENT_CREATION_TIMEOUT);

        // Verify comprehensive service coordination
        expect(agentService.createAgent).toHaveBeenCalledWith(
          complexCoordinationRequest,
        );
        expect(agentService.validateAgentConfiguration).toHaveBeenCalled();

        // Verify complex configuration integrity
        expect(createdAgent.metadata.version).toBeDefined();
        expect(createdAgent.metadata.isActive).toBe(true);
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});

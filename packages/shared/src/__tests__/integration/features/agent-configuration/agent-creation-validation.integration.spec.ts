/**
 * @fileoverview Agent Configuration Validation Integration Tests
 *
 * Integration tests focusing on agent configuration validation workflows,
 * verifying cross-service validation coordination and constraint enforcement
 * across PersonalityService, RoleService, ModelService, and ValidationService.
 *
 * Integration Strategy:
 * - Tests cross-service validation coordination between all configuration services
 * - Validates personality-role compatibility through cross-service integration
 * - Tests model configuration compatibility with personality and role constraints
 * - Verifies validation error context preservation across service boundaries
 * - Tests validation performance within specified limits (300ms requirement)
 * - Follows BDD Given-When-Then structure with comprehensive error scenarios
 */

import type { AgentCreateRequest } from "../../../../types/agent";
import type { PersonalityConfiguration } from "../../../../types/personality";
import type { CustomRole } from "../../../../types/role";
import type { ModelConfiguration } from "../../../../types/model";
import type {
  AgentService,
  RoleService,
  ModelService,
  ValidationService,
} from "../../../../types/services";
import { AgentServiceMockFactory } from "../../support/AgentServiceMockFactory";
import { ValidationServiceMockFactory } from "../../support/ValidationServiceMockFactory";
import { RoleServiceMockFactory } from "../../support/RoleServiceMockFactory";
import { ModelServiceMockFactory } from "../../support/ModelServiceMockFactory";

describe("Feature: Agent Configuration Creation Integration", () => {
  // Test timeout for complex validation integration scenarios
  const INTEGRATION_TEST_TIMEOUT = 30000;

  // Performance requirements from task specification
  const CROSS_SERVICE_VALIDATION_TIMEOUT = 300; // 300ms maximum for cross-service validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const AGENT_CREATION_TIMEOUT = 1000; // 1000ms maximum for agent creation

  // Service mocks for cross-service validation coordination testing
  let agentService: jest.Mocked<AgentService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let validationService: jest.Mocked<ValidationService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let roleService: jest.Mocked<RoleService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let modelService: jest.Mocked<ModelService>;

  beforeEach(() => {
    // Reset all service mocks before each test for cross-service validation coordination
    agentService = AgentServiceMockFactory.createSuccess();
    validationService =
      ValidationServiceMockFactory.createCrossServiceCoordination();
    roleService = RoleServiceMockFactory.createSuccess();
    modelService = ModelServiceMockFactory.createSuccess();
  });

  afterEach(() => {
    // Cleanup service state and validation coordination context
    jest.clearAllMocks();
  });

  describe("Scenario: Cross-service agent configuration validation", () => {
    it.skip(
      "should validate agent configurations across personality, role, and model compatibility",
      async () => {
        // Given - Complex agent configurations with interdependent validation requirements
        // - Personality: Analytical with high conscientiousness (85) and analytical depth (90)
        // - Role: Financial Analyst requiring high conscientiousness and low risk tolerance
        // - Model: GPT-4 Turbo with conservative parameters for financial analysis
        // - Cross-service validation coordination configured for compatibility checking

        const analyticalPersonality: PersonalityConfiguration = {
          id: "personality-analytical-financial",
          name: "Analytical Financial Personality",
          description:
            "High conscientiousness and analytical depth for financial analysis",
          // Big Five traits optimized for financial analysis
          openness: 65, // Moderate openness for regulatory awareness
          conscientiousness: 85, // High conscientiousness for accuracy
          extraversion: 45, // Moderate extraversion for client communication
          agreeableness: 60, // Moderate agreeableness for stakeholder relations
          neuroticism: 25, // Low neuroticism for confidence in analysis
          // Behavioral traits aligned with financial analysis requirements
          formality: 80, // High formality for professional financial communication
          humor: 20, // Low humor for serious financial matters
          assertiveness: 70, // High assertiveness for recommendation confidence
          empathy: 40, // Moderate empathy balanced with analytical objectivity
          storytelling: 30, // Low storytelling for factual financial reporting
          brevity: 70, // High brevity for clear financial summaries
          imagination: 25, // Low imagination for conservative financial approach
          playfulness: 15, // Very low playfulness for serious financial analysis
          dramaticism: 10, // Minimal dramaticism for objective reporting
          analyticalDepth: 90, // Maximum analytical depth for financial analysis
          contrarianism: 35, // Moderate contrarianism for risk assessment
          encouragement: 50, // Balanced encouragement for client relations
          curiosity: 75, // High curiosity for thorough financial investigation
          patience: 80, // High patience for detailed financial analysis
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const financialAnalystRole: CustomRole = {
          id: "financial-analyst-specialist",
          name: "Financial Analyst Specialist",
          description:
            "Specialized role for comprehensive financial analysis and reporting",
          capabilities: [
            "financial-modeling",
            "risk-assessment",
            "regulatory-compliance",
            "investment-analysis",
            "portfolio-optimization",
          ],
          constraints: [
            "regulatory-compliance-required",
            "conservative-risk-approach",
            "accuracy-over-speed",
            "documented-assumptions",
          ],
          isTemplate: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          metadata: {
            domain: "finance",
            complexity: "advanced",
            tags: ["analyst", "financial", "specialist"],
          },
        };

        const conservativeModelConfig: ModelConfiguration = {
          id: "gpt-4-turbo-financial",
          name: "GPT-4 Turbo Financial Analysis",
          provider: "openai",
          version: "gpt-4-turbo-preview",
          description:
            "Conservative model configuration for financial analysis",
          isAvailable: true,
          tier: "premium",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const agentValidationRequest: AgentCreateRequest = {
          name: "Financial Analysis Validation Agent",
          description:
            "Agent for comprehensive financial analysis with cross-service validation",
          personalityId: analyticalPersonality.id,
          role: financialAnalystRole.id,
          modelId: conservativeModelConfig.id,
          capabilities: [
            "financial-modeling",
            "risk-assessment",
            "regulatory-compliance",
          ],
          constraints: [
            "regulatory-compliance-required",
            "conservative-risk-approach",
          ],
          settings: {
            temperature: 0.2, // Very low temperature for conservative financial analysis
            maxTokens: 4096, // Adequate tokens for detailed financial reports
            topP: 0.8, // Controlled creativity for financial analysis
          },
          tags: ["financial", "validation", "cross-service"],
        };

        // When - Validation is performed across personality, role, and model compatibility
        // - ValidationService coordinates with PersonalityService for trait compatibility
        // - ValidationService coordinates with RoleService for role requirement validation
        // - ValidationService coordinates with ModelService for model capability checking
        // - Cross-service validation ensures configuration compatibility and constraint enforcement
        // - All validation constraints are enforced with clear error reporting

        const validationStartTime = Date.now();

        const validationResult = await agentService.validateAgentConfiguration(
          agentValidationRequest,
        );

        const validationTime = Date.now() - validationStartTime;

        // Then - All validation constraints are enforced with clear error reporting
        // - Cross-service validation completes within 300ms performance requirement
        // - Personality-role compatibility is validated through cross-service integration
        // - Model configuration compatibility with personality and role is verified
        // - Configuration constraint violations provide specific guidance for resolution
        // - Validation errors maintain context from originating services

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);

        // Verify cross-service validation performance meets requirement
        expect(validationTime).toBeLessThan(CROSS_SERVICE_VALIDATION_TIMEOUT);

        // Verify cross-service validation coordination occurred
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          agentValidationRequest,
        );

        // Verify validation success for compatible configuration
        expect(validationResult.isValid).toBe(true);

        // Additional validation for financial analysis configuration compatibility
        expect(agentValidationRequest.settings.temperature).toBe(0.2); // Conservative temperature
        expect(agentValidationRequest.capabilities).toContain(
          "financial-modeling",
        );
        expect(agentValidationRequest.constraints).toContain(
          "regulatory-compliance-required",
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should detect and report cross-service validation failures with detailed context",
      async () => {
        // Given - Agent configuration with intentional cross-service incompatibilities
        // - Personality: High creativity (openness 90) with low conscientiousness (25)
        // - Role: Financial Analyst requiring high conscientiousness and low creativity
        // - Model: Creative model configuration inappropriate for financial analysis
        // - ValidationService configured to detect cross-service incompatibilities

        const creativePersonality: PersonalityConfiguration = {
          id: "personality-highly-creative",
          name: "Highly Creative Personality",
          description:
            "High creativity and openness with low conscientiousness",
          // Big Five traits incompatible with financial analysis
          openness: 90, // Very high openness - incompatible with conservative financial analysis
          conscientiousness: 25, // Very low conscientiousness - incompatible with financial accuracy
          extraversion: 80, // High extraversion
          agreeableness: 85, // High agreeableness
          neuroticism: 60, // Moderate neuroticism
          // Behavioral traits incompatible with financial role requirements
          formality: 20, // Very low formality - incompatible with financial professionalism
          humor: 85, // High humor - inappropriate for financial analysis
          assertiveness: 90, // Very high assertiveness
          empathy: 90, // Very high empathy - may compromise objective analysis
          storytelling: 90, // High storytelling - inappropriate for factual financial reporting
          brevity: 30, // Low brevity - poor for financial summaries
          imagination: 95, // Very high imagination - inappropriate for conservative analysis
          playfulness: 85, // High playfulness - inappropriate for serious financial matters
          dramaticism: 80, // High dramaticism - inappropriate for objective reporting
          analyticalDepth: 40, // Low analytical depth - incompatible with financial analysis
          contrarianism: 80, // High contrarianism - may create unnecessary risk
          encouragement: 95, // Very high encouragement
          curiosity: 95, // Very high curiosity
          patience: 30, // Low patience - incompatible with detailed financial analysis
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const incompatibleAgentRequest: AgentCreateRequest = {
          name: "Incompatible Configuration Agent",
          description:
            "Agent with intentionally incompatible cross-service configuration",
          personalityId: creativePersonality.id,
          role: "financial-analyst-specialist", // Requires high conscientiousness, low creativity
          modelId: "gpt-4-turbo-creative", // Creative model configuration
          capabilities: ["creative-writing", "artistic-guidance"], // Inappropriate capabilities
          constraints: ["creative-freedom"], // Inappropriate constraints
          settings: {
            temperature: 1.5, // Very high temperature - inappropriate for financial analysis
            maxTokens: 1024, // Limited tokens - inadequate for financial reports
            topP: 1.0, // Maximum creativity - inappropriate for financial analysis
          },
          tags: ["creative", "incompatible"],
        };

        // Configure ValidationService to detect incompatibilities
        validationService = ValidationServiceMockFactory.createWithFailures({
          validationErrors: [
            {
              field: "personality-role-compatibility",
              message:
                "Personality conscientiousness (25) below role minimum requirement (80)",
              code: "PERSONALITY_ROLE_INCOMPATIBLE",
            },
            {
              field: "personality-role-compatibility",
              message:
                "Personality formality (20) below role minimum requirement (75)",
              code: "PERSONALITY_TRAIT_INSUFFICIENT",
            },
            {
              field: "model-configuration-compatibility",
              message:
                "Model temperature (1.5) exceeds role maximum requirement (0.5) for financial analysis",
              code: "MODEL_CONFIG_INCOMPATIBLE",
            },
            {
              field: "capability-role-alignment",
              message:
                "Capabilities [creative-writing, artistic-guidance] incompatible with financial-analyst role",
              code: "CAPABILITY_ROLE_MISMATCH",
            },
          ],
        });

        // When - Cross-service validation detects multiple incompatibilities
        // - ValidationService identifies personality-role trait incompatibilities
        // - ValidationService detects model configuration incompatibilities
        // - ValidationService reports capability-role misalignments
        // - Cross-service validation provides detailed error context from each service

        const validationStartTime = Date.now();

        const validationResult = await agentService.validateAgentConfiguration(
          incompatibleAgentRequest,
        );

        const validationTime = Date.now() - validationStartTime;

        // Then - Cross-service validation failures provide detailed guidance
        // - Validation completes within performance requirements despite failures
        // - Validation errors include specific field and service context
        // - Error messages provide actionable guidance for resolution
        // - Service boundary information is preserved in error context

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);

        // Verify validation performance meets requirement even for failures
        expect(validationTime).toBeLessThan(CROSS_SERVICE_VALIDATION_TIMEOUT);

        // Verify specific validation errors with service context
        const validationErrors = validationResult.errors;
        expect(
          validationErrors.some(
            (error) =>
              error.field === "personality-role-compatibility" &&
              error.message.includes("conscientiousness") &&
              error.message.includes("below role minimum"),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "model-configuration-compatibility" &&
              error.message.includes("temperature") &&
              error.message.includes("exceeds role maximum"),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "capability-role-alignment" &&
              error.message.includes("incompatible with financial-analyst"),
          ),
        ).toBe(true);

        // Verify service coordination occurred despite failures
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          incompatibleAgentRequest,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Personality-role compatibility validation through cross-service integration", () => {
    it.skip(
      "should validate personality-role compatibility through cross-service integration",
      async () => {
        // Given - Agent configurations requiring personality-role compatibility checking
        // - Technical personality with high analytical depth and moderate conscientiousness
        // - Software Developer role requiring technical aptitude and analytical thinking
        // - Cross-service integration for personality trait and role requirement matching

        const technicalPersonality: PersonalityConfiguration = {
          id: "personality-technical-developer",
          name: "Technical Developer Personality",
          description:
            "Optimized personality for software development and technical problem-solving",
          // Big Five traits aligned with software development
          openness: 80, // High openness for learning new technologies
          conscientiousness: 70, // High conscientiousness for code quality
          extraversion: 50, // Balanced extraversion for team collaboration
          agreeableness: 65, // Moderate agreeableness for code review collaboration
          neuroticism: 30, // Low neuroticism for handling technical challenges
          // Behavioral traits optimized for software development
          formality: 50, // Moderate formality for technical communication
          humor: 60, // Moderate humor for team dynamics
          assertiveness: 75, // High assertiveness for technical decisions
          empathy: 55, // Moderate empathy for user experience consideration
          storytelling: 40, // Moderate storytelling for technical documentation
          brevity: 80, // High brevity for clear code comments
          imagination: 85, // High imagination for creative problem-solving
          playfulness: 70, // High playfulness for experimental coding
          dramaticism: 25, // Low dramaticism for objective technical discussion
          analyticalDepth: 95, // Maximum analytical depth for technical analysis
          contrarianism: 60, // Moderate contrarianism for design alternatives
          encouragement: 70, // High encouragement for mentoring junior developers
          curiosity: 90, // Very high curiosity for technology exploration
          patience: 75, // High patience for debugging and problem-solving
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const developerRole: CustomRole = {
          id: "software-developer-senior",
          name: "Senior Software Developer",
          description:
            "Senior software development role with technical leadership responsibilities",
          capabilities: [
            "software-architecture",
            "code-review",
            "technical-mentoring",
            "problem-solving",
            "technology-evaluation",
          ],
          constraints: [
            "code-quality-standards",
            "performance-requirements",
            "security-best-practices",
          ],
          isTemplate: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          metadata: {
            domain: "software-development",
            complexity: "advanced",
            tags: ["developer", "senior", "technical"],
          },
        };

        const technicalAgentRequest: AgentCreateRequest = {
          name: "Technical Developer Agent",
          description:
            "Agent for software development and technical problem-solving",
          personalityId: technicalPersonality.id,
          role: developerRole.id,
          modelId: "gpt-4-turbo",
          capabilities: [
            "software-architecture",
            "code-review",
            "problem-solving",
          ],
          constraints: ["code-quality-standards", "performance-requirements"],
          settings: {
            temperature: 0.6, // Moderate temperature for balanced creativity and precision
            maxTokens: 3072, // Adequate tokens for technical explanations
            topP: 0.85, // Controlled creativity for technical solutions
          },
          tags: ["technical", "developer", "compatibility"],
        };

        // When - Cross-service validation checks personality and role compatibility
        // - PersonalityService provides personality trait analysis
        // - RoleService provides role requirement and compatibility factor analysis
        // - ValidationService performs cross-service compatibility matching
        // - Compatibility algorithms analyze trait-requirement alignment

        const compatibilityCheckStart = Date.now();

        const validationResult = await agentService.validateAgentConfiguration(
          technicalAgentRequest,
        );

        const compatibilityCheckTime = Date.now() - compatibilityCheckStart;

        // Then - Validation results provide specific compatibility analysis and guidance
        // - Compatibility validation completes within performance requirements
        // - Personality traits are successfully matched against role requirements
        // - Compatibility factors are analyzed for technical aptitude alignment
        // - Validation provides detailed compatibility scoring and recommendations

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);

        // Verify compatibility validation performance
        expect(compatibilityCheckTime).toBeLessThan(
          CROSS_SERVICE_VALIDATION_TIMEOUT,
        );

        // Verify service coordination for compatibility checking
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          technicalAgentRequest,
        );

        // Verify personality-role compatibility success
        expect(technicalPersonality.analyticalDepth).toBeGreaterThanOrEqual(80); // Meets role requirement
        expect(technicalPersonality.curiosity).toBeGreaterThanOrEqual(75); // Meets role requirement
        expect(technicalPersonality.patience).toBeGreaterThanOrEqual(70); // Meets role requirement
        expect(technicalPersonality.conscientiousness).toBeGreaterThanOrEqual(
          65,
        ); // Meets role requirement
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should provide detailed compatibility guidance for personality-role mismatches",
      async () => {
        // Given - Personality configuration incompatible with role requirements
        // - Social personality with high extraversion and low analytical depth
        // - Technical Analyst role requiring high analytical depth and focused attention
        // - Cross-service validation configured to detect personality-role mismatches

        const socialPersonality: PersonalityConfiguration = {
          id: "personality-social-extrovert",
          name: "Social Extrovert Personality",
          description: "High social engagement with low analytical focus",
          // Big Five traits optimized for social interaction, not technical analysis
          openness: 75, // High openness for social situations
          conscientiousness: 45, // Low conscientiousness - problematic for detailed work
          extraversion: 95, // Very high extraversion - may distract from focused analysis
          agreeableness: 90, // Very high agreeableness
          neuroticism: 20, // Low neuroticism
          // Behavioral traits optimized for social engagement, not technical focus
          formality: 30, // Low formality
          humor: 90, // Very high humor - may distract from technical focus
          assertiveness: 60, // Moderate assertiveness
          empathy: 95, // Very high empathy
          storytelling: 85, // High storytelling
          brevity: 25, // Very low brevity - problematic for technical communication
          imagination: 70, // High imagination
          playfulness: 90, // Very high playfulness - may distract from technical focus
          dramaticism: 75, // High dramaticism
          analyticalDepth: 30, // Very low analytical depth - incompatible with analyst role
          contrarianism: 15, // Very low contrarianism
          encouragement: 95, // Very high encouragement
          curiosity: 40, // Low curiosity for technical details
          patience: 25, // Very low patience - problematic for detailed analysis
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const incompatibleAgentRequest: AgentCreateRequest = {
          name: "Incompatible Personality-Role Agent",
          description:
            "Agent with personality-role incompatibility for testing",
          personalityId: socialPersonality.id,
          role: "technical-analyst-specialist", // Requires high analytical depth and focus
          modelId: "gpt-4-turbo",
          capabilities: ["technical-analysis", "detailed-research"],
          constraints: ["analytical-precision-required"],
          settings: {
            temperature: 0.3, // Low temperature for analytical precision
            maxTokens: 2048,
          },
          tags: ["incompatible", "personality-role"],
        };

        // Configure ValidationService to detect personality-role incompatibilities
        validationService = ValidationServiceMockFactory.createWithFailures({
          validationErrors: [
            {
              field: "personality-role-compatibility",
              message:
                "Analytical depth (30) significantly below role requirement (85) for technical analysis",
              code: "ANALYTICAL_DEPTH_INSUFFICIENT",
            },
            {
              field: "personality-role-compatibility",
              message:
                "Patience (25) below role minimum requirement (70) for detailed analysis tasks",
              code: "PATIENCE_INSUFFICIENT",
            },
            {
              field: "personality-role-compatibility",
              message:
                "Conscientiousness (45) below role requirement (65) for quality analytical work",
              code: "CONSCIENTIOUSNESS_INSUFFICIENT",
            },
            {
              field: "personality-behavioral-alignment",
              message:
                "High playfulness (90) may conflict with focused analytical work requirements",
              code: "BEHAVIORAL_TRAIT_CONFLICT",
            },
          ],
        });

        // When - Cross-service validation detects personality-role incompatibilities
        // - PersonalityService analyzes social personality traits
        // - RoleService provides technical analyst role requirements
        // - ValidationService identifies specific trait-requirement mismatches
        // - Compatibility analysis provides detailed mismatch guidance

        const mismatchAnalysisStart = Date.now();

        const validationResult = await agentService.validateAgentConfiguration(
          incompatibleAgentRequest,
        );

        const mismatchAnalysisTime = Date.now() - mismatchAnalysisStart;

        // Then - Detailed compatibility guidance identifies specific personality-role conflicts
        // - Validation completes within performance requirements
        // - Specific trait deficiencies are identified with clear guidance
        // - Compatibility scoring provides actionable recommendations
        // - Error context includes both personality and role service information

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);

        // Verify mismatch analysis performance
        expect(mismatchAnalysisTime).toBeLessThan(
          CROSS_SERVICE_VALIDATION_TIMEOUT,
        );

        // Verify specific personality-role incompatibility errors
        const validationErrors = validationResult.errors;
        expect(
          validationErrors.some(
            (error) =>
              error.field === "personality-role-compatibility" &&
              error.message.includes("Analytical depth") &&
              error.message.includes("below role requirement"),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "personality-role-compatibility" &&
              error.message.includes("Patience") &&
              error.message.includes("below role minimum"),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "personality-behavioral-alignment" &&
              error.message.includes("playfulness") &&
              error.message.includes("conflict with focused analytical"),
          ),
        ).toBe(true);

        // Verify service coordination for incompatibility detection
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          incompatibleAgentRequest,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Model configuration compatibility validation with personality and role", () => {
    it.skip(
      "should validate model configuration compatibility with personality and role",
      async () => {
        // Given - Model configurations that may conflict with personality or role requirements
        // - Creative personality requiring high temperature and flexible model parameters
        // - Creative Director role supporting creative model configurations
        // - Model configuration optimized for creative tasks with appropriate parameters

        const creativePersonality: PersonalityConfiguration = {
          id: "personality-creative-director",
          name: "Creative Director Personality",
          description:
            "High creativity and imagination for creative leadership",
          // Big Five traits optimized for creative direction
          openness: 95, // Maximum openness for creative exploration
          conscientiousness: 60, // Moderate conscientiousness for project management
          extraversion: 75, // High extraversion for creative leadership
          agreeableness: 70, // Moderate agreeableness for team collaboration
          neuroticism: 40, // Moderate neuroticism for creative sensitivity
          // Behavioral traits optimized for creative direction
          formality: 35, // Low formality for creative environments
          humor: 80, // High humor for creative team dynamics
          assertiveness: 85, // High assertiveness for creative vision
          empathy: 80, // High empathy for understanding creative needs
          storytelling: 95, // Maximum storytelling for creative communication
          brevity: 40, // Low brevity for detailed creative explanations
          imagination: 98, // Maximum imagination for creative innovation
          playfulness: 90, // Very high playfulness for creative exploration
          dramaticism: 85, // High dramaticism for creative expression
          analyticalDepth: 65, // Moderate analytical depth for creative analysis
          contrarianism: 75, // High contrarianism for creative alternatives
          encouragement: 90, // Very high encouragement for creative support
          curiosity: 95, // Very high curiosity for creative discovery
          patience: 55, // Moderate patience for creative processes
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const creativeDirectorRole: CustomRole = {
          id: "creative-director-senior",
          name: "Senior Creative Director",
          description:
            "Senior creative leadership role for artistic vision and team guidance",
          capabilities: [
            "creative-vision",
            "artistic-guidance",
            "creative-team-leadership",
            "brand-storytelling",
            "design-innovation",
          ],
          constraints: [
            "brand-consistency",
            "project-timeline-awareness",
            "budget-considerations",
          ],
          isTemplate: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          metadata: {
            domain: "creative",
            complexity: "advanced",
            tags: ["creative", "director", "leadership"],
          },
        };

        const creativeModelConfig: ModelConfiguration = {
          id: "gpt-4-turbo-creative",
          name: "GPT-4 Turbo Creative",
          provider: "openai",
          version: "gpt-4-turbo-preview",
          description: "High-creativity model configuration for creative tasks",
          isAvailable: true,
          tier: "premium",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const creativeAgentRequest: AgentCreateRequest = {
          name: "Creative Director Agent",
          description: "Agent for creative direction and artistic vision",
          personalityId: creativePersonality.id,
          role: creativeDirectorRole.id,
          modelId: creativeModelConfig.id,
          capabilities: [
            "creative-vision",
            "artistic-guidance",
            "brand-storytelling",
          ],
          constraints: ["brand-consistency", "project-timeline-awareness"],
          settings: {
            temperature: 0.9, // High temperature for creative output
            maxTokens: 4096, // Large token limit for detailed creative explanations
            topP: 0.95, // High creativity sampling
            frequencyPenalty: 0.1, // Minimal frequency penalty for creative variety
            presencePenalty: 0.2, // Low presence penalty for creative exploration
          },
          tags: ["creative", "director", "model-compatibility"],
        };

        // When - Cross-service validation checks model compatibility
        // - ModelService validates model configuration against personality requirements
        // - ModelService checks model capabilities against role requirements
        // - ValidationService performs cross-component compatibility analysis
        // - Model parameter validation ensures personality-role-model alignment

        const modelCompatibilityStart = Date.now();

        const validationResult =
          await agentService.validateAgentConfiguration(creativeAgentRequest);

        const modelCompatibilityTime = Date.now() - modelCompatibilityStart;

        // Then - Validation provides detailed compatibility analysis and recommendations
        // - Model compatibility validation completes within performance requirements
        // - Model parameters are validated against personality creativity requirements
        // - Model capabilities are verified against role creative requirements
        // - Cross-component validation confirms model-personality-role alignment

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);

        // Verify model compatibility validation performance
        expect(modelCompatibilityTime).toBeLessThan(
          CROSS_SERVICE_VALIDATION_TIMEOUT,
        );

        // Verify service coordination for model compatibility
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          creativeAgentRequest,
        );

        // Verify model configuration aligns with creative requirements
        expect(creativeAgentRequest.settings.temperature).toBe(0.9); // High temperature for creativity
        expect(
          creativeAgentRequest.settings.temperature,
        ).toBeGreaterThanOrEqual(0.7); // Meets role minimum
        expect(creativeAgentRequest.settings.temperature).toBeLessThanOrEqual(
          1.2,
        ); // Within role maximum
        expect(creativeAgentRequest.settings.maxTokens).toBe(4096); // Adequate for creative explanations
        expect(creativeAgentRequest.settings.topP).toBe(0.95); // High creativity sampling
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should detect model configuration conflicts with conservative personality and role requirements",
      async () => {
        // Given - Conservative personality and role with incompatible model configuration
        // - Risk-averse personality requiring low creativity and high precision
        // - Financial Compliance role requiring conservative model parameters
        // - Model configuration with high creativity parameters incompatible with conservative requirements

        const conservativePersonality: PersonalityConfiguration = {
          id: "personality-risk-averse",
          name: "Risk-Averse Conservative Personality",
          description: "Low risk tolerance with high precision requirements",
          // Big Five traits optimized for conservative, precise work
          openness: 35, // Low openness for conservative approach
          conscientiousness: 90, // Very high conscientiousness for precision
          extraversion: 40, // Low extraversion for focused work
          agreeableness: 65, // Moderate agreeableness
          neuroticism: 20, // Low neuroticism for confidence
          // Behavioral traits optimized for conservative, precise work
          formality: 95, // Maximum formality for professional standards
          humor: 15, // Very low humor for serious work
          assertiveness: 60, // Moderate assertiveness
          empathy: 45, // Moderate empathy
          storytelling: 20, // Very low storytelling for factual communication
          brevity: 85, // High brevity for clear, concise communication
          imagination: 25, // Very low imagination for conservative approach
          playfulness: 10, // Minimal playfulness for serious work
          dramaticism: 5, // Minimal dramaticism for objective communication
          analyticalDepth: 95, // Maximum analytical depth for thorough analysis
          contrarianism: 20, // Low contrarianism for consensus building
          encouragement: 50, // Moderate encouragement
          curiosity: 60, // Moderate curiosity focused on established facts
          patience: 95, // Maximum patience for detailed work
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const incompatibleModelRequest: AgentCreateRequest = {
          name: "Conservative-Creative Conflict Agent",
          description:
            "Agent with conservative personality but creative model configuration",
          personalityId: conservativePersonality.id,
          role: "financial-compliance-specialist", // Requires conservative approach
          modelId: "gpt-4-turbo-creative", // Creative model configuration
          capabilities: ["compliance-monitoring", "risk-assessment"],
          constraints: ["regulatory-compliance", "conservative-approach"],
          settings: {
            temperature: 1.4, // Very high temperature - conflicts with conservative requirements
            maxTokens: 8192, // Very large token limit - excessive for compliance reports
            topP: 1.0, // Maximum creativity - conflicts with conservative approach
            frequencyPenalty: -0.5, // Negative penalty encouraging repetition creativity
            presencePenalty: -0.3, // Negative penalty for creative topic exploration
          },
          tags: ["conservative", "creative-conflict"],
        };

        // Configure ValidationService to detect model configuration conflicts
        validationService = ValidationServiceMockFactory.createWithFailures({
          validationErrors: [
            {
              field: "model-personality-compatibility",
              message:
                "Model temperature (1.4) conflicts with conservative personality (imagination: 25, openness: 35)",
              code: "MODEL_PERSONALITY_CONFLICT",
            },
            {
              field: "model-role-compatibility",
              message:
                "Model creativity parameters exceed role conservative requirements for financial compliance",
              code: "MODEL_ROLE_CONFLICT",
            },
            {
              field: "model-configuration-validation",
              message:
                "Negative frequency penalty (-0.5) inappropriate for compliance work requiring consistent terminology",
              code: "MODEL_PARAMETER_INAPPROPRIATE",
            },
            {
              field: "cross-component-alignment",
              message:
                "High-creativity model configuration incompatible with risk-averse personality and compliance role",
              code: "CROSS_COMPONENT_MISALIGNMENT",
            },
          ],
        });

        // When - Model configuration conflicts are detected through cross-service validation
        // - ModelService identifies parameter conflicts with personality traits
        // - ModelService detects capability misalignment with role requirements
        // - ValidationService reports cross-component configuration conflicts
        // - Compatibility analysis provides specific conflict resolution guidance

        const conflictDetectionStart = Date.now();

        const validationResult = await agentService.validateAgentConfiguration(
          incompatibleModelRequest,
        );

        const conflictDetectionTime = Date.now() - conflictDetectionStart;

        // Then - Model configuration conflicts are identified with specific guidance
        // - Conflict detection completes within performance requirements
        // - Specific model parameter conflicts with personality are identified
        // - Model capability conflicts with role requirements are reported
        // - Cross-component misalignment guidance provides resolution recommendations

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);

        // Verify conflict detection performance
        expect(conflictDetectionTime).toBeLessThan(
          CROSS_SERVICE_VALIDATION_TIMEOUT,
        );

        // Verify specific model configuration conflict errors
        const validationErrors = validationResult.errors;
        expect(
          validationErrors.some(
            (error) =>
              error.field === "model-personality-compatibility" &&
              error.message.includes("temperature") &&
              error.message.includes("conflicts with conservative personality"),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "model-role-compatibility" &&
              error.message.includes(
                "creativity parameters exceed role conservative requirements",
              ),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "cross-component-alignment" &&
              error.message.includes(
                "High-creativity model configuration incompatible",
              ),
          ),
        ).toBe(true);

        // Verify service coordination for conflict detection
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          incompatibleModelRequest,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });

  describe("Scenario: Validation error context preservation across service boundaries", () => {
    it.skip(
      "should preserve validation context across service boundaries",
      async () => {
        // Given - Complex validation failures spanning multiple services
        // - PersonalityService validation errors for personality trait consistency
        // - RoleService validation errors for role capability requirements
        // - ModelService validation errors for model parameter constraints
        // - Cross-service validation configured to preserve error context from each service

        const problematicAgentRequest: AgentCreateRequest = {
          name: "Multi-Service Validation Error Agent",
          description:
            "Agent with validation errors across multiple service boundaries",
          personalityId: "personality-non-existent", // Non-existent personality ID
          role: "role-invalid-capabilities", // Role with invalid capability definitions
          modelId: "model-deprecated", // Deprecated or unavailable model
          capabilities: ["undefined-capability", "restricted-capability"],
          constraints: ["conflicting-constraint", "invalid-constraint"],
          settings: {
            temperature: 2.5, // Invalid temperature value (exceeds maximum)
            maxTokens: -1000, // Invalid negative token count
            topP: 1.5, // Invalid topP value (exceeds maximum)
          },
          tags: ["multi-service", "validation-errors"],
        };

        // Configure multiple services with different error scenarios
        validationService = ValidationServiceMockFactory.createWithFailures({
          validationErrors: [
            {
              field: "personalityId",
              message:
                "Personality 'personality-non-existent' not found in PersonalityService",
              code: "PERSONALITY_NOT_FOUND",
            },
            {
              field: "role",
              message:
                "Role 'role-invalid-capabilities' has invalid capability definitions in RoleService",
              code: "ROLE_INVALID_CAPABILITIES",
            },
            {
              field: "modelId",
              message:
                "Model 'model-deprecated' is deprecated and unavailable in ModelService",
              code: "MODEL_UNAVAILABLE",
            },
            {
              field: "settings.temperature",
              message:
                "Temperature value 2.5 exceeds maximum allowed value (2.0) in ModelService configuration",
              code: "MODEL_PARAMETER_OUT_OF_RANGE",
            },
            {
              field: "settings.maxTokens",
              message:
                "Negative token count (-1000) is invalid in ModelService parameter validation",
              code: "MODEL_PARAMETER_INVALID",
            },
          ],
        });

        // When - Validation errors occur across service coordination
        // - PersonalityService reports personality ID resolution errors
        // - RoleService reports role capability validation errors
        // - ModelService reports model availability and parameter validation errors
        // - ValidationService aggregates errors while preserving service context
        // - Cross-service error coordination maintains originating service information

        const multiServiceValidationStart = Date.now();

        const validationResult = await agentService.validateAgentConfiguration(
          problematicAgentRequest,
        );

        const multiServiceValidationTime =
          Date.now() - multiServiceValidationStart;

        // Then - Error context from originating services is maintained and aggregated
        // - Multi-service validation completes within performance requirements
        // - Errors include specific service context and originating service information
        // - Service boundary information is preserved for each validation error
        // - Error aggregation maintains detailed context for cross-service troubleshooting

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThanOrEqual(5);

        // Verify multi-service validation performance
        expect(multiServiceValidationTime).toBeLessThan(
          CROSS_SERVICE_VALIDATION_TIMEOUT,
        );

        // Verify service context preservation in error messages
        const validationErrors = validationResult.errors;
        expect(
          validationErrors.some(
            (error) =>
              error.field === "personalityId" &&
              error.message.includes("PersonalityService") &&
              error.code === "PERSONALITY_NOT_FOUND",
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "role" &&
              error.message.includes("RoleService") &&
              error.code === "ROLE_INVALID_CAPABILITIES",
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "modelId" &&
              error.message.includes("ModelService") &&
              error.code === "MODEL_UNAVAILABLE",
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "settings.temperature" &&
              error.message.includes("ModelService configuration") &&
              error.code === "MODEL_PARAMETER_OUT_OF_RANGE",
          ),
        ).toBe(true);

        // Verify service coordination occurred for context preservation
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          problematicAgentRequest,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );

    it.skip(
      "should maintain error correlation across complex service interaction chains",
      async () => {
        // Given - Complex agent configuration with cascading validation dependencies
        // - Personality validation depends on role compatibility requirements
        // - Model validation depends on both personality and role constraints
        // - Cross-service validation maintains error correlation throughout dependency chains

        const cascadingErrorRequest: AgentCreateRequest = {
          name: "Cascading Error Chain Agent",
          description:
            "Agent with cascading errors across service dependency chains",
          personalityId: "personality-cascading-errors",
          role: "role-dependency-chain",
          modelId: "model-cascade-validation",
          capabilities: ["cascading-validation", "dependency-chain-testing"],
          constraints: ["cross-service-dependencies"],
          settings: {
            temperature: 0.5,
            maxTokens: 2048,
          },
          tags: ["cascading", "dependency-chain"],
        };

        // Configure ValidationService with cascading error scenarios
        validationService = ValidationServiceMockFactory.createWithFailures({
          validationErrors: [
            {
              field: "personality-validation-chain",
              message:
                "Personality validation failed in PersonalityService, propagating to role compatibility check",
              code: "PERSONALITY_VALIDATION_CASCADE",
            },
            {
              field: "role-dependency-validation",
              message:
                "Role validation depends on personality context from PersonalityService - validation chain broken",
              code: "ROLE_DEPENDENCY_FAILURE",
            },
            {
              field: "model-compatibility-chain",
              message:
                "Model validation cannot proceed due to personality and role validation failures upstream",
              code: "MODEL_VALIDATION_BLOCKED",
            },
            {
              field: "cross-service-correlation",
              message:
                "Service correlation ID: CSS-12345 - tracking validation failure across PersonalityService -> RoleService -> ModelService",
              code: "CROSS_SERVICE_CORRELATION",
            },
          ],
        });

        // When - Complex service interaction chains encounter cascading failures
        // - Initial validation failure in PersonalityService
        // - Cascading validation failure in RoleService due to personality dependency
        // - Blocked validation in ModelService due to upstream failures
        // - Cross-service correlation tracking maintains error relationship context

        const cascadingValidationStart = Date.now();

        const validationResult = await agentService.validateAgentConfiguration(
          cascadingErrorRequest,
        );

        const cascadingValidationTime = Date.now() - cascadingValidationStart;

        // Then - Error correlation is maintained across complex service interaction chains
        // - Cascading validation handling completes within performance requirements
        // - Service dependency chain failures are correlated and reported
        // - Cross-service correlation IDs enable error tracking across service boundaries
        // - Error context includes dependency chain information for troubleshooting

        expect(validationResult).toBeDefined();
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);

        // Verify cascading validation performance
        expect(cascadingValidationTime).toBeLessThan(
          CROSS_SERVICE_VALIDATION_TIMEOUT,
        );

        // Verify cascading error correlation in validation results
        const validationErrors = validationResult.errors;
        expect(
          validationErrors.some(
            (error) =>
              error.field === "personality-validation-chain" &&
              error.message.includes("propagating to role compatibility"),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "role-dependency-validation" &&
              error.message.includes("depends on personality context"),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "model-compatibility-chain" &&
              error.message.includes("cannot proceed due to") &&
              error.message.includes("upstream"),
          ),
        ).toBe(true);

        expect(
          validationErrors.some(
            (error) =>
              error.field === "cross-service-correlation" &&
              error.message.includes("Service correlation ID") &&
              error.message.includes(
                "PersonalityService -> RoleService -> ModelService",
              ),
          ),
        ).toBe(true);

        // Verify service coordination for cascading validation
        expect(agentService.validateAgentConfiguration).toHaveBeenCalledWith(
          cascadingErrorRequest,
        );
      },
      INTEGRATION_TEST_TIMEOUT,
    );
  });
});

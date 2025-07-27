/**
 * @fileoverview Agent Test Data Builder
 *
 * Builder pattern for creating agent test data with fluent API and realistic scenarios.
 * Follows the established pattern from RoleTestDataBuilder for consistency.
 */

import type { AgentCreateRequest } from "../../../types/agent";

/**
 * Agent Test Data Builder
 * Provides fluent API for building test agent configuration data
 */
export class AgentTestDataBuilder {
  /**
   * Create a basic valid agent configuration for testing
   */
  static createValidAgentConfig(
    overrides: Partial<AgentCreateRequest> = {},
  ): AgentCreateRequest {
    const defaultAgent: AgentCreateRequest = {
      name: "Test Technical Advisor",
      description:
        "A test agent for technical guidance and implementation support",
      role: "technical-advisor",
      personalityId: "550e8400-e29b-41d4-a716-446655440001",
      modelId: "gpt-4-turbo-preview",
      capabilities: [
        "technical_analysis",
        "implementation_guidance",
        "problem_solving",
      ],
      constraints: ["technical_domain_only", "evidence_based_recommendations"],
      settings: {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
      },
      tags: ["technical", "advisor", "test"],
    };
    return { ...defaultAgent, ...overrides };
  }

  /**
   * Create a complex agent configuration with comprehensive settings
   */
  static createComplexAgentConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "Advanced Multi-Domain Specialist",
      description:
        "Complex agent with multiple capabilities and detailed configuration",
      role: "analyst",
      personalityId: "550e8400-e29b-41d4-a716-446655440002",
      modelId: "claude-3-opus",
      capabilities: [
        "comprehensive_analysis",
        "strategic_planning",
        "cross_domain_synthesis",
        "research_methodology",
        "data_interpretation",
        "insight_generation",
      ],
      constraints: [
        "multi_domain_expertise_required",
        "evidence_based_conclusions",
        "peer_review_recommended",
        "confidentiality_maintained",
        "ethical_guidelines_followed",
      ],
      settings: {
        temperature: 0.4,
        maxTokens: 4096,
        topP: 0.85,
        frequencyPenalty: 0.1,
        presencePenalty: 0.05,
      },
      tags: ["advanced", "multi-domain", "analyst", "complex"],
    });
  }

  /**
   * Create a minimal valid agent configuration
   */
  static createMinimalAgentConfig(): AgentCreateRequest {
    return {
      name: "Basic Assistant",
      role: "generalist",
      personalityId: "550e8400-e29b-41d4-a716-446655440003",
      modelId: "gpt-3.5-turbo",
      capabilities: ["general_assistance"],
      constraints: [],
      settings: {},
      tags: [],
    };
  }

  /**
   * Create an invalid agent configuration for validation testing
   */
  static createInvalidAgentConfig(): AgentCreateRequest {
    return {
      name: "", // Invalid: empty name
      description: "Test agent with validation errors",
      role: "analyst",
      personalityId: "invalid-uuid-format", // Invalid: not a valid UUID
      modelId: "", // Invalid: empty model ID
      capabilities: [], // Invalid: empty capabilities for specialist role
      constraints: [],
      settings: {},
      tags: [],
    };
  }

  /**
   * Create an agent with incompatible personality-role combination
   */
  static createIncompatibleConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "Incompatible Agent Configuration",
      description:
        "Agent with personality-role mismatch for testing compatibility validation",
      role: "creative-director", // Creative role
      personalityId: "template-analytical-001", // Analytical personality - mismatch
      modelId: "gpt-4-analysis", // Analytical model - compounds mismatch
      capabilities: [
        "creative_ideation", // Conflicts with analytical personality
        "artistic_vision",
        "brand_development",
      ],
      constraints: ["creative_domain_focus", "originality_required"],
      tags: ["incompatible", "mismatch", "testing"],
    });
  }

  /**
   * Create an agent with missing component configuration
   */
  static createMissingComponentConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "Missing Component Agent",
      description: "Agent referencing non-existent personality or model",
      role: "coach",
      personalityId: "550e8400-0000-0000-0000-000000000000", // Non-existent personality
      modelId: "non-existent-model-v1", // Non-existent model
      capabilities: ["coaching_guidance"],
      constraints: [],
      tags: ["missing", "references", "testing"],
    });
  }

  /**
   * Create multiple agent configurations for batch testing
   */
  static createMultipleAgentConfigs(count: number): AgentCreateRequest[] {
    const agents: AgentCreateRequest[] = [];
    for (let i = 0; i < count; i++) {
      agents.push(
        this.createValidAgentConfig({
          name: `Test Agent ${i + 1}`,
          description: `Test agent number ${i + 1} for batch operations`,
          role: "generalist",
          personalityId: `550e8400-e29b-41d4-a716-44665544000${i % 10}`,
          modelId: i % 2 === 0 ? "gpt-3.5-turbo" : "claude-3-haiku",
          capabilities: [`capability_${i + 1}`, "general_assistance"],
          constraints: [`constraint_${i + 1}`],
          tags: [`batch_${i + 1}`, "testing"],
        }),
      );
    }
    return agents;
  }

  /**
   * Create agent configurations for concurrent testing scenarios
   */
  static createConcurrentTestConfigs(): AgentCreateRequest[] {
    return [
      this.createValidAgentConfig({
        name: "Concurrent Technical Advisor",
        role: "technical-advisor",
        personalityId: "550e8400-e29b-41d4-a716-446655440001",
        modelId: "gpt-4-turbo-preview",
        tags: ["concurrent", "technical"],
      }),
      this.createValidAgentConfig({
        name: "Concurrent Creative Director",
        role: "creative-director",
        personalityId: "550e8400-e29b-41d4-a716-446655440002",
        modelId: "claude-3-sonnet",
        capabilities: ["creative_ideation", "artistic_direction"],
        tags: ["concurrent", "creative"],
      }),
      this.createValidAgentConfig({
        name: "Concurrent Data Analyst",
        role: "analyst",
        personalityId: "550e8400-e29b-41d4-a716-446655440003",
        modelId: "gpt-4-analysis",
        capabilities: ["data_analysis", "statistical_modeling"],
        tags: ["concurrent", "analytical"],
      }),
    ];
  }

  /**
   * Create an agent configuration optimized for performance testing
   */
  static createPerformanceTestConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "Performance Test Agent",
      description: "Agent optimized for performance testing scenarios",
      role: "generalist",
      personalityId: "550e8400-e29b-41d4-a716-446655440004",
      modelId: "mock-fast-model",
      capabilities: ["performance_testing", "quick_responses"],
      constraints: ["response_time_under_2s"],
      settings: {
        temperature: 0.5,
        maxTokens: 512,
        topP: 0.8,
      },
      tags: ["performance", "fast", "testing"],
    });
  }

  /**
   * Create multiple agent configurations for stress testing
   */
  static createStressTestConfigs(count: number): AgentCreateRequest[] {
    const configs: AgentCreateRequest[] = [];
    for (let i = 0; i < count; i++) {
      configs.push(
        this.createValidAgentConfig({
          name: `Stress Test Agent ${i + 1}`,
          description: `Stress test agent ${i + 1} for load testing`,
          role: "generalist",
          personalityId: `550e8400-e29b-41d4-a716-44665544000${i % 5}`,
          modelId: "mock-fast-model",
          capabilities: ["stress_testing"],
          constraints: ["performance_optimized"],
          settings: {
            temperature: 0.5,
            maxTokens: 256,
          },
          tags: ["stress", `batch-${Math.floor(i / 10)}`, "testing"],
        }),
      );
    }
    return configs;
  }

  /**
   * Create an agent with high personality-role compatibility
   */
  static createHighCompatibilityConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "High Compatibility Creative Agent",
      description: "Agent with optimal personality-role-model alignment",
      role: "creative-director",
      personalityId: "template-creative-001", // Creative personality
      modelId: "claude-3-sonnet", // Creative-specialized model
      capabilities: [
        "creative_ideation",
        "artistic_vision",
        "innovative_solutions",
      ],
      constraints: ["creative_domain_focus", "originality_required"],
      settings: {
        temperature: 0.9,
        maxTokens: 3000,
        topP: 0.95,
        frequencyPenalty: 0.1,
      },
      tags: ["high-compatibility", "optimal", "creative"],
    });
  }

  /**
   * Create an agent configuration for cross-service validation testing
   */
  static createCrossServiceValidationConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "Cross-Service Validation Agent",
      description: "Agent for testing cross-service integration and validation",
      role: "analyst",
      personalityId: "template-analytical-001",
      modelId: "gpt-4-analysis",
      capabilities: [
        "cross_service_validation",
        "integration_testing",
        "system_analysis",
      ],
      constraints: ["cross_service_compatibility", "validation_required"],
      settings: {
        temperature: 0.3,
        maxTokens: 4000,
        topP: 0.8,
      },
      tags: ["cross-service", "validation", "integration"],
    });
  }

  /**
   * Create an agent with capability conflicts for validation testing
   */
  static createConflictingCapabilitiesConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "Conflicting Capabilities Agent",
      description:
        "Agent with intentionally conflicting capabilities for testing",
      role: "coach",
      personalityId: "550e8400-e29b-41d4-a716-446655440001",
      modelId: "gpt-4-turbo-preview",
      capabilities: [
        "supportive_coaching", // Supportive approach
        "critical_analysis", // Conflicts with supportive nature
        "harsh_feedback", // Conflicts with coaching role
      ],
      constraints: [
        "positive_reinforcement_required", // Conflicts with harsh feedback capability
        "critical_evaluation_mandatory", // Conflicts with positive reinforcement
      ],
      tags: ["conflicting", "validation", "testing"],
    });
  }

  /**
   * Create an agent configuration for template-based testing
   */
  static createTemplateBasedConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "Template-Based Research Agent",
      description:
        "Agent created from template patterns for testing template workflows",
      role: "researcher",
      personalityId: "template-analytical-001",
      modelId: "claude-3-opus",
      capabilities: [
        "research_methodology",
        "data_collection",
        "analysis_synthesis",
      ],
      constraints: [
        "academic_standards",
        "citation_required",
        "peer_review_recommended",
      ],
      settings: {
        temperature: 0.4,
        maxTokens: 5000,
        topP: 0.85,
      },
      tags: ["template", "research", "academic"],
    });
  }

  /**
   * Create an agent configuration for error scenario testing
   */
  static createErrorScenarioConfig(): AgentCreateRequest {
    return this.createValidAgentConfig({
      name: "Error Scenario Test Agent",
      description:
        "Agent designed to trigger specific error conditions for testing",
      role: "analyst",
      personalityId: "550e8400-e29b-41d4-a716-446655440001",
      modelId: "mock-unavailable-model", // Unavailable model to trigger error
      capabilities: ["error_testing", "failure_simulation"],
      constraints: ["error_conditions_required"],
      settings: {
        temperature: 0.5,
        maxTokens: 1000,
      },
      tags: ["error", "testing", "simulation"],
    });
  }
}

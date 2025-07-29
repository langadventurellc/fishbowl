/**
 * @fileoverview Role Test Data Builder
 *
 * Builder pattern for creating role test data with fluent API and realistic scenarios.
 */

import type { CustomRoleCreateRequest } from "../../../types/role";

/**
 * Role Test Data Builder
 * Provides fluent API for building test role data
 */
export class RoleTestDataBuilder {
  /**
   * Create a basic custom role for testing
   */
  static createCustomRole(
    overrides: Partial<CustomRoleCreateRequest> = {},
  ): CustomRoleCreateRequest {
    const defaultRole: CustomRoleCreateRequest = {
      name: "Custom Technical Advisor",
      description:
        "A custom role for providing technical guidance and expertise",
      capabilities: [
        "technical_analysis",
        "code_review",
        "architecture_design",
      ],
      constraints: ["no_financial_advice", "technical_domain_only"],
      isTemplate: false,
      metadata: {
        domain: "software_engineering",
        complexity: "intermediate",
      },
    };
    return { ...defaultRole, ...overrides };
  }

  /**
   * Create an invalid role for validation testing
   */
  static createInvalidRole(): CustomRoleCreateRequest {
    return {
      name: "", // Invalid: empty name
      description: "Test role with validation errors",
      capabilities: [], // Invalid: no capabilities
      constraints: [],
      isTemplate: false,
    };
  }

  /**
   * Create a complex role with many capabilities
   */
  static createComplexRole(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Advanced Multi-Domain Specialist",
      description:
        "A comprehensive role spanning multiple domains and expertise areas",
      capabilities: [
        "technical_analysis",
        "business_strategy",
        "creative_problem_solving",
        "research_methodology",
        "data_analysis",
        "communication_facilitation",
      ],
      constraints: [
        "ethical_guidelines",
        "domain_expertise_required",
        "collaboration_focused",
      ],
      metadata: {
        domain: "multi_domain",
        complexity: "advanced",
        tags: ["specialist", "cross_functional", "leadership"],
      },
    });
  }

  /**
   * Create a minimal valid role
   */
  static createMinimalRole(): CustomRoleCreateRequest {
    return {
      name: "Basic Assistant",
      description: "Simple role with minimal configuration",
      capabilities: ["general_assistance"],
      constraints: [],
      isTemplate: false,
    };
  }

  /**
   * Create a template role
   */
  static createTemplateRole(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Research Specialist Template",
      description: "Template for creating research-focused roles",
      capabilities: ["research_methodology", "data_collection", "analysis"],
      constraints: ["academic_standards", "citation_required"],
      isTemplate: true,
      metadata: {
        domain: "research",
        complexity: "intermediate",
        tags: ["template", "research", "academic"],
      },
    });
  }

  /**
   * Create a role derived from template
   */
  static createTemplateBasedRole(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Market Research Analyst",
      description:
        "Specialized market research role based on research template",
      capabilities: [
        "market_analysis",
        "consumer_research",
        "trend_identification",
      ],
      constraints: ["market_data_required", "confidentiality_maintained"],
      isTemplate: false,
      templateId: "550e8400-e29b-41d4-a716-446655440000", // Mock template ID
      metadata: {
        domain: "market_research",
        complexity: "intermediate",
        tags: ["market", "research", "analysis"],
        templateSource: "research_specialist_template",
      },
    });
  }

  /**
   * Create template with comprehensive template metadata
   */
  static createTemplateWithMetadata(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Advanced Analytics Template",
      description: "Comprehensive template for data analytics roles",
      capabilities: [
        "data_analysis",
        "statistical_modeling",
        "report_generation",
        "visualization_creation",
      ],
      constraints: [
        "data_privacy_compliance",
        "statistical_accuracy_required",
        "peer_review_mandatory",
      ],
      isTemplate: true,
      metadata: {
        domain: "data_science",
        complexity: "advanced",
        tags: ["template", "analytics", "data_science"],
        templateSource: "predefined_analytics_template",
      },
    });
  }

  /**
   * Create role from template with custom modifications
   */
  static createRoleFromTemplateWithModifications(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Marketing Analytics Specialist",
      description:
        "Marketing-focused analytics role based on analytics template",
      capabilities: [
        "market_data_analysis", // Modified from template
        "campaign_performance_tracking", // Added custom capability
        "customer_segmentation", // Added custom capability
        "report_generation", // Inherited from template
      ],
      constraints: [
        "data_privacy_compliance", // Inherited from template
        "marketing_data_only", // Added custom constraint
        "campaign_confidentiality", // Added custom constraint
      ],
      isTemplate: false,
      templateId: "550e8400-e29b-41d4-a716-446655440000",
      metadata: {
        domain: "marketing_analytics",
        complexity: "intermediate",
        tags: ["marketing", "analytics", "custom"],
        templateSource: "advanced_analytics_template",
      },
    });
  }

  /**
   * Create template-based role for version compatibility testing
   */
  static createTemplateRoleWithVersionConstraints(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Version-Constrained Role",
      description:
        "Role created from template with specific version constraints",
      capabilities: ["versioned_capability_1", "versioned_capability_2"],
      constraints: ["version_compatibility_required"],
      templateId: "version-template-001",
      metadata: {
        domain: "version_testing",
        complexity: "basic",
        tags: ["versioned", "template", "compatibility"],
        templateSource: "versioned_template_v2",
        templateVersion: "2.1.0",
      },
    });
  }

  /**
   * Create a role with security constraints
   */
  static createSecurityConstrainedRole(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Security Analyst",
      description: "Role with elevated security requirements and constraints",
      capabilities: [
        "security_assessment",
        "vulnerability_analysis",
        "compliance_checking",
      ],
      constraints: [
        "security_clearance_required",
        "audit_trail_mandatory",
        "restricted_data_access",
      ],
      metadata: {
        domain: "cybersecurity",
        complexity: "advanced",
        tags: ["security", "compliance", "restricted"],
      },
    });
  }

  /**
   * Create a role for performance testing
   */
  static createPerformanceTestRole(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Performance Test Role",
      description: "Role designed for performance and load testing scenarios",
      capabilities: [
        "performance_optimization",
        "load_testing",
        "metrics_analysis",
      ],
      constraints: ["performance_metrics_required"],
      metadata: {
        domain: "performance_engineering",
        complexity: "basic",
      },
    });
  }

  /**
   * Create multiple roles for batch testing
   */
  static createMultipleRoles(count: number): CustomRoleCreateRequest[] {
    const roles: CustomRoleCreateRequest[] = [];
    for (let i = 0; i < count; i++) {
      roles.push(
        this.createCustomRole({
          name: `Test Role ${i + 1}`,
          description: `Test role number ${i + 1} for batch operations`,
          capabilities: [`capability_${i + 1}`, "general_assistance"],
          constraints: [`constraint_${i + 1}`],
          metadata: {
            domain: "testing",
            complexity: "basic",
            tags: [`batch_${i + 1}`, "testing"],
          },
        }),
      );
    }
    return roles;
  }

  /**
   * Create role with capability conflicts for validation testing
   */
  static createConflictingCapabilitiesRole(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Conflicting Capabilities Role",
      description:
        "Role with intentionally conflicting capabilities for testing",
      capabilities: [
        "financial_advice", // Conflicts with constraint
        "legal_consultation", // Potentially restricted
        "medical_diagnosis", // Likely prohibited
      ],
      constraints: [
        "no_financial_advice", // Conflicts with capability
        "no_legal_advice",
        "no_medical_advice",
      ],
      metadata: {
        domain: "conflict_testing",
        complexity: "basic",
      },
    });
  }

  /**
   * Create role for concurrent access testing
   */
  static createConcurrentTestRole(): CustomRoleCreateRequest {
    return this.createCustomRole({
      name: "Concurrent Access Test Role",
      description: "Role for testing concurrent modification scenarios",
      capabilities: ["concurrent_testing", "race_condition_simulation"],
      constraints: ["thread_safety_required"],
      metadata: {
        domain: "concurrency_testing",
        complexity: "advanced",
        tags: ["concurrent", "thread_safety", "testing"],
      },
    });
  }
}

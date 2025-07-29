/**
 * @fileoverview Custom Role Test Data Builder
 *
 * Fluent builder for creating custom role test data with comprehensive configuration options.
 * Supports building both valid and invalid custom roles for testing scenarios.
 */

import type { CustomRole } from "../../../types/role";

/**
 * Interface for building invalid custom roles for validation testing
 */
export interface InvalidCustomRole {
  [key: string]: unknown;
}

/**
 * Custom Role Test Data Builder
 * Provides fluent API for building custom role test data with comprehensive options
 */
export class CustomRoleTestDataBuilder {
  private role: Partial<CustomRole & { [key: string]: unknown }>;
  private isInvalid = false;

  private constructor() {
    this.role = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Custom Role",
      description: "Test custom role for integration testing",
      capabilities: ["test-capability"],
      constraints: ["test-constraint"],
      isTemplate: false,
      createdAt: new Date("2025-01-15T10:30:00.000Z"),
      updatedAt: new Date("2025-01-15T10:30:00.000Z"),
      version: 1,
      metadata: {
        domain: "testing",
        complexity: "basic" as const,
        tags: ["test"],
      },
    };
  }

  /**
   * Create a new builder instance
   */
  static create(): CustomRoleTestDataBuilder {
    return new CustomRoleTestDataBuilder();
  }

  /**
   * Set the role ID
   */
  withId(id: string): CustomRoleTestDataBuilder {
    this.role.id = id;
    return this;
  }

  /**
   * Set the role name
   */
  withName(name: string): CustomRoleTestDataBuilder {
    this.role.name = name;
    return this;
  }

  /**
   * Set the role description
   */
  withDescription(description: string): CustomRoleTestDataBuilder {
    this.role.description = description;
    return this;
  }

  /**
   * Set the role capabilities
   */
  withCapabilities(capabilities: string[]): CustomRoleTestDataBuilder {
    this.role.capabilities = capabilities;
    return this;
  }

  /**
   * Set the role constraints
   */
  withConstraints(constraints: string[]): CustomRoleTestDataBuilder {
    this.role.constraints = constraints;
    return this;
  }

  /**
   * Set template reference information
   */
  withTemplateReference(
    templateId: string,
    version: string,
  ): CustomRoleTestDataBuilder {
    this.role.templateId = templateId;
    if (this.role.metadata) {
      this.role.metadata = {
        ...this.role.metadata,
        templateSource: `template-${templateId}`,
        templateVersion: version,
      };
    }
    return this;
  }

  /**
   * Set the role category/domain
   */
  withCategory(category: string): CustomRoleTestDataBuilder {
    if (!this.role.metadata) {
      this.role.metadata = {};
    }
    this.role.metadata.domain = category;
    return this;
  }

  /**
   * Set custom metadata
   */
  withCustomMetadata(
    metadata: Partial<NonNullable<CustomRole["metadata"]>>,
  ): CustomRoleTestDataBuilder {
    this.role.metadata = {
      ...this.role.metadata,
      ...metadata,
    };
    return this;
  }

  /**
   * Set role as template
   */
  asTemplate(isTemplate = true): CustomRoleTestDataBuilder {
    this.role.isTemplate = isTemplate;
    return this;
  }

  /**
   * Set role version
   */
  withVersion(version: number): CustomRoleTestDataBuilder {
    this.role.version = version;
    return this;
  }

  /**
   * Set creation timestamp
   */
  withCreatedAt(createdAt: Date): CustomRoleTestDataBuilder {
    this.role.createdAt = createdAt;
    return this;
  }

  /**
   * Set update timestamp
   */
  withUpdatedAt(updatedAt: Date): CustomRoleTestDataBuilder {
    this.role.updatedAt = updatedAt;
    return this;
  }

  /**
   * Add an invalid field for validation testing
   */
  withInvalidField(field: string, value: unknown): CustomRoleTestDataBuilder {
    this.role[field] = value;
    this.isInvalid = true;
    return this;
  }

  /**
   * Build a valid custom role
   */
  build(): CustomRole {
    if (this.isInvalid) {
      throw new Error(
        "Cannot build valid CustomRole when invalid fields have been set. Use buildInvalid() instead.",
      );
    }
    return this.role as CustomRole;
  }

  /**
   * Build an invalid custom role for validation testing
   */
  buildInvalid(): InvalidCustomRole {
    return this.role as InvalidCustomRole;
  }

  // Preset builders for common test scenarios

  /**
   * Create a financial analyst custom role
   */
  static createFinancialAnalyst(): CustomRoleTestDataBuilder {
    return this.create()
      .withId("f47ac10b-58cc-4372-a567-0e02b2c3d479")
      .withName("Financial Data Analyst")
      .withDescription(
        "Specialized analyst for comprehensive financial data analysis, modeling, and reporting",
      )
      .withCapabilities([
        "financial-modeling",
        "data-visualization",
        "risk-assessment",
        "investment-analysis",
        "regulatory-compliance",
      ])
      .withConstraints([
        "audit-logging-required",
        "no-external-api-access",
        "senior-approval-required",
      ])
      .withCustomMetadata({
        domain: "finance",
        complexity: "advanced",
        tags: ["finance", "analysis", "custom"],
      });
  }

  /**
   * Create a template-based marketing role
   */
  static createMarketingStrategist(): CustomRoleTestDataBuilder {
    return this.create()
      .withId("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
      .withName("Creative Marketing Strategist")
      .withDescription(
        "Template-based custom role combining creative thinking with strategic marketing expertise",
      )
      .withCapabilities([
        "creative-ideation",
        "brand-strategy",
        "campaign-development",
        "market-positioning",
      ])
      .withConstraints([
        "brand-guidelines-required",
        "legal-review-required",
        "budget-approval-needed",
      ])
      .withTemplateReference("6ba7b811-9dad-11d1-80b4-00c04fd430c8", "1.0")
      .withCustomMetadata({
        domain: "marketing",
        complexity: "intermediate",
        tags: ["creative", "marketing", "strategy", "template-based"],
      });
  }

  /**
   * Create a minimal custom role
   */
  static createMinimal(): CustomRoleTestDataBuilder {
    return this.create()
      .withId("minimal-role-001")
      .withName("Basic Assistant")
      .withDescription("Minimal custom role with basic functionality")
      .withCapabilities(["general-assistance"])
      .withConstraints([])
      .withCustomMetadata({
        complexity: "basic",
        tags: ["minimal", "basic"],
      });
  }

  /**
   * Create a complex custom role with many capabilities
   */
  static createComplex(): CustomRoleTestDataBuilder {
    return this.create()
      .withId("complex-role-001")
      .withName("Advanced Multi-Domain Specialist")
      .withDescription(
        "Complex custom role with extensive capabilities across multiple domains",
      )
      .withCapabilities([
        "technical-analysis",
        "business-strategy",
        "creative-problem-solving",
        "research-methodology",
        "data-analysis",
        "communication-facilitation",
        "project-management",
        "risk-assessment",
        "compliance-monitoring",
        "quality-assurance",
        "innovation-development",
        "stakeholder-management",
      ])
      .withConstraints([
        "ethical-guidelines",
        "domain-expertise-required",
        "collaboration-focused",
        "security-clearance-required",
        "audit-trail-mandatory",
        "peer-review-required",
      ])
      .withCustomMetadata({
        domain: "multi-domain",
        complexity: "advanced",
        tags: [
          "specialist",
          "cross-functional",
          "leadership",
          "advanced",
          "comprehensive",
        ],
      });
  }

  /**
   * Create an invalid role with missing required fields
   */
  static createInvalidMissingRequired(): CustomRoleTestDataBuilder {
    return this.create()
      .withInvalidField("name", "")
      .withInvalidField("capabilities", [])
      .withInvalidField("description", "");
  }

  /**
   * Create an invalid role with wrong data types
   */
  static createInvalidDataTypes(): CustomRoleTestDataBuilder {
    return this.create()
      .withInvalidField("capabilities", "not-an-array")
      .withInvalidField("constraints", "not-an-array")
      .withInvalidField("version", "not-a-number");
  }

  /**
   * Create an invalid role with business rule violations
   */
  static createBusinessRuleViolations(): CustomRoleTestDataBuilder {
    return this.create()
      .withName("Invalid Business Rule Role")
      .withDescription("Role that violates business rules")
      .withCapabilities([])
      .withConstraints(["conflicting-constraint-1", "conflicting-constraint-2"])
      .withInvalidField("capabilities", []);
  }

  /**
   * Create role for concurrent testing
   */
  static createConcurrentTestRole(
    identifier: string,
  ): CustomRoleTestDataBuilder {
    return this.create()
      .withId(`concurrent-test-${identifier}`)
      .withName(`Concurrent Test Role ${identifier}`)
      .withDescription(`Role for testing concurrent operations - ${identifier}`)
      .withCapabilities(["concurrent-testing", "race-condition-simulation"])
      .withConstraints(["thread-safety-required"])
      .withCustomMetadata({
        domain: "concurrency-testing",
        complexity: "advanced",
        tags: ["concurrent", "testing", identifier],
      });
  }

  /**
   * Create multiple roles for batch testing
   */
  static createBatch(count: number): CustomRole[] {
    const roles: CustomRole[] = [];
    for (let i = 0; i < count; i++) {
      const role = this.create()
        .withId(`batch-role-${i.toString().padStart(3, "0")}`)
        .withName(`Batch Role ${i + 1}`)
        .withDescription(`Batch testing role number ${i + 1}`)
        .withCapabilities([`capability-${i + 1}`, "general-assistance"])
        .withConstraints([`constraint-${i + 1}`])
        .withCustomMetadata({
          domain: "batch-testing",
          complexity: "basic",
          tags: [`batch-${i + 1}`, "testing"],
        })
        .build();
      roles.push(role);
    }
    return roles;
  }
}

/**
 * Helper functions for common test scenarios
 */
export const CustomRoleBuilders = {
  /**
   * Create a valid custom role with default values
   */
  valid: () => CustomRoleTestDataBuilder.create(),

  /**
   * Create a financial analyst role
   */
  financialAnalyst: () => CustomRoleTestDataBuilder.createFinancialAnalyst(),

  /**
   * Create a marketing strategist role
   */
  marketingStrategist: () =>
    CustomRoleTestDataBuilder.createMarketingStrategist(),

  /**
   * Create a minimal role
   */
  minimal: () => CustomRoleTestDataBuilder.createMinimal(),

  /**
   * Create a complex role
   */
  complex: () => CustomRoleTestDataBuilder.createComplex(),

  /**
   * Create invalid roles for validation testing
   */
  invalid: {
    missingRequired: () =>
      CustomRoleTestDataBuilder.createInvalidMissingRequired(),
    wrongDataTypes: () => CustomRoleTestDataBuilder.createInvalidDataTypes(),
    businessRuleViolations: () =>
      CustomRoleTestDataBuilder.createBusinessRuleViolations(),
  },

  /**
   * Create roles for specific testing scenarios
   */
  testing: {
    concurrent: (id: string) =>
      CustomRoleTestDataBuilder.createConcurrentTestRole(id),
    batch: (count: number) => CustomRoleTestDataBuilder.createBatch(count),
  },
};

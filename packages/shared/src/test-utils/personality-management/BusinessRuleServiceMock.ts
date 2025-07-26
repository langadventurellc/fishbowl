import { BusinessRuleServiceMockConfig } from "src/test-utils/personality-management/BusinessRuleServiceMockConfig";
import { BusinessRuleValidationResult } from "src/test-utils/personality-management/BusinessRuleValidationResult";
import type {
  PersonalityConfiguration,
  PersonalityCreationData,
} from "src/types/personality";

/**
 * Mock implementation of BusinessRuleService for testing
 */

export class BusinessRuleServiceMock {
  private config: BusinessRuleServiceMockConfig;

  constructor(config: BusinessRuleServiceMockConfig = {}) {
    this.config = {
      shouldFail: false,
      ruleViolations: [],
      warningThresholds: {
        neuroticism: 75,
        perfectionism_anxiety: 85,
      },
      errorThresholds: {
        customer_service_extraversion: 40,
        customer_service_agreeableness: 60,
        technical_conscientiousness: 60,
      },
      ...config,
    };
  }

  /**
   * Validate personality against business rules
   */
  async validateBusinessRules(
    personality: PersonalityConfiguration | PersonalityCreationData,
    context?: {
      role?: string;
      teamContext?: string;
      culturalContext?: string;
    },
  ): Promise<BusinessRuleValidationResult> {
    if (this.config.shouldFail) {
      throw new Error("BusinessRuleService validation failed");
    }

    const violations = [];
    let score = 100;

    // Check role-specific requirements
    if (context?.role === "customer_service") {
      if (
        personality.extraversion <
        (this.config.errorThresholds?.customer_service_extraversion || 40)
      ) {
        violations.push({
          rule: "customer_service_extraversion_minimum",
          severity: "error" as const,
          message: `Customer service roles require minimum extraversion of ${this.config.errorThresholds?.customer_service_extraversion || 40}`,
          affectedTraits: ["extraversion"],
        });
        score -= 25;
      }

      if (
        personality.agreeableness <
        (this.config.errorThresholds?.customer_service_agreeableness || 60)
      ) {
        violations.push({
          rule: "customer_service_agreeableness_minimum",
          severity: "error" as const,
          message: `Customer service roles require minimum agreeableness of ${this.config.errorThresholds?.customer_service_agreeableness || 60}`,
          affectedTraits: ["agreeableness"],
        });
        score -= 25;
      }
    }

    // Check psychological warning patterns
    if (
      personality.neuroticism >
      (this.config.warningThresholds?.neuroticism || 75)
    ) {
      violations.push({
        rule: "high_neuroticism_warning",
        severity: "warning" as const,
        message: "High neuroticism may impact performance under stress",
        affectedTraits: ["neuroticism"],
      });
      score -= 10;
    }

    // Check perfectionism-anxiety pattern
    if (personality.conscientiousness > 85 && personality.neuroticism > 80) {
      violations.push({
        rule: "perfectionism_anxiety_pattern",
        severity: "warning" as const,
        message:
          "High conscientiousness with high neuroticism may indicate perfectionist anxiety",
        affectedTraits: ["conscientiousness", "neuroticism"],
      });
      score -= 15;
    }

    // Add configured violations
    this.config.ruleViolations?.forEach((rule) => {
      violations.push({
        rule,
        severity: "error" as const,
        message: `Configured rule violation: ${rule}`,
        affectedTraits: ["unknown"],
      });
      score -= 20;
    });

    return {
      isValid: violations.filter((v) => v.severity === "error").length === 0,
      violations,
      score: Math.max(0, score),
    };
  }

  /**
   * Update mock configuration
   */
  updateConfig(newConfig: Partial<BusinessRuleServiceMockConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset mock to default configuration
   */
  reset(): void {
    this.config = {
      shouldFail: false,
      ruleViolations: [],
      warningThresholds: {
        neuroticism: 75,
        perfectionism_anxiety: 85,
      },
      errorThresholds: {
        customer_service_extraversion: 40,
        customer_service_agreeableness: 60,
        technical_conscientiousness: 60,
      },
    };
  }
}

import { TraitInteractionError } from "src/test-utils/personality-management/TraitInteractionError";
import { TraitInteractionTestConfig } from "src/test-utils/personality-management/TraitInteractionTestConfig";
import { TraitInteractionValidationResult } from "src/test-utils/personality-management/TraitInteractionValidationResult";
import { TraitInteractionWarning } from "src/test-utils/personality-management/TraitInteractionWarning";
import type {
  PersonalityConfiguration,
  PersonalityCreationData,
} from "src/types/personality";

/**
 * Helper class for testing trait interaction business logic
 */

export class TraitInteractionTester {
  /**
   * Validate personality trait interactions using psychological research patterns
   */
  static validateTraitInteractions(
    personality: PersonalityConfiguration | PersonalityCreationData,
    config: TraitInteractionTestConfig = {
      enableCorrelationValidation: true,
      enableStatisticalImprobabilityDetection: true,
      enableBusinessRuleValidation: true,
      enableCulturalSensitivityChecks: false,
      enableDevelopmentalValidation: false,
    },
  ): TraitInteractionValidationResult {
    const warnings: TraitInteractionWarning[] = [];
    const errors: TraitInteractionError[] = [];
    const traits = this.extractBigFiveTraits(personality);

    // Validate trait correlations based on psychological research
    if (config.enableCorrelationValidation) {
      const correlationIssues = this.validateTraitCorrelations(traits);
      warnings.push(...correlationIssues.warnings);
      errors.push(...correlationIssues.errors);
    }

    // Check for statistically improbable combinations
    if (config.enableStatisticalImprobabilityDetection) {
      const probabilityWarnings = this.checkStatisticalImprobability(traits);
      warnings.push(...probabilityWarnings);
    }

    // Validate business rule compliance
    if (config.enableBusinessRuleValidation && config.businessContext) {
      const businessRuleIssues = this.validateBusinessRules(
        traits,
        config.businessContext,
      );
      errors.push(...businessRuleIssues);
    }

    // Check cultural sensitivity if context provided
    if (config.enableCulturalSensitivityChecks && config.culturalContext) {
      const culturalWarnings = this.checkCulturalSensitivity(
        traits,
        config.culturalContext,
      );
      warnings.push(...culturalWarnings);
    }

    // Validate developmental appropriateness if age context provided
    if (config.enableDevelopmentalValidation && config.ageContext) {
      const developmentalWarnings = this.checkDevelopmentalAppropriatenss(
        traits,
        config.ageContext,
      );
      warnings.push(...developmentalWarnings);
    }

    const psychologicalCoherenceScore =
      this.calculatePsychologicalCoherence(traits);
    const statisticalProbability = this.calculateStatisticalProbability(traits);
    const validationScore = this.calculateOverallValidationScore(
      psychologicalCoherenceScore,
      warnings,
      errors,
    );

    return {
      isValid: errors.length === 0,
      validationScore,
      warnings,
      errors,
      psychologicalCoherenceScore,
      statisticalProbability,
      recommendations: this.generateRecommendations(warnings, errors),
    };
  }

  /**
   * Extract Big Five traits from personality data
   */
  private static extractBigFiveTraits(
    personality: PersonalityConfiguration | PersonalityCreationData,
  ) {
    return {
      openness: personality.openness,
      conscientiousness: personality.conscientiousness,
      extraversion: personality.extraversion,
      agreeableness: personality.agreeableness,
      neuroticism: personality.neuroticism,
    };
  }

  /**
   * Validate trait correlations based on established psychological research
   */
  private static validateTraitCorrelations(traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }): { warnings: TraitInteractionWarning[]; errors: TraitInteractionError[] } {
    const warnings: TraitInteractionWarning[] = [];
    const errors: TraitInteractionError[] = [];

    // Conscientiousness-Neuroticism correlation (r ≈ -0.5)
    if (traits.conscientiousness > 80 && traits.neuroticism > 85) {
      warnings.push({
        type: "psychological_inconsistency",
        severity: "medium",
        message:
          "High conscientiousness with very high neuroticism is psychologically unusual",
        affectedTraits: ["conscientiousness", "neuroticism"],
        suggestedAction: "Review for perfectionist anxiety pattern",
        researchBasis:
          "Meta-analysis shows negative correlation r ≈ -0.5 (Roberts et al., 2007)",
      });
    }

    // Extraversion-Agreeableness correlation (r ≈ 0.3)
    if (traits.extraversion > 85 && traits.agreeableness < 20) {
      warnings.push({
        type: "psychological_inconsistency",
        severity: "medium",
        message:
          "Very high extraversion with very low agreeableness suggests antisocial pattern",
        affectedTraits: ["extraversion", "agreeableness"],
        suggestedAction: "Consider social behavior implications",
        researchBasis:
          "Positive correlation in social behaviors (DeYoung, 2006)",
      });
    }

    return { warnings, errors };
  }

  /**
   * Check for statistically improbable trait combinations
   */
  private static checkStatisticalImprobability(traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }): TraitInteractionWarning[] {
    const warnings: TraitInteractionWarning[] = [];
    const traitValues = Object.values(traits);

    // All traits extremely high (>90th percentile)
    if (traitValues.every((t) => t > 90)) {
      warnings.push({
        type: "statistical_improbability",
        severity: "low",
        message:
          "All traits above 90th percentile - probability <0.001% in population",
        affectedTraits: [
          "openness",
          "conscientiousness",
          "extraversion",
          "agreeableness",
          "neuroticism",
        ],
        suggestedAction: "Flag for statistical review",
      });
    }

    // All traits extremely low (<10th percentile)
    if (traitValues.every((t) => t < 10)) {
      warnings.push({
        type: "statistical_improbability",
        severity: "medium",
        message: "All traits below 10th percentile - suggests data entry error",
        affectedTraits: [
          "openness",
          "conscientiousness",
          "extraversion",
          "agreeableness",
          "neuroticism",
        ],
        suggestedAction: "Review data entry and measurement validity",
      });
    }

    return warnings;
  }

  /**
   * Validate business rule compliance for specific agent roles
   */
  private static validateBusinessRules(
    traits: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    },
    businessContext: string,
  ): TraitInteractionError[] {
    const errors: TraitInteractionError[] = [];

    switch (businessContext) {
      case "customer_service":
        if (traits.extraversion < 40) {
          errors.push({
            type: "business_rule_violation",
            severity: "high",
            message:
              "Customer service agents require minimum extraversion of 40",
            affectedTraits: ["extraversion"],
            requiredAction: "Increase extraversion or select different role",
            blockingReason:
              "Insufficient social energy for customer interaction",
          });
        }
        if (traits.agreeableness < 60) {
          errors.push({
            type: "business_rule_violation",
            severity: "high",
            message:
              "Customer service agents require minimum agreeableness of 60",
            affectedTraits: ["agreeableness"],
            requiredAction: "Increase agreeableness or select different role",
            blockingReason:
              "Insufficient empathy and cooperation for customer service",
          });
        }
        break;

      case "technical_advisor":
        if (traits.conscientiousness < 60) {
          errors.push({
            type: "business_rule_violation",
            severity: "high",
            message:
              "Technical advisors require minimum conscientiousness of 60",
            affectedTraits: ["conscientiousness"],
            requiredAction:
              "Increase conscientiousness or select different role",
            blockingReason:
              "Insufficient attention to detail for technical work",
          });
        }
        break;

      case "project_manager":
        if (traits.conscientiousness < 70) {
          errors.push({
            type: "business_rule_violation",
            severity: "high",
            message: "Project managers require minimum conscientiousness of 70",
            affectedTraits: ["conscientiousness"],
            requiredAction:
              "Increase conscientiousness or select different role",
            blockingReason:
              "Insufficient organization skills for project management",
          });
        }
        if (traits.neuroticism > 60) {
          errors.push({
            type: "business_rule_violation",
            severity: "high",
            message: "Project managers require maximum neuroticism of 60",
            affectedTraits: ["neuroticism"],
            requiredAction: "Reduce neuroticism or select different role",
            blockingReason:
              "Excessive anxiety incompatible with leadership responsibilities",
          });
        }
        break;
    }

    return errors;
  }

  /**
   * Check cultural sensitivity for personality traits
   */
  private static checkCulturalSensitivity(
    traits: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    },
    culturalContext: string,
  ): TraitInteractionWarning[] {
    const warnings: TraitInteractionWarning[] = [];

    if (culturalContext === "collectivist") {
      if (traits.agreeableness < 30) {
        warnings.push({
          type: "cultural_sensitivity",
          severity: "low",
          message:
            "Very low agreeableness may conflict with collectivist cultural values",
          affectedTraits: ["agreeableness"],
          suggestedAction:
            "Consider cultural appropriateness for team contexts",
        });
      }
      if (traits.extraversion > 85) {
        warnings.push({
          type: "cultural_sensitivity",
          severity: "low",
          message:
            "Very high extraversion may be culturally inappropriate in collectivist context",
          affectedTraits: ["extraversion"],
          suggestedAction: "Review for cultural sensitivity in group settings",
        });
      }
    }

    return warnings;
  }

  /**
   * Check developmental appropriateness for age context
   */
  private static checkDevelopmentalAppropriatenss(
    traits: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    },
    ageContext: string,
  ): TraitInteractionWarning[] {
    const warnings: TraitInteractionWarning[] = [];

    if (ageContext === "young_adult") {
      if (traits.conscientiousness > 90 && traits.neuroticism < 20) {
        warnings.push({
          type: "developmental_mismatch",
          severity: "low",
          message:
            "Very high conscientiousness and low neuroticism unusual for young adults",
          affectedTraits: ["conscientiousness", "neuroticism"],
          suggestedAction: "Note developmental atypicality",
        });
      }
    }

    return warnings;
  }

  /**
   * Calculate psychological coherence score
   */
  private static calculatePsychologicalCoherence(traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }): number {
    // Simplified coherence calculation based on trait balance and research patterns
    const traitValues = Object.values(traits);
    const mean = traitValues.reduce((a, b) => a + b, 0) / traitValues.length;
    const variance =
      traitValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      traitValues.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation indicates more balanced personality
    const balanceScore = Math.max(0, 100 - standardDeviation);

    // Bonus for research-backed positive patterns
    let coherenceBonus = 0;
    if (traits.conscientiousness > 70 && traits.neuroticism < 40)
      coherenceBonus += 10;
    if (traits.extraversion > 60 && traits.agreeableness > 60)
      coherenceBonus += 5;

    return Math.min(100, balanceScore + coherenceBonus);
  }

  /**
   * Calculate statistical probability of trait combination
   */
  private static calculateStatisticalProbability(traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }): number {
    // Simplified probability calculation
    const traitValues = Object.values(traits);
    const extremeCount = traitValues.filter((t) => t > 90 || t < 10).length;

    if (extremeCount >= 4) return 0.001;
    if (extremeCount === 3) return 0.01;
    if (extremeCount === 2) return 0.05;
    if (extremeCount === 1) return 0.15;
    return 0.95;
  }

  /**
   * Calculate overall validation score
   */
  private static calculateOverallValidationScore(
    coherenceScore: number,
    warnings: TraitInteractionWarning[],
    errors: TraitInteractionError[],
  ): number {
    let score = coherenceScore;

    // Deduct points for warnings
    score -= warnings.filter((w) => w.severity === "high").length * 15;
    score -= warnings.filter((w) => w.severity === "medium").length * 10;
    score -= warnings.filter((w) => w.severity === "low").length * 5;

    // Deduct points for errors
    score -= errors.length * 25;

    return Math.max(0, score);
  }

  /**
   * Generate recommendations based on validation results
   */
  private static generateRecommendations(
    warnings: TraitInteractionWarning[],
    errors: TraitInteractionError[],
  ): string[] {
    const recommendations: string[] = [];

    for (const error of errors) {
      recommendations.push(error.requiredAction);
    }

    for (const warning of warnings) {
      recommendations.push(warning.suggestedAction);
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

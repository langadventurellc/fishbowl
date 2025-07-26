/**
 * Configuration for trait interaction testing
 */

export interface TraitInteractionTestConfig {
  enableCorrelationValidation: boolean;
  enableStatisticalImprobabilityDetection: boolean;
  enableBusinessRuleValidation: boolean;
  enableCulturalSensitivityChecks: boolean;
  enableDevelopmentalValidation: boolean;
  ageContext?: "young_adult" | "middle_aged" | "older_adult";
  culturalContext?: "collectivist" | "individualist" | "mixed";
  businessContext?:
    | "customer_service"
    | "technical_advisor"
    | "creative_collaborator"
    | "project_manager";
}

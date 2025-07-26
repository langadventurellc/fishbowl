/**
 * @fileoverview Barrel export for personality management test utilities
 */

// Re-export all interfaces and types
export * from "./TraitInteractionTestConfig";
export * from "./TraitInteractionValidationResult";
export * from "./TraitInteractionWarning";
export * from "./TraitInteractionError";
export * from "./PersonalityScoringResult";
export * from "./TeamCompatibilityResult";
export * from "./BusinessRuleValidationResult";
export * from "./BusinessRuleServiceMockConfig";
export * from "./ScoringServiceMockConfig";
export * from "./ValidationServiceMockConfig";

// Re-export all classes
export * from "./TraitInteractionTester";
export * from "./PersonalityScoringTester";
export * from "./TeamDynamicsTester";
export * from "./BusinessRuleServiceMock";
export * from "./ScoringServiceMock";
export * from "./ValidationServiceMock";
export * from "./ServiceMockFactory";

// Re-export base setup
export * from "./base-setup";

/**
 * @fileoverview Factory functions for test data builders
 *
 * Provides convenient access to all test data builders for personality management.
 * This serves as the main entry point for test data creation.
 */

import { PersonalityDataBuilder } from "./PersonalityDataBuilder";
import { TraitCombinationBuilder } from "./TraitCombinationBuilder";
import { PersonalityTemplateBuilder } from "./PersonalityTemplateBuilder";
import { ValidationErrorBuilder } from "./ValidationErrorBuilder";

/**
 * Factory functions for common test data patterns
 */
export const TestDataBuilders = {
  /**
   * Create a new personality data builder
   */
  personality: () => new PersonalityDataBuilder(),

  /**
   * Create a trait combination builder
   */
  traitCombination: () => new TraitCombinationBuilder(),

  /**
   * Create a personality template builder
   */
  template: () => new PersonalityTemplateBuilder(),

  /**
   * Create a validation error builder
   */
  validationErrors: () => new ValidationErrorBuilder(),

  /**
   * Quick method to create minimal valid personality
   */
  minimalValid: () =>
    new PersonalityDataBuilder()
      .withName("Minimal Test")
      .withValidBigFiveTraits()
      .withValidBehavioralTraits()
      .build(),

  /**
   * Quick method to create complete valid personality
   */
  completeValid: () =>
    new PersonalityDataBuilder()
      .withName("Complete Test Personality")
      .withDescription("A fully configured test personality")
      .withCustomInstructions("Test-specific behavior instructions")
      .withValidBigFiveTraits()
      .withValidBehavioralTraits()
      .buildComplete(),
};

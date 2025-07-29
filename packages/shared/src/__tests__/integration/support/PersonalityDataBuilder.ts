/**
 * @fileoverview Fluent builder for personality data with sensible defaults
 */

import type {
  PersonalityConfiguration,
  PersonalityCreationData,
  BehavioralTraitName,
  BigFiveTraitName,
} from "../../../types/personality";

/**
 * Fluent builder for personality data with sensible defaults
 */
export class PersonalityDataBuilder {
  private personality: Partial<PersonalityCreationData> = {};

  constructor() {
    // Initialize with baseline valid values
    this.personality = {
      name: "Test Personality",
      description: "A test personality configuration",
      isTemplate: false,
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
      formality: 50,
      humor: 50,
      assertiveness: 50,
      empathy: 50,
      storytelling: 50,
      brevity: 50,
      imagination: 50,
      playfulness: 50,
      dramaticism: 50,
      analyticalDepth: 50,
      contrarianism: 50,
      encouragement: 50,
      curiosity: 50,
      patience: 50,
    };
  }

  /**
   * Set the personality name
   */
  withName(name: string): PersonalityDataBuilder {
    this.personality.name = name;
    return this;
  }

  /**
   * Set the personality description
   */
  withDescription(description: string): PersonalityDataBuilder {
    this.personality.description = description;
    return this;
  }

  /**
   * Set custom instructions
   */
  withCustomInstructions(instructions: string): PersonalityDataBuilder {
    this.personality.customInstructions = instructions;
    return this;
  }

  /**
   * Mark as template personality
   */
  asTemplate(): PersonalityDataBuilder {
    this.personality.isTemplate = true;
    return this;
  }

  /**
   * Set Big Five trait: Openness (0-100)
   */
  withOpenness(value: number): PersonalityDataBuilder {
    this.personality.openness = value;
    return this;
  }

  /**
   * Set Big Five trait: Conscientiousness (0-100)
   */
  withConscientiousness(value: number): PersonalityDataBuilder {
    this.personality.conscientiousness = value;
    return this;
  }

  /**
   * Set Big Five trait: Extraversion (0-100)
   */
  withExtraversion(value: number): PersonalityDataBuilder {
    this.personality.extraversion = value;
    return this;
  }

  /**
   * Set Big Five trait: Agreeableness (0-100)
   */
  withAgreeableness(value: number): PersonalityDataBuilder {
    this.personality.agreeableness = value;
    return this;
  }

  /**
   * Set Big Five trait: Neuroticism (0-100)
   */
  withNeuroticism(value: number): PersonalityDataBuilder {
    this.personality.neuroticism = value;
    return this;
  }

  /**
   * Set all Big Five traits to valid values
   */
  withValidBigFiveTraits(): PersonalityDataBuilder {
    return this.withOpenness(75)
      .withConscientiousness(80)
      .withExtraversion(60)
      .withAgreeableness(85)
      .withNeuroticism(40);
  }

  /**
   * Set behavioral trait value
   */
  withBehavioralTrait(
    trait: BehavioralTraitName,
    value: number,
  ): PersonalityDataBuilder {
    (this.personality as Record<string, unknown>)[trait] = value;
    return this;
  }

  /**
   * Set multiple behavioral traits with valid values
   */
  withValidBehavioralTraits(): PersonalityDataBuilder {
    return this.withBehavioralTrait("formality", 60)
      .withBehavioralTrait("humor", 70)
      .withBehavioralTrait("assertiveness", 65)
      .withBehavioralTrait("empathy", 80)
      .withBehavioralTrait("storytelling", 55)
      .withBehavioralTrait("brevity", 45)
      .withBehavioralTrait("imagination", 75)
      .withBehavioralTrait("playfulness", 60)
      .withBehavioralTrait("dramaticism", 40)
      .withBehavioralTrait("analyticalDepth", 85)
      .withBehavioralTrait("contrarianism", 30)
      .withBehavioralTrait("encouragement", 90)
      .withBehavioralTrait("curiosity", 80)
      .withBehavioralTrait("patience", 70);
  }

  /**
   * Set trait to invalid value (outside 0-100 range)
   */
  withInvalidTrait(
    trait: BigFiveTraitName | BehavioralTraitName,
    value: number,
  ): PersonalityDataBuilder {
    (this.personality as Record<string, unknown>)[trait] = value;
    return this;
  }

  /**
   * Build the personality data
   */
  build(): PersonalityCreationData {
    return { ...this.personality } as PersonalityCreationData;
  }

  /**
   * Build a complete personality configuration with ID and timestamps
   */
  buildComplete(): PersonalityConfiguration {
    const baseData = this.build();
    return {
      ...baseData,
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

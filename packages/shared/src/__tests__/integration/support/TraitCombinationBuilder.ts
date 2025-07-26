/**
 * @fileoverview Builder for trait combination testing scenarios
 */

import type {
  BigFiveTraits,
  BehavioralTraits,
} from "../../../types/personality";

/**
 * Builder for trait combination testing scenarios
 */
export class TraitCombinationBuilder {
  private traits: Partial<BigFiveTraits & BehavioralTraits> = {};

  /**
   * Create psychologically consistent trait combination
   */
  withConsistentTraits(): TraitCombinationBuilder {
    // High openness + high imagination + high curiosity
    this.traits.openness = 85;
    this.traits.imagination = 80;
    this.traits.curiosity = 85;

    // High conscientiousness + low playfulness + high analyticalDepth
    this.traits.conscientiousness = 80;
    this.traits.playfulness = 30;
    this.traits.analyticalDepth = 75;

    return this;
  }

  /**
   * Create psychologically inconsistent trait combination
   */
  withInconsistentTraits(): TraitCombinationBuilder {
    // High neuroticism but high assertiveness (unusual combination)
    this.traits.neuroticism = 90;
    this.traits.assertiveness = 90;

    // High conscientiousness but high playfulness (contradictory)
    this.traits.conscientiousness = 95;
    this.traits.playfulness = 95;

    return this;
  }

  /**
   * Create extreme trait combination (all high values)
   */
  withExtremeHighTraits(): TraitCombinationBuilder {
    Object.keys(this.traits).forEach((trait) => {
      (this.traits as Record<string, number>)[trait] =
        95 + Math.floor(Math.random() * 5);
    });
    return this;
  }

  /**
   * Create extreme trait combination (all low values)
   */
  withExtremeLowTraits(): TraitCombinationBuilder {
    Object.keys(this.traits).forEach((trait) => {
      (this.traits as Record<string, number>)[trait] = Math.floor(
        Math.random() * 5,
      );
    });
    return this;
  }

  /**
   * Set specific trait value
   */
  withTrait(
    trait: keyof (BigFiveTraits & BehavioralTraits),
    value: number,
  ): TraitCombinationBuilder {
    this.traits[trait] = value;
    return this;
  }

  /**
   * Build the trait combination
   */
  build(): Partial<BigFiveTraits & BehavioralTraits> {
    return { ...this.traits };
  }
}

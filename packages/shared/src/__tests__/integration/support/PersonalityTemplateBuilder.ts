/**
 * @fileoverview Builder for personality template creation
 */

import type { PersonalityConfiguration } from "../../../types/personality";
import { PersonalityDataBuilder } from "./PersonalityDataBuilder";

/**
 * Builder for personality template creation
 */
export class PersonalityTemplateBuilder {
  private builder: PersonalityDataBuilder;

  constructor() {
    this.builder = new PersonalityDataBuilder().asTemplate();
  }

  /**
   * Create creative personality template
   */
  createCreativeTemplate(): PersonalityTemplateBuilder {
    this.builder
      .withName("Creative Innovator")
      .withDescription("Highly creative and open to new experiences")
      .withOpenness(90)
      .withConscientiousness(60)
      .withExtraversion(70)
      .withAgreeableness(75)
      .withNeuroticism(45)
      .withBehavioralTrait("imagination", 95)
      .withBehavioralTrait("curiosity", 90)
      .withBehavioralTrait("playfulness", 80)
      .withBehavioralTrait("storytelling", 85);

    return this;
  }

  /**
   * Create analytical personality template
   */
  createAnalyticalTemplate(): PersonalityTemplateBuilder {
    this.builder
      .withName("Analytical Thinker")
      .withDescription("Detail-oriented and methodical approach")
      .withOpenness(70)
      .withConscientiousness(95)
      .withExtraversion(40)
      .withAgreeableness(60)
      .withNeuroticism(30)
      .withBehavioralTrait("analyticalDepth", 95)
      .withBehavioralTrait("brevity", 20)
      .withBehavioralTrait("formality", 80)
      .withBehavioralTrait("patience", 90);

    return this;
  }

  /**
   * Create supportive personality template
   */
  createSupportiveTemplate(): PersonalityTemplateBuilder {
    this.builder
      .withName("Supportive Guide")
      .withDescription("Empathetic and encouraging communication style")
      .withOpenness(75)
      .withConscientiousness(70)
      .withExtraversion(80)
      .withAgreeableness(95)
      .withNeuroticism(25)
      .withBehavioralTrait("empathy", 95)
      .withBehavioralTrait("encouragement", 90)
      .withBehavioralTrait("patience", 85)
      .withBehavioralTrait("humor", 70);

    return this;
  }

  /**
   * Build the template personality
   */
  build(): PersonalityConfiguration {
    return this.builder.buildComplete();
  }
}

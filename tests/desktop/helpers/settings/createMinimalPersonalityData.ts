import { randomUUID } from "crypto";
import type { MockPersonalityData } from "./MockPersonalityData";

export const createMinimalPersonalityData = (
  overrides?: Partial<MockPersonalityData>,
): MockPersonalityData => {
  const personalityId = randomUUID().slice(0, 8);

  // Minimal valid trait scores (all set to 50 - neutral)
  const minimalTraits = {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };

  const minimalBehaviors = {
    analytical: 50,
    empathetic: 50,
    decisive: 50,
    curious: 50,
    patient: 50,
    humorous: 50,
    formal: 50,
    optimistic: 50,
    cautious: 50,
    creative: 50,
    logical: 50,
    supportive: 50,
    direct: 50,
    enthusiastic: 50,
  };

  return {
    name: `Min Test ${personalityId}`,
    bigFive: minimalTraits,
    behaviors: minimalBehaviors,
    customInstructions: `Minimal test personality ${personalityId}.`,
    ...overrides,
  };
};

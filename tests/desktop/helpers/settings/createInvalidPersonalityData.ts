import type { MockPersonalityData } from "./MockPersonalityData";

export const createInvalidPersonalityData = (): {
  emptyName: Partial<MockPersonalityData>;
  invalidTraitScores: Partial<MockPersonalityData>;
  missingCustomInstructions: Partial<MockPersonalityData>;
  extremeTraitScores: Partial<MockPersonalityData>;
} => {
  const validBigFive = {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };

  const validBehaviors = {
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
    emptyName: {
      name: "",
      bigFive: validBigFive,
      behaviors: validBehaviors,
      customInstructions: "Valid instructions but empty name",
    },
    invalidTraitScores: {
      name: "Invalid Traits Personality",
      bigFive: {
        openness: -10, // Invalid: below 0
        conscientiousness: 150, // Invalid: above 100
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
      },
      behaviors: validBehaviors,
      customInstructions: "Personality with invalid trait scores",
    },
    missingCustomInstructions: {
      name: "No Instructions Personality",
      bigFive: validBigFive,
      behaviors: validBehaviors,
      customInstructions: "",
    },
    extremeTraitScores: {
      name: "Extreme Personality",
      bigFive: {
        openness: 0,
        conscientiousness: 100,
        extraversion: 0,
        agreeableness: 100,
        neuroticism: 0,
      },
      behaviors: {
        analytical: 100,
        empathetic: 0,
        decisive: 100,
        curious: 0,
        patient: 100,
        humorous: 0,
        formal: 100,
        optimistic: 0,
        cautious: 100,
        creative: 0,
        logical: 100,
        supportive: 0,
        direct: 100,
        enthusiastic: 0,
      },
      customInstructions: "Personality with extreme but valid trait scores",
    },
  };
};

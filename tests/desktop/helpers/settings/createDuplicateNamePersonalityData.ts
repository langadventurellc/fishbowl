import type { MockPersonalityData } from "./MockPersonalityData";

export const createDuplicateNamePersonalityData = (
  existingName: string,
): MockPersonalityData => {
  return {
    name: existingName, // Intentionally duplicate
    bigFive: {
      openness: 60,
      conscientiousness: 60,
      extraversion: 60,
      agreeableness: 60,
      neuroticism: 40,
    },
    behaviors: {
      analytical: 60,
      empathetic: 60,
      decisive: 60,
      curious: 60,
      patient: 60,
      humorous: 60,
      formal: 40,
      optimistic: 60,
      cautious: 40,
      creative: 60,
      logical: 60,
      supportive: 60,
      direct: 40,
      enthusiastic: 60,
    },
    customInstructions: `Duplicate personality with name: ${existingName}`,
  };
};

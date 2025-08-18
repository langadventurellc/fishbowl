import { randomUUID } from "crypto";
import type { MockPersonalityData } from "./MockPersonalityData";

export const createMockPersonalityData = (
  overrides?: Partial<MockPersonalityData>,
): MockPersonalityData => {
  const personalityId = randomUUID().slice(0, 8);

  // Generate balanced trait scores (40-60 range for neutral)
  const generateBalancedTraits = () => ({
    openness: 55 + Math.floor(Math.random() * 20) - 10, // 45-65
    conscientiousness: 55 + Math.floor(Math.random() * 20) - 10,
    extraversion: 55 + Math.floor(Math.random() * 20) - 10,
    agreeableness: 55 + Math.floor(Math.random() * 20) - 10,
    neuroticism: 55 + Math.floor(Math.random() * 20) - 10,
  });

  const generateBalancedBehaviors = () => ({
    analytical: 55 + Math.floor(Math.random() * 20) - 10,
    empathetic: 55 + Math.floor(Math.random() * 20) - 10,
    decisive: 55 + Math.floor(Math.random() * 20) - 10,
    curious: 55 + Math.floor(Math.random() * 20) - 10,
    patient: 55 + Math.floor(Math.random() * 20) - 10,
    humorous: 55 + Math.floor(Math.random() * 20) - 10,
    formal: 55 + Math.floor(Math.random() * 20) - 10,
    optimistic: 55 + Math.floor(Math.random() * 20) - 10,
    cautious: 55 + Math.floor(Math.random() * 20) - 10,
    creative: 55 + Math.floor(Math.random() * 20) - 10,
    logical: 55 + Math.floor(Math.random() * 20) - 10,
    supportive: 55 + Math.floor(Math.random() * 20) - 10,
    direct: 55 + Math.floor(Math.random() * 20) - 10,
    enthusiastic: 55 + Math.floor(Math.random() * 20) - 10,
  });

  return {
    name: `Test Personality ${personalityId}`,
    bigFive: generateBalancedTraits(),
    behaviors: generateBalancedBehaviors(),
    customInstructions: `You are a test personality for automated testing purposes (ID: ${personalityId}). Help with testing and verification tasks while maintaining this specific personality profile. Always provide clear, actionable responses for test scenarios.`,
    ...overrides,
  };
};

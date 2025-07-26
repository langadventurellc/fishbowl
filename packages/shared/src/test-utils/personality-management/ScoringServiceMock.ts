import { PersonalityScoringResult } from "./PersonalityScoringResult";
import { ScoringServiceMockConfig } from "src/test-utils/personality-management/ScoringServiceMockConfig";
import type {
  PersonalityConfiguration,
  PersonalityCreationData,
} from "src/types/personality";

/**
 * Mock implementation of ScoringService for testing
 */

export class ScoringServiceMock {
  private config: ScoringServiceMockConfig;

  constructor(config: ScoringServiceMockConfig = {}) {
    this.config = {
      shouldFail: false,
      baseScoreMultiplier: 1.0,
      subscoreVariance: 5.0,
      ...config,
    };
  }

  /**
   * Calculate personality scores
   */
  async calculatePersonalityScores(
    personality: PersonalityConfiguration | PersonalityCreationData,
  ): Promise<PersonalityScoringResult> {
    if (this.config.shouldFail) {
      throw new Error("ScoringService calculation failed");
    }

    // Calculate base scores from traits
    const baseScores = {
      creativity: Math.max(
        0,
        Math.min(
          100,
          personality.openness + (personality.imagination || 50) / 2,
        ),
      ),
      reliability: Math.max(
        0,
        Math.min(
          100,
          personality.conscientiousness + (100 - personality.neuroticism) / 4,
        ),
      ),
      socialWarmth: Math.max(
        0,
        Math.min(
          100,
          (personality.extraversion + personality.agreeableness) / 2,
        ),
      ),
      emotionalStability: Math.max(
        0,
        Math.min(100, 100 - personality.neuroticism),
      ),
      adaptability: Math.max(
        0,
        Math.min(100, (personality.openness + personality.extraversion) / 2),
      ),
      bigFiveBalance: Math.max(
        0,
        Math.min(
          100,
          (personality.openness +
            personality.conscientiousness +
            personality.extraversion +
            personality.agreeableness +
            (100 - personality.neuroticism)) /
            5,
        ),
      ),
      behavioralCoherence: Math.max(
        0,
        Math.min(
          100,
          (personality.conscientiousness + personality.agreeableness) / 2,
        ),
      ),
      psychologicalStability: Math.max(
        0,
        Math.min(100, 100 - personality.neuroticism),
      ),
    };

    // Apply variance and multiplier
    const subscores = Object.fromEntries(
      Object.entries(baseScores).map(([key, value]) => [
        key,
        Math.max(
          0,
          Math.min(
            100,
            value * (this.config.baseScoreMultiplier || 1.0) +
              (Math.random() - 0.5) * (this.config.subscoreVariance || 5.0),
          ),
        ),
      ]),
    ) as typeof baseScores;

    // Calculate overall score
    const overallScore =
      Object.values(subscores).reduce((sum, score) => sum + score, 0) /
      Object.keys(subscores).length;

    return {
      overallScore,
      subscores,
      performanceMetrics: {
        processingTime: 0,
        algorithmVersion: "mock-1.0.0",
        scoringTimestamp: new Date().toISOString(),
      },
      qualityIndicators: {
        confidence: 1.0,
        reliability: 0.95,
        validityChecks: true,
      },
    };
  }

  /**
   * Calculate team compatibility scores
   */
  async calculateTeamCompatibility(
    personalities: PersonalityConfiguration[],
  ): Promise<{
    overallCompatibility: number;
    pairwiseScores: Array<{
      member1Index: number;
      member2Index: number;
      compatibility: number;
    }>;
  }> {
    if (this.config.shouldFail) {
      throw new Error("ScoringService team compatibility calculation failed");
    }

    const pairwiseScores = [];

    for (let i = 0; i < personalities.length; i++) {
      for (let j = i + 1; j < personalities.length; j++) {
        const p1 = personalities[i];
        const p2 = personalities[j];
        if (!p1 || !p2) continue;

        // Simple compatibility calculation based on trait differences
        const traitDifferences = [
          Math.abs(p1.openness - p2.openness),
          Math.abs(p1.conscientiousness - p2.conscientiousness),
          Math.abs(p1.extraversion - p2.extraversion),
          Math.abs(p1.agreeableness - p2.agreeableness),
          Math.abs(p1.neuroticism - p2.neuroticism),
        ];

        const averageDifference =
          traitDifferences.reduce((sum, diff) => sum + diff, 0) /
          traitDifferences.length;
        const compatibility = Math.max(0, 100 - averageDifference);

        pairwiseScores.push({
          member1Index: i,
          member2Index: j,
          compatibility,
        });
      }
    }

    const overallCompatibility =
      pairwiseScores.length > 0
        ? pairwiseScores.reduce((sum, score) => sum + score.compatibility, 0) /
          pairwiseScores.length
        : 100;

    return {
      overallCompatibility,
      pairwiseScores,
    };
  }

  /**
   * Update mock configuration
   */
  updateConfig(newConfig: Partial<ScoringServiceMockConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset mock to default configuration
   */
  reset(): void {
    this.config = {
      shouldFail: false,
      baseScoreMultiplier: 1.0,
      subscoreVariance: 5.0,
    };
  }
}

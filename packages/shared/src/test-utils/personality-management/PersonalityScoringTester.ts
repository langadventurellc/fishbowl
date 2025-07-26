import { PersonalityScoringResult } from "src/test-utils/personality-management/PersonalityScoringResult";
import type {
  PersonalityConfiguration,
  PersonalityCreationData,
} from "src/types/personality";

/**
 * Helper class for testing personality scoring algorithms
 */

export class PersonalityScoringTester {
  /**
   * Test personality scoring with performance measurement
   */
  static async testPersonalityScoring(
    personality: PersonalityConfiguration | PersonalityCreationData,
    expectedScores?: Partial<PersonalityScoringResult>,
    performanceThreshold = 50,
  ): Promise<{
    result: PersonalityScoringResult;
    performance: { duration: number; withinThreshold: boolean };
  }> {
    const startTime = globalThis.performance.now();

    const result = this.calculatePersonalityScores(personality);

    const endTime = globalThis.performance.now();
    const duration = endTime - startTime;
    const withinThreshold = duration <= performanceThreshold;

    // Validate expected scores if provided
    if (expectedScores) {
      this.validateExpectedScores(result, expectedScores);
    }

    return {
      result,
      performance: {
        duration,
        withinThreshold,
      },
    };
  }

  /**
   * Calculate personality scores using algorithm
   */
  private static calculatePersonalityScores(
    personality: PersonalityConfiguration | PersonalityCreationData,
  ): PersonalityScoringResult {
    const traits = {
      openness: personality.openness,
      conscientiousness: personality.conscientiousness,
      extraversion: personality.extraversion,
      agreeableness: personality.agreeableness,
      neuroticism: personality.neuroticism,
    };

    return {
      overallScore: this.calculateOverallScore(traits),
      subscores: {
        creativity: Math.max(
          0,
          traits.openness + (personality.imagination || 0) / 2,
        ),
        reliability: Math.max(
          0,
          traits.conscientiousness + (100 - traits.neuroticism) / 4,
        ),
        socialWarmth: Math.max(
          0,
          (traits.extraversion + traits.agreeableness) / 2,
        ),
        emotionalStability: Math.max(0, 100 - traits.neuroticism),
        adaptability: Math.max(0, (traits.openness + traits.extraversion) / 2),
        bigFiveBalance: this.calculateBalance(Object.values(traits)),
        behavioralCoherence: this.calculateBehavioralCoherence(personality),
        psychologicalStability: this.calculatePsychologicalStability(traits),
      },
      performanceMetrics: {
        processingTime: 0, // Will be set by caller
        algorithmVersion: "1.0.0",
        scoringTimestamp: new Date().toISOString(),
      },
      qualityIndicators: {
        confidence: this.calculateConfidence(traits),
        reliability: this.calculateReliability(traits),
        validityChecks: true,
      },
    };
  }

  /**
   * Calculate overall personality score
   */
  private static calculateOverallScore(traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }): number {
    const weights = {
      openness: 0.2,
      conscientiousness: 0.25,
      extraversion: 0.2,
      agreeableness: 0.2,
      neuroticism: -0.15, // Negative weight for neuroticism
    };

    return Math.max(
      0,
      Math.min(
        100,
        traits.openness * weights.openness +
          traits.conscientiousness * weights.conscientiousness +
          traits.extraversion * weights.extraversion +
          traits.agreeableness * weights.agreeableness +
          (100 - traits.neuroticism) * Math.abs(weights.neuroticism),
      ),
    );
  }

  /**
   * Calculate trait balance score
   */
  private static calculateBalance(traitValues: number[]): number {
    const mean = traitValues.reduce((a, b) => a + b, 0) / traitValues.length;
    const variance =
      traitValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      traitValues.length;
    const standardDeviation = Math.sqrt(variance);
    return Math.max(0, 100 - standardDeviation);
  }

  /**
   * Calculate behavioral coherence score
   */
  private static calculateBehavioralCoherence(
    personality: PersonalityConfiguration | PersonalityCreationData,
  ): number {
    // Check alignment between Big Five and behavioral traits
    const bigFiveTraits = [
      personality.openness,
      personality.conscientiousness,
      personality.extraversion,
      personality.agreeableness,
      personality.neuroticism,
    ];
    const behavioralTraits = [
      personality.formality || 50,
      personality.humor || 50,
      personality.assertiveness || 50,
      personality.empathy || 50,
      personality.storytelling || 50,
      personality.brevity || 50,
      personality.imagination || 50,
      personality.playfulness || 50,
      personality.dramaticism || 50,
      personality.analyticalDepth || 50,
      personality.contrarianism || 50,
      personality.encouragement || 50,
      personality.curiosity || 50,
      personality.patience || 50,
    ];

    // Simplified coherence calculation
    const bigFiveMean =
      bigFiveTraits.reduce((a, b) => a + b, 0) / bigFiveTraits.length;
    const behavioralMean =
      behavioralTraits.reduce((a, b) => a + b, 0) / behavioralTraits.length;
    const difference = Math.abs(bigFiveMean - behavioralMean);

    return Math.max(0, 100 - difference);
  }

  /**
   * Calculate psychological stability score
   */
  private static calculatePsychologicalStability(traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }): number {
    // Base stability is inverse of neuroticism
    let stability = 100 - traits.neuroticism;

    // Bonus for stabilizing trait combinations
    if (traits.conscientiousness > 70 && traits.neuroticism < 40)
      stability += 10;
    if (traits.agreeableness > 60 && traits.extraversion > 40) stability += 5;

    return Math.min(100, Math.max(0, stability));
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }): number {
    const traitValues = Object.values(traits);
    const extremeCount = traitValues.filter((t) => t > 90 || t < 10).length;
    return Math.max(0.5, 1.0 - extremeCount * 0.1);
  }

  /**
   * Calculate reliability score
   */
  private static calculateReliability(traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }): number {
    // Higher reliability for balanced personalities
    const balance = this.calculateBalance(Object.values(traits));
    return balance / 100;
  }

  /**
   * Validate expected scores against actual results
   */
  private static validateExpectedScores(
    actual: PersonalityScoringResult,
    expected: Partial<PersonalityScoringResult>,
  ): void {
    const tolerance = 2.0; // Allow 2-point tolerance

    if (expected.overallScore !== undefined) {
      const diff = Math.abs(actual.overallScore - expected.overallScore);
      if (diff > tolerance) {
        throw new Error(
          `Overall score mismatch: expected ${expected.overallScore}, got ${actual.overallScore} (tolerance: ${tolerance})`,
        );
      }
    }

    if (expected.subscores) {
      Object.entries(expected.subscores).forEach(([key, expectedValue]) => {
        if (expectedValue !== undefined) {
          const actualValue =
            actual.subscores[key as keyof typeof actual.subscores];
          const diff = Math.abs(actualValue - expectedValue);
          if (diff > tolerance) {
            throw new Error(
              `Subscore ${key} mismatch: expected ${expectedValue}, got ${actualValue} (tolerance: ${tolerance})`,
            );
          }
        }
      });
    }
  }
}

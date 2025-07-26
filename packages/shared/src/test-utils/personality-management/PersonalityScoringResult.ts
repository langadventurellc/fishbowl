/**
 * Personality scoring result
 */

export interface PersonalityScoringResult {
  overallScore: number;
  subscores: {
    creativity: number;
    reliability: number;
    socialWarmth: number;
    emotionalStability: number;
    adaptability: number;
    bigFiveBalance: number;
    behavioralCoherence: number;
    psychologicalStability: number;
  };
  performanceMetrics: {
    processingTime: number;
    algorithmVersion: string;
    scoringTimestamp: string;
  };
  qualityIndicators: {
    confidence: number;
    reliability: number;
    validityChecks: boolean;
  };
}

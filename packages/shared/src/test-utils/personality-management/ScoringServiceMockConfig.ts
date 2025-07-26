/**
 * Configuration for mock scoring service
 */

export interface ScoringServiceMockConfig {
  shouldFail?: boolean;
  baseScoreMultiplier?: number;
  subscoreVariance?: number;
}

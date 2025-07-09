/**
 * Optimization report interface
 */
import { QueryAnalysisResult } from './QueryAnalysisResult';

export interface OptimizationReport {
  timestamp: number;
  queriesAnalyzed: number;
  totalRecommendations: number;
  averageInefficiencyScore: number;
  slowQueries: QueryAnalysisResult[];
  missingIndexes: string[];
  optimizationSuggestions: string[];
}

/**
 * Result of query analysis and optimization
 */
import { QueryPlan } from '../performance/QueryPlan';

export interface QueryAnalysisResult {
  sql: string;
  parameters?: unknown[];
  executionTime: number;
  rowsAffected: number;
  queryPlan: QueryPlan[];
  recommendations: string[];
  inefficiencyScore: number;
}

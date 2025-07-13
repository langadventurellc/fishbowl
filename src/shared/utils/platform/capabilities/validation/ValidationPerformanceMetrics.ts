import type { ValidationStage } from './ValidationStage';

/**
 * Performance metrics for validation execution
 */
export interface ValidationPerformanceMetrics {
  /** Total time for entire validation pipeline */
  totalExecutionTimeMs: number;
  /** Time per validation stage */
  stageExecutionTimes: Record<ValidationStage, number>;
  /** Number of rules executed */
  totalRulesExecuted: number;
  /** Average time per rule */
  averageRuleExecutionMs: number;
  /** Maximum time for any single rule */
  maxRuleExecutionMs: number;
  /** Number of rules that exceeded timeout */
  timedOutRules: number;
  /** Memory usage estimate in bytes */
  memoryUsageBytes: number;
}

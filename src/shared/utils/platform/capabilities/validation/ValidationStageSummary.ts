import type { ValidationStage } from './ValidationStage';

/**
 * Summary of validation results by stage
 */
export interface ValidationStageSummary {
  /** The validation stage */
  stage: ValidationStage;
  /** Total number of rules executed in this stage */
  totalRules: number;
  /** Number of rules that passed */
  passedRules: number;
  /** Number of rules that failed */
  failedRules: number;
  /** Number of rules that produced warnings */
  warningRules: number;
  /** Time taken to execute all rules in this stage */
  executionTimeMs: number;
  /** Whether this stage passed overall */
  stagePassed: boolean;
}

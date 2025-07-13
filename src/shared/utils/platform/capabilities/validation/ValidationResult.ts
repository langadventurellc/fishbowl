import type { ValidationRuleResult } from './ValidationRuleResult';
import type { ValidationSeverity } from './ValidationSeverity';
import type { ValidationStage } from './ValidationStage';
import type { ValidationStatus } from './ValidationStatus';
import type { ValidationStageSummary } from './ValidationStageSummary';
import type { ValidationPerformanceMetrics } from './ValidationPerformanceMetrics';

/**
 * Comprehensive result of capability validation pipeline execution
 *
 * This interface provides detailed information about the validation process,
 * including rule results, performance metrics, and actionable recommendations.
 */
export interface ValidationResult {
  /** Overall validation status */
  status: ValidationStatus;

  /** Whether validation passed (no critical failures) */
  passed: boolean;

  /** Whether detection should continue after validation */
  allowContinue: boolean;

  /** Timestamp when validation started */
  startTime: number;

  /** Timestamp when validation completed */
  endTime: number;

  /** Performance metrics for validation execution */
  performance: ValidationPerformanceMetrics;

  /** Summary of results by validation stage */
  stageSummaries: ValidationStageSummary[];

  /** Detailed results from individual validation rules */
  ruleResults: ValidationRuleResult[];

  /** Errors that occurred during validation */
  errors: Array<{
    ruleId: string;
    message: string;
    details?: Record<string, unknown>;
    stage: ValidationStage;
    severity: ValidationSeverity;
  }>;

  /** Warnings generated during validation */
  warnings: Array<{
    ruleId: string;
    message: string;
    details?: Record<string, unknown>;
    stage: ValidationStage;
  }>;

  /** Informational messages from validation */
  info: Array<{
    ruleId: string;
    message: string;
    details?: Record<string, unknown>;
    stage: ValidationStage;
  }>;

  /** Actionable suggestions for improving capability detection */
  suggestions: Array<{
    ruleId: string;
    suggestion: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'SECURITY' | 'PERFORMANCE' | 'RELIABILITY' | 'COMPATIBILITY';
  }>;

  /** Additional metadata about the validation process */
  metadata: {
    /** Capability that was validated */
    capabilityId: string;
    /** Platform type validation was run on */
    platformType?: string;
    /** Number of rules skipped due to applicability */
    skippedRules: number;
    /** Validation pipeline version */
    pipelineVersion: string;
    /** Custom metadata from rules */
    customData?: Record<string, unknown>;
  };
}

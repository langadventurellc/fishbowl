import type { ValidationStage } from './ValidationStage';

/**
 * Configuration for the capability validator
 */
export interface CapabilityValidatorConfig {
  /** Whether validation is enabled globally */
  enabled: boolean;
  /** Maximum total validation time in milliseconds */
  maxValidationTimeMs: number;
  /** Whether to continue validation after critical failures */
  continueAfterCritical: boolean;
  /** Whether to collect performance metrics */
  collectPerformanceMetrics: boolean;
  /** Memory limit for validation process in bytes */
  memoryLimitBytes: number;
  /** Whether to validate rules before execution */
  validateRulesBeforeExecution: boolean;
  /** Stages to execute (allows selective validation) */
  enabledStages: ValidationStage[];
  /** Custom metadata to include in validation results */
  customMetadata?: Record<string, unknown>;
}

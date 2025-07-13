import { ValidationStage } from '../validation/ValidationStage';

/**
 * Configuration interface for capability validation pipeline settings.
 *
 * This configuration controls the behavior of the validation pipeline during
 * capability detection, including performance constraints, validation stages,
 * and error handling strategies.
 *
 * @example
 * ```typescript
 * const config: CapabilityValidationConfig = {
 *   enabled: true,
 *   maxValidationTimeMs: 2000,
 *   continueAfterCritical: false,
 *   enabledStages: [ValidationStage.PRE_DETECTION, ValidationStage.POST_DETECTION],
 *   collectPerformanceMetrics: true,
 *   memoryLimitBytes: 1048576, // 1MB
 *   validateRulesBeforeExecution: true,
 *   customMetadata: { source: 'user-config' }
 * };
 * ```
 *
 * @see {@link ValidationStage} for available validation stages
 * @see {@link ValidationResult} for validation pipeline results
 */
export interface CapabilityValidationConfig {
  /**
   * Whether validation pipeline is enabled.
   * When disabled, validation is skipped entirely.
   *
   * @default true
   */
  enabled: boolean;

  /**
   * Maximum time allowed for validation execution in milliseconds.
   * Validation will be terminated if this limit is exceeded.
   *
   * @minimum 100
   * @maximum 10000
   * @default 2000
   */
  maxValidationTimeMs: number;

  /**
   * Whether to continue capability detection after critical validation failures.
   * When false, critical failures will stop the entire detection process.
   *
   * @default false
   */
  continueAfterCritical: boolean;

  /**
   * Whether to collect detailed performance metrics during validation.
   * Enables timing, memory usage, and rule execution statistics.
   *
   * @default true
   */
  collectPerformanceMetrics: boolean;

  /**
   * Maximum memory usage allowed for validation in bytes.
   * Validation will be terminated if this limit is exceeded.
   *
   * @minimum 65536
   * @maximum 10485760
   * @default 1048576
   */
  memoryLimitBytes: number;

  /**
   * Whether to validate validation rules themselves before execution.
   * Enables pre-validation of rule configuration and dependencies.
   *
   * @default true
   */
  validateRulesBeforeExecution: boolean;

  /**
   * Validation stages that should be executed.
   * Empty array disables all validation stages.
   *
   * @default [ValidationStage.PRE_DETECTION, ValidationStage.DURING_DETECTION, ValidationStage.POST_DETECTION]
   */
  enabledStages: ValidationStage[];

  /**
   * Custom metadata for validation configuration.
   * Can be used for environment-specific settings or debugging information.
   *
   * @default undefined
   */
  customMetadata?: Record<string, unknown>;
}

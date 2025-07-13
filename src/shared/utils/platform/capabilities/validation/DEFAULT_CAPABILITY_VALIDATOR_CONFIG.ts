import type { CapabilityValidatorConfig } from './CapabilityValidatorConfig';
import { ValidationStage } from './ValidationStage';

/**
 * Default configuration for capability validator
 */
export const DEFAULT_CAPABILITY_VALIDATOR_CONFIG: CapabilityValidatorConfig = {
  enabled: true,
  maxValidationTimeMs: 2000, // 2 seconds max per spec requirement
  continueAfterCritical: false,
  collectPerformanceMetrics: true,
  memoryLimitBytes: 1024 * 1024, // 1MB memory limit
  validateRulesBeforeExecution: true,
  enabledStages: [
    ValidationStage.PRE_DETECTION,
    ValidationStage.DURING_DETECTION,
    ValidationStage.POST_DETECTION,
  ],
};

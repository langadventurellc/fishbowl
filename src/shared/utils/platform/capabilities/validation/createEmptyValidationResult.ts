import type { ValidationResult } from './ValidationResult';
import { ValidationStatus } from './ValidationStatus';
import { ValidationStage } from './ValidationStage';

/**
 * Creates an empty validation result with default values
 */
export function createEmptyValidationResult(capabilityId: string): ValidationResult {
  const now = Date.now();

  return {
    status: ValidationStatus.PASSED,
    passed: true,
    allowContinue: true,
    startTime: now,
    endTime: now,
    performance: {
      totalExecutionTimeMs: 0,
      stageExecutionTimes: {
        [ValidationStage.PRE_DETECTION]: 0,
        [ValidationStage.DURING_DETECTION]: 0,
        [ValidationStage.POST_DETECTION]: 0,
      },
      totalRulesExecuted: 0,
      averageRuleExecutionMs: 0,
      maxRuleExecutionMs: 0,
      timedOutRules: 0,
      memoryUsageBytes: 0,
    },
    stageSummaries: [],
    ruleResults: [],
    errors: [],
    warnings: [],
    info: [],
    suggestions: [],
    metadata: {
      capabilityId,
      skippedRules: 0,
      pipelineVersion: '1.0.0',
    },
  };
}

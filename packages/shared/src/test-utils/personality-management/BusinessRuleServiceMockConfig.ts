/**
 * Configuration for mock business rule service
 */

export interface BusinessRuleServiceMockConfig {
  shouldFail?: boolean;
  ruleViolations?: string[];
  warningThresholds?: Record<string, number>;
  errorThresholds?: Record<string, number>;
}

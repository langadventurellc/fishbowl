import type { ValidationRuleConfig } from './ValidationRuleConfig';

/**
 * Default configuration for validation rules
 */
export const DEFAULT_VALIDATION_RULE_CONFIG: ValidationRuleConfig = {
  enabled: true,
  timeoutMs: 1000, // 1 second max per rule
  retryOnFailure: false,
  maxRetries: 0,
  customConfig: {},
};

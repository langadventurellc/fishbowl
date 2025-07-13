/**
 * Configuration for a validation rule
 */
export interface ValidationRuleConfig {
  /** Whether this rule is enabled */
  enabled: boolean;
  /** Timeout for rule execution in milliseconds */
  timeoutMs: number;
  /** Whether to retry failed rules */
  retryOnFailure: boolean;
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Custom configuration for the rule */
  customConfig?: Record<string, unknown>;
}

/**
 * Configuration for the validation rule registry
 */
export interface ValidationRuleRegistryConfig {
  /** Whether to allow duplicate rule IDs (overwrites existing) */
  allowDuplicates: boolean;
  /** Maximum number of rules per capability */
  maxRulesPerCapability: number;
  /** Whether to validate rules during registration */
  validateOnRegister: boolean;
  /** Default priority for rules without explicit priority */
  defaultPriority: number;
}

import type { ValidationSeverity } from './ValidationSeverity';

/**
 * Result of a validation rule execution
 */
export interface ValidationRuleResult {
  /** Whether the validation rule passed */
  passed: boolean;
  /** Severity level of any violations */
  severity: ValidationSeverity;
  /** Human-readable message describing the result */
  message: string;
  /** Detailed information about the validation */
  details?: Record<string, unknown>;
  /** Suggestions for resolving validation failures */
  suggestions?: string[];
  /** Whether detection should continue after this rule */
  continueOnFailure: boolean;
  /** Time taken to execute this rule in milliseconds */
  executionTimeMs: number;
}

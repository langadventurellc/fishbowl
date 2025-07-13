import type { ValidationContext } from './ValidationContext';
import type { ValidationRuleResult } from './ValidationRuleResult';
import type { ValidationRuleConfig } from './ValidationRuleConfig';
import type { ValidationStage } from './ValidationStage';

/**
 * Interface for capability validation rules
 *
 * Validation rules are applied at specific stages of the capability detection process
 * to ensure data integrity, security, and reliability of detection results.
 */
export interface ValidationRule {
  /** Unique identifier for this validation rule */
  readonly id: string;

  /** Human-readable name for this validation rule */
  readonly name: string;

  /** Description of what this rule validates */
  readonly description: string;

  /** Validation stage when this rule should execute */
  readonly stage: ValidationStage;

  /** Priority for rule execution (higher numbers execute first) */
  readonly priority: number;

  /** Capability IDs this rule applies to (empty array = all capabilities) */
  readonly applicableCapabilities: string[];

  /** Platform types this rule applies to (empty array = all platforms) */
  readonly applicablePlatforms: string[];

  /** Configuration for this validation rule */
  readonly config: ValidationRuleConfig;

  /**
   * Validates the capability or detection result based on the rule logic
   *
   * @param context - Validation context containing capability and stage information
   * @returns Promise resolving to validation result
   */
  validate(context: ValidationContext): Promise<ValidationRuleResult>;

  /**
   * Determines if this rule should be applied to the given capability and platform
   *
   * @param capabilityId - The capability being validated
   * @param platformType - The platform type being detected on
   * @returns True if this rule should be applied
   */
  isApplicable(capabilityId: string, platformType?: string): boolean;
}

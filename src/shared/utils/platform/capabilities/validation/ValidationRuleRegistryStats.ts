import type { ValidationStage } from './ValidationStage';

/**
 * Statistics about registered validation rules
 */
export interface ValidationRuleRegistryStats {
  /** Total number of registered rules */
  totalRules: number;
  /** Number of rules by stage */
  rulesByStage: Record<ValidationStage, number>;
  /** Number of rules by capability */
  rulesByCapability: Record<string, number>;
  /** Number of rules by platform */
  rulesByPlatform: Record<string, number>;
  /** Rules with highest priority */
  highestPriority: number;
  /** Rules with lowest priority */
  lowestPriority: number;
  /** Average priority across all rules */
  averagePriority: number;
}

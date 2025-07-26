/**
 * Error in trait interactions
 */

export interface TraitInteractionError {
  type: "range_violation" | "business_rule_violation" | "correlation_violation";
  severity: "high";
  message: string;
  affectedTraits: string[];
  requiredAction: string;
  blockingReason: string;
}

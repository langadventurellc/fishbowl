/**
 * Business rule validation result
 */

export interface BusinessRuleValidationResult {
  isValid: boolean;
  violations: Array<{
    rule: string;
    severity: "error" | "warning";
    message: string;
    affectedTraits: string[];
  }>;
  score: number;
}

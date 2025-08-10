/**
 * Validation result type for validators that return detailed results
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errors?: string[];
}

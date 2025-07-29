/**
 * ValidationResult interface for form field validation.
 *
 * Provides a standardized structure for validation results across all form components.
 *
 * @module types/validation/ValidationResult
 */

export interface ValidationResult {
  /** Whether the field value is valid */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
  /** Whether validation is currently in progress */
  isValidating: boolean;
}

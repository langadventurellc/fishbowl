import type { LlmFieldConfig } from "../LlmFieldConfig";
import type { LlmValidationResult } from "./LlmValidationResult";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";
import { createFieldError } from "./createFieldError";
import { LlmValidationErrorCode } from "./LlmValidationErrorCode";

/**
 * Abstract base class for field validators.
 *
 * Provides common validation logic for required fields and
 * defines the contract for field-specific validation.
 *
 * @template T - The specific field configuration type
 */
export abstract class BaseFieldValidator<T extends LlmFieldConfig> {
  constructor(protected field: T) {}

  /**
   * Validates a field value according to its configuration.
   *
   * @param value - The value to validate
   * @returns Validation result with errors if invalid
   */
  abstract validate(value: unknown): LlmValidationResult;

  /**
   * Validates that a required field has a value.
   *
   * @param value - The value to check
   * @returns Validation error if required and missing, null otherwise
   */
  protected validateRequired(value: unknown): LlmFieldValidationError | null {
    if (this.field.required && !this.hasValue(value)) {
      return createFieldError(
        this.field.id,
        LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
        `${this.field.label} is required`,
      );
    }
    return null;
  }

  /**
   * Checks if a value is considered "present" for this field type.
   *
   * @param value - The value to check
   * @returns True if the value is present, false otherwise
   */
  protected abstract hasValue(value: unknown): boolean;
}

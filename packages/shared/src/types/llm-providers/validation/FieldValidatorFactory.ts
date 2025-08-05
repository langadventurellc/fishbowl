import type { LlmFieldConfig } from "../LlmFieldConfig";
import type { LlmValidationResult } from "./LlmValidationResult";
import { BaseFieldValidator } from "./BaseFieldValidator";
import { TextFieldValidator } from "./TextFieldValidator";
import { SecureTextFieldValidator } from "./SecureTextFieldValidator";
import { CheckboxFieldValidator } from "./CheckboxFieldValidator";

/**
 * Factory for creating field validators based on field type.
 *
 * Provides static methods for validator creation and field validation.
 */
export class FieldValidatorFactory {
  /**
   * Creates a validator instance for the given field configuration.
   *
   * @param field - The field configuration
   * @returns A validator instance for the field type
   * @throws Error if field type is unknown
   */
  static create(field: LlmFieldConfig): BaseFieldValidator<LlmFieldConfig> {
    switch (field.type) {
      case "text":
        return new TextFieldValidator(field);
      case "secure-text":
        return new SecureTextFieldValidator(field);
      case "checkbox":
        return new CheckboxFieldValidator(field);
      default:
        // TypeScript ensures this is unreachable, but include for safety
        throw new Error(
          `Unknown field type: ${(field as { type: string }).type}`,
        );
    }
  }

  /**
   * Validates a field value using the appropriate validator.
   *
   * @param value - The value to validate
   * @param field - The field configuration
   * @returns Validation result
   */
  static validateField(
    value: unknown,
    field: LlmFieldConfig,
  ): LlmValidationResult {
    const validator = this.create(field);
    return validator.validate(value);
  }
}

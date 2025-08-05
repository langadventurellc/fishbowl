import { z } from "zod";
import type { CheckboxField } from "../CheckboxField";
import type { LlmValidationResult } from "./LlmValidationResult";
import { BaseFieldValidator } from "./BaseFieldValidator";
import { createValidResult } from "./createValidResult";
import { buildValidationResult } from "./buildValidationResult";

/**
 * Validator for checkbox (boolean) fields.
 *
 * Validates that the value is a boolean type.
 */
export class CheckboxFieldValidator extends BaseFieldValidator<CheckboxField> {
  private schema = z.boolean();

  validate(value: unknown): LlmValidationResult {
    // Checkbox fields typically aren't "required" in the same way
    // They default to false when unchecked

    // For checkboxes, treat undefined/null as false
    const normalizedValue = value ?? false;

    // Validate with schema
    const result = this.schema.safeParse(normalizedValue);
    if (!result.success) {
      return buildValidationResult(result, [this.field]);
    }

    return createValidResult();
  }

  protected hasValue(value: unknown): boolean {
    // Checkboxes always have a value (true or false)
    return value !== undefined && value !== null;
  }
}

import { z } from "zod";
import type { TextField } from "../TextField";
import type { LlmValidationResult } from "./LlmValidationResult";
import { BaseFieldValidator } from "./BaseFieldValidator";
import { createValidResult } from "./createValidResult";
import { createInvalidResult } from "./createInvalidResult";
import { buildValidationResult } from "./buildValidationResult";

/**
 * Validator for text input fields.
 *
 * Handles validation for:
 * - Required/optional fields
 * - Minimum and maximum length
 * - Pattern matching
 */
export class TextFieldValidator extends BaseFieldValidator<TextField> {
  private schema: z.ZodString;

  constructor(field: TextField) {
    super(field);
    this.schema = z.string();

    // Add custom validations based on field config
    if (field.minLength !== undefined) {
      this.schema = this.schema.min(
        field.minLength,
        `${field.label} must be at least ${field.minLength} characters`,
      );
    }
    if (field.maxLength !== undefined) {
      this.schema = this.schema.max(
        field.maxLength,
        `${field.label} must be at most ${field.maxLength} characters`,
      );
    }
    if (field.pattern) {
      this.schema = this.schema.regex(
        new RegExp(field.pattern),
        `${field.label} format is invalid`,
      );
    }
  }

  validate(value: unknown): LlmValidationResult {
    // Check required
    const requiredError = this.validateRequired(value);
    if (requiredError) {
      return createInvalidResult([requiredError]);
    }

    // Skip validation only if optional and truly empty (null/undefined/"")
    if (
      !this.field.required &&
      (value === null || value === undefined || value === "")
    ) {
      return createValidResult();
    }

    // Always validate if a value is provided, even for optional fields
    const result = this.schema.safeParse(value);
    if (!result.success) {
      return buildValidationResult(result, [this.field]);
    }

    return createValidResult();
  }

  protected hasValue(value: unknown): boolean {
    return typeof value === "string" && value.trim().length > 0;
  }
}

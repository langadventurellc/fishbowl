import {
  type ValidationError,
  getValidationSummary,
} from "@fishbowl-ai/shared";

/**
 * Custom error class for validation failures in service layer
 *
 * Extends Error with structured validation information and user-friendly summary.
 */
export class LlmConfigValidationError extends Error {
  public readonly errors: ValidationError[];
  public readonly validationSummary: string;

  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = "LlmConfigValidationError";
    this.errors = errors;
    this.validationSummary = getValidationSummary(errors);
  }
}

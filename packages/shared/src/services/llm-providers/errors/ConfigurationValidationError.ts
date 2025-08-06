import { ConfigurationLoadError } from "./ConfigurationLoadError";
import type { FormattedValidationError } from "../validation/FormattedValidationError";
import type { ConfigurationErrorContext } from "./ConfigurationErrorContext";

export class ConfigurationValidationError extends ConfigurationLoadError {
  constructor(
    filePath: string,
    public readonly validationErrors: FormattedValidationError[],
    public readonly rawData?: unknown,
    context?: ConfigurationErrorContext,
  ) {
    const errorCount = validationErrors.length;
    const message = `Configuration validation failed in '${filePath}' with ${errorCount} error${errorCount > 1 ? "s" : ""}`;

    super(filePath, "validate", message, undefined, context);
    this.name = "ConfigurationValidationError";
  }

  getFieldErrors(): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};

    this.validationErrors.forEach((error) => {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = [];
      }
      fieldErrors[error.field]!.push(error.message);
    });

    return fieldErrors;
  }

  getFirstError(): FormattedValidationError | null {
    return this.validationErrors[0] || null;
  }

  hasFieldError(fieldPath: string): boolean {
    return this.validationErrors.some(
      (error) => error.path === fieldPath || error.field === fieldPath,
    );
  }

  override getDetailedMessage(): string {
    const parts = [this.message];

    if (this.validationErrors.length > 0) {
      parts.push("\nValidation errors:");
      this.validationErrors.forEach((error) => {
        const location = error.line ? ` (line ${error.line})` : "";
        parts.push(`  - ${error.path}: ${error.message}${location}`);
      });
    }

    const suggestions = this.getRecoverySuggestions();
    if (suggestions.length > 0) {
      parts.push("\nRecovery suggestions:");
      suggestions.forEach((s) => parts.push(`  - ${s}`));
    }

    return parts.join("");
  }

  override toJSON(): Record<string, unknown> {
    const json = super.toJSON();
    return {
      ...json,
      validationErrors: this.validationErrors,
      rawData: this.context?.includeRawData ? this.rawData : undefined,
    };
  }
}

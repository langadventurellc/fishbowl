import { FileStorageError } from "../../storage/errors/FileStorageError";
import type { ValidationErrorDetail } from "./ValidationErrorDetail";

/**
 * Error thrown when LLM provider configuration loading fails.
 * Extends FileStorageError to include validation-specific error details.
 */
export class ConfigurationLoadError extends FileStorageError {
  constructor(
    message: string,
    filePath: string,
    public readonly validationErrors?: ValidationErrorDetail[],
    cause?: Error,
  ) {
    super(message, "loadConfiguration", filePath, cause);
    this.name = "ConfigurationLoadError";
  }

  /**
   * Get a detailed error message including validation errors.
   * Useful for development and debugging.
   */
  getDetailedMessage(): string {
    if (!this.validationErrors || this.validationErrors.length === 0) {
      return this.message;
    }

    const details = this.validationErrors
      .map((err) => `  - ${err.path}: ${err.message}`)
      .join("\n");

    return `${this.message}\nValidation errors:\n${details}`;
  }

  /**
   * Get a JSON-serializable representation including validation errors.
   */
  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors,
    };
  }
}

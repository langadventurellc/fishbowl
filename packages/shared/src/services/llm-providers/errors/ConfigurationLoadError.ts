import { FileStorageError } from "../../storage/errors/FileStorageError";
import type { ConfigurationErrorContext } from "./ConfigurationErrorContext";
import type { ConfigurationErrorData } from "./ConfigurationErrorData";
import type { ValidationErrorDetail } from "./ValidationErrorDetail";

/**
 * Error thrown when LLM provider configuration loading fails.
 * Extends FileStorageError to include detailed context and recovery suggestions.
 */
export class ConfigurationLoadError extends FileStorageError {
  public readonly validationErrors?: ValidationErrorDetail[];

  constructor(
    messageOrFilePath: string,
    filePathOrOperation: string | "load" | "parse" | "validate",
    messageOrValidationErrors?: string | ValidationErrorDetail[],
    causeOrCause?: Error,
    contextOrUndefined?: ConfigurationErrorContext,
  ) {
    // Support both old and new constructor signatures
    if (
      typeof filePathOrOperation === "string" &&
      Array.isArray(messageOrValidationErrors)
    ) {
      // Old signature: (message, filePath, validationErrors?, cause?)
      super(
        messageOrFilePath,
        "loadConfiguration",
        filePathOrOperation,
        causeOrCause,
      );
      this.validationErrors = messageOrValidationErrors;
    } else {
      // New signature: (filePath, operation, message, cause?, context?)
      const filePath = messageOrFilePath;
      const operation = filePathOrOperation as "load" | "parse" | "validate";
      const message = messageOrValidationErrors as string;
      super(message, operation, filePath, causeOrCause);
      this.context = contextOrUndefined;
    }
    this.name = "ConfigurationLoadError";
  }

  public readonly context?: ConfigurationErrorContext;

  getRecoverySuggestions(): string[] {
    const suggestions: string[] = [];

    switch (this.operation) {
      case "load":
        if (this.cause?.message.includes("ENOENT")) {
          suggestions.push(`Create configuration file at '${this.filePath}'`);
          suggestions.push("Use default configuration as fallback");
        }
        break;
      case "parse":
        suggestions.push("Check JSON syntax for missing commas or brackets");
        suggestions.push("Validate JSON using an online JSON validator");
        break;
      case "validate":
        suggestions.push("Review the validation errors below");
        suggestions.push("Check field types match expected schemas");
        break;
    }

    return suggestions;
  }

  getDetailedMessage(): string {
    const parts = [this.message];

    if (this.context?.environment === "development" && this.cause) {
      parts.push(`\nCause: ${this.cause.message}`);
    }

    const suggestions = this.getRecoverySuggestions();
    if (suggestions.length > 0) {
      parts.push("\nRecovery suggestions:");
      suggestions.forEach((s) => parts.push(`  - ${s}`));
    }

    return parts.join("");
  }

  toJSON(): Record<string, unknown> {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      validationErrors: this.validationErrors,
      context: this.context,
      stack:
        this.context?.environment === "development" ? this.stack : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  toConfigurationErrorData(): ConfigurationErrorData {
    return {
      name: this.name,
      message: this.message,
      filePath: this.filePath,
      operation: this.operation,
      context: this.context,
      stack:
        this.context?.environment === "development" ? this.stack : undefined,
      timestamp: new Date().toISOString(),
    };
  }
}

import { ConfigurationLoadError } from "./ConfigurationLoadError";
import { ConfigurationValidationError } from "./ConfigurationValidationError";
import { HotReloadError } from "./HotReloadError";
import type { RecoverySuggestion } from "./RecoverySuggestion";
import type { RecoveryResult } from "./RecoveryResult";
import { createLoggerSync } from "../../../logging/createLoggerSync";

export class ErrorRecovery {
  private static readonly logger = createLoggerSync({
    config: { name: "ErrorRecovery" },
  });

  static suggestionsForError(error: Error): RecoverySuggestion[] {
    const suggestions: RecoverySuggestion[] = [];

    if (error instanceof HotReloadError) {
      if (error.hasValidFallback()) {
        suggestions.push({
          type: "fallback",
          message: "Use last valid configuration",
          action: async () => {
            this.logger.info("Using fallback configuration");
          },
        });
      }
    }

    if (error instanceof ConfigurationValidationError) {
      const firstError = error.getFirstError();
      if (firstError) {
        suggestions.push({
          type: "user_action",
          message: `Fix validation error in field '${firstError.field}': ${firstError.message}`,
        });
      }
    }

    if (error instanceof ConfigurationLoadError) {
      if (error.cause?.message.includes("ENOENT")) {
        suggestions.push({
          type: "auto_fix",
          message: "Create default configuration file",
          action: async () => {
            // Implementation would create default config file
            this.logger.info("Creating default configuration");
          },
        });
      }

      if (error.cause?.message.includes("EACCES")) {
        suggestions.push({
          type: "user_action",
          message: "Check file permissions for configuration file",
        });
      }
    }

    return suggestions;
  }

  static canRecover(error: ConfigurationLoadError): boolean {
    // File not found - can create default
    if (error.cause?.message.includes("ENOENT")) {
      return true;
    }

    // Hot reload with fallback
    if (error instanceof HotReloadError && error.hasValidFallback()) {
      return true;
    }

    // Validation errors can potentially be fixed
    if (error instanceof ConfigurationValidationError) {
      return true;
    }

    return false;
  }

  static async attemptRecovery(
    error: ConfigurationLoadError,
  ): Promise<RecoveryResult> {
    this.logger.info("Attempting error recovery", {
      errorType: error.name,
      operation: error.operation,
    });

    if (error.cause?.message.includes("ENOENT")) {
      return this.recoverFromFileNotFound(error);
    }

    if (error instanceof ConfigurationValidationError) {
      return this.recoverFromValidationError(error);
    }

    if (error instanceof HotReloadError) {
      return this.recoverFromHotReloadError(error);
    }

    if (error.operation === "parse") {
      return this.recoverFromParseError(error);
    }

    return {
      success: false,
      remainingErrors: [error],
    };
  }

  private static recoverFromFileNotFound(
    error: ConfigurationLoadError,
  ): RecoveryResult {
    // Return empty configuration as fallback
    this.logger.warn(
      `Configuration file not found at ${error.filePath}, using empty configuration`,
    );

    return {
      success: true,
      fallbackData: [],
      appliedFixes: ["Created empty configuration fallback"],
    };
  }

  private static recoverFromValidationError(
    error: ConfigurationValidationError,
  ): RecoveryResult {
    const fieldErrors = error.getFieldErrors();
    const errorFields = Object.keys(fieldErrors);

    this.logger.warn("Validation errors detected", {
      errorCount: error.validationErrors.length,
      fields: errorFields,
    });

    // Cannot auto-fix validation errors, but provide detailed info
    return {
      success: false,
      remainingErrors: [error],
      appliedFixes: [],
    };
  }

  private static recoverFromHotReloadError(
    error: HotReloadError,
  ): RecoveryResult {
    if (error.hasValidFallback()) {
      this.logger.info(
        "Using last valid configuration after hot-reload failure",
      );

      return {
        success: true,
        fallbackData: error.lastValidConfiguration,
        appliedFixes: ["Reverted to last valid configuration"],
      };
    }

    return {
      success: false,
      remainingErrors: [error],
    };
  }

  private static recoverFromParseError(
    error: ConfigurationLoadError,
  ): RecoveryResult {
    this.logger.error("JSON parse error in configuration", error);

    // Cannot auto-fix parse errors
    return {
      success: false,
      fallbackData: [],
      appliedFixes: [],
      remainingErrors: [error],
    };
  }
}

import { LlmConfigError } from "./LlmConfigError";

/**
 * Error thrown when configuration data fails validation.
 * Code: INVALID_CONFIG_DATA
 */
export class InvalidConfigError extends LlmConfigError {
  constructor(message: string, validationErrors?: unknown, cause?: Error) {
    super(message, "INVALID_CONFIG_DATA", { validationErrors }, cause);
  }
}

import { LlmConfigError } from "./LlmConfigError";

/**
 * Error thrown for general service operation failures.
 * Code: CONFIG_OPERATION_FAILED
 */
export class ConfigOperationError extends LlmConfigError {
  constructor(
    operation: string,
    message: string,
    context?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(message, "CONFIG_OPERATION_FAILED", { operation, ...context }, cause);
  }
}

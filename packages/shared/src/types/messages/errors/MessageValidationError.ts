/**
 * Error thrown when message validation fails
 */
export class MessageValidationError extends Error {
  readonly validationErrors: string[];

  constructor(validationErrors: string[]) {
    super(`Message validation failed: ${validationErrors.join(", ")}`);
    this.name = "MessageValidationError";
    this.validationErrors = validationErrors;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, MessageValidationError.prototype);
  }

  /**
   * Serialize error for IPC transport
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      validationErrors: this.validationErrors,
      stack: this.stack,
    };
  }
}

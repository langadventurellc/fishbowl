interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Error thrown when conversation agent data fails validation
 */
export class ConversationAgentValidationError extends Error {
  readonly errors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    const message = `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`;
    super(message);
    this.name = "ConversationAgentValidationError";
    this.errors = errors;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ConversationAgentValidationError.prototype);
  }

  /**
   * Serialize error for IPC transport
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors,
      stack: this.stack,
    };
  }
}

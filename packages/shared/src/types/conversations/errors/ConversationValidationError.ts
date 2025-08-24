interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Error thrown when conversation data fails validation
 */
export class ConversationValidationError extends Error {
  readonly errors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    const message = `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`;
    super(message);
    this.name = "ConversationValidationError";
    this.errors = errors;

    Object.setPrototypeOf(this, ConversationValidationError.prototype);
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

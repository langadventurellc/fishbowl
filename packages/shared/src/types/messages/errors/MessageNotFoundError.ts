/**
 * Error thrown when a message cannot be found
 */
export class MessageNotFoundError extends Error {
  readonly messageId: string;

  constructor(messageId: string) {
    super(`Message not found: ${messageId}`);
    this.name = "MessageNotFoundError";
    this.messageId = messageId;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, MessageNotFoundError.prototype);
  }

  /**
   * Serialize error for IPC transport
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      messageId: this.messageId,
      stack: this.stack,
    };
  }
}

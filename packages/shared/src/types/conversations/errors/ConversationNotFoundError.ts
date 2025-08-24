/**
 * Error thrown when a conversation cannot be found
 */
export class ConversationNotFoundError extends Error {
  readonly conversationId: string;

  constructor(conversationId: string) {
    super(`Conversation not found: ${conversationId}`);
    this.name = "ConversationNotFoundError";
    this.conversationId = conversationId;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ConversationNotFoundError.prototype);
  }

  /**
   * Serialize error for IPC transport
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      conversationId: this.conversationId,
      stack: this.stack,
    };
  }
}

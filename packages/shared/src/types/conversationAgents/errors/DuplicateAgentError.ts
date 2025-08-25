/**
 * Error thrown when attempting to add a duplicate agent to a conversation
 */
export class DuplicateAgentError extends Error {
  readonly conversationId: string;
  readonly agentId: string;

  constructor(conversationId: string, agentId: string) {
    super(`Agent ${agentId} is already in conversation ${conversationId}`);
    this.name = "DuplicateAgentError";
    this.conversationId = conversationId;
    this.agentId = agentId;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, DuplicateAgentError.prototype);
  }

  /**
   * Serialize error for IPC transport
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      conversationId: this.conversationId,
      agentId: this.agentId,
      stack: this.stack,
    };
  }
}

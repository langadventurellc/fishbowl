/**
 * Error thrown when a conversation agent association cannot be found
 */
export class ConversationAgentNotFoundError extends Error {
  readonly conversationAgentId?: string;
  readonly conversationId?: string;
  readonly agentId?: string;

  constructor(params: {
    conversationAgentId?: string;
    conversationId?: string;
    agentId?: string;
  }) {
    const parts = [];
    if (params.conversationAgentId) {
      parts.push(`ID: ${params.conversationAgentId}`);
    }
    if (params.conversationId && params.agentId) {
      parts.push(
        `conversation: ${params.conversationId}, agent: ${params.agentId}`,
      );
    }

    super(`Conversation agent not found: ${parts.join(" ")}`);
    this.name = "ConversationAgentNotFoundError";
    this.conversationAgentId = params.conversationAgentId;
    this.conversationId = params.conversationId;
    this.agentId = params.agentId;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ConversationAgentNotFoundError.prototype);
  }

  /**
   * Serialize error for IPC transport
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      conversationAgentId: this.conversationAgentId,
      conversationId: this.conversationId,
      agentId: this.agentId,
      stack: this.stack,
    };
  }
}

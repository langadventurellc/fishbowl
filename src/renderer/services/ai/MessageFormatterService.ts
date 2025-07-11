import { Message } from '../../../shared/types';
import { AIMessage } from './AIMessage';

/**
 * Service for formatting application messages for AI provider consumption.
 * Converts internal Message format to standardized AI SDK format.
 */
export class MessageFormatterService {
  private systemMessageCounter = 0;
  /**
   * Formats a single message for AI provider consumption.
   * @param message - Application message to format
   * @returns Formatted message following AI SDK patterns
   */
  public formatMessageForAI(message: Message): AIMessage {
    // Map application agent roles to AI SDK roles
    const aiRole = this.mapRoleToAIRole(message.type);

    return {
      role: aiRole,
      content: message.content,
      id: message.id,
      createdAt: new Date(message.timestamp),
    };
  }

  /**
   * Formats an array of messages for AI provider consumption.
   * @param messages - Array of application messages to format
   * @returns Array of formatted messages ready for AI SDK
   */
  public formatMessagesForAI(messages: Message[]): AIMessage[] {
    return messages.map(message => this.formatMessageForAI(message));
  }

  /**
   * Creates a system message for AI context.
   * @param content - System message content
   * @returns Formatted system message
   */
  public createSystemMessage(content: string): AIMessage {
    return {
      role: 'system',
      content,
      id: `system-${Date.now()}-${++this.systemMessageCounter}`,
    };
  }

  /**
   * Maps application message types to AI SDK roles.
   * @param messageType - Application message type
   * @returns AI SDK role
   */
  private mapRoleToAIRole(messageType: string): 'user' | 'assistant' | 'system' {
    switch (messageType.toLowerCase()) {
      case 'user':
      case 'human':
        return 'user';
      case 'assistant':
      case 'ai':
      case 'bot':
        return 'assistant';
      case 'system':
        return 'system';
      default:
        // Default to assistant for agent messages
        return 'assistant';
    }
  }

  /**
   * Prepares conversation context with system prompt and formatted messages.
   * @param messages - Array of application messages
   * @param systemPrompt - Optional system prompt to include
   * @returns Complete conversation context ready for AI SDK
   */
  public prepareConversationContext(messages: Message[], systemPrompt?: string): AIMessage[] {
    const context: AIMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      context.push(this.createSystemMessage(systemPrompt));
    }

    // Add formatted messages
    context.push(...this.formatMessagesForAI(messages));

    return context;
  }
}

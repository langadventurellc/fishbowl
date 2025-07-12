import { Message } from '../../../shared/types';
import { getActiveMessagesForAI } from '../../../shared/utils/ai';

/**
 * Service for managing conversation context with message filtering for AI interactions.
 * This service integrates the existing message filtering utility with AI context preparation.
 */
export class ConversationContextService {
  /**
   * Prepares conversation context for AI by filtering active messages.
   * @param messages - Array of all messages in the conversation
   * @returns Array of active messages sorted by timestamp, ready for AI consumption
   */
  public prepareAIContext(messages: Message[]): Message[] {
    // Use existing utility to filter active messages
    return getActiveMessagesForAI(messages);
  }

  /**
   * Prepares conversation context for a specific conversation ID.
   * @param conversationId - The ID of the conversation
   * @param getAllMessages - Function to retrieve all messages for the conversation
   * @returns Array of active messages ready for AI context
   */
  public async prepareAIContextForConversation(
    conversationId: string,
    getAllMessages: (conversationId: string) => Promise<Message[]>,
  ): Promise<Message[]> {
    const allMessages = await getAllMessages(conversationId);
    return this.prepareAIContext(allMessages);
  }

  /**
   * Validates that message filtering is working correctly.
   * @param messages - Array of messages to validate
   * @returns Validation result with statistics
   */
  public validateFilteredContext(messages: Message[]): {
    totalMessages: number;
    activeMessages: number;
    inactiveMessages: number;
    isValid: boolean;
  } {
    const activeMessages = this.prepareAIContext(messages);
    const inactiveMessages = messages.filter(msg => !msg.isActive);

    return {
      totalMessages: messages.length,
      activeMessages: activeMessages.length,
      inactiveMessages: inactiveMessages.length,
      isValid: activeMessages.every(msg => msg.isActive === true),
    };
  }
}

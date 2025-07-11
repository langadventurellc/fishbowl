import { AgentService } from './AgentService';
import { ConversationContextService } from './ConversationContextService';
import { MessageFormatterService } from './MessageFormatterService';

/**
 * Factory for creating AI service instances with proper dependency injection.
 * Provides a centralized way to create services with their dependencies.
 */
export class ServiceFactory {
  /**
   * Creates a new AgentService instance with all required dependencies.
   * @returns Configured AgentService instance
   */
  public static createAgentService(): AgentService {
    const contextService = new ConversationContextService();
    const formatterService = new MessageFormatterService();

    return new AgentService(contextService, formatterService);
  }

  /**
   * Creates a new ConversationContextService instance.
   * @returns ConversationContextService instance
   */
  public static createConversationContextService(): ConversationContextService {
    return new ConversationContextService();
  }

  /**
   * Creates a new MessageFormatterService instance.
   * @returns MessageFormatterService instance
   */
  public static createMessageFormatterService(): MessageFormatterService {
    return new MessageFormatterService();
  }
}

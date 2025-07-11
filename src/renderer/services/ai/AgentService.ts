import { Message, Agent } from '../../../shared/types';
import { ConversationContextService } from './ConversationContextService';
import { MessageFormatterService } from './MessageFormatterService';
import { AgentConfig } from './AgentConfig';
import { AIContextResult } from './AIContextResult';

/**
 * Main service for AI agent interactions with message filtering integration.
 * This service coordinates between conversation context and message formatting services.
 */
export class AgentService {
  private conversationContextService: ConversationContextService;
  private messageFormatterService: MessageFormatterService;

  constructor() {
    this.conversationContextService = new ConversationContextService();
    this.messageFormatterService = new MessageFormatterService();
  }

  /**
   * Prepares AI context for a conversation with message filtering applied.
   * @param messages - All messages in the conversation
   * @param agent - Agent configuration (optional)
   * @param config - AI configuration (optional)
   * @returns Prepared AI context with filtering applied
   */
  public prepareAIContext(
    messages: Message[],
    agent?: Agent,
    config?: AgentConfig,
  ): AIContextResult {
    // Step 1: Filter messages to only include active ones
    const activeMessages = this.conversationContextService.prepareAIContext(messages);

    // Step 2: Create system prompt from agent personality if available
    let systemPrompt = config?.systemPrompt;
    if (agent && !systemPrompt) {
      systemPrompt = this.buildSystemPromptFromAgent(agent);
    }

    // Step 3: Format messages for AI SDK
    const formattedMessages = this.messageFormatterService.prepareConversationContext(
      activeMessages,
      systemPrompt,
    );

    return {
      messages: formattedMessages,
      activeMessageCount: activeMessages.length,
      totalMessageCount: messages.length,
      isFiltered: activeMessages.length < messages.length,
      agent,
    };
  }

  /**
   * Prepares AI context for a specific conversation with agent.
   * @param conversationId - ID of the conversation
   * @param agent - Agent for the conversation
   * @param getAllMessages - Function to retrieve all messages
   * @param config - AI configuration
   * @returns Prepared AI context
   */
  public async prepareAIContextForConversation(
    conversationId: string,
    agent: Agent,
    getAllMessages: (conversationId: string) => Promise<Message[]>,
    config?: AgentConfig,
  ): Promise<AIContextResult> {
    const messages = await getAllMessages(conversationId);
    return this.prepareAIContext(messages, agent, config);
  }

  /**
   * Validates that message filtering is working correctly for AI context.
   * @param messages - Messages to validate
   * @returns Validation result
   */
  public validateAIContext(messages: Message[]): {
    isValid: boolean;
    totalMessages: number;
    activeMessages: number;
    inactiveFiltered: number;
    hasActiveMessages: boolean;
  } {
    const validation = this.conversationContextService.validateFilteredContext(messages);

    return {
      isValid: validation.isValid,
      totalMessages: validation.totalMessages,
      activeMessages: validation.activeMessages,
      inactiveFiltered: validation.inactiveMessages,
      hasActiveMessages: validation.activeMessages > 0,
    };
  }

  /**
   * Gets the conversation context service for direct access.
   * @returns ConversationContextService instance
   */
  public getConversationContextService(): ConversationContextService {
    return this.conversationContextService;
  }

  /**
   * Gets the message formatter service for direct access.
   * @returns MessageFormatterService instance
   */
  public getMessageFormatterService(): MessageFormatterService {
    return this.messageFormatterService;
  }

  /**
   * Builds a system prompt from agent personality and configuration.
   * @param agent - Agent to build prompt from
   * @returns System prompt string
   */
  private buildSystemPromptFromAgent(agent: Agent): string {
    let prompt = `You are ${agent.name}`;

    if (agent.role) {
      prompt += `, a ${agent.role}`;
    }

    if (agent.personality) {
      prompt += `. ${agent.personality}`;
    }

    return prompt;
  }
}

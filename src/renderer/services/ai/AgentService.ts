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

  constructor(
    contextService: ConversationContextService,
    formatterService: MessageFormatterService,
  ) {
    this.conversationContextService = contextService;
    this.messageFormatterService = formatterService;
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
   * @throws {Error} When message retrieval fails or context preparation fails
   */
  public async prepareAIContextForConversation(
    conversationId: string,
    agent: Agent,
    getAllMessages: (conversationId: string) => Promise<Message[]>,
    config?: AgentConfig,
  ): Promise<AIContextResult> {
    try {
      const messages = await getAllMessages(conversationId);
      return this.prepareAIContext(messages, agent, config);
    } catch (error) {
      console.error(`Failed to prepare AI context for conversation ${conversationId}:`, error);
      throw new Error(
        `ContextPreparationError: Could not retrieve messages for conversation ${conversationId}. ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      );
    }
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
   * Builds a system prompt from agent personality and configuration.
   * Uses proper quoting and structure to prevent prompt injection attacks.
   * @param agent - Agent to build prompt from
   * @returns System prompt string with injection protection
   */
  private buildSystemPromptFromAgent(agent: Agent): string {
    // Sanitize input values to prevent injection
    const sanitizedName = this.sanitizePromptInput(agent.name);
    const sanitizedRole = agent.role ? this.sanitizePromptInput(agent.role) : null;
    const sanitizedPersonality = agent.personality
      ? this.sanitizePromptInput(agent.personality)
      : null;

    let prompt = `You are an AI assistant. Your assigned name is "${sanitizedName}".`;

    if (sanitizedRole) {
      prompt += ` Your role is: "${sanitizedRole}".`;
    }

    if (sanitizedPersonality) {
      prompt += ` Adhere to the following personality guidelines: "${sanitizedPersonality}".`;
    }

    return prompt;
  }

  /**
   * Sanitizes user input to prevent prompt injection attacks.
   * @param input - User input to sanitize
   * @returns Sanitized input safe for prompt inclusion
   */
  private sanitizePromptInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove or escape potentially dangerous characters
    return input
      .replace(/["\r\n\t]/g, ' ') // Remove quotes, newlines, and tabs
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .slice(0, 200); // Limit length to prevent excessively long inputs
  }
}

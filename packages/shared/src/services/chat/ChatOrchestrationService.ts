import { createLoggerSync } from "../../logging/createLoggerSync";
import type { SystemPromptFactory } from "../../prompts/system/SystemPromptFactory";
import type { ConversationAgentsRepository } from "../../repositories/conversationAgents/ConversationAgentsRepository";
import type { MessageRepository } from "../../repositories/messages/MessageRepository";
import type { PersistedAgentData } from "../../types/agents/PersistedAgentData";
import { LlmProviderError } from "../llm/errors/LlmProviderError";
import type { MessageFormatterService } from "../llm/services/MessageFormatterService";
import { ChatError, ErrorMapper } from "./errors";
import type { LlmBridgeInterface } from "./interfaces/LlmBridgeInterface";
import type {
  AgentContext,
  AgentProcessingResult,
  ProcessingResult,
} from "./types";
import type { AgentEventCallback } from "./types/AgentEventCallback";

/**
 * Core business logic service that coordinates message processing across multiple AI agents simultaneously.
 * Handles parallel LLM provider calls, context assembly, and response persistence.
 *
 * This service follows the established patterns:
 * - Constructor injection for platform-specific dependencies
 * - Structured logging with component metadata
 * - Promise.allSettled() for parallel agent processing
 * - Error handling patterns from existing services
 */
export class ChatOrchestrationService {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "ChatOrchestrationService" } },
  });

  constructor(
    private readonly llmBridge: LlmBridgeInterface,
    private readonly messageRepository: MessageRepository,
    private readonly conversationAgentsRepository: ConversationAgentsRepository,
    private readonly systemPromptFactory: SystemPromptFactory,
    private readonly messageFormatterService: MessageFormatterService,
    private readonly agentsResolver: (
      agentId: string,
    ) => Promise<PersistedAgentData>,
  ) {
    this.logger.info("ChatOrchestrationService initialized");
  }

  /**
   * Process a user message across all enabled agents in a conversation.
   * Coordinates parallel LLM calls and saves agent responses as they complete.
   *
   * @param conversationId - Conversation containing the user message
   * @param userMessageId - The user message to process
   * @returns Processing results with success/failure status for each agent
   */
  async processUserMessage(
    conversationId: string,
    userMessageId: string,
    eventCallback?: AgentEventCallback,
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    this.logger.info("Starting user message processing", {
      conversationId,
      userMessageId,
    });

    try {
      // Get all enabled agents for this conversation
      const enabledAgents =
        await this.conversationAgentsRepository.getEnabledByConversationId(
          conversationId,
        );

      // Early return if no agents are enabled
      if (enabledAgents.length === 0) {
        this.logger.info("No enabled agents found for conversation", {
          conversationId,
        });

        return {
          userMessageId,
          totalAgents: 0,
          successfulAgents: 0,
          failedAgents: 0,
          agentResults: [],
          totalDuration: Date.now() - startTime,
        };
      }

      this.logger.info(
        `Processing message with ${enabledAgents.length} enabled agents`,
        {
          conversationId,
          agentCount: enabledAgents.length,
        },
      );

      // Launch parallel agent processing
      const agentPromises = enabledAgents.map((conversationAgent) =>
        this.processAgentMessage(
          conversationId,
          userMessageId,
          conversationAgent.agent_id,
          conversationAgent.id,
          eventCallback,
        ).catch(
          (error) =>
            ({
              agentId: conversationAgent.agent_id,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
              duration: 0,
            }) as AgentProcessingResult,
        ),
      );

      // Wait for all agents to complete (success or failure)
      const settledResults = await Promise.allSettled(agentPromises);

      // Extract results from settled promises
      const agentResults: AgentProcessingResult[] = settledResults.map(
        (result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            // Handle promise rejection
            const agentId = enabledAgents[index]!.agent_id;
            return {
              agentId,
              success: false,
              error:
                result.reason instanceof Error
                  ? result.reason.message
                  : "Promise rejection",
              duration: 0,
            };
          }
        },
      );

      // Calculate summary statistics
      const successfulAgents = agentResults.filter((r) => r.success).length;
      const failedAgents = agentResults.filter((r) => !r.success).length;

      const result: ProcessingResult = {
        userMessageId,
        totalAgents: enabledAgents.length,
        successfulAgents,
        failedAgents,
        agentResults,
        totalDuration: Date.now() - startTime,
      };

      this.logger.info("User message processing completed", {
        conversationId,
        userMessageId,
        totalAgents: result.totalAgents,
        successfulAgents: result.successfulAgents,
        failedAgents: result.failedAgents,
        totalDuration: result.totalDuration,
      });

      return result;
    } catch (error) {
      this.logger.error(
        "Error during user message processing",
        error as Error,
        {
          conversationId,
          userMessageId,
        },
      );

      return {
        userMessageId,
        totalAgents: 0,
        successfulAgents: 0,
        failedAgents: 0,
        agentResults: [],
        totalDuration: Date.now() - startTime,
      };
    }
  }

  /**
   * Build agent-specific context for LLM processing.
   * Assembles system prompt and formatted message history for a target agent.
   *
   * @param conversationId - Conversation to build context for
   * @param agentId - Target agent ID for context assembly
   * @returns Agent context with system prompt and formatted messages
   */
  async buildAgentContext(
    conversationId: string,
    agentId: string,
  ): Promise<AgentContext> {
    try {
      this.logger.debug("Building agent context", { conversationId, agentId });

      // Get conversation messages (only included ones)
      const messages =
        await this.messageRepository.getByConversation(conversationId);
      const includedMessages = messages.filter((message) => message.included);

      // Resolve agent data
      const agent = await this.agentsResolver(agentId);

      // Get all agents in conversation for participant context
      const conversationAgents =
        await this.conversationAgentsRepository.findByConversationId(
          conversationId,
        );
      const participantAgentData = await Promise.all(
        conversationAgents
          .filter((ca) => ca.agent_id !== agentId) // Exclude target agent
          .map((ca) => this.agentsResolver(ca.agent_id)),
      );

      // Generate system prompt with participants
      const systemPrompt = await this.systemPromptFactory.createSystemPrompt(
        agent,
        participantAgentData,
      );

      // Build agent name mapping for message formatting
      const allParticipants = await Promise.all(
        conversationAgents.map((ca) => this.agentsResolver(ca.agent_id)),
      );
      const agentNameByConversationAgentId: Record<string, string> = {};

      conversationAgents.forEach((ca, index) => {
        const agentData = allParticipants[index];
        if (agentData) {
          agentNameByConversationAgentId[ca.id] = agentData.name;
        }
      });

      // Format messages for the target agent
      const formattedMessages = this.messageFormatterService.formatMessages(
        includedMessages,
        conversationAgents.find((ca) => ca.agent_id === agentId)?.id || "",
        agentNameByConversationAgentId,
      );

      // Check if we need to append a temporary continue message
      // This ensures the last message is from "user" role for API compliance
      const finalMessages = [...formattedMessages];
      if (
        formattedMessages.length > 0 &&
        formattedMessages[formattedMessages.length - 1]?.role === "assistant"
      ) {
        finalMessages.push({
          role: "user",
          content:
            "Continue the conversation. Please ignore this instruction in your response and respond naturally to the conversation.",
        });
      }

      const context: AgentContext = {
        systemPrompt,
        messages: finalMessages,
      };

      this.logger.debug("Agent context built successfully", {
        conversationId,
        agentId,
        messageCount: formattedMessages.length,
      });

      return context;
    } catch (error) {
      this.logger.error("Error building agent context", error as Error, {
        conversationId,
        agentId,
      });
      throw error;
    }
  }

  /**
   * Resolve agent name for user-friendly error messages
   */
  private async resolveAgentName(agentId: string): Promise<string> {
    try {
      const agent = await this.agentsResolver(agentId);
      return agent.name || `Agent ${agentId}`;
    } catch {
      return `Agent ${agentId}`;
    }
  }

  /**
   * Process a message for a single agent.
   * Builds context, calls LLM provider, and saves response.
   *
   * @param conversationId - Conversation ID
   * @param userMessageId - User message ID being processed
   * @param agentId - Target agent ID
   * @returns Agent processing result
   */
  // eslint-disable-next-line statement-count/function-statement-count-warn
  private async processAgentMessage(
    conversationId: string,
    userMessageId: string,
    agentId: string,
    conversationAgentId: string,
    eventCallback?: AgentEventCallback,
  ): Promise<AgentProcessingResult> {
    const startTime = Date.now();

    try {
      this.logger.debug("Processing agent message", {
        conversationId,
        userMessageId,
        agentId,
      });

      // Emit thinking event
      if (eventCallback) {
        const agentName = await this.resolveAgentName(agentId);
        eventCallback({
          conversationAgentId,
          status: "thinking",
          agentName,
        });
      }

      // Build agent context
      const context = await this.buildAgentContext(conversationId, agentId);

      // Resolve agent configuration
      const agent = await this.agentsResolver(agentId);

      // Send to LLM provider
      const response = await this.llmBridge.sendToProvider(
        { llmConfigId: agent.llmConfigId, model: agent.model },
        context,
      );

      // Find the conversation agent ID for this agent
      const conversationAgents =
        await this.conversationAgentsRepository.findByConversationId(
          conversationId,
        );
      const conversationAgent = conversationAgents.find(
        (ca) => ca.agent_id === agentId,
      );

      // Save agent response to database
      const savedMessage = await this.messageRepository.create({
        conversation_id: conversationId,
        conversation_agent_id: conversationAgent?.id,
        role: "agent",
        content: response,
        included: true,
      });

      const duration = Date.now() - startTime;

      this.logger.info("Agent message processed successfully", {
        conversationId,
        agentId,
        messageId: savedMessage.id,
        duration,
      });

      // Emit complete event
      if (eventCallback) {
        const agentName = await this.resolveAgentName(agentId);
        eventCallback({
          conversationAgentId,
          status: "complete",
          messageId: savedMessage.id,
          agentName,
        });
      }

      return {
        agentId,
        success: true,
        response,
        messageId: savedMessage.id,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Convert error to structured ChatError
      let chatError: ChatError;
      if (error instanceof LlmProviderError) {
        chatError = ErrorMapper.fromLlmProviderError(
          error,
          conversationId,
          agentId,
        );
      } else if (error instanceof Error) {
        chatError = ErrorMapper.fromGenericError(
          error,
          conversationId,
          agentId,
        );
      } else {
        chatError = ErrorMapper.fromGenericError(
          new Error("Unknown error occurred"),
          conversationId,
          agentId,
        );
      }

      // Resolve agent name for user-friendly error message
      const agentName = await this.resolveAgentName(agentId);
      const userFriendlyMessage = chatError.userMessage.replace(
        `Agent ${agentId}: `,
        `Agent ${agentName}: `,
      );

      // Persist error as system message
      try {
        await this.messageRepository.create({
          conversation_id: conversationId,
          conversation_agent_id: undefined, // System message
          role: "system",
          content: userFriendlyMessage,
          included: true,
        });
      } catch (messageError) {
        this.logger.error(
          "Failed to persist error system message",
          messageError as Error,
          {
            conversationId,
            agentId,
            originalError: chatError.technicalDetails,
          },
        );
      }

      // Enhanced structured logging
      this.logger.error("Agent message processing failed", error as Error, {
        conversationId,
        agentId,
        userMessageId,
        duration,
        errorType: chatError.type,
        errorCode: chatError.code,
        provider: chatError.provider,
        retryable: chatError.retryable,
        timestamp: chatError.timestamp,
      });

      // Emit error event
      if (eventCallback) {
        // Map ChatErrorType to simplified error type for IPC
        const errorTypeMap: Record<
          string,
          | "network"
          | "auth"
          | "rate_limit"
          | "validation"
          | "provider"
          | "timeout"
          | "unknown"
        > = {
          network_error: "network",
          auth_error: "auth",
          rate_limit_error: "rate_limit",
          validation_error: "validation",
          provider_error: "provider",
          timeout_error: "timeout",
          unknown_error: "unknown",
        };

        eventCallback({
          conversationAgentId,
          status: "error",
          error: userFriendlyMessage,
          agentName,
          errorType: errorTypeMap[chatError.type] || "unknown",
          retryable: chatError.retryable,
        });
      }

      return {
        agentId,
        success: false,
        error: userFriendlyMessage,
        duration,
      };
    }
  }
}

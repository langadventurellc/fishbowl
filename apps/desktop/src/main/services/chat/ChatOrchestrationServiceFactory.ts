import {
  ChatOrchestrationService,
  MessageFormatterService,
  SystemPromptFactory,
} from "@fishbowl-ai/shared";
import type { PersistedAgentData } from "@fishbowl-ai/shared";

import type { MainProcessServices } from "../MainProcessServices";
import { agentsRepositoryManager } from "../../../data/repositories/agentsRepositoryManager";
import { MainProcessLlmBridge } from "./MainProcessLlmBridge";
import { MainProcessSystemPromptResolvers } from "./MainProcessSystemPromptResolvers";

/**
 * Factory for creating ChatOrchestrationService instances with proper dependency injection.
 * Follows the established service factory pattern from MainProcessServices.
 */
export class ChatOrchestrationServiceFactory {
  /**
   * Create a ChatOrchestrationService instance with all dependencies injected.
   *
   * @param mainServices - MainProcessServices instance providing repositories
   * @returns Configured ChatOrchestrationService ready for use
   * @throws Error if required dependencies are not available
   */
  static create(mainServices: MainProcessServices): ChatOrchestrationService {
    try {
      // Create system prompt resolvers using repository managers
      const systemPromptResolvers = new MainProcessSystemPromptResolvers();

      // Create system prompt factory with resolvers and default template
      // TODO: Load template from configuration or use default
      const defaultTemplate = `
You are {{agentName}}, a {{roleName}}.

{{roleDescription}}

{{roleSystemPrompt}}

{{#if agentSystemPrompt}}
Additional instructions: {{agentSystemPrompt}}
{{/if}}

{{#if personalityCustomInstructions}}
Personality: {{personalityName}}
{{personalityCustomInstructions}}
{{/if}}

{{#if participants}}
{{participants}}
{{/if}}

{{#if behaviors.personalityBehaviors}}
Behavioral Guidelines:
{{#each behaviors.personalityBehaviors}}
- {{@key}}: {{this}}
{{/each}}
{{/if}}

{{#if behaviors.agentOverrides}}
Agent-specific Behavioral Overrides:
{{#each behaviors.agentOverrides}}
- {{@key}}: {{this}}
{{/each}}
{{/if}}

Respond naturally and stay in character as {{agentName}}.
      `.trim();

      const systemPromptFactory = new SystemPromptFactory(
        systemPromptResolvers,
        defaultTemplate,
        mainServices.logger,
      );

      // Create message formatter service
      const messageFormatterService = new MessageFormatterService();

      // Create LLM bridge for main process
      const llmBridge = new MainProcessLlmBridge();

      // Create agents resolver function using agents repository manager
      const agentsResolver = async (
        agentId: string,
      ): Promise<PersistedAgentData> => {
        const agentsRepository = agentsRepositoryManager.get();
        const agentsData = await agentsRepository.loadAgents();

        // Find the specific agent by ID
        const agent = agentsData.agents?.find(
          (a: PersistedAgentData) => a.id === agentId,
        );

        if (!agent) {
          throw new Error(`Agent not found: ${agentId}`);
        }

        return agent;
      };

      // Create and return ChatOrchestrationService with all dependencies
      return new ChatOrchestrationService(
        llmBridge,
        mainServices.messagesRepository,
        mainServices.conversationAgentsRepository,
        systemPromptFactory,
        messageFormatterService,
        agentsResolver,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to create ChatOrchestrationService: ${errorMessage}`,
      );
    }
  }
}

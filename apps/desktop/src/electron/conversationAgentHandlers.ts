import { ipcMain } from "electron";
import {
  CONVERSATION_AGENT_CHANNELS,
  type ConversationAgentGetByConversationRequest,
  type ConversationAgentAddRequest,
  type ConversationAgentRemoveRequest,
  type ConversationAgentListRequest,
  type ConversationAgentGetByConversationResponse,
  type ConversationAgentAddResponse,
  type ConversationAgentRemoveResponse,
  type ConversationAgentListResponse,
} from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import type { MainProcessServices } from "../main/services/MainProcessServices";
import { createLoggerSync } from "@fishbowl-ai/shared";
import type { ConversationAgent } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "ConversationAgentHandlers" } },
});

export function setupConversationAgentHandlers(
  mainServices: MainProcessServices,
): void {
  ipcMain.handle(
    CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
    async (
      _event,
      request: ConversationAgentGetByConversationRequest,
    ): Promise<ConversationAgentGetByConversationResponse> => {
      logger.debug("Getting conversation agents", {
        conversationId: request.conversationId,
      });
      try {
        const agents =
          await mainServices.conversationAgentsRepository.findByConversationId(
            request.conversationId,
          );
        logger.debug("Conversation agents retrieved successfully", {
          conversationId: request.conversationId,
          count: agents.length,
        });
        return { success: true, data: agents };
      } catch (error) {
        logger.error("Failed to get conversation agents", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  ipcMain.handle(
    CONVERSATION_AGENT_CHANNELS.ADD,
    async (
      _event,
      request: ConversationAgentAddRequest,
    ): Promise<ConversationAgentAddResponse> => {
      logger.debug("Adding agent to conversation", {
        conversationId: request.conversation_id,
        agentId: request.agent_id,
      });
      try {
        const agent =
          await mainServices.conversationAgentsRepository.create(request);
        logger.debug("Agent added to conversation successfully", {
          id: agent.id,
          conversationId: agent.conversation_id,
          agentId: agent.agent_id,
        });
        return { success: true, data: agent };
      } catch (error) {
        logger.error("Failed to add agent to conversation", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  ipcMain.handle(
    CONVERSATION_AGENT_CHANNELS.REMOVE,
    async (
      _event,
      request: ConversationAgentRemoveRequest,
    ): Promise<ConversationAgentRemoveResponse> => {
      logger.debug("Removing agent from conversation", {
        conversationId: request.conversation_id,
        agentId: request.agent_id,
      });
      try {
        // Find the conversation agent by conversation_id and agent_id
        const agents =
          await mainServices.conversationAgentsRepository.findByConversationId(
            request.conversation_id,
          );
        const targetAgent = agents.find(
          (agent) => agent.agent_id === request.agent_id,
        );

        if (!targetAgent) {
          logger.debug("Agent not found in conversation", {
            conversationId: request.conversation_id,
            agentId: request.agent_id,
          });
          return { success: true, data: false };
        }

        // Delete the conversation agent
        await mainServices.conversationAgentsRepository.delete(targetAgent.id);
        logger.debug("Agent removed from conversation successfully", {
          conversationAgentId: targetAgent.id,
          conversationId: request.conversation_id,
          agentId: request.agent_id,
        });
        return { success: true, data: true };
      } catch (error) {
        logger.error(
          "Failed to remove agent from conversation",
          error as Error,
        );
        return { success: false, error: serializeError(error) };
      }
    },
  );

  ipcMain.handle(
    CONVERSATION_AGENT_CHANNELS.LIST,
    async (
      _event,
      _request: ConversationAgentListRequest,
    ): Promise<ConversationAgentListResponse> => {
      logger.debug("Listing all conversation agents");
      try {
        // For debugging, we'll need to get all conversation agents
        // Note: Repository doesn't have a direct "listAll" method
        // TODO: Add listAll method to ConversationAgentsRepository for debugging
        const agents: ConversationAgent[] = [];
        logger.debug("All conversation agents listed successfully", {
          count: agents.length,
        });
        return { success: true, data: agents };
      } catch (error) {
        logger.error("Failed to list all conversation agents", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("Conversation agent IPC handlers initialized");
}

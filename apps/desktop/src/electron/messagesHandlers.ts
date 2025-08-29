import { ipcMain } from "electron";
import {
  MESSAGES_CHANNELS,
  type MessagesListRequest,
  type MessagesCreateRequest,
  type MessagesUpdateInclusionRequest,
  type MessagesListResponse,
  type MessagesCreateResponse,
  type MessagesUpdateInclusionResponse,
} from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import type { MainProcessServices } from "../main/services/MainProcessServices";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "messagesHandlers" } },
});

export function setupMessagesHandlers(mainServices: MainProcessServices): void {
  ipcMain.handle(
    MESSAGES_CHANNELS.LIST,
    async (
      _event,
      request: MessagesListRequest,
    ): Promise<MessagesListResponse> => {
      logger.debug("Listing messages for conversation", {
        conversationId: request.conversationId,
      });
      try {
        const messages =
          await mainServices.messagesRepository.getByConversation(
            request.conversationId,
          );
        logger.debug("Messages listed successfully", {
          count: messages.length,
          conversationId: request.conversationId,
        });
        return { success: true, data: messages };
      } catch (error) {
        logger.error("Failed to list messages", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  ipcMain.handle(
    MESSAGES_CHANNELS.CREATE,
    async (
      _event,
      request: MessagesCreateRequest,
    ): Promise<MessagesCreateResponse> => {
      logger.debug("Creating message", {
        conversationId: request.input.conversation_id,
        role: request.input.role,
      });
      try {
        const message = await mainServices.messagesRepository.create(
          request.input,
        );
        logger.debug("Message created successfully", {
          id: message.id,
          conversationId: message.conversation_id,
        });
        return { success: true, data: message };
      } catch (error) {
        logger.error("Failed to create message", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  ipcMain.handle(
    MESSAGES_CHANNELS.UPDATE_INCLUSION,
    async (
      _event,
      request: MessagesUpdateInclusionRequest,
    ): Promise<MessagesUpdateInclusionResponse> => {
      logger.debug("Updating message inclusion", {
        id: request.id,
        included: request.included,
      });

      try {
        const message = await mainServices.messagesRepository.updateInclusion(
          request.id,
          request.included,
        );
        logger.info("Message inclusion updated successfully", {
          id: request.id,
          included: request.included,
        });
        return { success: true, data: message };
      } catch (error) {
        logger.error("Failed to update message inclusion", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("Messages IPC handlers initialized");
}

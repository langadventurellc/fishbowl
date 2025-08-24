import { ipcMain } from "electron";
import {
  CONVERSATION_CHANNELS,
  type ConversationsCreateRequest,
  type ConversationsListRequest,
  type ConversationsGetRequest,
  type ConversationsCreateResponse,
  type ConversationsListResponse,
  type ConversationsGetResponse,
} from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import type { MainProcessServices } from "../main/services/MainProcessServices";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "conversationsHandlers" } },
});

export function setupConversationsHandlers(
  mainServices: MainProcessServices,
): void {
  ipcMain.handle(
    CONVERSATION_CHANNELS.CREATE,
    async (
      _event,
      request: ConversationsCreateRequest,
    ): Promise<ConversationsCreateResponse> => {
      logger.debug("Creating conversation", { title: request.title });
      try {
        const conversation =
          await mainServices.conversationsRepository.create(request);
        logger.debug("Conversation created successfully", {
          id: conversation.id,
        });
        return { success: true, data: conversation };
      } catch (error) {
        logger.error("Failed to create conversation", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  ipcMain.handle(
    CONVERSATION_CHANNELS.LIST,
    async (
      _event,
      _request: ConversationsListRequest,
    ): Promise<ConversationsListResponse> => {
      logger.debug("Listing conversations");
      try {
        const conversations = await mainServices.conversationsRepository.list();
        logger.debug("Conversations listed successfully", {
          count: conversations.length,
        });
        return { success: true, data: conversations };
      } catch (error) {
        logger.error("Failed to list conversations", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  ipcMain.handle(
    CONVERSATION_CHANNELS.GET,
    async (
      _event,
      request: ConversationsGetRequest,
    ): Promise<ConversationsGetResponse> => {
      logger.debug("Getting conversation", { id: request.id });

      try {
        const conversation = await mainServices.conversationsRepository.get(
          request.id,
        );
        logger.debug("Conversation retrieved successfully", { id: request.id });
        return { success: true, data: conversation };
      } catch (error) {
        logger.error("Failed to get conversation", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("Conversation IPC handlers initialized");
}

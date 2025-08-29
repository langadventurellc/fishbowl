import { ipcMain, webContents, type IpcMainInvokeEvent } from "electron";
import {
  CHAT_CHANNELS,
  CHAT_EVENTS,
  type SendToAgentsRequest,
  type AllCompleteEvent,
} from "../shared/ipc/index";
import type { MainProcessServices } from "../main/services/MainProcessServices";
import type { ProcessingResult } from "@fishbowl-ai/shared";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "chatHandlers" } },
});

/**
 * Emits all complete events to all renderer processes
 */
const emitAllComplete = (eventData: AllCompleteEvent): void => {
  webContents.getAllWebContents().forEach((contents) => {
    if (!contents.isDestroyed()) {
      contents.send(CHAT_EVENTS.ALL_COMPLETE, eventData);
    }
  });
};

/**
 * Validates the sendToAgents request parameters
 */
const validateSendToAgentsRequest = (request: SendToAgentsRequest): void => {
  if (!request.conversationId || typeof request.conversationId !== "string") {
    throw new Error("Invalid conversationId: must be a non-empty string");
  }

  if (!request.userMessageId || typeof request.userMessageId !== "string") {
    throw new Error("Invalid userMessageId: must be a non-empty string");
  }
};

/**
 * Handles the completion of chat orchestration processing
 */
const handleOrchestrationComplete = (
  conversationId: string,
  userMessageId: string,
) => {
  return (result: ProcessingResult) => {
    logger.info("Chat orchestration completed", {
      conversationId,
      userMessageId,
      totalAgents: result.totalAgents,
      successfulAgents: result.successfulAgents,
      failedAgents: result.failedAgents,
      totalDuration: result.totalDuration,
    });

    emitAllComplete({ conversationId });
  };
};

/**
 * Handles chat orchestration errors
 */
const handleOrchestrationError = (
  conversationId: string,
  userMessageId: string,
) => {
  return (error: Error) => {
    logger.error("Chat orchestration failed", error, {
      conversationId,
      userMessageId,
    });

    // Still emit all complete event even on failure
    emitAllComplete({ conversationId });
  };
};

/**
 * Processes the user message asynchronously using fire-and-forget pattern
 */
const processUserMessageAsync = (
  services: MainProcessServices,
  request: SendToAgentsRequest,
): void => {
  services.chatOrchestrationService
    .processUserMessage(request.conversationId, request.userMessageId)
    .then(
      handleOrchestrationComplete(
        request.conversationId,
        request.userMessageId,
      ),
    )
    .catch(
      handleOrchestrationError(request.conversationId, request.userMessageId),
    );
};

/**
 * Handles sendToAgents IPC requests
 */
const handleSendToAgents = (services: MainProcessServices) => {
  return async (
    event: IpcMainInvokeEvent,
    request: SendToAgentsRequest,
  ): Promise<void> => {
    logger.debug("Processing sendToAgents request", {
      conversationId: request.conversationId,
      userMessageId: request.userMessageId,
    });

    try {
      // Input validation
      validateSendToAgentsRequest(request);

      // Process the user message asynchronously (fire-and-forget)
      processUserMessageAsync(services, request);

      logger.debug("SendToAgents request initiated successfully", {
        conversationId: request.conversationId,
        userMessageId: request.userMessageId,
      });

      // Return immediately - fire-and-forget pattern
      return;
    } catch (error) {
      logger.error("Failed to process sendToAgents request", error as Error, {
        conversationId: request.conversationId,
        userMessageId: request.userMessageId,
      });

      // Re-throw to let IPC handle the error response
      throw error;
    }
  };
};

/**
 * Setup IPC handlers for chat operations
 */
export function setupChatHandlers(services: MainProcessServices): void {
  ipcMain.handle(CHAT_CHANNELS.SEND_TO_AGENTS, handleSendToAgents(services));
  logger.info("Chat IPC handlers initialized");
}

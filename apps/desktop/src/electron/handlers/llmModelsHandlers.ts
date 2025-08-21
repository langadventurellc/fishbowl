import type { IpcMain, IpcMainInvokeEvent } from "electron";
import {
  LLM_MODELS_CHANNELS,
  type LlmModelsLoadResponse,
  type LlmModelsSaveRequest,
  type LlmModelsSaveResponse,
  type LlmModelsResetResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import { llmModelsRepositoryManager } from "../../data/repositories/llmModelsRepositoryManager";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "llmModelsHandlers" } },
});

export function setupLlmModelsHandlers(ipcMain: IpcMain): void {
  // Handler for loading LLM models
  ipcMain.handle(
    LLM_MODELS_CHANNELS.LOAD,
    async (_event: IpcMainInvokeEvent): Promise<LlmModelsLoadResponse> => {
      try {
        logger.debug("Loading LLM models");

        const repository = llmModelsRepositoryManager.get();
        const llmModels = await repository.loadLlmModels();

        logger.debug("LLM models loaded successfully", {
          providersCount: llmModels?.providers?.length || 0,
        });
        return { success: true, data: llmModels };
      } catch (error) {
        logger.error("Failed to load LLM models", error as Error);
        return {
          success: false,
          error: serializeError(error),
        };
      }
    },
  );

  // Handler for saving LLM models
  ipcMain.handle(
    LLM_MODELS_CHANNELS.SAVE,
    async (
      _event: IpcMainInvokeEvent,
      request: LlmModelsSaveRequest,
    ): Promise<LlmModelsSaveResponse> => {
      try {
        logger.debug("Saving LLM models", {
          providersCount: request.llmModels?.providers?.length || 0,
        });

        const repository = llmModelsRepositoryManager.get();
        await repository.saveLlmModels(request.llmModels);

        logger.debug("LLM models saved successfully");
        return { success: true };
      } catch (error) {
        logger.error("Failed to save LLM models", error as Error);
        return {
          success: false,
          error: serializeError(error),
        };
      }
    },
  );

  // Handler for resetting LLM models
  ipcMain.handle(
    LLM_MODELS_CHANNELS.RESET,
    async (_event: IpcMainInvokeEvent): Promise<LlmModelsResetResponse> => {
      try {
        logger.debug("Resetting LLM models");

        const repository = llmModelsRepositoryManager.get();
        await repository.resetLlmModels();

        // After reset, load and return the default models
        const defaultLlmModels = await repository.loadLlmModels();

        logger.debug("LLM models reset successfully");
        return { success: true, data: defaultLlmModels };
      } catch (error) {
        logger.error("Failed to reset LLM models", error as Error);
        return {
          success: false,
          error: serializeError(error),
        };
      }
    },
  );

  logger.info("LLM models IPC handlers initialized");
}

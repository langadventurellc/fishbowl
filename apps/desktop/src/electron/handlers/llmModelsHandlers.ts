import type { IpcMain, IpcMainInvokeEvent } from "electron";
import {
  LLM_MODELS_CHANNELS,
  type LlmModelsLoadResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import { llmModelsRepositoryManager } from "../../data/repositories/llmModelsRepositoryManager";

export function setupLlmModelsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    LLM_MODELS_CHANNELS.LOAD,
    async (_event: IpcMainInvokeEvent): Promise<LlmModelsLoadResponse> => {
      try {
        const repository = llmModelsRepositoryManager.get();
        const llmModels = await repository.loadLlmModels();
        return { success: true, data: llmModels };
      } catch (error) {
        console.error("Failed to load LLM models:", error);
        return {
          success: false,
          error: serializeError(error),
        };
      }
    },
  );
}

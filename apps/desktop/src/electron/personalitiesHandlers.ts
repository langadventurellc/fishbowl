import { ipcMain } from "electron";
import {
  PERSONALITIES_CHANNELS,
  type PersonalitiesLoadResponse,
  type PersonalitiesSaveRequest,
  type PersonalitiesSaveResponse,
  type PersonalitiesResetResponse,
} from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import { personalitiesRepositoryManager } from "../data/repositories/personalitiesRepositoryManager";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "personalitiesHandlers" } },
});

/**
 * Sets up IPC handlers for personalities operations
 * Registers handlers for load, save, and reset operations using PersonalitiesRepository
 */
export function setupPersonalitiesHandlers(): void {
  // Handler for loading personalities
  ipcMain.handle(
    PERSONALITIES_CHANNELS.LOAD,
    async (_event): Promise<PersonalitiesLoadResponse> => {
      try {
        logger.debug("Loading personalities");

        const repository = personalitiesRepositoryManager.get();
        const personalities = await repository.loadPersonalities();

        logger.debug("Personalities loaded successfully", {
          personalityCount: personalities.personalities?.length || 0,
        });
        return { success: true, data: personalities };
      } catch (error) {
        logger.error("Failed to load personalities", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for saving personalities
  ipcMain.handle(
    PERSONALITIES_CHANNELS.SAVE,
    async (
      _event,
      request: PersonalitiesSaveRequest,
    ): Promise<PersonalitiesSaveResponse> => {
      try {
        logger.debug("Saving personalities", {
          personalityCount: request.personalities?.personalities?.length || 0,
        });

        const repository = personalitiesRepositoryManager.get();
        await repository.savePersonalities(request.personalities);

        logger.debug("Personalities saved successfully");
        return { success: true };
      } catch (error) {
        logger.error("Failed to save personalities", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for resetting personalities
  ipcMain.handle(
    PERSONALITIES_CHANNELS.RESET,
    async (_event): Promise<PersonalitiesResetResponse> => {
      try {
        logger.debug("Resetting personalities");

        const repository = personalitiesRepositoryManager.get();
        await repository.resetPersonalities();

        // After reset, return undefined to indicate empty state
        logger.debug("Personalities reset successfully");
        return { success: true, data: undefined };
      } catch (error) {
        logger.error("Failed to reset personalities", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("Personalities IPC handlers initialized");
}

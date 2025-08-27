import { ipcMain } from "electron";
import {
  PERSONALITY_DEFINITIONS_CHANNELS,
  type GetDefinitionsResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import { DesktopPersonalityDefinitionsService } from "../services/DesktopPersonalityDefinitionsService";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "personalityDefinitionsHandlers" } },
});

/**
 * Sets up IPC handlers for personality definitions operations
 * Registers handler for getting personality definitions using DesktopPersonalityDefinitionsService
 */
export function setupPersonalityDefinitionsHandlers(): void {
  // Handler for getting personality definitions
  ipcMain.handle(
    PERSONALITY_DEFINITIONS_CHANNELS.GET_DEFINITIONS,
    async (_event): Promise<GetDefinitionsResponse> => {
      try {
        logger.debug("Loading personality definitions");

        const service = DesktopPersonalityDefinitionsService.getInstance();
        const definitions = await service.loadDefinitions();

        logger.debug("Personality definitions loaded successfully", {
          sectionCount: definitions.sections?.length || 0,
        });
        return { success: true, data: definitions };
      } catch (error) {
        logger.error("Failed to load personality definitions", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("Personality definitions IPC handlers initialized");
}

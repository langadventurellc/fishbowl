import { ipcMain } from "electron";
import { AGENTS_CHANNELS, type AgentsLoadResponse } from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import { agentsRepositoryManager } from "../data/repositories/agentsRepositoryManager";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "agentsHandlers" } },
});

/**
 * Sets up IPC handlers for agents operations
 * Registers handlers for load operations using AgentsRepository
 */
export function setupAgentsHandlers(): void {
  // Handler for loading agents
  ipcMain.handle(
    AGENTS_CHANNELS.LOAD,
    async (_event): Promise<AgentsLoadResponse> => {
      try {
        logger.debug("Loading agents");

        const repository = agentsRepositoryManager.get();
        const agents = await repository.loadAgents();

        logger.debug("Agents loaded successfully", {
          agentCount: agents.agents?.length || 0,
        });
        return { success: true, data: agents };
      } catch (error) {
        logger.error("Failed to load agents", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("Agents IPC handlers initialized");
}

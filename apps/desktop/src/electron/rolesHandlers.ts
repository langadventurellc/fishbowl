import { ipcMain } from "electron";
import {
  ROLES_CHANNELS,
  type RolesLoadResponse,
  type RolesSaveRequest,
  type RolesSaveResponse,
  type RolesResetResponse,
} from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import { rolesRepositoryManager } from "../data/repositories/rolesRepositoryManager";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "rolesHandlers" } },
});

/**
 * Sets up IPC handlers for roles operations
 * Registers handlers for load, save, and reset operations using RolesRepository
 */
export function setupRolesHandlers(): void {
  // Handler for loading roles
  ipcMain.handle(
    ROLES_CHANNELS.LOAD,
    async (_event): Promise<RolesLoadResponse> => {
      try {
        logger.debug("Loading roles");

        const repository = rolesRepositoryManager.get();
        const roles = await repository.loadRoles();

        logger.debug("Roles loaded successfully", {
          roleCount: roles?.roles?.length || 0,
        });
        return { success: true, data: roles || undefined };
      } catch (error) {
        logger.error("Failed to load roles", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for saving roles
  ipcMain.handle(
    ROLES_CHANNELS.SAVE,
    async (_event, request: RolesSaveRequest): Promise<RolesSaveResponse> => {
      try {
        logger.debug("Saving roles", {
          roleCount: request.roles?.roles?.length || 0,
        });

        const repository = rolesRepositoryManager.get();
        await repository.saveRoles(request.roles);

        logger.debug("Roles saved successfully");
        return { success: true };
      } catch (error) {
        logger.error("Failed to save roles", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for resetting roles
  ipcMain.handle(
    ROLES_CHANNELS.RESET,
    async (_event): Promise<RolesResetResponse> => {
      try {
        logger.debug("Resetting roles");

        const repository = rolesRepositoryManager.get();
        await repository.resetRoles();

        // After reset, return undefined to indicate empty state
        logger.debug("Roles reset successfully");
        return { success: true, data: undefined };
      } catch (error) {
        logger.error("Failed to reset roles", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("Roles IPC handlers initialized");
}

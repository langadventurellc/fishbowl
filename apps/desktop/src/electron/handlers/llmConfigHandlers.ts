import { ipcMain } from "electron";
import {
  LLM_CONFIG_CHANNELS,
  type LlmConfigCreateRequest,
  type LlmConfigCreateResponse,
  type LlmConfigReadRequest,
  type LlmConfigReadResponse,
  type LlmConfigUpdateRequest,
  type LlmConfigUpdateResponse,
  type LlmConfigDeleteRequest,
  type LlmConfigDeleteResponse,
  type LlmConfigListRequest,
  type LlmConfigListResponse,
  type LlmConfigInitializeRequest,
  type LlmConfigInitializeResponse,
} from "../../shared/ipc/index";
import { serializeError } from "../utils/errorSerialization";
import { llmConfigServiceManager } from "../getLlmConfigService";
import type { LlmConfigServiceInterface } from "../services/LlmConfigServiceInterface";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "llmConfigHandlers" } },
});

/**
 * Sets up IPC handlers for LLM configuration operations
 * Registers handlers for create, read, update, delete, and list operations
 *
 * @param service - Optional LlmConfigService instance for dependency injection (used in tests)
 */
export function setupLlmConfigHandlers(
  service?: LlmConfigServiceInterface,
): void {
  // Handler for creating LLM configuration
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.CREATE,
    async (
      _event,
      request: LlmConfigCreateRequest,
    ): Promise<LlmConfigCreateResponse> => {
      try {
        logger.debug("Creating LLM configuration", {
          provider: request.config.provider,
        });

        // Validate request structure
        if (!request.config) {
          throw new Error("Configuration input is required");
        }

        const configService = service || llmConfigServiceManager.get();
        const createdConfig = await configService.create(request.config);

        logger.debug("LLM configuration created successfully", {
          configId: createdConfig.id,
        });
        return { success: true, data: createdConfig };
      } catch (error) {
        logger.error("Failed to create LLM configuration", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for reading LLM configuration
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.READ,
    async (
      _event,
      request: LlmConfigReadRequest,
    ): Promise<LlmConfigReadResponse> => {
      try {
        logger.debug("Reading LLM configuration", { configId: request.id });

        if (!request.id) {
          throw new Error("Configuration ID is required");
        }

        const configService = service || llmConfigServiceManager.get();
        const config = await configService.read(request.id);

        if (!config) {
          logger.debug("LLM configuration not found", { configId: request.id });
          return { success: true, data: null };
        }

        logger.debug("LLM configuration read successfully", {
          configId: request.id,
        });
        return { success: true, data: config };
      } catch (error) {
        logger.error("Failed to read LLM configuration", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for updating LLM configuration
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.UPDATE,
    async (
      _event,
      request: LlmConfigUpdateRequest,
    ): Promise<LlmConfigUpdateResponse> => {
      try {
        logger.debug("Updating LLM configuration", {
          configId: request.id,
          hasUpdates: Object.keys(request.updates).length > 0,
        });

        if (!request.id) {
          throw new Error("Configuration ID is required");
        }

        const configService = service || llmConfigServiceManager.get();
        const updatedConfig = await configService.update(
          request.id,
          request.updates,
        );

        logger.debug("LLM configuration updated successfully", {
          configId: request.id,
        });
        return { success: true, data: updatedConfig };
      } catch (error) {
        logger.error("Failed to update LLM configuration", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for deleting LLM configuration
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.DELETE,
    async (
      _event,
      request: LlmConfigDeleteRequest,
    ): Promise<LlmConfigDeleteResponse> => {
      try {
        logger.debug("Deleting LLM configuration", { configId: request.id });

        if (!request.id) {
          throw new Error("Configuration ID is required");
        }

        const configService = service || llmConfigServiceManager.get();
        await configService.delete(request.id);

        logger.debug("LLM configuration deleted successfully", {
          configId: request.id,
        });
        return { success: true };
      } catch (error) {
        logger.error("Failed to delete LLM configuration", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for listing LLM configurations
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.LIST,
    async (
      _event,
      _request: LlmConfigListRequest,
    ): Promise<LlmConfigListResponse> => {
      try {
        logger.debug("Listing LLM configurations");

        const configService = service || llmConfigServiceManager.get();
        const configs = await configService.list();

        logger.debug("LLM configurations listed successfully", {
          count: configs.length,
        });
        return { success: true, data: configs };
      } catch (error) {
        logger.error("Failed to list LLM configurations", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for initializing LLM configuration service
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.INITIALIZE,
    async (
      _event,
      _request: LlmConfigInitializeRequest,
    ): Promise<LlmConfigInitializeResponse> => {
      try {
        logger.debug("Initializing LLM configuration service");

        const configService = service || llmConfigServiceManager.get();
        await configService.initialize();

        logger.debug("LLM configuration service initialized successfully");
        return { success: true };
      } catch (error) {
        logger.error(
          "Failed to initialize LLM configuration service",
          error as Error,
        );
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("LLM configuration IPC handlers initialized");
}

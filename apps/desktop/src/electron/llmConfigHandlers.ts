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
} from "../shared/ipc/index.js";
import { serializeError } from "./utils/errorSerialization.js";
import { llmStorageServiceManager } from "./getLlmStorageService.js";
import { createLoggerSync, llmConfigInputSchema } from "@fishbowl-ai/shared";
import { z } from "zod";

const logger = createLoggerSync({
  context: { metadata: { component: "llmConfigHandlers" } },
});

const uuidSchema = z.string().uuid();

/**
 * Sets up IPC handlers for LLM configuration operations
 * Registers handlers for create, read, update, delete, and list operations
 */
export function setupLlmConfigHandlers(): void {
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

        // Validate input
        const validatedInput = llmConfigInputSchema.parse(request.config);

        const service = llmStorageServiceManager.get();
        const createdConfig = await service.repository.create(validatedInput);

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

        // Validate UUID format
        uuidSchema.parse(request.id);

        const service = llmStorageServiceManager.get();
        const config = await service.repository.read(request.id);

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

        // Validate UUID format
        uuidSchema.parse(request.id);

        // Validate updates if provided
        if (Object.keys(request.updates).length > 0) {
          llmConfigInputSchema.partial().parse(request.updates);
        }

        const service = llmStorageServiceManager.get();
        const updatedConfig = await service.repository.update(
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

        // Validate UUID format
        uuidSchema.parse(request.id);

        const service = llmStorageServiceManager.get();
        await service.repository.delete(request.id);

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

        const service = llmStorageServiceManager.get();
        const configs = await service.repository.list();

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

  logger.info("LLM configuration IPC handlers initialized");
}

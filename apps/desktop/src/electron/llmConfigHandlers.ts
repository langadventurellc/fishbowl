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
} from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import { llmStorageServiceManager } from "./getLlmStorageService";
import { LlmStorageService } from "./services/LlmStorageService";
import { createLoggerSync, llmConfigInputSchema } from "@fishbowl-ai/shared";
import { z } from "zod";

const logger = createLoggerSync({
  context: { metadata: { component: "llmConfigHandlers" } },
});

const uuidSchema = z.string().uuid();

/**
 * Sets up IPC handlers for LLM configuration operations
 * Registers handlers for create, read, update, delete, and list operations
 *
 * @param service - Optional storage service instance for dependency injection (used in tests)
 */
export function setupLlmConfigHandlers(service?: LlmStorageService): void {
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

        const storageService = service || llmStorageServiceManager.get();
        const createdConfig =
          await storageService.repository.create(validatedInput);

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

        const storageService = service || llmStorageServiceManager.get();
        const config = await storageService.repository.read(request.id);

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

        const storageService = service || llmStorageServiceManager.get();
        const updatedConfig = await storageService.repository.update(
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

        const storageService = service || llmStorageServiceManager.get();
        await storageService.repository.delete(request.id);

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

        const storageService = service || llmStorageServiceManager.get();
        const configs = await storageService.repository.list();

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

        // Get or create the storage service instance (initialization happens in constructor)
        const storageService = service || llmStorageServiceManager.get();

        // Verify secure storage is available
        const isSecureStorageAvailable =
          storageService.isSecureStorageAvailable();
        if (!isSecureStorageAvailable) {
          logger.warn("Secure storage is not available for API key encryption");
        }

        logger.debug("LLM configuration service initialized successfully", {
          secureStorageAvailable: isSecureStorageAvailable,
        });
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

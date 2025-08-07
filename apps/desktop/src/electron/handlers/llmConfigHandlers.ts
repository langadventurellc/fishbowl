import type { IpcMain } from "electron";
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
import type { LlmConfigServiceInterface } from "../services/LlmConfigServiceInterface";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "llmConfigHandlers" } },
});

/**
 * Validate create request structure
 */
function validateCreateRequest(request: LlmConfigCreateRequest): void {
  if (!request) {
    throw new Error("Request is required");
  }
  if (!request.config) {
    throw new Error("Configuration input is required");
  }
}

/**
 * Validate read request structure
 */
function validateReadRequest(request: LlmConfigReadRequest): void {
  if (!request) {
    throw new Error("Request is required");
  }
  if (!request.id) {
    throw new Error("Configuration ID is required");
  }
}

/**
 * Validate update request structure
 */
function validateUpdateRequest(request: LlmConfigUpdateRequest): void {
  if (!request) {
    throw new Error("Request is required");
  }
  if (!request.id) {
    throw new Error("Configuration ID is required");
  }
}

/**
 * Validate delete request structure
 */
function validateDeleteRequest(request: LlmConfigDeleteRequest): void {
  if (!request) {
    throw new Error("Request is required");
  }
  if (!request.id) {
    throw new Error("Configuration ID is required");
  }
}

/**
 * Register create handler with ipcMain
 */
function registerCreateHandler(
  ipcMain: IpcMain,
  service: LlmConfigServiceInterface,
): void {
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.CREATE,
    async (
      _event,
      request: LlmConfigCreateRequest,
    ): Promise<LlmConfigCreateResponse> => {
      try {
        validateCreateRequest(request);

        logger.debug("Creating LLM configuration", {
          provider: request.config?.provider,
        });

        const createdConfig = await service.create(request.config);

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
}

/**
 * Register read handler with ipcMain
 */
function registerReadHandler(
  ipcMain: IpcMain,
  service: LlmConfigServiceInterface,
): void {
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.READ,
    async (
      _event,
      request: LlmConfigReadRequest,
    ): Promise<LlmConfigReadResponse> => {
      try {
        logger.debug("Reading LLM configuration", { configId: request.id });

        validateReadRequest(request);

        const config = await service.read(request.id);

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
}

/**
 * Register update handler with ipcMain
 */
function registerUpdateHandler(
  ipcMain: IpcMain,
  service: LlmConfigServiceInterface,
): void {
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.UPDATE,
    async (
      _event,
      request: LlmConfigUpdateRequest,
    ): Promise<LlmConfigUpdateResponse> => {
      try {
        logger.debug("Updating LLM configuration", {
          configId: request.id,
          hasUpdates: Object.keys(request.updates || {}).length > 0,
        });

        validateUpdateRequest(request);

        const updatedConfig = await service.update(request.id, request.updates);

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
}

/**
 * Register delete handler with ipcMain
 */
function registerDeleteHandler(
  ipcMain: IpcMain,
  service: LlmConfigServiceInterface,
): void {
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.DELETE,
    async (
      _event,
      request: LlmConfigDeleteRequest,
    ): Promise<LlmConfigDeleteResponse> => {
      try {
        logger.debug("Deleting LLM configuration", { configId: request.id });

        validateDeleteRequest(request);

        await service.delete(request.id);

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
}

/**
 * Register list handler with ipcMain
 */
function registerListHandler(
  ipcMain: IpcMain,
  service: LlmConfigServiceInterface,
): void {
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.LIST,
    async (
      _event,
      _request: LlmConfigListRequest,
    ): Promise<LlmConfigListResponse> => {
      try {
        logger.debug("Listing LLM configurations");

        const configs = await service.list();

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
}

/**
 * Register initialize handler with ipcMain
 */
function registerInitializeHandler(
  ipcMain: IpcMain,
  service: LlmConfigServiceInterface,
): void {
  ipcMain.handle(
    LLM_CONFIG_CHANNELS.INITIALIZE,
    async (
      _event,
      _request: LlmConfigInitializeRequest,
    ): Promise<LlmConfigInitializeResponse> => {
      try {
        logger.debug("Initializing LLM configuration service");

        await service.initialize();

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
}

/**
 * Sets up IPC handlers for LLM configuration operations
 * Registers handlers for create, read, update, delete, list, and initialize operations
 *
 * @param ipcMain - Electron's IpcMain instance
 * @param service - LlmConfigService instance for handling operations
 */
export function setupLlmConfigHandlers(
  ipcMain: IpcMain,
  service: LlmConfigServiceInterface,
): void {
  // Validate inputs
  if (!ipcMain) {
    throw new Error("IpcMain instance is required");
  }
  if (!service) {
    throw new Error("LlmConfigService instance is required");
  }

  // Register all handlers
  registerCreateHandler(ipcMain, service);
  registerReadHandler(ipcMain, service);
  registerUpdateHandler(ipcMain, service);
  registerDeleteHandler(ipcMain, service);
  registerListHandler(ipcMain, service);
  registerInitializeHandler(ipcMain, service);

  logger.info("LLM configuration IPC handlers registered successfully");
}

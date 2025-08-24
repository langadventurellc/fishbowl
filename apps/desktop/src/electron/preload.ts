import { contextBridge, ipcRenderer } from "electron";
import { createLoggerSync } from "@fishbowl-ai/shared";
import type { ElectronAPI } from "../types/electron";

const logger = createLoggerSync({ config: { name: "preload", level: "info" } });
import { SETTINGS_CHANNELS } from "../shared/ipc/constants";
import { LLM_CONFIG_CHANNELS } from "../shared/ipc/llmConfigConstants";
import { LLM_MODELS_CHANNELS } from "../shared/ipc/llmModelsConstants";
import { ROLES_CHANNELS } from "../shared/ipc/rolesConstants";
import { PERSONALITIES_CHANNELS } from "../shared/ipc/personalitiesConstants";
import { AGENTS_CHANNELS } from "../shared/ipc/agentsConstants";
import { CONVERSATION_CHANNELS } from "../shared/ipc/conversationsConstants";
import type {
  SettingsLoadResponse,
  SettingsSaveRequest,
  SettingsSaveResponse,
  SettingsResetResponse,
  LlmConfigCreateRequest,
  LlmConfigCreateResponse,
  LlmConfigReadRequest,
  LlmConfigReadResponse,
  LlmConfigUpdateRequest,
  LlmConfigUpdateResponse,
  LlmConfigDeleteRequest,
  LlmConfigDeleteResponse,
  LlmConfigListResponse,
  LlmConfigRefreshCacheRequest,
  LlmConfigRefreshCacheResponse,
  RolesLoadResponse,
  RolesSaveRequest,
  RolesSaveResponse,
  RolesResetResponse,
  PersonalitiesLoadResponse,
  PersonalitiesSaveRequest,
  PersonalitiesSaveResponse,
  PersonalitiesResetResponse,
  LlmModelsLoadResponse,
  AgentsLoadResponse,
  AgentsSaveRequest,
  AgentsSaveResponse,
  AgentsResetResponse,
  ConversationsCreateRequest,
  ConversationsCreateResponse,
  ConversationsListResponse,
  ConversationsGetRequest,
  ConversationsGetResponse,
} from "../shared/ipc/index";
import type {
  PersistedSettingsData,
  PersistedRolesSettingsData,
  PersistedPersonalitiesSettingsData,
  PersistedLlmModelsSettingsData,
  PersistedAgentsSettingsData,
  LlmConfig,
  LlmConfigInput,
  LlmConfigMetadata,
  Conversation,
} from "@fishbowl-ai/shared";
import type { SettingsCategory } from "@fishbowl-ai/ui-shared";

const electronAPI: ElectronAPI = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  onOpenSettings: (callback: () => void) => {
    try {
      // Create a wrapped callback to prevent event object exposure
      const wrappedCallback = () => {
        try {
          callback();
        } catch (error) {
          logger.error(
            "Error in settings callback:",
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      };

      // Register the IPC listener with the wrapped callback
      ipcRenderer.on("open-settings", wrappedCallback);

      // Return cleanup function for memory management
      return () => {
        try {
          ipcRenderer.removeListener("open-settings", wrappedCallback);
        } catch (error) {
          logger.error(
            "Error removing IPC listener:",
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      };
    } catch (error) {
      logger.error(
        "Error setting up IPC listener:",
        error instanceof Error ? error : new Error(String(error)),
      );
      // Return no-op cleanup function if setup fails
      return () => {};
    }
  },
  removeAllListeners: (channel: string) => {
    try {
      ipcRenderer.removeAllListeners(channel);
    } catch (error) {
      logger.error(
        `Error removing all listeners for channel ${channel}`,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  },
  settings: {
    load: async (): Promise<PersistedSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          SETTINGS_CHANNELS.LOAD,
        )) as SettingsLoadResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to load settings");
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error loading settings:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    save: async (
      settings: Partial<PersistedSettingsData>,
      section?: SettingsCategory,
    ): Promise<void> => {
      try {
        const request: SettingsSaveRequest = { settings, section };
        const response = (await ipcRenderer.invoke(
          SETTINGS_CHANNELS.SAVE,
          request,
        )) as SettingsSaveResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to save settings");
        }
      } catch (error) {
        logger.error(
          "Error saving settings:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    reset: async (): Promise<PersistedSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          SETTINGS_CHANNELS.RESET,
        )) as SettingsResetResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to reset settings",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error resetting settings:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    setDebugLogging: async (enabled: boolean): Promise<void> => {
      try {
        await ipcRenderer.invoke(SETTINGS_CHANNELS.SET_DEBUG_LOGGING, enabled);
      } catch (error) {
        logger.error(
          "Error setting debug logging:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
  llmConfig: {
    create: async (config: LlmConfigInput): Promise<LlmConfig> => {
      try {
        const request: LlmConfigCreateRequest = { config };
        const response = (await ipcRenderer.invoke(
          LLM_CONFIG_CHANNELS.CREATE,
          request,
        )) as LlmConfigCreateResponse;
        if (!response.success) {
          // Handle validation errors with detailed messages
          if (response.error?.code === "VALIDATION_ERROR") {
            const validationError = new Error(response.error.message);
            validationError.name = "ValidationError";
            throw validationError;
          }

          throw new Error(
            response.error?.message || "Failed to create LLM configuration",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error creating LLM configuration:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    read: async (id: string): Promise<LlmConfig | null> => {
      try {
        const request: LlmConfigReadRequest = { id };
        const response = (await ipcRenderer.invoke(
          LLM_CONFIG_CHANNELS.READ,
          request,
        )) as LlmConfigReadResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to read LLM configuration",
          );
        }
        return response.data || null;
      } catch (error) {
        logger.error(
          "Error reading LLM configuration:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    update: async (
      id: string,
      updates: Partial<LlmConfigInput>,
    ): Promise<LlmConfig> => {
      try {
        const request: LlmConfigUpdateRequest = { id, updates };
        const response = (await ipcRenderer.invoke(
          LLM_CONFIG_CHANNELS.UPDATE,
          request,
        )) as LlmConfigUpdateResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to update LLM configuration",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error updating LLM configuration:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        const request: LlmConfigDeleteRequest = { id };
        const response = (await ipcRenderer.invoke(
          LLM_CONFIG_CHANNELS.DELETE,
          request,
        )) as LlmConfigDeleteResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to delete LLM configuration",
          );
        }
      } catch (error) {
        logger.error(
          "Error deleting LLM configuration:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    list: async (): Promise<LlmConfigMetadata[]> => {
      try {
        const response = (await ipcRenderer.invoke(
          LLM_CONFIG_CHANNELS.LIST,
        )) as LlmConfigListResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to list LLM configurations",
          );
        }
        return response.data || [];
      } catch (error) {
        logger.error(
          "Error listing LLM configurations:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    refreshCache: async (): Promise<void> => {
      try {
        const request: LlmConfigRefreshCacheRequest = {};
        const response = (await ipcRenderer.invoke(
          LLM_CONFIG_CHANNELS.REFRESH_CACHE,
          request,
        )) as LlmConfigRefreshCacheResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message ||
              "Failed to refresh LLM configuration cache",
          );
        }
      } catch (error) {
        logger.error(
          "Error refreshing LLM configuration cache:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
  roles: {
    load: async (): Promise<PersistedRolesSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          ROLES_CHANNELS.LOAD,
        )) as RolesLoadResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to load roles");
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error loading roles:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    save: async (roles: PersistedRolesSettingsData): Promise<void> => {
      try {
        const request: RolesSaveRequest = { roles };
        const response = (await ipcRenderer.invoke(
          ROLES_CHANNELS.SAVE,
          request,
        )) as RolesSaveResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to save roles");
        }
      } catch (error) {
        logger.error(
          "Error saving roles:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    reset: async (): Promise<PersistedRolesSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          ROLES_CHANNELS.RESET,
        )) as RolesResetResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to reset roles");
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error resetting roles:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
  personalities: {
    load: async (): Promise<PersistedPersonalitiesSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          PERSONALITIES_CHANNELS.LOAD,
        )) as PersonalitiesLoadResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to load personalities",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error loading personalities:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    save: async (
      personalities: PersistedPersonalitiesSettingsData,
    ): Promise<void> => {
      try {
        const request: PersonalitiesSaveRequest = { personalities };
        const response = (await ipcRenderer.invoke(
          PERSONALITIES_CHANNELS.SAVE,
          request,
        )) as PersonalitiesSaveResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to save personalities",
          );
        }
      } catch (error) {
        logger.error(
          "Error saving personalities:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    reset: async (): Promise<PersistedPersonalitiesSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          PERSONALITIES_CHANNELS.RESET,
        )) as PersonalitiesResetResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to reset personalities",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error resetting personalities:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
  llmModels: {
    load: async (): Promise<PersistedLlmModelsSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          LLM_MODELS_CHANNELS.LOAD,
        )) as LlmModelsLoadResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to load LLM models",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error loading LLM models:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
  agents: {
    load: async (): Promise<PersistedAgentsSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          AGENTS_CHANNELS.LOAD,
        )) as AgentsLoadResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to load agents");
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error loading agents:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    save: async (agents: PersistedAgentsSettingsData): Promise<void> => {
      try {
        const request: AgentsSaveRequest = { agents };
        const response = (await ipcRenderer.invoke(
          AGENTS_CHANNELS.SAVE,
          request,
        )) as AgentsSaveResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to save agents");
        }
      } catch (error) {
        logger.error(
          "Error saving agents:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    reset: async (): Promise<PersistedAgentsSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          AGENTS_CHANNELS.RESET,
        )) as AgentsResetResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to reset agents");
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error resetting agents:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
  conversations: {
    create: async (title?: string): Promise<Conversation> => {
      try {
        const request: ConversationsCreateRequest = { title };
        const response = (await ipcRenderer.invoke(
          CONVERSATION_CHANNELS.CREATE,
          request,
        )) as ConversationsCreateResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to create conversation",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error creating conversation:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    list: async (): Promise<Conversation[]> => {
      try {
        const response = (await ipcRenderer.invoke(
          CONVERSATION_CHANNELS.LIST,
          {},
        )) as ConversationsListResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to list conversations",
          );
        }
        return response.data || [];
      } catch (error) {
        logger.error(
          "Error listing conversations:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    get: async (id: string): Promise<Conversation | null> => {
      try {
        const request: ConversationsGetRequest = { id };
        const response = (await ipcRenderer.invoke(
          CONVERSATION_CHANNELS.GET,
          request,
        )) as ConversationsGetResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to get conversation",
          );
        }
        return response.data || null;
      } catch (error) {
        logger.error(
          "Error getting conversation:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

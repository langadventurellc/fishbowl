/**
 * Zustand store for agents management with CRUD operations.
 *
 * Provides reactive state management for user-created agents with
 * comprehensive validation, error handling, and persistence integration.
 *
 * @module stores/agentsStore
 */

import type {
  PersistedAgentsSettingsData,
  StructuredLogger,
} from "@fishbowl-ai/shared";
import { ConsoleLogger } from "@fishbowl-ai/shared";
import { create } from "zustand";
import { mapAgentsPersistenceToUI } from "../mapping/agents/mapAgentsPersistenceToUI";
import { mapAgentsUIToPersistence } from "../mapping/agents/mapAgentsUIToPersistence";
import { agentSchema } from "../schemas/agentSchema";
import { AgentsPersistenceAdapter } from "../types/agents/persistence/AgentsPersistenceAdapter";
import { AgentsPersistenceError } from "../types/agents/persistence/AgentsPersistenceError";
import { AgentFormData } from "../types/settings/AgentFormData";
import { AgentSettingsViewModel } from "../types/settings/AgentViewModel";
import { AgentDefaults } from "../types/settings/AgentDefaults";
import { type AgentsStore } from "./AgentsStore";
import { ErrorState } from "./ErrorState";

// Debounce delay for auto-save
const DEBOUNCE_DELAY_MS = 500;

// Maximum retry attempts for save operations
const MAX_RETRY_ATTEMPTS = 3;

// Base delay for exponential backoff (in ms)
const RETRY_BASE_DELAY_MS = 1000;

// Default agent defaults
const DEFAULT_AGENT_DEFAULTS: AgentDefaults = {
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
};

// Generate unique ID using crypto API or fallback
const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useAgentsStore = create<AgentsStore>()((set, get) => {
  // Debounce timer reference
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let defaultsDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Retry count for exponential backoff
  let retryCount = 0;

  // Store snapshot for rollback
  let rollbackSnapshot: AgentSettingsViewModel[] | null = null;

  /**
   * Internal debounced save function
   * Batches rapid changes and persists after delay
   */
  const debouncedSave = () => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    debounceTimer = setTimeout(async () => {
      const { adapter, logger } = get();
      if (!adapter) {
        logger.warn("Cannot save: no adapter configured");
        return;
      }

      // Perform the actual save
      try {
        await get().persistChanges();
      } catch (error) {
        logger.error(
          "Auto-save failed",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }, DEBOUNCE_DELAY_MS);
  };

  /**
   * Internal debounced save function for defaults
   * Batches rapid changes and persists after delay
   */
  const debouncedDefaultsSave = (defaults: AgentDefaults) => {
    // Clear existing timer
    if (defaultsDebounceTimer) {
      clearTimeout(defaultsDebounceTimer);
    }

    // Set new timer
    defaultsDebounceTimer = setTimeout(async () => {
      const { adapter, logger } = get();
      if (!adapter) {
        logger.warn("Cannot save defaults: no adapter configured");
        return;
      }

      // Perform the actual save
      try {
        await get().saveDefaults(defaults);
      } catch (error) {
        logger.error(
          "Auto-save defaults failed",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }, DEBOUNCE_DELAY_MS);
  };

  /**
   * Handle save errors with rollback and retry logic
   */

  /**
   * Determines if an error is retryable based on its type and characteristics
   */

  /**
   * Create a properly formatted error state
   */
  const createErrorState = (
    message: string | null,
    operation: "save" | "load" | "sync" | "import" | "reset" | null = null,
    isRetryable: boolean = false,
    retryCount: number = 0,
  ): ErrorState => ({
    message,
    operation,
    isRetryable,
    retryCount,
    timestamp: message ? new Date().toISOString() : null,
  });

  /**
   * Create a clear error state (no error)
   */
  const clearErrorState = (): ErrorState => createErrorState(null);

  const isRetryableError = (error: unknown): boolean => {
    // Never retry validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      return false;
    }

    // Check for specific error codes
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      // Non-retryable error codes
      if (["ENOENT", "EACCES", "EPERM", "ENOSPC"].includes(code)) {
        return false;
      }
      // Network-related errors are retryable
      if (["ETIMEDOUT", "ECONNREFUSED", "ENOTFOUND"].includes(code)) {
        return true;
      }
    }

    // Check for AgentsPersistenceError
    if (error instanceof AgentsPersistenceError) {
      // Load operations might be retryable if temporary
      if (error.operation === "load" && error.cause) {
        return isRetryableError(error.cause);
      }
      // Save operations are potentially retryable
      if (error.operation === "save") {
        return (
          !error.message.includes("validation") &&
          !error.message.includes("permission")
        );
      }
    }

    // Default: unknown errors might be temporary
    return true;
  };

  /**
   * Gets a user-friendly error message based on error type and operation
   */
  const getErrorMessage = (error: unknown, operation: string): string => {
    // Validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      const zodError = error as {
        issues?: Array<{ path: Array<string | number>; message: string }>;
      };
      if (zodError.issues && Array.isArray(zodError.issues)) {
        const issues = zodError.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        );
        return `Validation failed: ${issues.join(", ")}`;
      }
    }

    // File system errors
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      switch (code) {
        case "ENOENT":
          return operation === "load"
            ? "Agents configuration not found. Starting with defaults."
            : "Unable to save: Configuration file not accessible.";
        case "EACCES":
        case "EPERM":
          return "Permission denied. Check folder permissions for the app data directory.";
        case "ENOSPC":
          return "Insufficient disk space to save agents.";
        case "ETIMEDOUT":
          return "Operation timed out. Please check your connection.";
        default:
          break;
      }
    }

    // AgentsPersistenceError
    if (error instanceof AgentsPersistenceError) {
      return error.message;
    }

    // Generic error with message
    if (error instanceof Error) {
      return error.message;
    }

    // Fallback
    return `Failed to ${operation} agents. Please try again.`;
  };

  /**
   * Central error handler for all persistence operations
   */
  const handlePersistenceError = (
    error: unknown,
    operation: "save" | "load" | "sync" | "import" | "reset",
  ): void => {
    const isRetryable = isRetryableError(error);
    const message = getErrorMessage(error, operation);

    // Extract field errors if validation error
    let fieldErrors: Array<{ field: string; message: string }> | undefined;
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      const zodError = error as {
        issues?: Array<{ path: Array<string | number>; message: string }>;
      };
      if (zodError.issues && Array.isArray(zodError.issues)) {
        fieldErrors = zodError.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
      }
    }

    // Update error state
    set({
      error: {
        message,
        operation,
        isRetryable,
        retryCount: 0,
        timestamp: new Date().toISOString(),
        fieldErrors,
      },
    });

    // Log the error with context
    get().logger.error(
      `${operation} operation failed`,
      error instanceof Error ? error : new Error(String(error)),
    );
  };

  const handleSaveError = async (
    error: unknown,
    originalAgents: AgentSettingsViewModel[],
  ): Promise<void> => {
    // Use the new error handling infrastructure
    handlePersistenceError(error, "save");

    // Rollback to original state with pending operations cleanup
    set((state) => ({
      agents: originalAgents,
      isSaving: false,
      pendingOperations: state.pendingOperations.map((op) => ({
        ...op,
        status: op.status === "pending" ? "failed" : op.status,
      })),
    }));

    // Announce rollback to UI for user feedback
    const errorType =
      error instanceof Error ? error.constructor.name : typeof error;
    get().logger.info(
      `Rolled back to previous state after save error. Original agent count: ${originalAgents.length}, Error type: ${errorType}`,
    );

    // Implement exponential backoff retry
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      retryCount++;
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, retryCount - 1);

      const failedOperationsCount = get().pendingOperations.filter(
        (op) => op.status === "failed",
      ).length;
      get().logger.info(
        `Retrying save in ${delay}ms (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}). Failed operations: ${failedOperationsCount}`,
      );

      setTimeout(async () => {
        try {
          await get().persistChanges();
          retryCount = 0; // Reset on success
        } catch (retryError) {
          await handleSaveError(retryError, originalAgents);
        }
      }, delay);
    } else {
      const state = get();
      const failedCount = state.pendingOperations.filter(
        (op) => op.status === "failed",
      ).length;
      const totalCount = state.pendingOperations.length;
      get().logger.error(
        `Save failed after ${MAX_RETRY_ATTEMPTS} attempts. Failed operations: ${failedCount}, Total pending: ${totalCount}`,
      );
      retryCount = 0;
    }
  };

  return {
    agents: [],
    defaults: DEFAULT_AGENT_DEFAULTS,
    isLoading: false,
    error: {
      message: null,
      operation: null,
      isRetryable: false,
      retryCount: 0,
      timestamp: null,
    },
    adapter: null,
    logger: new ConsoleLogger({
      metadata: { component: "agents-store" },
    }) as unknown as StructuredLogger,
    isInitialized: false,
    isSaving: false,
    lastSyncTime: null,
    pendingOperations: [],
    retryTimers: new Map(),

    // CRUD operations
    createAgent: (agentData: AgentFormData) => {
      try {
        // Validate input data
        const validatedData = agentSchema.parse(agentData);

        // Check name uniqueness
        const { isAgentNameUnique } = get();
        if (!isAgentNameUnique(validatedData.name)) {
          set({
            error: createErrorState("An agent with this name already exists"),
          });
          return "";
        }

        const newAgent: AgentSettingsViewModel = {
          id: generateId(),
          ...validatedData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const operationId = generateId();
        set((state) => ({
          agents: [...state.agents, newAgent],
          error: clearErrorState(),
          pendingOperations: [
            ...state.pendingOperations,
            {
              id: operationId,
              type: "create",
              agentId: newAgent.id,
              timestamp: new Date().toISOString(),
              rollbackData: undefined, // No rollback for create
              status: "pending" as const,
            },
          ],
        }));

        // Trigger auto-save
        debouncedSave();

        return newAgent.id;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create agent";
        set({ error: createErrorState(errorMessage) });
        return "";
      }
    },

    updateAgent: (id: string, agentData: AgentFormData) => {
      try {
        const validatedData = agentSchema.parse(agentData);
        const { agents, isAgentNameUnique } = get();

        const existingAgent = agents.find((agent) => agent.id === id);
        if (!existingAgent) {
          set({ error: createErrorState("Agent not found") });
          return;
        }

        // Check name uniqueness (excluding current agent)
        if (!isAgentNameUnique(validatedData.name, id)) {
          set({
            error: createErrorState("An agent with this name already exists"),
          });
          return;
        }

        const operationId = generateId();
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? {
                  ...agent,
                  ...validatedData,
                  updatedAt: new Date().toISOString(),
                }
              : agent,
          ),
          error: clearErrorState(),
          pendingOperations: [
            ...state.pendingOperations,
            {
              id: operationId,
              type: "update",
              agentId: id,
              timestamp: new Date().toISOString(),
              rollbackData: existingAgent, // Store original for potential rollback
              status: "pending" as const,
            },
          ],
        }));

        // Trigger auto-save
        debouncedSave();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update agent";
        set({ error: createErrorState(errorMessage) });
      }
    },

    deleteAgent: (id: string) => {
      const { agents } = get();
      const agentToDelete = agents.find((agent) => agent.id === id);

      if (!agentToDelete) {
        set({ error: createErrorState("Agent not found") });
        return;
      }

      const operationId = generateId();
      set((state) => ({
        agents: state.agents.filter((agent) => agent.id !== id),
        error: clearErrorState(),
        pendingOperations: [
          ...state.pendingOperations,
          {
            id: operationId,
            type: "delete",
            agentId: id,
            timestamp: new Date().toISOString(),
            rollbackData: agentToDelete, // Store for potential restoration
            status: "pending",
          },
        ],
      }));

      // Trigger auto-save
      debouncedSave();
    },

    getAgentById: (id: string) => {
      return get().agents.find((agent) => agent.id === id);
    },

    isAgentNameUnique: (name: string, excludeId?: string) => {
      const { agents } = get();
      return !agents.some(
        (agent) =>
          agent.name.toLowerCase() === name.toLowerCase() &&
          agent.id !== excludeId,
      );
    },

    // State management
    setLoading: (loading: boolean) => {
      set({ isLoading: Boolean(loading) });
    },

    setError: (error: string | null) => {
      set({ error: error ? createErrorState(error) : clearErrorState() });
    },

    clearError: () => {
      set({ error: clearErrorState() });
    },

    setAdapter: (adapter: AgentsPersistenceAdapter) => {
      set({ adapter });
    },

    initialize: async (
      adapter: AgentsPersistenceAdapter,
      logger: StructuredLogger,
    ) => {
      set({
        adapter,
        logger,
        isLoading: true,
        error: clearErrorState(),
      });

      try {
        // Load data from adapter
        const persistedData: PersistedAgentsSettingsData | null =
          await adapter.load();

        if (persistedData) {
          // Transform persistence data to UI format
          const uiAgents = mapAgentsPersistenceToUI(persistedData);

          set({
            agents: uiAgents,
            isInitialized: true,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: clearErrorState(),
          });
        } else {
          // No persisted data, start with empty array
          set({
            agents: [],
            isInitialized: true,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: clearErrorState(),
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to initialize agents: ${error.message}`
            : "Failed to initialize agents";

        set({
          isInitialized: false,
          isLoading: false,
          error: createErrorState(errorMessage, "load"),
        });

        // Log detailed error for debugging but don't throw to avoid crashing UI
        console.error("Agents store initialization error:", error);
      }
    },

    persistChanges: async () => {
      const { adapter, agents, isSaving } = get();

      // Prevent concurrent saves
      if (isSaving) {
        get().logger.info("Save already in progress, skipping");
        return;
      }

      if (!adapter) {
        throw new AgentsPersistenceError(
          "Cannot persist changes: no adapter configured",
          "save",
        );
      }

      // Take snapshot for potential rollback
      rollbackSnapshot = [...agents];

      set({
        isSaving: true,
        error: clearErrorState(),
      });

      try {
        // Map to persistence format
        const persistedData = mapAgentsUIToPersistence(agents);

        // Save through adapter
        await adapter.save(persistedData);

        // Update state on success
        set((state) => ({
          isSaving: false,
          lastSyncTime: new Date().toISOString(),
          pendingOperations: state.pendingOperations
            .map((op) => ({
              ...op,
              status: "completed" as const,
            }))
            .filter((op) => {
              // Keep recent completed operations for audit trail (optional)
              const opTime = new Date(op.timestamp).getTime();
              const cutoff = Date.now() - 60000; // Keep for 1 minute
              return opTime > cutoff;
            }),
          error: clearErrorState(),
        }));

        get().logger.info(`Successfully saved ${agents.length} agents`);

        // Reset retry count on success
        retryCount = 0;
        rollbackSnapshot = null;
      } catch (error) {
        // Handle save error with potential retry
        await handleSaveError(error, rollbackSnapshot || []);

        // Re-throw for caller handling
        throw error;
      }
    },

    syncWithStorage: async () => {
      const { adapter } = get();

      if (!adapter) {
        throw new AgentsPersistenceError(
          "Cannot sync: no adapter configured",
          "load",
        );
      }

      set({
        isLoading: true,
        error: clearErrorState(),
      });

      try {
        const persistedData = await adapter.load();

        if (persistedData) {
          const uiAgents = mapAgentsPersistenceToUI(persistedData);

          set({
            agents: uiAgents,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: clearErrorState(),
          });

          get().logger.info(`Synced ${uiAgents.length} agents from storage`);
        } else {
          set({
            agents: [],
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: clearErrorState(),
          });

          get().logger.info("No agents found in storage");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to sync with storage: ${error.message}`
            : "Failed to sync with storage";

        set({
          isLoading: false,
          error: createErrorState(errorMessage, "sync"),
        });

        throw error;
      }
    },

    exportAgents: async () => {
      const { agents } = get();

      try {
        // Transform current UI state to persistence format
        const persistedData = mapAgentsUIToPersistence(agents);

        get().logger.info(`Exported ${agents.length} agents for backup`);

        return persistedData;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to export agents: ${error.message}`
            : "Failed to export agents";

        set({ error: createErrorState(errorMessage) });

        get().logger.error(
          "Export agents failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    importAgents: async (data: PersistedAgentsSettingsData) => {
      const { adapter } = get();

      if (!adapter) {
        throw new AgentsPersistenceError(
          "Cannot import agents: no adapter configured",
          "save",
        );
      }

      set({
        isSaving: true,
        error: clearErrorState(),
      });

      try {
        // Validate imported data structure
        const validatedData = mapAgentsUIToPersistence(
          mapAgentsPersistenceToUI(data),
        );

        // Transform from persistence to UI format
        const uiAgents = mapAgentsPersistenceToUI(validatedData);

        // Replace current store state with imported data
        set({
          agents: uiAgents,
          isSaving: false,
          lastSyncTime: new Date().toISOString(),
          pendingOperations: [],
          error: clearErrorState(),
        });

        // Save imported data to persistence
        await adapter.save(validatedData);

        get().logger.info(`Successfully imported ${uiAgents.length} agents`);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to import agents: ${error.message}`
            : "Failed to import agents";

        set({
          isSaving: false,
          error: createErrorState(errorMessage, "import"),
        });

        get().logger.error(
          "Import agents failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    resetAgents: async () => {
      const { adapter } = get();

      if (!adapter) {
        throw new AgentsPersistenceError(
          "Cannot reset agents: no adapter configured",
          "reset",
        );
      }

      set({
        isSaving: true,
        error: clearErrorState(),
      });

      try {
        // Clear local store state
        set({
          agents: [],
          isInitialized: false,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          error: clearErrorState(),
        });

        // Call adapter's reset() method
        await adapter.reset();

        get().logger.info("Successfully reset all agents and storage");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to reset agents: ${error.message}`
            : "Failed to reset agents";

        set({
          isSaving: false,
          error: createErrorState(errorMessage, "reset"),
        });

        get().logger.error(
          "Reset agents failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    // Error recovery methods
    retryLastOperation: async () => {
      const { error } = get();
      if (!error) {
        get().logger.warn("No error state to retry");
        return;
      }

      if (!error.operation || !error.isRetryable) {
        get().logger.warn("No retryable operation found");
        return;
      }

      // Clear existing error to show fresh state
      set({
        error: createErrorState(
          `Retrying ${error.operation}...`,
          error.operation,
          error.isRetryable,
          0,
        ),
      });

      try {
        switch (error.operation) {
          case "save":
            await get().persistChanges();
            break;
          case "load":
          case "sync":
            await get().syncWithStorage();
            break;
          case "import":
            // Import would need to store the data to retry
            get().logger.warn("Import retry not implemented");
            break;
          case "reset":
            await get().resetAgents();
            break;
        }
      } catch (retryError) {
        // Error will be handled by the operation itself
        get().logger.error(
          "Manual retry failed",
          retryError instanceof Error
            ? retryError
            : new Error(String(retryError)),
        );
      }
    },

    clearErrorState: () => {
      // Clear any pending retry timers
      const { retryTimers } = get();
      retryTimers.forEach((timer) => clearTimeout(timer));
      retryTimers.clear();

      set({
        error: clearErrorState(),
      });
    },

    getErrorDetails: () => {
      return get().error || clearErrorState();
    },

    // Cleanup method to prevent memory leaks
    destroy: () => {
      // Clear any pending debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      // Clear any pending defaults debounce timer
      if (defaultsDebounceTimer) {
        clearTimeout(defaultsDebounceTimer);
        defaultsDebounceTimer = null;
      }

      // Clear any pending retry timers
      const { retryTimers } = get();
      retryTimers.forEach((timer) => clearTimeout(timer));
      retryTimers.clear();

      // Clear rollback snapshot
      rollbackSnapshot = null;
    },

    // Defaults management methods
    setDefaults: (defaults: AgentDefaults) => {
      set({ defaults, error: clearErrorState() });
      // Trigger auto-save
      debouncedDefaultsSave(defaults);
    },

    getDefaults: () => {
      return get().defaults;
    },

    loadDefaults: async () => {
      const { adapter } = get();

      if (!adapter) {
        throw new AgentsPersistenceError(
          "Cannot load defaults: no adapter configured",
          "load",
        );
      }

      set({
        isLoading: true,
        error: clearErrorState(),
      });

      try {
        const persistedData = await adapter.load();

        // If we have persisted data and it contains defaults, use them
        if (
          persistedData &&
          "defaults" in persistedData &&
          persistedData.defaults
        ) {
          set({
            defaults: persistedData.defaults as AgentDefaults,
            isLoading: false,
            error: clearErrorState(),
          });
        } else {
          // Use factory defaults if no persisted defaults found
          set({
            defaults: DEFAULT_AGENT_DEFAULTS,
            isLoading: false,
            error: clearErrorState(),
          });
        }

        get().logger.info("Successfully loaded defaults");
      } catch (error) {
        handlePersistenceError(error, "load");
        throw error;
      }
    },

    saveDefaults: async (defaults: AgentDefaults) => {
      const { adapter } = get();

      if (!adapter) {
        throw new AgentsPersistenceError(
          "Cannot save defaults: no adapter configured",
          "save",
        );
      }

      set({
        isSaving: true,
        error: clearErrorState(),
      });

      try {
        // Load existing data first
        const existingData = (await adapter.load()) || {
          schemaVersion: "1.0.0",
          agents: [],
          lastUpdated: new Date().toISOString(),
        };

        // Update with new defaults
        const updatedData = {
          ...existingData,
          defaults,
          lastUpdated: new Date().toISOString(),
        };

        // Save updated data
        await adapter.save(updatedData);

        set({
          defaults,
          isSaving: false,
          lastSyncTime: new Date().toISOString(),
          error: clearErrorState(),
        });

        get().logger.info("Successfully saved defaults");
      } catch (error) {
        handlePersistenceError(error, "save");
        set({ isSaving: false });
        throw error;
      }
    },

    resetDefaults: async () => {
      const { adapter } = get();

      if (!adapter) {
        throw new AgentsPersistenceError(
          "Cannot reset defaults: no adapter configured",
          "reset",
        );
      }

      set({
        isSaving: true,
        error: clearErrorState(),
      });

      try {
        // Reset to factory defaults
        set({
          defaults: DEFAULT_AGENT_DEFAULTS,
          isSaving: false,
          error: clearErrorState(),
        });

        // Save the reset defaults
        await get().saveDefaults(DEFAULT_AGENT_DEFAULTS);

        get().logger.info("Successfully reset defaults to factory values");
      } catch (error) {
        handlePersistenceError(error, "reset");
        set({ isSaving: false });
        throw error;
      }
    },
  };
});

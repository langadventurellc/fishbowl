/**
 * Zustand store for roles management with CRUD operations.
 *
 * Provides reactive state management for user-created roles with
 * comprehensive validation, error handling, and persistence integration.
 *
 * @module stores/rolesStore
 */

import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { create } from "zustand";
import { mapRolesPersistenceToUI } from "../mapping/roles/mapRolesPersistenceToUI";
import { mapRolesUIToPersistence } from "../mapping/roles/mapRolesUIToPersistence";
import { roleSchema } from "../schemas/roleSchema";
import { RolesPersistenceAdapter } from "../types/roles/persistence/RolesPersistenceAdapter";
import { RolesPersistenceError } from "../types/roles/persistence/RolesPersistenceError";
import { RoleFormData } from "../types/settings/RoleFormData";
import { RoleViewModel } from "../types/settings/RoleViewModel";

// Lazy logger creation to avoid process access in browser context
let logger: ReturnType<typeof createLoggerSync> | null = null;
const getLogger = () => {
  if (!logger) {
    try {
      logger = createLoggerSync({
        context: { metadata: { component: "rolesStore" } },
      });
    } catch {
      // Fallback to console in browser contexts where logger creation fails
      logger = {
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      } as ReturnType<typeof createLoggerSync>;
    }
  }
  return logger;
};

// Debounce delay for auto-save
const DEBOUNCE_DELAY_MS = 500;

// Maximum retry attempts for save operations
const MAX_RETRY_ATTEMPTS = 3;

// Base delay for exponential backoff (in ms)
const RETRY_BASE_DELAY_MS = 1000;

// Generate unique ID using crypto API or fallback
const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface RolesState {
  roles: RoleViewModel[];
  isLoading: boolean;
  error: string | null;
  // New adapter integration state
  adapter: RolesPersistenceAdapter | null;
  isInitialized: boolean;
  isSaving: boolean;
  lastSyncTime: string | null;
  pendingOperations: Array<{ type: string; timestamp: string }>;
}

interface RolesActions {
  createRole: (roleData: RoleFormData) => string;
  updateRole: (id: string, roleData: RoleFormData) => void;
  deleteRole: (id: string) => void;
  getRoleById: (id: string) => RoleViewModel | undefined;
  isRoleNameUnique: (name: string, excludeId?: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // Adapter integration methods
  setAdapter: (adapter: RolesPersistenceAdapter) => void;
  initialize: (adapter: RolesPersistenceAdapter) => Promise<void>;
  // Auto-save methods
  persistChanges: () => Promise<void>;
  syncWithStorage: () => Promise<void>;
  // Sync and bulk operation methods
  exportRoles: () => Promise<PersistedRolesSettingsData>;
  importRoles: (data: PersistedRolesSettingsData) => Promise<void>;
  resetRoles: () => Promise<void>;
}

type RolesStore = RolesState & RolesActions;

export const useRolesStore = create<RolesStore>()((set, get) => {
  // Debounce timer reference
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Retry count for exponential backoff
  let retryCount = 0;

  // Store snapshot for rollback
  let rollbackSnapshot: RoleViewModel[] | null = null;

  /**
   * Internal debounced save function
   * Batches rapid changes and persists after delay
   */
  const _debouncedSave = () => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    debounceTimer = setTimeout(async () => {
      const { adapter } = get();
      if (!adapter) {
        getLogger().warn("Cannot save: no adapter configured");
        return;
      }

      // Perform the actual save
      try {
        await get().persistChanges();
      } catch (error) {
        getLogger().error(
          "Auto-save failed",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }, DEBOUNCE_DELAY_MS);
  };

  /**
   * Handle save errors with rollback and retry logic
   */
  const _handleSaveError = async (
    error: unknown,
    originalRoles: RoleViewModel[],
  ): Promise<void> => {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save roles";

    // Log the error
    getLogger().error(
      "Save operation failed",
      error instanceof Error ? error : new Error(String(error)),
    );

    // Rollback to original state
    set({
      roles: originalRoles,
      isSaving: false,
      error: errorMessage,
    });

    // Implement exponential backoff retry
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      retryCount++;
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, retryCount - 1);

      getLogger().info(
        `Retrying save in ${delay}ms (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS})`,
      );

      setTimeout(async () => {
        try {
          await get().persistChanges();
          retryCount = 0; // Reset on success
        } catch (retryError) {
          await _handleSaveError(retryError, originalRoles);
        }
      }, delay);
    } else {
      getLogger().error(`Save failed after ${MAX_RETRY_ATTEMPTS} attempts`);
      retryCount = 0;
    }
  };

  return {
    roles: [],
    isLoading: false,
    error: null,
    adapter: null,
    isInitialized: false,
    isSaving: false,
    lastSyncTime: null,
    pendingOperations: [],

    // CRUD operations
    createRole: (roleData: RoleFormData) => {
      try {
        // Validate input data
        const validatedData = roleSchema.parse(roleData);

        // Check name uniqueness
        const { isRoleNameUnique } = get();
        if (!isRoleNameUnique(validatedData.name)) {
          set({ error: "A role with this name already exists" });
          return "";
        }

        const newRole: RoleViewModel = {
          id: generateId(),
          ...validatedData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          roles: [...state.roles, newRole],
          error: null,
          pendingOperations: [
            ...state.pendingOperations,
            { type: "create", timestamp: new Date().toISOString() },
          ],
        }));

        // Trigger auto-save
        _debouncedSave();

        return newRole.id;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create role";
        set({ error: errorMessage });
        return "";
      }
    },

    updateRole: (id: string, roleData: RoleFormData) => {
      try {
        const validatedData = roleSchema.parse(roleData);
        const { roles, isRoleNameUnique } = get();

        const existingRole = roles.find((role) => role.id === id);
        if (!existingRole) {
          set({ error: "Role not found" });
          return;
        }

        // Check name uniqueness (excluding current role)
        if (!isRoleNameUnique(validatedData.name, id)) {
          set({ error: "A role with this name already exists" });
          return;
        }

        set((state) => ({
          roles: state.roles.map((role) =>
            role.id === id
              ? {
                  ...role,
                  ...validatedData,
                  updatedAt: new Date().toISOString(),
                }
              : role,
          ),
          error: null,
          pendingOperations: [
            ...state.pendingOperations,
            { type: "update", timestamp: new Date().toISOString() },
          ],
        }));

        // Trigger auto-save
        _debouncedSave();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update role";
        set({ error: errorMessage });
      }
    },

    deleteRole: (id: string) => {
      const { roles } = get();
      const roleExists = roles.some((role) => role.id === id);

      if (!roleExists) {
        set({ error: "Role not found" });
        return;
      }

      set((state) => ({
        roles: state.roles.filter((role) => role.id !== id),
        error: null,
        pendingOperations: [
          ...state.pendingOperations,
          { type: "delete", timestamp: new Date().toISOString() },
        ],
      }));

      // Trigger auto-save
      _debouncedSave();
    },

    getRoleById: (id: string) => {
      return get().roles.find((role) => role.id === id);
    },

    isRoleNameUnique: (name: string, excludeId?: string) => {
      const { roles } = get();
      return !roles.some(
        (role) =>
          role.name.toLowerCase() === name.toLowerCase() &&
          role.id !== excludeId,
      );
    },

    // State management
    setLoading: (loading: boolean) => {
      set({ isLoading: Boolean(loading) });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    setAdapter: (adapter: RolesPersistenceAdapter) => {
      set({ adapter });
    },

    initialize: async (adapter: RolesPersistenceAdapter) => {
      set({
        adapter,
        isLoading: true,
        error: null,
      });

      try {
        // Load data from adapter
        const persistedData: PersistedRolesSettingsData | null =
          await adapter.load();

        if (persistedData) {
          // Transform persistence data to UI format
          const uiRoles = mapRolesPersistenceToUI(persistedData);

          set({
            roles: uiRoles,
            isInitialized: true,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: null,
          });
        } else {
          // No persisted data, start with empty array
          set({
            roles: [],
            isInitialized: true,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: null,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to initialize roles: ${error.message}`
            : "Failed to initialize roles";

        set({
          isInitialized: false,
          isLoading: false,
          error: errorMessage,
        });

        // Log detailed error for debugging but don't throw to avoid crashing UI
        console.error("Roles store initialization error:", error);
      }
    },

    persistChanges: async () => {
      const { adapter, roles, isSaving } = get();

      // Prevent concurrent saves
      if (isSaving) {
        getLogger().info("Save already in progress, skipping");
        return;
      }

      if (!adapter) {
        throw new RolesPersistenceError(
          "Cannot persist changes: no adapter configured",
          "save",
        );
      }

      // Take snapshot for potential rollback
      rollbackSnapshot = [...roles];

      set({
        isSaving: true,
        error: null,
      });

      try {
        // Map to persistence format
        const persistedData = mapRolesUIToPersistence(roles);

        // Save through adapter
        await adapter.save(persistedData);

        // Update state on success
        set({
          isSaving: false,
          lastSyncTime: new Date().toISOString(),
          pendingOperations: [],
          error: null,
        });

        getLogger().info(`Successfully saved ${roles.length} roles`);

        // Reset retry count on success
        retryCount = 0;
        rollbackSnapshot = null;
      } catch (error) {
        // Handle save error with potential retry
        await _handleSaveError(error, rollbackSnapshot || []);

        // Re-throw for caller handling
        throw error;
      }
    },

    syncWithStorage: async () => {
      const { adapter } = get();

      if (!adapter) {
        throw new RolesPersistenceError(
          "Cannot sync: no adapter configured",
          "load",
        );
      }

      set({
        isLoading: true,
        error: null,
      });

      try {
        const persistedData = await adapter.load();

        if (persistedData) {
          const uiRoles = mapRolesPersistenceToUI(persistedData);

          set({
            roles: uiRoles,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: null,
          });

          getLogger().info(`Synced ${uiRoles.length} roles from storage`);
        } else {
          set({
            roles: [],
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: null,
          });

          getLogger().info("No roles found in storage");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to sync with storage: ${error.message}`
            : "Failed to sync with storage";

        set({
          isLoading: false,
          error: errorMessage,
        });

        throw error;
      }
    },

    exportRoles: async () => {
      const { roles } = get();

      try {
        // Transform current UI state to persistence format
        const persistedData = mapRolesUIToPersistence(roles);

        getLogger().info(`Exported ${roles.length} roles for backup`);

        return persistedData;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to export roles: ${error.message}`
            : "Failed to export roles";

        set({ error: errorMessage });

        getLogger().error(
          "Export roles failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    importRoles: async (data: PersistedRolesSettingsData) => {
      const { adapter } = get();

      if (!adapter) {
        throw new RolesPersistenceError(
          "Cannot import roles: no adapter configured",
          "save",
        );
      }

      set({
        isSaving: true,
        error: null,
      });

      try {
        // Validate imported data structure
        const validatedData = mapRolesUIToPersistence(
          mapRolesPersistenceToUI(data),
        );

        // Transform from persistence to UI format
        const uiRoles = mapRolesPersistenceToUI(validatedData);

        // Replace current store state with imported data
        set({
          roles: uiRoles,
          isSaving: false,
          lastSyncTime: new Date().toISOString(),
          pendingOperations: [],
          error: null,
        });

        // Save imported data to persistence
        await adapter.save(validatedData);

        getLogger().info(`Successfully imported ${uiRoles.length} roles`);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to import roles: ${error.message}`
            : "Failed to import roles";

        set({
          isSaving: false,
          error: errorMessage,
        });

        getLogger().error(
          "Import roles failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    resetRoles: async () => {
      const { adapter } = get();

      if (!adapter) {
        throw new RolesPersistenceError(
          "Cannot reset roles: no adapter configured",
          "reset",
        );
      }

      set({
        isSaving: true,
        error: null,
      });

      try {
        // Clear local store state
        set({
          roles: [],
          isInitialized: false,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          error: null,
        });

        // Call adapter's reset() method
        await adapter.reset();

        getLogger().info("Successfully reset all roles and storage");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to reset roles: ${error.message}`
            : "Failed to reset roles";

        set({
          isSaving: false,
          error: errorMessage,
        });

        getLogger().error(
          "Reset roles failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },
  };
});

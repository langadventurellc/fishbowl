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
import { RolesErrorState } from "src/stores/RolesErrorState";
import { RolesStore } from "src/stores/RolesStore";
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

  /**
   * Determines if an error is retryable based on its type and characteristics
   */

  /**
   * Create a properly formatted error state
   */
  const _createErrorState = (
    message: string | null,
    operation: "save" | "load" | "sync" | "import" | "reset" | null = null,
    isRetryable: boolean = false,
    retryCount: number = 0,
  ): RolesErrorState => ({
    message,
    operation,
    isRetryable,
    retryCount,
    timestamp: message ? new Date().toISOString() : null,
  });

  /**
   * Create a clear error state (no error)
   */
  const _clearErrorState = (): RolesErrorState => _createErrorState(null);

  const _isRetryableError = (error: unknown): boolean => {
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

    // Check for RolesPersistenceError
    if (error instanceof RolesPersistenceError) {
      // Load operations might be retryable if temporary
      if (error.operation === "load" && error.cause) {
        return _isRetryableError(error.cause);
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
  const _getErrorMessage = (error: unknown, operation: string): string => {
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
            ? "Roles configuration not found. Starting with defaults."
            : "Unable to save: Configuration file not accessible.";
        case "EACCES":
        case "EPERM":
          return "Permission denied. Check folder permissions for the app data directory.";
        case "ENOSPC":
          return "Insufficient disk space to save roles.";
        case "ETIMEDOUT":
          return "Operation timed out. Please check your connection.";
        default:
          break;
      }
    }

    // RolesPersistenceError
    if (error instanceof RolesPersistenceError) {
      return error.message;
    }

    // Generic error with message
    if (error instanceof Error) {
      return error.message;
    }

    // Fallback
    return `Failed to ${operation} roles. Please try again.`;
  };

  /**
   * Central error handler for all persistence operations
   */
  const _handlePersistenceError = (
    error: unknown,
    operation: "save" | "load" | "sync" | "import" | "reset",
  ): void => {
    const isRetryable = _isRetryableError(error);
    const message = _getErrorMessage(error, operation);

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
    getLogger().error(
      `${operation} operation failed`,
      error instanceof Error ? error : new Error(String(error)),
    );
  };

  /**
   * Retry an operation with exponential backoff
   */
  const _retryOperation = async <T>(
    operation: () => Promise<T>,
    operationName: "save" | "load" | "sync" | "import" | "reset",
    maxRetries: number = MAX_RETRY_ATTEMPTS,
  ): Promise<T> => {
    let lastError: unknown;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Clear any existing retry timer for this operation
        const { retryTimers } = get();
        const existingTimer = retryTimers.get(operationName);
        if (existingTimer) {
          clearTimeout(existingTimer);
          retryTimers.delete(operationName);
        }

        // Attempt the operation
        const result = await operation();

        // Success - clear error state
        set({
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
        });

        return result;
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        if (!_isRetryableError(error)) {
          _handlePersistenceError(error, operationName);
          throw error;
        }

        retryCount++;

        // Update error state with retry count
        const currentError = get().error;
        set({
          error: _createErrorState(
            `${_getErrorMessage(error, operationName)} (Retry ${retryCount}/${maxRetries})`,
            currentError?.operation || operationName,
            currentError?.isRetryable || _isRetryableError(error),
            retryCount,
          ),
        });

        if (retryCount < maxRetries) {
          // Calculate delay with exponential backoff
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, retryCount - 1);

          getLogger().info(
            `Retrying ${operationName} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`,
          );

          // Wait before retrying
          await new Promise((resolve) => {
            const timer = setTimeout(resolve, delay);
            // Store timer reference for cleanup
            get().retryTimers.set(operationName, timer);
          });
        }
      }
    }

    // All retries exhausted
    _handlePersistenceError(lastError, operationName);
    throw lastError;
  };

  const _handleSaveError = async (
    error: unknown,
    originalRoles: RoleViewModel[],
  ): Promise<void> => {
    // Use the new error handling infrastructure
    _handlePersistenceError(error, "save");

    // Rollback to original state
    set({
      roles: originalRoles,
      isSaving: false,
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
    error: {
      message: null,
      operation: null,
      isRetryable: false,
      retryCount: 0,
      timestamp: null,
    },
    adapter: null,
    isInitialized: false,
    isSaving: false,
    lastSyncTime: null,
    pendingOperations: [],
    retryTimers: new Map(),

    // CRUD operations
    createRole: (roleData: RoleFormData) => {
      try {
        // Validate input data
        const validatedData = roleSchema.parse(roleData);

        // Check name uniqueness
        const { isRoleNameUnique } = get();
        if (!isRoleNameUnique(validatedData.name)) {
          set({
            error: _createErrorState("A role with this name already exists"),
          });
          return "";
        }

        const newRole: RoleViewModel = {
          id: generateId(),
          ...validatedData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const operationId = generateId();
        set((state) => ({
          roles: [...state.roles, newRole],
          error: _clearErrorState(),
          pendingOperations: [
            ...state.pendingOperations,
            {
              id: operationId,
              type: "create",
              roleId: newRole.id,
              timestamp: new Date().toISOString(),
              rollbackData: undefined, // No rollback for create
              status: "pending" as const,
            },
          ],
        }));

        // Trigger auto-save
        _debouncedSave();

        return newRole.id;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create role";
        set({ error: _createErrorState(errorMessage) });
        return "";
      }
    },

    updateRole: (id: string, roleData: RoleFormData) => {
      try {
        const validatedData = roleSchema.parse(roleData);
        const { roles, isRoleNameUnique } = get();

        const existingRole = roles.find((role) => role.id === id);
        if (!existingRole) {
          set({ error: _createErrorState("Role not found") });
          return;
        }

        // Check name uniqueness (excluding current role)
        if (!isRoleNameUnique(validatedData.name, id)) {
          set({
            error: _createErrorState("A role with this name already exists"),
          });
          return;
        }

        const operationId = generateId();
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
          error: _clearErrorState(),
          pendingOperations: [
            ...state.pendingOperations,
            {
              id: operationId,
              type: "update",
              roleId: id,
              timestamp: new Date().toISOString(),
              rollbackData: existingRole, // Store original for potential rollback
              status: "pending" as const,
            },
          ],
        }));

        // Trigger auto-save
        _debouncedSave();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update role";
        set({ error: _createErrorState(errorMessage) });
      }
    },

    deleteRole: (id: string) => {
      const { roles } = get();
      const roleToDelete = roles.find((role) => role.id === id);

      if (!roleToDelete) {
        set({ error: _createErrorState("Role not found") });
        return;
      }

      const operationId = generateId();
      set((state) => ({
        roles: state.roles.filter((role) => role.id !== id),
        error: _clearErrorState(),
        pendingOperations: [
          ...state.pendingOperations,
          {
            id: operationId,
            type: "delete",
            roleId: id,
            timestamp: new Date().toISOString(),
            rollbackData: roleToDelete, // Store for potential restoration
            status: "pending",
          },
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
      set({ error: error ? _createErrorState(error) : _clearErrorState() });
    },

    clearError: () => {
      set({ error: _clearErrorState() });
    },

    setAdapter: (adapter: RolesPersistenceAdapter) => {
      set({ adapter });
    },

    initialize: async (adapter: RolesPersistenceAdapter) => {
      set({
        adapter,
        isLoading: true,
        error: _clearErrorState(),
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
            error: _clearErrorState(),
          });
        } else {
          // No persisted data, start with empty array
          set({
            roles: [],
            isInitialized: true,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: _clearErrorState(),
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
          error: _createErrorState(errorMessage, "load"),
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
        error: _clearErrorState(),
      });

      try {
        // Map to persistence format
        const persistedData = mapRolesUIToPersistence(roles);

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
          error: _clearErrorState(),
        }));

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
        error: _clearErrorState(),
      });

      try {
        const persistedData = await adapter.load();

        if (persistedData) {
          const uiRoles = mapRolesPersistenceToUI(persistedData);

          set({
            roles: uiRoles,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: _clearErrorState(),
          });

          getLogger().info(`Synced ${uiRoles.length} roles from storage`);
        } else {
          set({
            roles: [],
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: _clearErrorState(),
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
          error: _createErrorState(errorMessage, "sync"),
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

        set({ error: _createErrorState(errorMessage) });

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
        error: _clearErrorState(),
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
          error: _clearErrorState(),
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
          error: _createErrorState(errorMessage, "import"),
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
        error: _clearErrorState(),
      });

      try {
        // Clear local store state
        set({
          roles: [],
          isInitialized: false,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          error: _clearErrorState(),
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
          error: _createErrorState(errorMessage, "reset"),
        });

        getLogger().error(
          "Reset roles failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    // Error recovery methods
    retryLastOperation: async () => {
      const { error } = get();
      if (!error) {
        getLogger().warn("No error state to retry");
        return;
      }

      if (!error.operation || !error.isRetryable) {
        getLogger().warn("No retryable operation found");
        return;
      }

      // Clear existing error to show fresh state
      set({
        error: _createErrorState(
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
            getLogger().warn("Import retry not implemented");
            break;
          case "reset":
            await get().resetRoles();
            break;
        }
      } catch (retryError) {
        // Error will be handled by the operation itself
        getLogger().error(
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
        error: _clearErrorState(),
      });
    },

    getErrorDetails: () => {
      return get().error || _clearErrorState();
    },
  };
});

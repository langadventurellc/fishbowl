/**
 * Zustand store for personalities management with CRUD operations.
 *
 * Provides reactive state management for user-created personalities with
 * comprehensive validation, error handling, and persistence integration.
 *
 * @module stores/personalitiesStore
 */

import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { create } from "zustand";
import { mapPersonalitiesPersistenceToUI } from "../mapping/personalities/mapPersonalitiesPersistenceToUI";
import { mapPersonalitiesUIToPersistence } from "../mapping/personalities/mapPersonalitiesUIToPersistence";
import { personalitySchema } from "../schemas/personalitySchema";
import { PersonalitiesPersistenceAdapter } from "../types/personalities/persistence/PersonalitiesPersistenceAdapter";
import { PersonalitiesPersistenceError } from "../types/personalities/persistence/PersonalitiesPersistenceError";
import { PersonalityFormData } from "../types/settings/PersonalityFormData";
import { PersonalityViewModel } from "../types/settings/PersonalityViewModel";
import { ErrorState } from "./ErrorState";
import { type PersonalitiesStore } from "./PersonalitiesStore";

// Lazy logger creation to avoid process access in browser context
let _logger: ReturnType<typeof createLoggerSync> | null = null;
const _getLogger = () => {
  if (!_logger) {
    try {
      _logger = createLoggerSync({
        context: { metadata: { component: "personalitiesStore" } },
      });
    } catch {
      // Fallback to console in browser contexts where logger creation fails
      _logger = {
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      } as ReturnType<typeof createLoggerSync>;
    }
  }
  return _logger;
};

// Debounce delay for auto-save
const _DEBOUNCE_DELAY_MS = 1000;

// Generate unique ID using crypto API or fallback
const _generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const usePersonalitiesStore = create<PersonalitiesStore>()((
  set,
  get,
) => {
  // Debounce timer reference
  let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Store snapshot for rollback
  let _rollbackSnapshot: PersonalityViewModel[] | null = null;

  /**
   * Internal debounced save function
   * Batches rapid changes and persists after delay
   */
  const _debouncedSave = () => {
    // Clear existing timer
    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
    }

    // Set new timer (minimal delay in tests)
    const delay = process.env.NODE_ENV === "test" ? 1 : _DEBOUNCE_DELAY_MS;
    _debounceTimer = setTimeout(async () => {
      const { adapter } = get();
      if (!adapter) {
        _getLogger().warn("Cannot save: no adapter configured");
        return;
      }

      // Perform the actual save
      try {
        await get().persistChanges();
      } catch (error) {
        _getLogger().error(
          "Auto-save failed",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }, delay);
  };

  /**
   * Create a properly formatted error state
   */
  const _createErrorState = (
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
  const _clearErrorState = (): ErrorState => _createErrorState(null);

  /**
   * Determines if an error is retryable based on its type and characteristics
   */
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

    // Check for PersonalitiesPersistenceError
    if (error instanceof PersonalitiesPersistenceError) {
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
            ? "Personalities configuration not found. Starting with defaults."
            : "Unable to save: Configuration file not accessible.";
        case "EACCES":
        case "EPERM":
          return "Permission denied. Check folder permissions for the app data directory.";
        case "ENOSPC":
          return "Insufficient disk space to save personalities.";
        case "ETIMEDOUT":
          return "Operation timed out. Please check your connection.";
        default:
          break;
      }
    }

    // PersonalitiesPersistenceError
    if (error instanceof PersonalitiesPersistenceError) {
      return error.message;
    }

    // Generic error with message
    if (error instanceof Error) {
      return error.message;
    }

    // Fallback
    return `Failed to ${operation} personalities. Please try again.`;
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
    _getLogger().error(
      `${operation} operation failed`,
      error instanceof Error ? error : new Error(String(error)),
    );
  };

  /**
   * Handle save errors with rollback and retry logic
   */
  const _handleSaveError = async (
    error: unknown,
    originalPersonalities: PersonalityViewModel[],
  ): Promise<void> => {
    // Use the new error handling infrastructure
    _handlePersistenceError(error, "save");

    // Rollback to original state with pending operations cleanup
    set((state) => ({
      personalities: originalPersonalities,
      isSaving: false,
      pendingOperations: state.pendingOperations.map((op) => ({
        ...op,
        status: op.status === "pending" ? "failed" : op.status,
      })),
    }));

    // Announce rollback to UI for user feedback
    const errorType =
      error instanceof Error ? error.constructor.name : typeof error;
    _getLogger().info(
      `Rolled back to previous state after save error. Original personality count: ${originalPersonalities.length}, Error type: ${errorType}`,
    );

    // This function handles rollback and error reporting
  };

  return {
    personalities: [],
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
    createPersonality: (personalityData: PersonalityFormData) => {
      try {
        // Validate input data
        const validatedData = personalitySchema.parse(personalityData);

        // Check name uniqueness
        const { isPersonalityNameUnique } = get();
        if (!isPersonalityNameUnique(validatedData.name)) {
          set({
            error: _createErrorState(
              "A personality with this name already exists",
            ),
          });
          return "";
        }

        const newPersonality: PersonalityViewModel = {
          id: _generateId(),
          ...validatedData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const operationId = _generateId();
        set((state) => ({
          personalities: [...state.personalities, newPersonality],
          error: _clearErrorState(),
          pendingOperations: [
            ...state.pendingOperations,
            {
              id: operationId,
              type: "create",
              personalityId: newPersonality.id,
              timestamp: new Date().toISOString(),
              rollbackData: undefined, // No rollback for create
              status: "pending" as const,
            },
          ],
        }));

        // Trigger auto-save
        _debouncedSave();

        return newPersonality.id;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create personality";
        set({ error: _createErrorState(errorMessage) });
        return "";
      }
    },

    updatePersonality: (id: string, personalityData: PersonalityFormData) => {
      try {
        const validatedData = personalitySchema.parse(personalityData);
        const { personalities, isPersonalityNameUnique } = get();

        const existingPersonality = personalities.find(
          (personality) => personality.id === id,
        );
        if (!existingPersonality) {
          set({ error: _createErrorState("Personality not found") });
          return;
        }

        // Check name uniqueness (excluding current personality)
        if (!isPersonalityNameUnique(validatedData.name, id)) {
          set({
            error: _createErrorState(
              "A personality with this name already exists",
            ),
          });
          return;
        }

        const operationId = _generateId();
        set((state) => ({
          personalities: state.personalities.map((personality) =>
            personality.id === id
              ? {
                  ...personality,
                  ...validatedData,
                  updatedAt: new Date().toISOString(),
                }
              : personality,
          ),
          error: _clearErrorState(),
          pendingOperations: [
            ...state.pendingOperations,
            {
              id: operationId,
              type: "update",
              personalityId: id,
              timestamp: new Date().toISOString(),
              rollbackData: existingPersonality, // Store original for potential rollback
              status: "pending" as const,
            },
          ],
        }));

        // Trigger auto-save
        _debouncedSave();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update personality";
        set({ error: _createErrorState(errorMessage) });
      }
    },

    deletePersonality: (id: string) => {
      const { personalities } = get();
      const personalityToDelete = personalities.find(
        (personality) => personality.id === id,
      );

      if (!personalityToDelete) {
        set({ error: _createErrorState("Personality not found") });
        return;
      }

      const operationId = _generateId();
      set((state) => ({
        personalities: state.personalities.filter(
          (personality) => personality.id !== id,
        ),
        error: _clearErrorState(),
        pendingOperations: [
          ...state.pendingOperations,
          {
            id: operationId,
            type: "delete",
            personalityId: id,
            timestamp: new Date().toISOString(),
            rollbackData: personalityToDelete, // Store for potential restoration
            status: "pending",
          },
        ],
      }));

      // Trigger auto-save
      _debouncedSave();
    },

    getPersonalityById: (id: string) => {
      return get().personalities.find((personality) => personality.id === id);
    },

    isPersonalityNameUnique: (name: string, excludeId?: string) => {
      const { personalities } = get();
      return !personalities.some(
        (personality) =>
          personality.name.toLowerCase() === name.toLowerCase() &&
          personality.id !== excludeId,
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

    setAdapter: (adapter: PersonalitiesPersistenceAdapter) => {
      set({ adapter });
    },

    initialize: async (adapter: PersonalitiesPersistenceAdapter) => {
      set({
        adapter,
        isLoading: true,
        error: _clearErrorState(),
      });

      try {
        // Load data from adapter
        const persistedData = await adapter.load();

        if (persistedData) {
          // Transform persistence data to UI format
          const uiPersonalities =
            mapPersonalitiesPersistenceToUI(persistedData);

          set({
            personalities: uiPersonalities,
            isInitialized: true,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: _clearErrorState(),
          });
        } else {
          // No persisted data, start with empty array
          set({
            personalities: [],
            isInitialized: true,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: _clearErrorState(),
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to initialize personalities: ${error.message}`
            : "Failed to initialize personalities";

        set({
          isInitialized: false,
          isLoading: false,
          error: _createErrorState(errorMessage, "load"),
        });

        // Log detailed error for debugging but don't throw to avoid crashing UI
        console.error("Personalities store initialization error:", error);
      }
    },

    persistChanges: async () => {
      const { adapter, personalities, isSaving } = get();

      // Prevent concurrent saves
      if (isSaving) {
        _getLogger().info("Save already in progress, skipping");
        return;
      }

      if (!adapter) {
        throw new PersonalitiesPersistenceError(
          "Cannot persist changes: no adapter configured",
          "save",
        );
      }

      // Take snapshot for potential rollback
      _rollbackSnapshot = [...personalities];

      set({
        isSaving: true,
        error: _clearErrorState(),
      });

      try {
        // Map to persistence format and save through adapter
        const persistedData = mapPersonalitiesUIToPersistence(personalities);

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

        _getLogger().info(
          `Successfully saved ${personalities.length} personalities`,
        );

        _rollbackSnapshot = null;
      } catch (error) {
        // Handle save error with potential retry
        await _handleSaveError(error, _rollbackSnapshot || []);

        // Re-throw for caller handling
        throw error;
      }
    },

    syncWithStorage: async () => {
      const { adapter } = get();

      if (!adapter) {
        throw new PersonalitiesPersistenceError(
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
          const uiPersonalities =
            mapPersonalitiesPersistenceToUI(persistedData);

          set({
            personalities: uiPersonalities,
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: _clearErrorState(),
          });

          _getLogger().info(
            `Synced ${uiPersonalities.length} personalities from storage`,
          );
        } else {
          set({
            personalities: [],
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
            error: _clearErrorState(),
          });

          _getLogger().info("No personalities found in storage");
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

    exportPersonalities: async () => {
      const { personalities } = get();

      try {
        // Transform current UI state to persistence format
        const persistedData = mapPersonalitiesUIToPersistence(personalities);

        _getLogger().info(
          `Exported ${personalities.length} personalities for backup`,
        );

        return persistedData;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to export personalities: ${error.message}`
            : "Failed to export personalities";

        set({ error: _createErrorState(errorMessage) });

        _getLogger().error(
          "Export personalities failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    importPersonalities: async (data: PersistedPersonalitiesSettingsData) => {
      const { adapter } = get();

      if (!adapter) {
        throw new PersonalitiesPersistenceError(
          "Cannot import personalities: no adapter configured",
          "save",
        );
      }

      set({
        isSaving: true,
        error: _clearErrorState(),
      });

      try {
        // Validate imported data structure
        const validatedData = mapPersonalitiesUIToPersistence(
          mapPersonalitiesPersistenceToUI(data),
        );

        // Transform from persistence to UI format
        const uiPersonalities = mapPersonalitiesPersistenceToUI(validatedData);

        // Replace current store state with imported data
        set({
          personalities: uiPersonalities,
          isSaving: false,
          lastSyncTime: new Date().toISOString(),
          pendingOperations: [],
          error: _clearErrorState(),
        });

        // Save imported data to persistence
        await adapter.save(validatedData);

        _getLogger().info(
          `Successfully imported ${uiPersonalities.length} personalities`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to import personalities: ${error.message}`
            : "Failed to import personalities";

        set({
          isSaving: false,
          error: _createErrorState(errorMessage, "import"),
        });

        _getLogger().error(
          "Import personalities failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    resetPersonalities: async () => {
      const { adapter } = get();

      if (!adapter) {
        throw new PersonalitiesPersistenceError(
          "Cannot reset personalities: no adapter configured",
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
          personalities: [],
          isInitialized: false,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          error: _clearErrorState(),
        });

        // Call adapter's reset() method
        await adapter.reset();

        _getLogger().info("Successfully reset all personalities and storage");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Failed to reset personalities: ${error.message}`
            : "Failed to reset personalities";

        set({
          isSaving: false,
          error: _createErrorState(errorMessage, "reset"),
        });

        _getLogger().error(
          "Reset personalities failed",
          error instanceof Error ? error : new Error(String(error)),
        );

        throw error;
      }
    },

    // Error recovery methods
    retryLastOperation: async () => {
      const { error } = get();
      if (!error) {
        _getLogger().warn("No error state to retry");
        return;
      }

      if (!error.operation || !error.isRetryable) {
        _getLogger().warn("No retryable operation found");
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
            _getLogger().warn("Import retry not implemented");
            break;
          case "reset":
            await get().resetPersonalities();
            break;
        }
      } catch (retryError) {
        // Error will be handled by the operation itself
        _getLogger().error(
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

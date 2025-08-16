/**
 * Zustand store for personalities management with CRUD operations.
 *
 * Provides reactive state management for user-created personalities with
 * comprehensive validation, error handling, and persistence integration.
 *
 * @module stores/personalitiesStore
 */

// import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { create } from "zustand";
// import { mapPersonalitiesPersistenceToUI } from "../mapping/personalities/mapPersonalitiesPersistenceToUI";
// import { mapPersonalitiesUIToPersistence } from "../mapping/personalities/mapPersonalitiesUIToPersistence";
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

// Maximum retry attempts for save operations
const _MAX_RETRY_ATTEMPTS = 3;

// Base delay for exponential backoff (in ms)
const _RETRY_BASE_DELAY_MS = 1000;

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

  // Retry count for exponential backoff
  let _retryCount = 0;

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

    // Set new timer
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
    }, _DEBOUNCE_DELAY_MS);
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

    initialize: async () => {
      throw new Error("initialize not yet implemented");
    },

    persistChanges: async () => {
      throw new Error("persistChanges not yet implemented");
    },

    syncWithStorage: async () => {
      throw new Error("syncWithStorage not yet implemented");
    },

    exportPersonalities: async () => {
      throw new Error("exportPersonalities not yet implemented");
    },

    importPersonalities: async () => {
      throw new Error("importPersonalities not yet implemented");
    },

    resetPersonalities: async () => {
      throw new Error("resetPersonalities not yet implemented");
    },

    retryLastOperation: async () => {
      throw new Error("retryLastOperation not yet implemented");
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

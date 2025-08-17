/**
 * Unit tests for the personalities Zustand store.
 *
 * Tests store initialization, basic state management, validation, error handling,
 * and interface compliance. CRUD operations are tested in separate task.
 *
 * @module stores/__tests__/usePersonalitiesStore.test
 */

import { PersonalitiesPersistenceAdapter } from "../../types/personalities/persistence/PersonalitiesPersistenceAdapter";
import { usePersonalitiesStore } from "../usePersonalitiesStore";

// Mock console methods
const mockConsoleError = jest.fn();

beforeEach(() => {
  // Reset store to clean state
  usePersonalitiesStore.setState({
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
  });

  // Reset console mocks
  mockConsoleError.mockClear();
  jest.spyOn(console, "error").mockImplementation(mockConsoleError);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("usePersonalitiesStore", () => {
  describe("store initialization", () => {
    it("should initialize with correct default values", () => {
      const state = usePersonalitiesStore.getState();

      expect(state.personalities).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error?.message).toBeNull();
      expect(state.error?.operation).toBeNull();
      expect(state.error?.isRetryable).toBe(false);
      expect(state.error?.retryCount).toBe(0);
      expect(state.error?.timestamp).toBeNull();
      expect(state.adapter).toBeNull();
      expect(state.isInitialized).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.lastSyncTime).toBeNull();
      expect(state.pendingOperations).toEqual([]);
      expect(state.retryTimers).toBeInstanceOf(Map);
    });
  });

  describe("error state management", () => {
    it("should set error correctly", () => {
      const store = usePersonalitiesStore.getState();

      store.setError("Test error message");
      const state = usePersonalitiesStore.getState();

      expect(state.error?.message).toBe("Test error message");
      expect(state.error?.timestamp).toBeTruthy();
      expect(typeof state.error?.timestamp).toBe("string");
    });

    it("should clear error correctly", () => {
      const store = usePersonalitiesStore.getState();

      // Set an error first
      store.setError("Test error");
      expect(usePersonalitiesStore.getState().error?.message).toBe(
        "Test error",
      );

      // Clear the error
      store.clearError();
      const state = usePersonalitiesStore.getState();

      expect(state.error?.message).toBeNull();
      expect(state.error?.timestamp).toBeNull();
    });

    it("should set error to null when passing null", () => {
      const store = usePersonalitiesStore.getState();

      // Set an error first
      store.setError("Test error");
      expect(usePersonalitiesStore.getState().error?.message).toBe(
        "Test error",
      );

      // Clear by setting null
      store.setError(null);
      const state = usePersonalitiesStore.getState();

      expect(state.error?.message).toBeNull();
      expect(state.error?.timestamp).toBeNull();
    });

    it("should get error details correctly", () => {
      const store = usePersonalitiesStore.getState();

      store.setError("Test error details");
      const errorDetails = store.getErrorDetails();

      expect(errorDetails?.message).toBe("Test error details");
      expect(errorDetails?.timestamp).toBeTruthy();
    });

    it("should return clean error state when no error exists", () => {
      const store = usePersonalitiesStore.getState();
      const errorDetails = store.getErrorDetails();

      expect(errorDetails?.message).toBeNull();
      expect(errorDetails?.operation).toBeNull();
      expect(errorDetails?.isRetryable).toBe(false);
      expect(errorDetails?.retryCount).toBe(0);
      expect(errorDetails?.timestamp).toBeNull();
    });
  });

  describe("loading state management", () => {
    it("should set loading state to true", () => {
      const store = usePersonalitiesStore.getState();

      store.setLoading(true);

      expect(usePersonalitiesStore.getState().isLoading).toBe(true);
    });

    it("should set loading state to false", () => {
      const store = usePersonalitiesStore.getState();

      store.setLoading(false);

      expect(usePersonalitiesStore.getState().isLoading).toBe(false);
    });

    it("should convert truthy values to boolean", () => {
      const store = usePersonalitiesStore.getState();

      store.setLoading("truthy string" as unknown as boolean);
      expect(usePersonalitiesStore.getState().isLoading).toBe(true);

      store.setLoading(0 as unknown as boolean);
      expect(usePersonalitiesStore.getState().isLoading).toBe(false);
    });
  });

  describe("adapter management", () => {
    it("should set adapter correctly", () => {
      const store = usePersonalitiesStore.getState();
      const mockAdapter = {} as PersonalitiesPersistenceAdapter;

      store.setAdapter(mockAdapter);

      expect(usePersonalitiesStore.getState().adapter).toBe(mockAdapter);
    });
  });

  describe("retry timers cleanup", () => {
    it("should clear retry timers when clearing error state", () => {
      const store = usePersonalitiesStore.getState();

      // Add a mock timer
      const mockTimer = setTimeout(() => {}, 1000);
      store.retryTimers.set("test", mockTimer);

      expect(store.retryTimers.size).toBe(1);

      store.clearErrorState();

      expect(store.retryTimers.size).toBe(0);
      clearTimeout(mockTimer); // cleanup
    });

    it("should clear error state when clearing error state", () => {
      const store = usePersonalitiesStore.getState();

      // Set an error first
      store.setError("Test error");
      expect(usePersonalitiesStore.getState().error?.message).toBe(
        "Test error",
      );

      store.clearErrorState();
      const state = usePersonalitiesStore.getState();

      expect(state.error?.message).toBeNull();
      expect(state.error?.timestamp).toBeNull();
    });
  });

  describe("TypeScript interface compliance", () => {
    it("should implement all required PersonalitiesStore methods", () => {
      const store = usePersonalitiesStore.getState();

      // Check that all methods exist (even if not implemented yet)
      expect(typeof store.createPersonality).toBe("function");
      expect(typeof store.updatePersonality).toBe("function");
      expect(typeof store.deletePersonality).toBe("function");
      expect(typeof store.getPersonalityById).toBe("function");
      expect(typeof store.isPersonalityNameUnique).toBe("function");
      expect(typeof store.setLoading).toBe("function");
      expect(typeof store.setError).toBe("function");
      expect(typeof store.clearError).toBe("function");
      expect(typeof store.setAdapter).toBe("function");
      expect(typeof store.initialize).toBe("function");
      expect(typeof store.persistChanges).toBe("function");
      expect(typeof store.syncWithStorage).toBe("function");
      expect(typeof store.exportPersonalities).toBe("function");
      expect(typeof store.importPersonalities).toBe("function");
      expect(typeof store.resetPersonalities).toBe("function");
      expect(typeof store.retryLastOperation).toBe("function");
      expect(typeof store.clearErrorState).toBe("function");
      expect(typeof store.getErrorDetails).toBe("function");
    });

    it("should have correct state structure", () => {
      const state = usePersonalitiesStore.getState();

      expect(Array.isArray(state.personalities)).toBe(true);
      expect(typeof state.isLoading).toBe("boolean");
      expect(state.error).toBeDefined();
      expect(
        typeof state.error?.message === "string" ||
          state.error?.message === null,
      ).toBe(true);
      expect(
        typeof state.error?.operation === "string" ||
          state.error?.operation === null,
      ).toBe(true);
      expect(typeof state.error?.isRetryable).toBe("boolean");
      expect(typeof state.error?.retryCount).toBe("number");
      expect(
        typeof state.error?.timestamp === "string" ||
          state.error?.timestamp === null,
      ).toBe(true);
      expect(state.adapter === null || typeof state.adapter === "object").toBe(
        true,
      );
      expect(typeof state.isInitialized).toBe("boolean");
      expect(typeof state.isSaving).toBe("boolean");
      expect(
        typeof state.lastSyncTime === "string" || state.lastSyncTime === null,
      ).toBe(true);
      expect(Array.isArray(state.pendingOperations)).toBe(true);
      expect(state.retryTimers instanceof Map).toBe(true);
    });
  });
});

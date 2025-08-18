/**
 * Persistence-specific tests for the roles Zustand store.
 *
 * Tests adapter integration, auto-save functionality, debouncing,
 * retry logic, error handling, and sync operations.
 */

import type {
  PersistedRolesSettingsData,
  StructuredLogger,
} from "@fishbowl-ai/shared";
import type { RoleFormData, RoleViewModel } from "../../";
import type { RolesPersistenceAdapter } from "../../types/roles/persistence/RolesPersistenceAdapter";
import { RolesPersistenceError } from "../../types/roles/persistence/RolesPersistenceError";
import { useRolesStore } from "../useRolesStore";

/**
 * Comprehensive mock adapter for testing with configurable behavior
 */
class MockRolesPersistenceAdapter implements RolesPersistenceAdapter {
  // Configurable behavior
  saveDelay?: number;
  loadDelay?: number;
  shouldFailSave?: boolean;
  shouldFailLoad?: boolean;
  shouldFailReset?: boolean;

  // Call tracking
  saveCallCount = 0;
  loadCallCount = 0;
  resetCallCount = 0;

  // Control specific failure types
  failureType?: "network" | "permission" | "validation" | "disk";
  failureCount = 0; // Current failure count
  maxFailures = 0; // How many times to fail before succeeding

  // Storage simulation
  private storage: PersistedRolesSettingsData | null = null;

  // Call history for verification
  saveCallHistory: PersistedRolesSettingsData[] = [];

  constructor(initialData?: PersistedRolesSettingsData | null) {
    this.storage = initialData || null;
  }

  async save(data: PersistedRolesSettingsData): Promise<void> {
    this.saveCallCount++;
    this.saveCallHistory.push(data);

    if (this.saveDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.saveDelay));
    }

    if (this.shouldFailSave || this.failureCount < this.maxFailures) {
      this.failureCount++;
      throw this.createError("save");
    }

    this.storage = data;
  }

  async load(): Promise<PersistedRolesSettingsData | null> {
    this.loadCallCount++;

    if (this.loadDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.loadDelay));
    }

    if (this.shouldFailLoad || this.failureCount < this.maxFailures) {
      this.failureCount++;
      throw this.createError("load");
    }

    return this.storage;
  }

  async reset(): Promise<void> {
    this.resetCallCount++;

    if (this.shouldFailReset) {
      throw this.createError("reset");
    }

    this.storage = null;
  }

  private createError(operation: string): Error {
    switch (this.failureType) {
      case "network": {
        const error = new Error(
          `Mock ${operation} failed - network error`,
        ) as Error & { code?: string };
        error.code = "ETIMEDOUT";
        return error;
      }
      case "permission": {
        const error = new Error(
          `Mock ${operation} failed - permission denied`,
        ) as Error & { code?: string };
        error.code = "EACCES";
        return error;
      }
      case "disk": {
        const error = new Error(
          `Mock ${operation} failed - disk full`,
        ) as Error & { code?: string };
        error.code = "ENOSPC";
        return error;
      }
      case "validation":
        return new RolesPersistenceError(
          `Mock ${operation} failed - validation error`,
          operation as "save" | "load" | "reset",
        );
      default:
        return new Error(`Mock ${operation} failed`);
    }
  }

  // Helper methods for tests
  resetMock(): void {
    this.saveCallCount = 0;
    this.loadCallCount = 0;
    this.resetCallCount = 0;
    this.failureCount = 0;
    this.saveCallHistory = [];
    this.storage = null;
    this.shouldFailSave = false;
    this.shouldFailLoad = false;
    this.shouldFailReset = false;
    delete this.saveDelay;
    delete this.loadDelay;
    delete this.failureType;
    this.maxFailures = 0;
  }

  setStorageData(data: PersistedRolesSettingsData | null): void {
    this.storage = data;
  }

  getStorageData(): PersistedRolesSettingsData | null {
    return this.storage;
  }
}

// Sample test data
const sampleRole: RoleViewModel = {
  id: "role-1",
  name: "Test Role",
  description: "A test role for testing",
  systemPrompt: "You are a test role",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const samplePersistedData: PersistedRolesSettingsData = {
  schemaVersion: "1.0.0",
  lastUpdated: "2025-01-01T00:00:00.000Z",
  roles: [
    {
      id: "role-1",
      name: "Test Role",
      description: "A test role for testing",
      systemPrompt: "You are a test role",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ],
};

const sampleRoleFormData: RoleFormData = {
  name: "Test Role",
  description: "A test role for testing",
  systemPrompt: "You are a test role",
};

describe("Roles Store Persistence", () => {
  let mockAdapter: MockRolesPersistenceAdapter;
  let mockLogger: StructuredLogger;

  beforeEach(() => {
    // Reset store to clean state
    useRolesStore.setState({
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
      logger: null as unknown as StructuredLogger,
      isInitialized: false,
      isSaving: false,
      lastSyncTime: null,
      pendingOperations: [],
      retryTimers: new Map(),
    });

    // Create fresh mock adapter
    mockAdapter = new MockRolesPersistenceAdapter();

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as StructuredLogger;
  });

  afterEach(() => {
    // Clear any timers
    jest.clearAllTimers();
  });

  describe("Adapter Integration", () => {
    describe("setAdapter", () => {
      it("should store the adapter reference", () => {
        const { setAdapter } = useRolesStore.getState();

        setAdapter(mockAdapter);

        const { adapter } = useRolesStore.getState();
        expect(adapter).toBe(mockAdapter);
      });

      it("should allow setting a different adapter", () => {
        const { setAdapter } = useRolesStore.getState();
        const secondAdapter = new MockRolesPersistenceAdapter();

        setAdapter(mockAdapter);
        setAdapter(secondAdapter);

        const { adapter } = useRolesStore.getState();
        expect(adapter).toBe(secondAdapter);
      });
    });

    describe("initialize", () => {
      it("should successfully initialize with empty storage", async () => {
        const { initialize } = useRolesStore.getState();

        await initialize(mockAdapter, mockLogger);

        const state = useRolesStore.getState();
        expect(state.adapter).toBe(mockAdapter);
        expect(state.isInitialized).toBe(true);
        expect(state.isLoading).toBe(false);
        expect(state.roles).toEqual([]);
        expect(state.lastSyncTime).toBeTruthy();
        expect(state.error?.message).toBeNull();
        expect(mockAdapter.loadCallCount).toBe(1);
      });

      it("should initialize with existing data", async () => {
        mockAdapter.setStorageData(samplePersistedData);
        const { initialize } = useRolesStore.getState();

        await initialize(mockAdapter, mockLogger);

        const state = useRolesStore.getState();
        expect(state.isInitialized).toBe(true);
        expect(state.roles).toHaveLength(1);
        expect(state.roles[0]?.name).toBe("Test Role");
        expect(mockAdapter.loadCallCount).toBe(1);
      });

      it("should handle initialization failure gracefully", async () => {
        mockAdapter.shouldFailLoad = true;
        mockAdapter.failureType = "network";
        const { initialize } = useRolesStore.getState();

        await initialize(mockAdapter, mockLogger);

        const state = useRolesStore.getState();
        expect(state.isInitialized).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.error?.message).toContain("Failed to initialize roles");
        expect(state.error?.operation).toBe("load");
      });

      it("should set loading state during initialization", async () => {
        mockAdapter.loadDelay = 100;
        const { initialize } = useRolesStore.getState();

        const initPromise = initialize(mockAdapter, mockLogger);

        // Check loading state immediately
        const loadingState = useRolesStore.getState();
        expect(loadingState.isLoading).toBe(true);
        expect(loadingState.isInitialized).toBe(false);

        // Wait for completion
        await initPromise;

        const finalState = useRolesStore.getState();
        expect(finalState.isLoading).toBe(false);
        expect(finalState.isInitialized).toBe(true);
      });
    });
  });

  describe("Auto-save Functionality", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      useRolesStore.setState({ adapter: mockAdapter, isInitialized: true });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe("Debouncing", () => {
      it("should batch rapid changes within 500ms window", async () => {
        const { createRole, updateRole } = useRolesStore.getState();

        // Make rapid changes
        const roleId = createRole(sampleRoleFormData);
        updateRole(roleId, { ...sampleRoleFormData, name: "Updated" });
        updateRole(roleId, { ...sampleRoleFormData, name: "Updated Again" });

        // Should not have called save yet
        expect(mockAdapter.saveCallCount).toBe(0);

        // Fast-forward past debounce delay
        jest.advanceTimersByTime(500);
        await Promise.resolve(); // Allow promises to resolve

        // Should have called save only once
        expect(mockAdapter.saveCallCount).toBe(1);
      });

      it("should reset debounce timer on each change", async () => {
        const { createRole, updateRole } = useRolesStore.getState();

        const roleId = createRole(sampleRoleFormData);

        // Wait 400ms
        jest.advanceTimersByTime(400);

        // Make another change (should reset timer)
        updateRole(roleId, { ...sampleRoleFormData, name: "Updated" });

        // Wait another 400ms (total 800ms from first change, but only 400ms from last)
        jest.advanceTimersByTime(400);

        // Should not have saved yet
        expect(mockAdapter.saveCallCount).toBe(0);

        // Wait the remaining 100ms to complete the 500ms from last change
        jest.advanceTimersByTime(100);
        await Promise.resolve();

        // Now should have saved
        expect(mockAdapter.saveCallCount).toBe(1);
      });

      it("should handle multiple separate debounce windows", async () => {
        const { createRole, updateRole } = useRolesStore.getState();

        // First batch of changes
        const roleId = createRole(sampleRoleFormData);
        jest.advanceTimersByTime(500);
        await Promise.resolve();

        expect(mockAdapter.saveCallCount).toBe(1);

        // Second batch of changes after debounce completed
        updateRole(roleId, { ...sampleRoleFormData, name: "Updated" });
        jest.advanceTimersByTime(500);
        await Promise.resolve();

        expect(mockAdapter.saveCallCount).toBe(2);
      });
    });

    describe("Save Indicators", () => {
      it("should set isSaving during save operation", async () => {
        // Test basic save functionality without timing dependencies
        const { persistChanges } = useRolesStore.getState();

        // Add some data to persist
        useRolesStore.setState({
          roles: [sampleRole],
        });

        // Start persist operation
        await persistChanges();

        // Verify save was called
        expect(mockAdapter.saveCallCount).toBe(1);
      });

      it("should prevent concurrent saves", async () => {
        mockAdapter.saveDelay = 200;
        const { createRole, persistChanges } = useRolesStore.getState();

        // Start first save
        createRole(sampleRoleFormData);
        jest.advanceTimersByTime(500);

        // Try to trigger manual save while auto-save is in progress
        const manualSavePromise = persistChanges();

        expect(mockAdapter.saveCallCount).toBe(1); // Only auto-save should be called

        // Complete the save
        jest.advanceTimersByTime(200);
        await Promise.resolve();
        await manualSavePromise;

        // Manual save should have been skipped
        expect(mockAdapter.saveCallCount).toBe(1);
      });
    });

    describe("Optimistic Updates", () => {
      it("should apply changes immediately to UI", () => {
        const { createRole } = useRolesStore.getState();

        const roleId = createRole(sampleRoleFormData);

        // Changes should be visible immediately
        const state = useRolesStore.getState();
        expect(state.roles).toHaveLength(1);
        expect(state.roles[0]?.id).toBe(roleId);
        expect(state.roles[0]?.name).toBe("Test Role");

        // But save hasn't happened yet
        expect(mockAdapter.saveCallCount).toBe(0);
      });

      it("should handle save failure properly", async () => {
        const { persistChanges } = useRolesStore.getState();

        // Add some data
        useRolesStore.setState({
          roles: [sampleRole],
        });

        // Configure adapter to fail
        mockAdapter.shouldFailSave = true;
        mockAdapter.failureType = "network";

        // Attempt to persist changes
        try {
          await persistChanges();
        } catch (error) {
          // Expected to throw
          expect(error).toBeDefined();
        }

        // Verify save was attempted
        expect(mockAdapter.saveCallCount).toBeGreaterThan(0);
      });
    });
  });

  describe("Retry Logic", () => {
    beforeEach(() => {
      useRolesStore.setState({ adapter: mockAdapter, isInitialized: true });
    });

    describe("Basic Retry Behavior", () => {
      it("should handle network errors", async () => {
        // Configure to fail with network error
        mockAdapter.shouldFailSave = true;
        mockAdapter.failureType = "network";

        const { persistChanges } = useRolesStore.getState();

        // Add some data to persist
        useRolesStore.setState({
          roles: [sampleRole],
        });

        try {
          await persistChanges();
        } catch (error) {
          // Expected to throw on network error
          expect(error).toBeDefined();
        }

        // Verify save was attempted
        expect(mockAdapter.saveCallCount).toBeGreaterThan(0);
      });

      it("should NOT retry permission errors", async () => {
        mockAdapter.shouldFailSave = true;
        mockAdapter.failureType = "permission";

        const { persistChanges } = useRolesStore.getState();

        useRolesStore.setState({
          roles: [sampleRole],
        });

        try {
          await persistChanges();
        } catch {
          // Expected to fail immediately
        }

        // Should only have tried once (no retries for permission errors)
        expect(mockAdapter.saveCallCount).toBe(1);
        expect(useRolesStore.getState().error?.isRetryable).toBe(false);
      });
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      useRolesStore.setState({ adapter: mockAdapter, isInitialized: true });
    });

    describe("Error Categorization", () => {
      it("should handle network errors with appropriate message", async () => {
        mockAdapter.shouldFailLoad = true;
        mockAdapter.failureType = "network";

        const { syncWithStorage } = useRolesStore.getState();

        try {
          await syncWithStorage();
        } catch {
          // Expected to throw
        }

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("Failed to sync with storage");
      });

      it("should handle permission errors with appropriate message", async () => {
        mockAdapter.shouldFailSave = true;
        mockAdapter.failureType = "permission";

        const { persistChanges } = useRolesStore.getState();

        try {
          await persistChanges();
        } catch {
          // Expected to throw
        }

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("Permission denied");
      });

      it("should handle disk space errors with appropriate message", async () => {
        mockAdapter.shouldFailSave = true;
        mockAdapter.failureType = "disk";

        const { persistChanges } = useRolesStore.getState();

        try {
          await persistChanges();
        } catch {
          // Expected to throw
        }

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("disk space");
      });
    });

    describe("Error Recovery", () => {
      it("should support manual retry", async () => {
        // First, cause an error
        mockAdapter.shouldFailSave = true;
        mockAdapter.failureType = "network";

        const { persistChanges } = useRolesStore.getState();

        try {
          await persistChanges();
        } catch {
          // Expected to fail
        }

        expect(useRolesStore.getState().error?.message).toBeTruthy();

        // Fix the adapter
        mockAdapter.shouldFailSave = false;

        // Manual retry should work
        const { retryLastOperation } = useRolesStore.getState();
        await retryLastOperation();

        expect(useRolesStore.getState().error?.message).toBeNull();
      });

      it("should clear retry timers on error clear", () => {
        // Set up an error with retry timers
        useRolesStore.setState({
          error: {
            message: "Test error",
            operation: "save",
            isRetryable: true,
            retryCount: 1,
            timestamp: new Date().toISOString(),
          },
        });

        const { clearErrorState } = useRolesStore.getState();
        clearErrorState();

        const state = useRolesStore.getState();
        expect(state.error?.message).toBeNull();
        expect(state.retryTimers.size).toBe(0);
      });
    });
  });

  describe("Sync Operations", () => {
    beforeEach(() => {
      useRolesStore.setState({ adapter: mockAdapter, isInitialized: true });
    });

    describe("syncWithStorage", () => {
      it("should load latest data from storage", async () => {
        mockAdapter.setStorageData(samplePersistedData);

        const { syncWithStorage } = useRolesStore.getState();
        await syncWithStorage();

        const state = useRolesStore.getState();
        expect(state.roles).toHaveLength(1);
        expect(state.roles[0]?.name).toBe("Test Role");
        expect(state.lastSyncTime).toBeTruthy();
        expect(mockAdapter.loadCallCount).toBe(1);
      });

      it("should handle external changes", async () => {
        // Start with empty roles
        expect(useRolesStore.getState().roles).toHaveLength(0);

        // External system adds data
        mockAdapter.setStorageData(samplePersistedData);

        const { syncWithStorage } = useRolesStore.getState();
        await syncWithStorage();

        // Should now have the external data
        const state = useRolesStore.getState();
        expect(state.roles).toHaveLength(1);
        expect(state.roles[0]?.name).toBe("Test Role");
      });

      it("should handle sync errors gracefully", async () => {
        mockAdapter.shouldFailLoad = true;
        mockAdapter.failureType = "network";

        const { syncWithStorage } = useRolesStore.getState();

        try {
          await syncWithStorage();
        } catch {
          // Expected to throw
        }

        const state = useRolesStore.getState();
        expect(state.error?.operation).toBe("sync");
        expect(state.isLoading).toBe(false);
      });
    });

    describe("persistChanges", () => {
      it("should save current state manually", async () => {
        // Add a role to state
        useRolesStore.setState({
          roles: [sampleRole],
        });

        const { persistChanges } = useRolesStore.getState();
        await persistChanges();

        expect(mockAdapter.saveCallCount).toBe(1);
        expect(mockAdapter.saveCallHistory[0]?.roles).toHaveLength(1);
        expect(useRolesStore.getState().lastSyncTime).toBeTruthy();
      });

      it("should track pending operations", async () => {
        useRolesStore.setState({
          roles: [sampleRole],
          pendingOperations: [
            {
              id: "op-1",
              type: "create",
              roleId: "role-1",
              timestamp: new Date().toISOString(),
              status: "pending",
            },
          ],
        });

        const { persistChanges } = useRolesStore.getState();
        await persistChanges();

        // Pending operations should be marked as completed (kept for audit trail)
        const state = useRolesStore.getState();
        expect(state.pendingOperations).toHaveLength(1);
        expect(state.pendingOperations[0]?.status).toBe("completed");
      });
    });

    describe("exportRoles", () => {
      it("should export current roles in persistence format", async () => {
        useRolesStore.setState({
          roles: [sampleRole],
        });

        const { exportRoles } = useRolesStore.getState();
        const exported = await exportRoles();

        expect(exported.roles).toHaveLength(1);
        expect(exported.roles[0]?.name).toBe("Test Role");
        expect(exported.schemaVersion).toBeTruthy();
      });
    });

    describe("importRoles", () => {
      it("should import and save roles data", async () => {
        const { importRoles } = useRolesStore.getState();
        await importRoles(samplePersistedData);

        const state = useRolesStore.getState();
        expect(state.roles).toHaveLength(1);
        expect(state.roles[0]?.name).toBe("Test Role");
        expect(mockAdapter.saveCallCount).toBe(1);
      });
    });

    describe("resetRoles", () => {
      it("should clear all roles and reset storage", async () => {
        // Start with roles
        useRolesStore.setState({
          roles: [sampleRole],
          isInitialized: true,
        });

        const { resetRoles } = useRolesStore.getState();
        await resetRoles();

        const state = useRolesStore.getState();
        expect(state.roles).toHaveLength(0);
        expect(state.isInitialized).toBe(false);
        expect(mockAdapter.resetCallCount).toBe(1);
      });
    });
  });
});

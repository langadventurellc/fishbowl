/**
 * Unit tests for the roles Zustand store.
 *
 * Tests store initialization, CRUD operations, validation, error handling,
 * persistence integration, and edge cases.
 *
 * @module stores/__tests__/rolesStore.test
 */

import type {
  PersistedRolesSettingsData,
  StructuredLogger,
} from "@fishbowl-ai/shared";
import type { RoleFormData, RoleViewModel } from "../../";
import type { RolesPersistenceAdapter } from "../../types/roles/persistence/RolesPersistenceAdapter";
import { RolesPersistenceError } from "../../types/roles/persistence/RolesPersistenceError";
import { useRolesStore } from "../useRolesStore";

// Mock console methods
const mockConsoleError = jest.fn();

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
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as StructuredLogger,
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

describe("rolesStore", () => {
  describe("store initialization", () => {
    it("should initialize with correct default values", () => {
      const state = useRolesStore.getState();

      expect(state.roles).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error?.message).toBe(null);
    });
  });

  describe("createRole action", () => {
    const validRoleData: RoleFormData = {
      name: "Test Role",
      description: "Test description",
      systemPrompt: "Test system prompt",
    };

    it("should create a new role with valid data", () => {
      const store = useRolesStore.getState();

      const roleId = store.createRole(validRoleData);

      expect(roleId).toBeTruthy();
      expect(roleId).toMatch(/^[a-f0-9-]{36}$|^[a-z0-9]+$/); // UUID or fallback format

      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]).toBeTruthy();
      expect(state.roles[0]!.name).toBe(validRoleData.name);
      expect(state.roles[0]!.description).toBe(validRoleData.description);
      expect(state.roles[0]!.id).toBe(roleId);
      expect(state.roles[0]!.createdAt).toBeTruthy();
      expect(state.roles[0]!.updatedAt).toBeTruthy();
      expect(state.error?.message).toBe(null);
    });

    it("should reject duplicate role names (case-insensitive)", () => {
      const store = useRolesStore.getState();

      // Create first role
      const firstId = store.createRole(validRoleData);
      expect(firstId).toBeTruthy();

      // Try to create role with same name (different case)
      const duplicateData: RoleFormData = {
        name: "TEST ROLE",
        description: "Different description",
        systemPrompt: "Test system prompt",
      };

      const secondId = store.createRole(duplicateData);

      expect(secondId).toBe("");
      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.error?.message).toBe("A role with this name already exists");
    });

    it("should handle invalid data and return empty string", () => {
      const store = useRolesStore.getState();

      const invalidData = {
        name: "", // Invalid: empty name
        description: "Valid description",
      } as RoleFormData;

      const roleId = store.createRole(invalidData);

      expect(roleId).toBe("");
      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(0);
      expect(state.error?.message).toBeTruthy();
    });

    it("should create a role with systemPrompt", () => {
      const store = useRolesStore.getState();

      const roleDataWithPrompt: RoleFormData = {
        name: "AI Assistant",
        description: "Helpful AI assistant role",
        systemPrompt: "You are a helpful AI assistant.",
      };

      const roleId = store.createRole(roleDataWithPrompt);

      expect(roleId).toBeTruthy();
      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]!.name).toBe(roleDataWithPrompt.name);
      expect(state.roles[0]!.description).toBe(roleDataWithPrompt.description);
      expect(state.roles[0]!.systemPrompt).toBe(
        roleDataWithPrompt.systemPrompt,
      );
      expect(state.error?.message).toBe(null);
    });

    it("should create a role with required systemPrompt", () => {
      const store = useRolesStore.getState();

      const roleDataWithPrompt: RoleFormData = {
        name: "Simple Role",
        description: "Role with system prompt",
        systemPrompt: "Test system prompt",
      };

      const roleId = store.createRole(roleDataWithPrompt);

      expect(roleId).toBeTruthy();
      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]!.name).toBe(roleDataWithPrompt.name);
      expect(state.roles[0]!.description).toBe(roleDataWithPrompt.description);
      expect(state.roles[0]!.systemPrompt).toBe(
        roleDataWithPrompt.systemPrompt,
      );
      expect(state.error?.message).toBe(null);
    });
  });

  describe("updateRole action", () => {
    const existingRole: RoleViewModel = {
      id: "existing-1",
      name: "Original Role",
      description: "Original description",
      systemPrompt: "Original system prompt",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useRolesStore.setState({
        roles: [existingRole],
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
    });

    it("should update existing role with valid data", () => {
      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: "Updated Role",
        description: "Updated description",
        systemPrompt: "Updated system prompt",
      };

      store.updateRole(existingRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]!.id).toBe(existingRole.id);
      expect(state.roles[0]!.name).toBe(updateData.name);
      expect(state.roles[0]!.description).toBe(updateData.description);
      expect(state.roles[0]!.createdAt).toBe(existingRole.createdAt);
      expect(state.roles[0]!.updatedAt).not.toBe(existingRole.updatedAt);
      expect(state.error?.message).toBe(null);
    });

    it("should reject non-existent role ID", () => {
      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: "Updated Role",
        description: "Updated description",
        systemPrompt: "Test system prompt",
      };

      store.updateRole("non-existent", updateData);

      const state = useRolesStore.getState();
      expect(state.roles[0]).toEqual(existingRole); // Unchanged
      expect(state.error?.message).toBe("Role not found");
    });

    it("should reject duplicate names when updating (excluding current role)", () => {
      const secondRole: RoleViewModel = {
        id: "existing-2",
        name: "Second Role",
        description: "Second description",
        systemPrompt: "Test system prompt",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      useRolesStore.setState({
        roles: [existingRole, secondRole],
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

      const store = useRolesStore.getState();

      // Try to update second role to have same name as first
      const updateData: RoleFormData = {
        name: existingRole.name,
        description: "Different description",
        systemPrompt: "Test system prompt",
      };

      store.updateRole(secondRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles[1]).toEqual(secondRole); // Unchanged
      expect(state.error?.message).toBe("A role with this name already exists");
    });

    it("should allow updating role to same name (no duplicate error)", () => {
      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: existingRole.name, // Same name
        description: "Updated description",
        systemPrompt: "Test system prompt",
      };

      store.updateRole(existingRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles[0]!.description).toBe(updateData.description);
      expect(state.error?.message).toBe(null);
    });

    it("should update role with systemPrompt", () => {
      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: existingRole.name,
        description: existingRole.description,
        systemPrompt: "You are an updated AI assistant.",
      };

      store.updateRole(existingRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles[0]!.systemPrompt).toBe(updateData.systemPrompt);
      expect(state.error?.message).toBe(null);
    });

    it("should update role to remove systemPrompt (set to undefined)", () => {
      // First create a role with systemPrompt
      const roleWithPrompt: RoleViewModel = {
        ...existingRole,
        systemPrompt: "Original system prompt",
      };

      useRolesStore.setState({
        roles: [roleWithPrompt],
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

      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: existingRole.name,
        description: existingRole.description,
        systemPrompt: "Test system prompt",
        // systemPrompt not provided, should remain as original or undefined depending on schema
      };

      store.updateRole(existingRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles[0]!.name).toBe(updateData.name);
      expect(state.roles[0]!.description).toBe(updateData.description);
      expect(state.error?.message).toBe(null);
    });
  });

  describe("deleteRole action", () => {
    const existingRole: RoleViewModel = {
      id: "existing-1",
      name: "Original Role",
      description: "Original description",
      systemPrompt: "Test system prompt",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useRolesStore.setState({
        roles: [existingRole],
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
    });

    it("should delete existing role", () => {
      const store = useRolesStore.getState();

      store.deleteRole(existingRole.id);

      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(0);
      expect(state.error?.message).toBe(null);
    });

    it("should handle non-existent role ID", () => {
      const store = useRolesStore.getState();

      store.deleteRole("non-existent");

      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1); // Unchanged
      expect(state.error?.message).toBe("Role not found");
    });
  });

  describe("getRoleById action", () => {
    const existingRole: RoleViewModel = {
      id: "existing-1",
      name: "Original Role",
      description: "Original description",
      systemPrompt: "Test system prompt",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useRolesStore.setState({
        roles: [existingRole],
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
    });

    it("should return role for existing ID", () => {
      const store = useRolesStore.getState();

      const role = store.getRoleById(existingRole.id);

      expect(role).toEqual(existingRole);
    });

    it("should return undefined for non-existent ID", () => {
      const store = useRolesStore.getState();

      const role = store.getRoleById("non-existent");

      expect(role).toBeUndefined();
    });
  });

  describe("isRoleNameUnique action", () => {
    const existingRoles: RoleViewModel[] = [
      {
        id: "role-1",
        name: "First Role",
        description: "First description",
        systemPrompt: "Test system prompt",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "role-1",
        name: "First Role",
        description: "First description",
        systemPrompt: "Test system prompt",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    beforeEach(() => {
      useRolesStore.setState({
        roles: existingRoles,
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
    });

    it("should return false for existing name", () => {
      const store = useRolesStore.getState();

      const isUnique = store.isRoleNameUnique("First Role");

      expect(isUnique).toBe(false);
    });

    it("should return false for existing name (case-insensitive)", () => {
      const store = useRolesStore.getState();

      const isUnique = store.isRoleNameUnique("FIRST ROLE");

      expect(isUnique).toBe(false);
    });

    it("should return true for unique name", () => {
      const store = useRolesStore.getState();

      const isUnique = store.isRoleNameUnique("Unique Role");

      expect(isUnique).toBe(true);
    });

    it("should exclude specified ID when checking uniqueness", () => {
      const store = useRolesStore.getState();

      // Should be unique when excluding the existing role with this name
      const isUnique = store.isRoleNameUnique("First Role", "role-1");

      expect(isUnique).toBe(true);
    });

    it("should return false when excluding different ID", () => {
      const store = useRolesStore.getState();

      // Should not be unique when excluding a different role
      const isUnique = store.isRoleNameUnique("First Role", "role-2");

      expect(isUnique).toBe(false);
    });
  });

  describe("state management actions", () => {
    it("should set loading state", () => {
      const store = useRolesStore.getState();

      store.setLoading(true);
      expect(useRolesStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(useRolesStore.getState().isLoading).toBe(false);
    });

    it("should set error state", () => {
      const store = useRolesStore.getState();

      store.setError("Test error");
      expect(useRolesStore.getState().error?.message).toBe("Test error");

      store.setError(null);
      expect(useRolesStore.getState().error?.message).toBe(null);
    });

    it("should clear error", () => {
      const store = useRolesStore.getState();

      store.setError("Test error");
      expect(useRolesStore.getState().error?.message).toBe("Test error");

      store.clearError();
      expect(useRolesStore.getState().error?.message).toBe(null);
    });
  });

  describe("sync and bulk operation methods", () => {
    const mockAdapter: RolesPersistenceAdapter = {
      save: jest.fn(),
      load: jest.fn(),
      reset: jest.fn(),
    };

    const sampleRoles: RoleViewModel[] = [
      {
        id: "role-1",
        name: "Test Role 1",
        description: "First test role",
        systemPrompt: "You are a test assistant",
        createdAt: "2025-01-10T10:00:00.000Z",
        updatedAt: "2025-01-10T10:00:00.000Z",
      },
      {
        id: "role-2",
        name: "Test Role 2",
        description: "Second test role",
        systemPrompt: "You are another test assistant",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    const samplePersistedData: PersistedRolesSettingsData = {
      schemaVersion: "1.0.0",
      roles: [
        {
          id: "role-1",
          name: "Test Role 1",
          description: "First test role",
          systemPrompt: "You are a test assistant",
          createdAt: "2025-01-10T10:00:00.000Z",
          updatedAt: "2025-01-10T10:00:00.000Z",
        },
      ],
      lastUpdated: "2025-01-10T12:00:00.000Z",
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("exportRoles", () => {
      it("should export roles in persistence format", async () => {
        useRolesStore.setState({
          roles: sampleRoles,
          isLoading: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();
        const exportedData = await store.exportRoles();

        expect(exportedData).toBeDefined();
        expect(exportedData.schemaVersion).toBe("1.0.0");
        expect(exportedData.roles).toHaveLength(2);
        expect(exportedData.roles[0]?.name).toBe("Test Role 1");
        expect(exportedData.roles[1]?.name).toBe("Test Role 2");
        expect(exportedData.lastUpdated).toBeTruthy();
      });

      it("should export empty array when no roles exist", async () => {
        useRolesStore.setState({
          roles: [],
          isLoading: false,
          error: null,
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
        });

        const store = useRolesStore.getState();
        const exportedData = await store.exportRoles();

        expect(exportedData.roles).toHaveLength(0);
        expect(exportedData.schemaVersion).toBe("1.0.0");
      });

      it("should handle export errors gracefully", async () => {
        // Set up store with invalid data that will cause mapping to fail
        useRolesStore.setState({
          roles: [
            {
              id: "",
              name: "",
              description: "",
              createdAt: "",
              updatedAt: "",
            } as RoleViewModel,
          ],
          isLoading: false,
          error: null,
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
        });

        const store = useRolesStore.getState();

        await expect(store.exportRoles()).rejects.toThrow();

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("Failed to export roles");
      });
    });

    describe("importRoles", () => {
      it("should import valid roles data", async () => {
        (mockAdapter.save as jest.Mock).mockResolvedValue(undefined);

        useRolesStore.setState({
          roles: [],
          isLoading: false,
          error: null,
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
        });

        const store = useRolesStore.getState();
        await store.importRoles(samplePersistedData);

        const state = useRolesStore.getState();
        expect(state.roles).toHaveLength(1);
        expect(state.roles[0]?.name).toBe("Test Role 1");
        expect(state.roles[0]?.description).toBe("First test role");
        expect(state.isSaving).toBe(false);
        expect(state.error?.message).toBe(null);
        expect(state.lastSyncTime).toBeTruthy();

        expect(mockAdapter.save).toHaveBeenCalledWith(
          expect.objectContaining({
            schemaVersion: "1.0.0",
            roles: expect.arrayContaining([
              expect.objectContaining({
                name: "Test Role 1",
                description: "First test role",
              }),
            ]),
          }),
        );
      });

      it("should throw error when no adapter configured", async () => {
        useRolesStore.setState({
          roles: [],
          isLoading: false,
          error: null,
          adapter: null,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
        });

        const store = useRolesStore.getState();

        await expect(store.importRoles(samplePersistedData)).rejects.toThrow(
          RolesPersistenceError,
        );
      });

      it("should handle import errors gracefully", async () => {
        (mockAdapter.save as jest.Mock).mockRejectedValue(
          new Error("Save failed"),
        );

        useRolesStore.setState({
          roles: sampleRoles,
          isLoading: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();

        await expect(store.importRoles(samplePersistedData)).rejects.toThrow(
          "Save failed",
        );

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("Failed to import roles");
        expect(state.isSaving).toBe(false);
      });

      it("should validate imported data structure", async () => {
        const invalidData = {
          schemaVersion: "1.0.0",
          roles: [
            {
              id: "",
              name: "",
              description: "",
            },
          ],
          lastUpdated: "invalid-date",
        } as PersistedRolesSettingsData;

        useRolesStore.setState({
          roles: [],
          isLoading: false,
          error: null,
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
        });

        const store = useRolesStore.getState();

        await expect(store.importRoles(invalidData)).rejects.toThrow();

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("Failed to import roles");
      });
    });

    describe("resetRoles", () => {
      it("should reset all roles and storage", async () => {
        (mockAdapter.reset as jest.Mock).mockResolvedValue(undefined);

        useRolesStore.setState({
          roles: sampleRoles,
          isLoading: false,
          error: null,
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: "2025-01-10T10:00:00.000Z",
          pendingOperations: [
            {
              id: "test-operation-id",
              type: "create",
              roleId: "test-role-id",
              timestamp: "2025-01-10T10:00:00.000Z",
              status: "pending" as const,
            },
          ],
        });

        const store = useRolesStore.getState();
        await store.resetRoles();

        const state = useRolesStore.getState();
        expect(state.roles).toHaveLength(0);
        expect(state.isInitialized).toBe(false);
        expect(state.isSaving).toBe(false);
        expect(state.lastSyncTime).toBe(null);
        expect(state.pendingOperations).toHaveLength(0);
        expect(state.error?.message).toBe(null);

        expect(mockAdapter.reset).toHaveBeenCalled();
      });

      it("should throw error when no adapter configured", async () => {
        useRolesStore.setState({
          roles: sampleRoles,
          isLoading: false,
          error: null,
          adapter: null,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
        });

        const store = useRolesStore.getState();

        await expect(store.resetRoles()).rejects.toThrow(RolesPersistenceError);
      });

      it("should handle reset errors gracefully", async () => {
        (mockAdapter.reset as jest.Mock).mockRejectedValue(
          new Error("Reset failed"),
        );

        useRolesStore.setState({
          roles: sampleRoles,
          isLoading: false,
          error: null,
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: "2025-01-10T10:00:00.000Z",
          pendingOperations: [],
        });

        const store = useRolesStore.getState();

        await expect(store.resetRoles()).rejects.toThrow("Reset failed");

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("Failed to reset roles");
        expect(state.isSaving).toBe(false);
      });
    });
  });

  describe("Enhanced Error Handling", () => {
    const mockAdapter: RolesPersistenceAdapter = {
      save: jest.fn(),
      load: jest.fn(),
      reset: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
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
        adapter: mockAdapter,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });
    });

    describe("Error State Management", () => {
      it("should create proper error state with all fields", () => {
        const store = useRolesStore.getState();
        store.setError("Test error message");

        const state = useRolesStore.getState();
        expect(state.error?.message).toBe("Test error message");
        expect(state.error?.operation).toBe(null);
        expect(state.error?.isRetryable).toBe(false);
        expect(state.error?.retryCount).toBe(0);
        expect(state.error?.timestamp).toBeTruthy();
      });

      it("should clear error state completely", () => {
        const store = useRolesStore.getState();

        // Set an error first
        store.setError("Test error");
        expect(useRolesStore.getState().error?.message).toBe("Test error");

        // Clear the error
        store.clearErrorState();
        const state = useRolesStore.getState();
        expect(state.error?.message).toBe(null);
        expect(state.error?.operation).toBe(null);
        expect(state.error?.retryCount).toBe(0);
        expect(state.error?.timestamp).toBe(null);
      });

      it("should return current error details", () => {
        const store = useRolesStore.getState();
        store.setError("Test error message");

        const errorDetails = store.getErrorDetails();
        expect(errorDetails.message).toBe("Test error message");
        expect(errorDetails.timestamp).toBeTruthy();
      });
    });

    describe("Retryable Error Detection", () => {
      it("should handle network-related errors as retryable", async () => {
        const networkError = new Error("Network timeout") as Error & {
          code: string;
        };
        networkError.code = "ETIMEDOUT";

        (mockAdapter.save as jest.Mock).mockRejectedValue(networkError);

        useRolesStore.setState({
          roles: [
            {
              id: "role-1",
              name: "First Role",
              description: "First description",
              systemPrompt: "Test system prompt",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          ],
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          isLoading: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();

        try {
          await store.persistChanges();
        } catch {
          // Expected to throw after retries
        }

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("timed out");
      });

      it("should handle permission errors as non-retryable", async () => {
        const permissionError = new Error("Permission denied") as Error & {
          code: string;
        };
        permissionError.code = "EACCES";

        (mockAdapter.save as jest.Mock).mockRejectedValue(permissionError);

        useRolesStore.setState({
          roles: [
            {
              id: "role-1",
              name: "First Role",
              description: "First description",
              systemPrompt: "Test system prompt",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          ],
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          isLoading: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();

        try {
          await store.persistChanges();
        } catch {
          // Expected to throw immediately
        }

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("Permission denied");
        expect(state.error?.isRetryable).toBe(false);
      });
    });

    describe("Manual Retry Operations", () => {
      it("should retry last failed save operation", async () => {
        // Set up mock to succeed on save
        (mockAdapter.save as jest.Mock).mockResolvedValue(undefined);

        useRolesStore.setState({
          roles: [
            {
              id: "role-1",
              name: "First Role",
              description: "First description",
              systemPrompt: "Test system prompt",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          ],
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          error: {
            message: "Save failed",
            operation: "save",
            isRetryable: true,
            retryCount: 1,
            timestamp: "2024-01-01T00:00:00.000Z",
          },
          isLoading: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();
        await store.retryLastOperation();

        const state = useRolesStore.getState();
        expect(state.error?.message).toBe(null);
        expect(mockAdapter.save).toHaveBeenCalled();
      });

      it("should not retry non-retryable operations", async () => {
        useRolesStore.setState({
          error: {
            message: "Permission denied",
            operation: "save",
            isRetryable: false,
            retryCount: 0,
            timestamp: "2024-01-01T00:00:00.000Z",
          },
          roles: [],
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          isLoading: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();
        await store.retryLastOperation();

        // Should not have called the adapter since operation is not retryable
        expect(mockAdapter.save).not.toHaveBeenCalled();
      });

      it("should handle sync retry operations", async () => {
        (mockAdapter.load as jest.Mock).mockResolvedValue(null);

        useRolesStore.setState({
          error: {
            message: "Sync failed",
            operation: "sync",
            isRetryable: true,
            retryCount: 1,
            timestamp: "2024-01-01T00:00:00.000Z",
          },
          roles: [],
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          isLoading: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();
        await store.retryLastOperation();

        expect(mockAdapter.load).toHaveBeenCalled();
      });
    });

    describe("Timer Management", () => {
      it("should clear retry timers when clearing error state", () => {
        const store = useRolesStore.getState();

        // Mock a timer being set
        const mockTimer = setTimeout(() => {}, 1000);
        useRolesStore.setState({
          retryTimers: new Map([["save", mockTimer]]),
          error: {
            message: "Test error",
            operation: "save",
            isRetryable: true,
            retryCount: 1,
            timestamp: "2024-01-01T00:00:00.000Z",
          },
          roles: [],
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          isLoading: false,
          lastSyncTime: null,
          pendingOperations: [],
        });

        store.clearErrorState();

        const state = useRolesStore.getState();
        expect(state.retryTimers.size).toBe(0);
        expect(state.error?.message).toBe(null);
      });
    });

    describe("Field-Level Error Handling", () => {
      it("should handle validation errors with field details", async () => {
        interface ZodError extends Error {
          name: "ZodError";
          issues: Array<{ path: Array<string | number>; message: string }>;
        }

        const validationError: ZodError = {
          name: "ZodError",
          message: "Validation failed",
          issues: [
            { path: ["name"], message: "Name is required" },
            { path: ["description"], message: "Description is too short" },
          ],
        } as ZodError;

        (mockAdapter.save as jest.Mock).mockRejectedValue(validationError);

        useRolesStore.setState({
          roles: [
            {
              id: "role-1",
              name: "First Role",
              description: "First description",
              systemPrompt: "Test system prompt",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          ],
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          isLoading: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();

        try {
          await store.persistChanges();
        } catch {
          // Expected to throw
        }

        const state = useRolesStore.getState();
        expect(state.error?.message).toContain("Validation failed");
        expect(state.error?.fieldErrors).toEqual([
          { field: "name", message: "Name is required" },
          { field: "description", message: "Description is too short" },
        ]);
        expect(state.error?.isRetryable).toBe(false);
      });
    });
  });

  describe("CRUD Auto-save Integration Unit Tests", () => {
    const mockAdapter: RolesPersistenceAdapter = {
      save: jest.fn(),
      load: jest.fn(),
      reset: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();

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
        adapter: mockAdapter,
        isInitialized: true,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });
    });

    describe("CRUD methods trigger auto-save", () => {
      it("should trigger debounced save after successful createRole", () => {
        jest.useFakeTimers();
        const store = useRolesStore.getState();

        const roleData: RoleFormData = {
          name: "Test Role",
          description: "Test description",
          systemPrompt: "Test system prompt",
        };

        const roleId = store.createRole(roleData);

        expect(roleId).toBeTruthy();

        // Fast-forward time to trigger debounced save
        jest.advanceTimersByTime(500);

        expect(mockAdapter.save).toHaveBeenCalled();
        jest.useRealTimers();
      });

      it("should trigger debounced save after successful updateRole", () => {
        jest.useFakeTimers();
        // Setup existing role
        const existingRole: RoleViewModel = {
          id: "existing-1",
          name: "Original Role",
          description: "Original description",
          systemPrompt: "Test system prompt",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        useRolesStore.setState({
          roles: [existingRole],
          isLoading: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();

        const updateData: RoleFormData = {
          name: "Updated Role",
          description: "Updated description",
          systemPrompt: "Test system prompt",
        };

        store.updateRole(existingRole.id, updateData);

        // Fast-forward time to trigger debounced save
        jest.advanceTimersByTime(500);

        expect(mockAdapter.save).toHaveBeenCalled();
        jest.useRealTimers();
      });

      it("should trigger debounced save after successful deleteRole", () => {
        jest.useFakeTimers();
        // Setup existing role
        const existingRole: RoleViewModel = {
          id: "existing-1",
          name: "Original Role",
          description: "Original description",
          systemPrompt: "Test system prompt",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        useRolesStore.setState({
          roles: [existingRole],
          isLoading: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();
        store.deleteRole(existingRole.id);

        // Fast-forward time to trigger debounced save
        jest.advanceTimersByTime(500);

        expect(mockAdapter.save).toHaveBeenCalled();
        jest.useRealTimers();
      });

      it("should NOT trigger auto-save when CRUD operations fail validation", () => {
        jest.useFakeTimers();
        const store = useRolesStore.getState();

        // Invalid role data should fail validation
        const invalidRoleData = {
          name: "", // Invalid: empty name
          description: "Valid description",
        } as RoleFormData;

        const roleId = store.createRole(invalidRoleData);

        expect(roleId).toBe("");

        // Fast-forward time to see if any save was triggered
        jest.advanceTimersByTime(500);

        expect(mockAdapter.save).not.toHaveBeenCalled();
        jest.useRealTimers();
      });

      it("should NOT trigger auto-save when updating non-existent role", () => {
        jest.useFakeTimers();
        const store = useRolesStore.getState();

        const updateData: RoleFormData = {
          name: "Updated Role",
          description: "Updated description",
          systemPrompt: "Test system prompt",
        };

        store.updateRole("non-existent", updateData);

        // Fast-forward time to see if any save was triggered
        jest.advanceTimersByTime(500);

        expect(mockAdapter.save).not.toHaveBeenCalled();
        jest.useRealTimers();
      });

      it("should NOT trigger auto-save when deleting non-existent role", () => {
        jest.useFakeTimers();
        const store = useRolesStore.getState();

        store.deleteRole("non-existent");

        // Fast-forward time to see if any save was triggered
        jest.advanceTimersByTime(500);

        expect(mockAdapter.save).not.toHaveBeenCalled();
        jest.useRealTimers();
      });
    });

    describe("Pending operations tracking", () => {
      it("should track pending operation with correct details for createRole", () => {
        const store = useRolesStore.getState();

        const roleData: RoleFormData = {
          name: "Test Role",
          description: "Test description",
          systemPrompt: "Test system prompt",
        };

        const roleId = store.createRole(roleData);
        const state = useRolesStore.getState();

        expect(state.pendingOperations).toHaveLength(1);
        expect(state.pendingOperations[0]).toMatchObject({
          id: expect.any(String),
          type: "create",
          roleId: roleId,
          timestamp: expect.any(String),
          rollbackData: undefined, // No rollback for create
          status: "pending",
        });
      });

      it("should track pending operation with rollback data for updateRole", () => {
        // Setup existing role
        const existingRole: RoleViewModel = {
          id: "existing-1",
          name: "Original Role",
          description: "Original description",
          systemPrompt: "Test system prompt",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        useRolesStore.setState({
          roles: [existingRole],
          isLoading: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();

        const updateData: RoleFormData = {
          name: "Updated Role",
          description: "Updated description",
          systemPrompt: "Test system prompt",
        };

        store.updateRole(existingRole.id, updateData);
        const state = useRolesStore.getState();

        expect(state.pendingOperations).toHaveLength(1);
        expect(state.pendingOperations[0]).toMatchObject({
          id: expect.any(String),
          type: "update",
          roleId: existingRole.id,
          timestamp: expect.any(String),
          rollbackData: existingRole, // Original role for rollback
          status: "pending",
        });
      });

      it("should track pending operation with rollback data for deleteRole", () => {
        // Setup existing role
        const existingRole: RoleViewModel = {
          id: "existing-1",
          name: "Original Role",
          description: "Original description",
          systemPrompt: "Test system prompt",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        useRolesStore.setState({
          roles: [existingRole],
          isLoading: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();
        store.deleteRole(existingRole.id);
        const state = useRolesStore.getState();

        expect(state.pendingOperations).toHaveLength(1);
        expect(state.pendingOperations[0]).toMatchObject({
          id: expect.any(String),
          type: "delete",
          roleId: existingRole.id,
          timestamp: expect.any(String),
          rollbackData: existingRole, // Deleted role for potential restoration
          status: "pending",
        });
      });

      it("should NOT add pending operations for failed CRUD operations", () => {
        const store = useRolesStore.getState();

        // Invalid role data should fail validation
        const invalidRoleData = {
          name: "", // Invalid: empty name
          description: "Valid description",
        } as RoleFormData;

        store.createRole(invalidRoleData);
        const state = useRolesStore.getState();

        expect(state.pendingOperations).toHaveLength(0);
      });

      it("should generate unique operation IDs for multiple operations", () => {
        const store = useRolesStore.getState();

        const roleData1: RoleFormData = {
          name: "Test Role 1",
          description: "Test description",
          systemPrompt: "Test system prompt",
        };

        const roleData2: RoleFormData = {
          name: "Test Role 2",
          description: "Test description",
          systemPrompt: "Test system prompt",
        };

        store.createRole(roleData1);
        store.createRole(roleData2);
        const state = useRolesStore.getState();

        expect(state.pendingOperations).toHaveLength(2);
        expect(state.pendingOperations[0]?.id).not.toBe(
          state.pendingOperations[1]?.id,
        );
      });
    });

    describe("Operation-specific rollback data", () => {
      it("should store complete role data for delete operations", () => {
        const roleWithAllFields: RoleViewModel = {
          id: "complete-role",
          name: "Complete Role",
          description: "Role with all fields",
          systemPrompt: "You are a complete AI assistant.",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T12:00:00.000Z",
        };

        useRolesStore.setState({
          roles: [roleWithAllFields],
          isLoading: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();
        store.deleteRole(roleWithAllFields.id);
        const state = useRolesStore.getState();

        const deleteOperation = state.pendingOperations.find(
          (op) => op.type === "delete",
        );

        expect(deleteOperation?.rollbackData).toEqual(roleWithAllFields);
      });

      it("should store original role data for update operations", () => {
        const originalRole: RoleViewModel = {
          id: "update-test",
          name: "Original Name",
          description: "Original description",
          systemPrompt: "Original system prompt",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        useRolesStore.setState({
          roles: [originalRole],
          isLoading: false,
          error: {
            message: null,
            operation: null,
            isRetryable: false,
            retryCount: 0,
            timestamp: null,
          },
          adapter: mockAdapter,
          isInitialized: true,
          isSaving: false,
          lastSyncTime: null,
          pendingOperations: [],
          retryTimers: new Map(),
        });

        const store = useRolesStore.getState();

        const updateData: RoleFormData = {
          name: "Updated Role",
          description: "Updated description",
          systemPrompt: "Test system prompt",
        };

        store.updateRole(originalRole.id, updateData);
        const state = useRolesStore.getState();

        const updateOperation = state.pendingOperations.find(
          (op) => op.type === "update",
        );

        expect(updateOperation?.rollbackData).toEqual(originalRole);
      });

      it("should not store rollback data for create operations", () => {
        const store = useRolesStore.getState();

        const roleData: RoleFormData = {
          name: "Test Role",
          description: "Test description",
          systemPrompt: "Test system prompt",
        };

        store.createRole(roleData);
        const state = useRolesStore.getState();

        const createOperation = state.pendingOperations.find(
          (op) => op.type === "create",
        );

        expect(createOperation?.rollbackData).toBeUndefined();
      });
    });
  });
});

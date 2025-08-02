/**
 * Unit tests for the custom roles Zustand store.
 *
 * Tests store initialization, CRUD operations, validation, error handling,
 * persistence integration, and edge cases.
 *
 * @module stores/__tests__/customRolesStore.test
 */

import type { CustomRoleViewModel, RoleFormData } from "../../";
import { customRolesPersistence } from "../customRolesPersistence";
import { useCustomRolesStore } from "../customRolesStore";

// Mock the persistence layer
jest.mock("../customRolesPersistence", () => ({
  customRolesPersistence: {
    save: jest.fn(),
    load: jest.fn(),
    clear: jest.fn(),
  },
}));

const mockPersistence = customRolesPersistence as jest.Mocked<
  typeof customRolesPersistence
>;

// Mock console methods
const mockConsoleError = jest.fn();

beforeEach(() => {
  // Reset store to clean state
  useCustomRolesStore.setState({
    roles: [],
    isLoading: false,
    error: null,
  });

  // Reset persistence mocks
  mockPersistence.save.mockClear();
  mockPersistence.load.mockClear();
  mockPersistence.clear.mockClear();
  mockPersistence.save.mockResolvedValue();
  mockPersistence.load.mockResolvedValue([]);

  // Reset console mocks
  mockConsoleError.mockClear();
  jest.spyOn(console, "error").mockImplementation(mockConsoleError);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("customRolesStore", () => {
  describe("store initialization", () => {
    it("should initialize with correct default values", () => {
      const state = useCustomRolesStore.getState();

      expect(state.roles).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it("should load roles on initialization", async () => {
      const mockRoles: CustomRoleViewModel[] = [
        {
          id: "test-1",
          name: "Test Role",
          description: "Test description",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      mockPersistence.load.mockResolvedValue(mockRoles);

      // Trigger load manually to test behavior
      await useCustomRolesStore.getState().loadRoles();

      const state = useCustomRolesStore.getState();
      expect(state.roles).toEqual(mockRoles);
      expect(mockPersistence.load).toHaveBeenCalled();
    });
  });

  describe("createRole action", () => {
    const validRoleData: RoleFormData = {
      name: "Test Role",
      description: "Test description",
    };

    it("should create a new role with valid data", () => {
      const store = useCustomRolesStore.getState();

      const roleId = store.createRole(validRoleData);

      expect(roleId).toBeTruthy();
      expect(roleId).toMatch(/^[a-f0-9-]{36}$|^[a-z0-9]+$/); // UUID or fallback format

      const state = useCustomRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]).toBeTruthy();
      expect(state.roles[0]!.name).toBe(validRoleData.name);
      expect(state.roles[0]!.description).toBe(validRoleData.description);
      expect(state.roles[0]!.id).toBe(roleId);
      expect(state.roles[0]!.createdAt).toBeTruthy();
      expect(state.roles[0]!.updatedAt).toBeTruthy();
      expect(state.error).toBe(null);
    });

    it("should trigger save after creating role", () => {
      const store = useCustomRolesStore.getState();

      store.createRole(validRoleData);

      expect(mockPersistence.save).toHaveBeenCalled();
    });

    it("should reject duplicate role names (case-insensitive)", () => {
      const store = useCustomRolesStore.getState();

      // Create first role
      const firstId = store.createRole(validRoleData);
      expect(firstId).toBeTruthy();

      // Try to create role with same name (different case)
      const duplicateData: RoleFormData = {
        name: "TEST ROLE",
        description: "Different description",
      };

      const secondId = store.createRole(duplicateData);

      expect(secondId).toBe("");
      const state = useCustomRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.error).toBe("A role with this name already exists");
    });

    it("should handle invalid data and return empty string", () => {
      const store = useCustomRolesStore.getState();

      const invalidData = {
        name: "", // Invalid: empty name
        description: "Valid description",
      } as RoleFormData;

      const roleId = store.createRole(invalidData);

      expect(roleId).toBe("");
      const state = useCustomRolesStore.getState();
      expect(state.roles).toHaveLength(0);
      expect(state.error).toBeTruthy();
    });

    it("should handle persistence errors gracefully", async () => {
      mockPersistence.save.mockRejectedValue(new Error("Storage full"));

      const store = useCustomRolesStore.getState();
      store.createRole(validRoleData);

      // Wait for async save to complete

      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = useCustomRolesStore.getState();
      expect(state.error).toBe("Storage full");
    });
  });

  describe("updateRole action", () => {
    const existingRole: CustomRoleViewModel = {
      id: "existing-1",
      name: "Original Role",
      description: "Original description",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useCustomRolesStore.setState({
        roles: [existingRole],
        isLoading: false,
        error: null,
      });
    });

    it("should update existing role with valid data", () => {
      const store = useCustomRolesStore.getState();

      const updateData: RoleFormData = {
        name: "Updated Role",
        description: "Updated description",
      };

      store.updateRole(existingRole.id, updateData);

      const state = useCustomRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]!.id).toBe(existingRole.id);
      expect(state.roles[0]!.name).toBe(updateData.name);
      expect(state.roles[0]!.description).toBe(updateData.description);
      expect(state.roles[0]!.createdAt).toBe(existingRole.createdAt);
      expect(state.roles[0]!.updatedAt).not.toBe(existingRole.updatedAt);
      expect(state.error).toBe(null);
    });

    it("should trigger save after updating role", () => {
      const store = useCustomRolesStore.getState();

      const updateData: RoleFormData = {
        name: "Updated Role",
        description: "Updated description",
      };

      store.updateRole(existingRole.id, updateData);

      expect(mockPersistence.save).toHaveBeenCalled();
    });

    it("should reject non-existent role ID", () => {
      const store = useCustomRolesStore.getState();

      const updateData: RoleFormData = {
        name: "Updated Role",
        description: "Updated description",
      };

      store.updateRole("non-existent", updateData);

      const state = useCustomRolesStore.getState();
      expect(state.roles[0]).toEqual(existingRole); // Unchanged
      expect(state.error).toBe("Role not found");
    });

    it("should reject duplicate names when updating (excluding current role)", () => {
      const secondRole: CustomRoleViewModel = {
        id: "existing-2",
        name: "Second Role",
        description: "Second description",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      useCustomRolesStore.setState({
        roles: [existingRole, secondRole],
        isLoading: false,
        error: null,
      });

      const store = useCustomRolesStore.getState();

      // Try to update second role to have same name as first
      const updateData: RoleFormData = {
        name: existingRole.name,
        description: "Different description",
      };

      store.updateRole(secondRole.id, updateData);

      const state = useCustomRolesStore.getState();
      expect(state.roles[1]).toEqual(secondRole); // Unchanged
      expect(state.error).toBe("A role with this name already exists");
    });

    it("should allow updating role to same name (no duplicate error)", () => {
      const store = useCustomRolesStore.getState();

      const updateData: RoleFormData = {
        name: existingRole.name, // Same name
        description: "Updated description",
      };

      store.updateRole(existingRole.id, updateData);

      const state = useCustomRolesStore.getState();
      expect(state.roles[0]!.description).toBe(updateData.description);
      expect(state.error).toBe(null);
    });
  });

  describe("deleteRole action", () => {
    const existingRole: CustomRoleViewModel = {
      id: "existing-1",
      name: "Test Role",
      description: "Test description",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useCustomRolesStore.setState({
        roles: [existingRole],
        isLoading: false,
        error: null,
      });
    });

    it("should delete existing role", () => {
      const store = useCustomRolesStore.getState();

      store.deleteRole(existingRole.id);

      const state = useCustomRolesStore.getState();
      expect(state.roles).toHaveLength(0);
      expect(state.error).toBe(null);
    });

    it("should trigger save after deleting role", () => {
      const store = useCustomRolesStore.getState();

      store.deleteRole(existingRole.id);

      expect(mockPersistence.save).toHaveBeenCalled();
    });

    it("should handle non-existent role ID", () => {
      const store = useCustomRolesStore.getState();

      store.deleteRole("non-existent");

      const state = useCustomRolesStore.getState();
      expect(state.roles).toHaveLength(1); // Unchanged
      expect(state.error).toBe("Role not found");
    });
  });

  describe("getRoleById action", () => {
    const existingRole: CustomRoleViewModel = {
      id: "existing-1",
      name: "Test Role",
      description: "Test description",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useCustomRolesStore.setState({
        roles: [existingRole],
        isLoading: false,
        error: null,
      });
    });

    it("should return role for existing ID", () => {
      const store = useCustomRolesStore.getState();

      const role = store.getRoleById(existingRole.id);

      expect(role).toEqual(existingRole);
    });

    it("should return undefined for non-existent ID", () => {
      const store = useCustomRolesStore.getState();

      const role = store.getRoleById("non-existent");

      expect(role).toBeUndefined();
    });
  });

  describe("isRoleNameUnique action", () => {
    const existingRoles: CustomRoleViewModel[] = [
      {
        id: "role-1",
        name: "First Role",
        description: "First description",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "role-2",
        name: "Second Role",
        description: "Second description",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    beforeEach(() => {
      useCustomRolesStore.setState({
        roles: existingRoles,
        isLoading: false,
        error: null,
      });
    });

    it("should return false for existing name", () => {
      const store = useCustomRolesStore.getState();

      const isUnique = store.isRoleNameUnique("First Role");

      expect(isUnique).toBe(false);
    });

    it("should return false for existing name (case-insensitive)", () => {
      const store = useCustomRolesStore.getState();

      const isUnique = store.isRoleNameUnique("FIRST ROLE");

      expect(isUnique).toBe(false);
    });

    it("should return true for unique name", () => {
      const store = useCustomRolesStore.getState();

      const isUnique = store.isRoleNameUnique("Unique Role");

      expect(isUnique).toBe(true);
    });

    it("should exclude specified ID when checking uniqueness", () => {
      const store = useCustomRolesStore.getState();

      // Should be unique when excluding the existing role with this name
      const isUnique = store.isRoleNameUnique("First Role", "role-1");

      expect(isUnique).toBe(true);
    });

    it("should return false when excluding different ID", () => {
      const store = useCustomRolesStore.getState();

      // Should not be unique when excluding a different role
      const isUnique = store.isRoleNameUnique("First Role", "role-2");

      expect(isUnique).toBe(false);
    });
  });

  describe("state management actions", () => {
    it("should set loading state", () => {
      const store = useCustomRolesStore.getState();

      store.setLoading(true);
      expect(useCustomRolesStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(useCustomRolesStore.getState().isLoading).toBe(false);
    });

    it("should set error state", () => {
      const store = useCustomRolesStore.getState();

      store.setError("Test error");
      expect(useCustomRolesStore.getState().error).toBe("Test error");

      store.setError(null);
      expect(useCustomRolesStore.getState().error).toBe(null);
    });

    it("should clear error", () => {
      const store = useCustomRolesStore.getState();

      store.setError("Test error");
      expect(useCustomRolesStore.getState().error).toBe("Test error");

      store.clearError();
      expect(useCustomRolesStore.getState().error).toBe(null);
    });
  });

  describe("persistence integration", () => {
    it("should handle successful load", async () => {
      const mockRoles: CustomRoleViewModel[] = [
        {
          id: "test-1",
          name: "Test Role",
          description: "Test description",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      mockPersistence.load.mockResolvedValue(mockRoles);

      const store = useCustomRolesStore.getState();
      await store.loadRoles();

      const state = useCustomRolesStore.getState();
      expect(state.roles).toEqual(mockRoles);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it("should handle load errors", async () => {
      mockPersistence.load.mockRejectedValue(new Error("Load failed"));

      const store = useCustomRolesStore.getState();
      await store.loadRoles();

      const state = useCustomRolesStore.getState();
      expect(state.roles).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Load failed");
    });

    it("should handle save errors", async () => {
      mockPersistence.save.mockRejectedValue(new Error("Save failed"));

      const store = useCustomRolesStore.getState();
      await store.saveRoles();

      const state = useCustomRolesStore.getState();
      expect(state.error).toBe("Save failed");
    });
  });
});

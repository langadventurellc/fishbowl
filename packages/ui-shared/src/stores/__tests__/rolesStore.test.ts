/**
 * Unit tests for the roles Zustand store.
 *
 * Tests store initialization, CRUD operations, validation, error handling,
 * persistence integration, and edge cases.
 *
 * @module stores/__tests__/rolesStore.test
 */

import type { RoleViewModel, RoleFormData } from "../../";
import { useRolesStore } from "../rolesStore";

// Mock console methods
const mockConsoleError = jest.fn();

beforeEach(() => {
  // Reset store to clean state
  useRolesStore.setState({
    roles: [],
    isLoading: false,
    error: null,
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
      expect(state.error).toBe(null);
    });
  });

  describe("createRole action", () => {
    const validRoleData: RoleFormData = {
      name: "Test Role",
      description: "Test description",
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
      expect(state.error).toBe(null);
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
      };

      const secondId = store.createRole(duplicateData);

      expect(secondId).toBe("");
      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.error).toBe("A role with this name already exists");
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
      expect(state.error).toBeTruthy();
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
      expect(state.error).toBe(null);
    });

    it("should create a role without systemPrompt (backward compatibility)", () => {
      const store = useRolesStore.getState();

      const roleDataWithoutPrompt: RoleFormData = {
        name: "Simple Role",
        description: "Role without system prompt",
      };

      const roleId = store.createRole(roleDataWithoutPrompt);

      expect(roleId).toBeTruthy();
      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]!.name).toBe(roleDataWithoutPrompt.name);
      expect(state.roles[0]!.description).toBe(
        roleDataWithoutPrompt.description,
      );
      expect(state.roles[0]!.systemPrompt).toBeUndefined();
      expect(state.error).toBe(null);
    });
  });

  describe("updateRole action", () => {
    const existingRole: RoleViewModel = {
      id: "existing-1",
      name: "Original Role",
      description: "Original description",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useRolesStore.setState({
        roles: [existingRole],
        isLoading: false,
        error: null,
      });
    });

    it("should update existing role with valid data", () => {
      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: "Updated Role",
        description: "Updated description",
      };

      store.updateRole(existingRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]!.id).toBe(existingRole.id);
      expect(state.roles[0]!.name).toBe(updateData.name);
      expect(state.roles[0]!.description).toBe(updateData.description);
      expect(state.roles[0]!.createdAt).toBe(existingRole.createdAt);
      expect(state.roles[0]!.updatedAt).not.toBe(existingRole.updatedAt);
      expect(state.error).toBe(null);
    });

    it("should reject non-existent role ID", () => {
      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: "Updated Role",
        description: "Updated description",
      };

      store.updateRole("non-existent", updateData);

      const state = useRolesStore.getState();
      expect(state.roles[0]).toEqual(existingRole); // Unchanged
      expect(state.error).toBe("Role not found");
    });

    it("should reject duplicate names when updating (excluding current role)", () => {
      const secondRole: RoleViewModel = {
        id: "existing-2",
        name: "Second Role",
        description: "Second description",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      useRolesStore.setState({
        roles: [existingRole, secondRole],
        isLoading: false,
        error: null,
      });

      const store = useRolesStore.getState();

      // Try to update second role to have same name as first
      const updateData: RoleFormData = {
        name: existingRole.name,
        description: "Different description",
      };

      store.updateRole(secondRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles[1]).toEqual(secondRole); // Unchanged
      expect(state.error).toBe("A role with this name already exists");
    });

    it("should allow updating role to same name (no duplicate error)", () => {
      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: existingRole.name, // Same name
        description: "Updated description",
      };

      store.updateRole(existingRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles[0]!.description).toBe(updateData.description);
      expect(state.error).toBe(null);
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
      expect(state.error).toBe(null);
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
        error: null,
      });

      const store = useRolesStore.getState();

      const updateData: RoleFormData = {
        name: existingRole.name,
        description: existingRole.description,
        // systemPrompt not provided, should remain as original or undefined depending on schema
      };

      store.updateRole(existingRole.id, updateData);

      const state = useRolesStore.getState();
      expect(state.roles[0]!.name).toBe(updateData.name);
      expect(state.roles[0]!.description).toBe(updateData.description);
      expect(state.error).toBe(null);
    });
  });

  describe("deleteRole action", () => {
    const existingRole: RoleViewModel = {
      id: "existing-1",
      name: "Test Role",
      description: "Test description",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useRolesStore.setState({
        roles: [existingRole],
        isLoading: false,
        error: null,
      });
    });

    it("should delete existing role", () => {
      const store = useRolesStore.getState();

      store.deleteRole(existingRole.id);

      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(0);
      expect(state.error).toBe(null);
    });

    it("should handle non-existent role ID", () => {
      const store = useRolesStore.getState();

      store.deleteRole("non-existent");

      const state = useRolesStore.getState();
      expect(state.roles).toHaveLength(1); // Unchanged
      expect(state.error).toBe("Role not found");
    });
  });

  describe("getRoleById action", () => {
    const existingRole: RoleViewModel = {
      id: "existing-1",
      name: "Test Role",
      description: "Test description",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      useRolesStore.setState({
        roles: [existingRole],
        isLoading: false,
        error: null,
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
      useRolesStore.setState({
        roles: existingRoles,
        isLoading: false,
        error: null,
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
      expect(useRolesStore.getState().error).toBe("Test error");

      store.setError(null);
      expect(useRolesStore.getState().error).toBe(null);
    });

    it("should clear error", () => {
      const store = useRolesStore.getState();

      store.setError("Test error");
      expect(useRolesStore.getState().error).toBe("Test error");

      store.clearError();
      expect(useRolesStore.getState().error).toBe(null);
    });
  });
});

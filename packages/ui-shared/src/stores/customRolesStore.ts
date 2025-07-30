/**
 * Zustand store for custom roles management with CRUD operations.
 *
 * Provides reactive state management for custom user-created roles with
 * comprehensive validation, error handling, and persistence integration.
 *
 * @module stores/customRolesStore
 */

import { create } from "zustand";
import { roleSchema } from "@fishbowl-ai/shared";
import type { CustomRoleViewModel, RoleFormData } from "../settings";
import { customRolesPersistence } from "./customRolesPersistence";

// Generate unique ID using crypto API or fallback
const generateId = (): string => {
  // eslint-disable-next-line no-undef
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    // eslint-disable-next-line no-undef
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface CustomRolesState {
  roles: CustomRoleViewModel[];
  isLoading: boolean;
  error: string | null;
}

interface CustomRolesActions {
  createRole: (roleData: RoleFormData) => string;
  updateRole: (id: string, roleData: RoleFormData) => void;
  deleteRole: (id: string) => void;
  getRoleById: (id: string) => CustomRoleViewModel | undefined;
  isRoleNameUnique: (name: string, excludeId?: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  loadRoles: () => Promise<void>;
  saveRoles: () => Promise<void>;
}

type CustomRolesStore = CustomRolesState & CustomRolesActions;

export const useCustomRolesStore = create<CustomRolesStore>()((set, get) => ({
  roles: [],
  isLoading: false,
  error: null,

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

      const newRole: CustomRoleViewModel = {
        id: generateId(),
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        roles: [...state.roles, newRole],
        error: null,
      }));

      // Async save
      get().saveRoles();

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
            ? { ...role, ...validatedData, updatedAt: new Date().toISOString() }
            : role,
        ),
        error: null,
      }));

      // Async save
      get().saveRoles();
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
    }));

    // Async save
    get().saveRoles();
  },

  getRoleById: (id: string) => {
    return get().roles.find((role) => role.id === id);
  },

  isRoleNameUnique: (name: string, excludeId?: string) => {
    const { roles } = get();
    return !roles.some(
      (role) =>
        role.name.toLowerCase() === name.toLowerCase() && role.id !== excludeId,
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

  // Persistence operations
  loadRoles: async () => {
    try {
      set({ isLoading: true, error: null });
      const loadedRoles = await customRolesPersistence.load();
      set({ roles: loadedRoles, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load roles";
      set({ error: errorMessage, isLoading: false });
    }
  },

  saveRoles: async () => {
    try {
      const { roles } = get();
      await customRolesPersistence.save(roles);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save roles";
      set({ error: errorMessage });
    }
  },
}));

// Initialize store by loading existing roles
useCustomRolesStore.getState().loadRoles();

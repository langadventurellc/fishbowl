/**
 * Zustand store for roles management with CRUD operations.
 *
 * Provides reactive state management for user-created roles with
 * comprehensive validation, error handling, and persistence integration.
 *
 * @module stores/rolesStore
 */

import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import { create } from "zustand";
import { mapRolesPersistenceToUI } from "../mapping/roles/mapRolesPersistenceToUI";
import { roleSchema } from "../schemas/roleSchema";
import { RolesPersistenceAdapter } from "../types/roles/persistence/RolesPersistenceAdapter";
import { RoleFormData } from "../types/settings/RoleFormData";
import { RoleViewModel } from "../types/settings/RoleViewModel";

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
  // New adapter integration methods
  setAdapter: (adapter: RolesPersistenceAdapter) => void;
  initialize: (adapter: RolesPersistenceAdapter) => Promise<void>;
}

type RolesStore = RolesState & RolesActions;

export const useRolesStore = create<RolesStore>()((set, get) => ({
  roles: [],
  isLoading: false,
  error: null,
  // New adapter integration state defaults
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
      }));

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
}));

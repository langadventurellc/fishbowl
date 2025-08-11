import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import { RolesErrorState } from "src/stores/RolesErrorState";
import {
  RoleFormData,
  RoleViewModel,
  RolesPersistenceAdapter,
} from "src/types";

export interface RolesActions {
  createRole: (roleData: RoleFormData) => string;
  updateRole: (id: string, roleData: RoleFormData) => void;
  deleteRole: (id: string) => void;
  getRoleById: (id: string) => RoleViewModel | undefined;
  isRoleNameUnique: (name: string, excludeId?: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // Adapter integration methods
  setAdapter: (adapter: RolesPersistenceAdapter) => void;
  initialize: (adapter: RolesPersistenceAdapter) => Promise<void>;
  // Auto-save methods
  persistChanges: () => Promise<void>;
  syncWithStorage: () => Promise<void>;
  // Sync and bulk operation methods
  exportRoles: () => Promise<PersistedRolesSettingsData>;
  importRoles: (data: PersistedRolesSettingsData) => Promise<void>;
  resetRoles: () => Promise<void>;
  // Error recovery methods
  retryLastOperation: () => Promise<void>;
  clearErrorState: () => void;
  getErrorDetails: () => RolesErrorState;
}

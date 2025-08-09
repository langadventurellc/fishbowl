/**
 * React hooks for roles management.
 *
 * Provides optimized React integration for the roles store with
 * memoized callbacks and selective state subscriptions.
 *
 * @module hooks/useRoles
 */

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useRolesStore } from "../stores/rolesStore";

/**
 * Main hook for roles management with all store state and actions
 */
export const useRoles = () => {
  const { roles, isLoading, error } = useRolesStore(
    useShallow((state) => ({
      roles: state.roles,
      isLoading: state.isLoading,
      error: state.error,
    })),
  );

  const createRole = useRolesStore((state) => state.createRole);
  const updateRole = useRolesStore((state) => state.updateRole);
  const deleteRole = useRolesStore((state) => state.deleteRole);
  const getRoleById = useRolesStore((state) => state.getRoleById);
  const isRoleNameUnique = useRolesStore((state) => state.isRoleNameUnique);
  const clearError = useRolesStore((state) => state.clearError);

  return {
    roles,
    isLoading,
    error,
    createRole: useCallback(createRole, [createRole]),
    updateRole: useCallback(updateRole, [updateRole]),
    deleteRole: useCallback(deleteRole, [deleteRole]),
    getRoleById: useCallback(getRoleById, [getRoleById]),
    isRoleNameUnique: useCallback(isRoleNameUnique, [isRoleNameUnique]),
    clearError: useCallback(clearError, [clearError]),
  };
};

/**
 * Hook for accessing only the CRUD actions (useful for forms that don't need state)
 */
export const useRoleActions = () => {
  const actions = useRolesStore(
    useShallow((state) => ({
      createRole: state.createRole,
      updateRole: state.updateRole,
      deleteRole: state.deleteRole,
      clearError: state.clearError,
    })),
  );

  return actions;
};

/**
 * Hook for accessing a specific role by ID with automatic updates
 */
export const useRoleById = (id: string | undefined) => {
  return useRolesStore(
    useCallback((state) => (id ? state.getRoleById(id) : undefined), [id]),
  );
};

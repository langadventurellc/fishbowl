/**
 * React hooks for custom roles management.
 *
 * Provides optimized React integration for the custom roles store with
 * memoized callbacks and selective state subscriptions.
 *
 * @module hooks/useCustomRoles
 */

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCustomRolesStore } from "../stores/customRolesStore";

/**
 * Main hook for custom roles management with all store state and actions
 */
export const useCustomRoles = () => {
  const { roles, isLoading, error } = useCustomRolesStore(
    useShallow((state) => ({
      roles: state.roles,
      isLoading: state.isLoading,
      error: state.error,
    })),
  );

  const createRole = useCustomRolesStore((state) => state.createRole);
  const updateRole = useCustomRolesStore((state) => state.updateRole);
  const deleteRole = useCustomRolesStore((state) => state.deleteRole);
  const getRoleById = useCustomRolesStore((state) => state.getRoleById);
  const isRoleNameUnique = useCustomRolesStore(
    (state) => state.isRoleNameUnique,
  );
  const clearError = useCustomRolesStore((state) => state.clearError);

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
export const useCustomRoleActions = () => {
  const actions = useCustomRolesStore(
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
export const useCustomRoleById = (id: string | undefined) => {
  return useCustomRolesStore(
    useCallback((state) => (id ? state.getRoleById(id) : undefined), [id]),
  );
};

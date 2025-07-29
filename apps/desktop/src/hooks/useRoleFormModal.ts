/**
 * useRoleFormModal hook provides state management for role creation/editing modal.
 *
 * @module hooks/useRoleFormModal
 */

import { useState, useCallback } from "react";
import {
  useCustomRoles,
  type CustomRole,
  type RoleFormData,
} from "@fishbowl-ai/shared";
import type { UseRoleFormModalReturn } from "./types/UseRoleFormModalReturn";

export function useRoleFormModal(): UseRoleFormModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [currentRole, setCurrentRole] = useState<CustomRole | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const { createRole, updateRole } = useCustomRoles();

  const openCreateModal = useCallback(() => {
    setMode("create");
    setCurrentRole(undefined);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((role: CustomRole) => {
    setMode("edit");
    setCurrentRole(role);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setCurrentRole(undefined);
  }, []);

  const handleSave = useCallback(
    async (data: RoleFormData) => {
      setIsLoading(true);
      try {
        if (mode === "create") {
          await createRole(data);
        } else if (currentRole) {
          await updateRole(currentRole.id, data);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [mode, currentRole, createRole, updateRole],
  );

  return {
    isOpen,
    mode,
    currentRole,
    isLoading,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
  };
}

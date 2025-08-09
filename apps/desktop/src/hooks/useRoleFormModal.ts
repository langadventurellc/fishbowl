/**
 * useRoleFormModal hook provides state management for role creation/editing modal.
 *
 * @module hooks/useRoleFormModal
 */

import {
  useRoles,
  type RoleViewModel,
  type RoleFormData,
} from "@fishbowl-ai/ui-shared";
import { useCallback, useState } from "react";
import type { UseRoleFormModalReturn } from "./types/UseRoleFormModalReturn";

export function useRoleFormModal(): UseRoleFormModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [currentRole, setCurrentRole] = useState<RoleViewModel | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const { createRole, updateRole } = useRoles();

  const openCreateModal = useCallback(() => {
    setMode("create");
    setCurrentRole(undefined);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((role: RoleViewModel) => {
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

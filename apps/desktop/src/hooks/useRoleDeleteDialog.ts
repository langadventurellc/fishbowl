/**
 * useRoleDeleteDialog hook manages role deletion dialog state and integration with store.
 *
 * Features:
 * - Dialog state management
 * - Integration with custom roles store
 * - Error handling and user feedback
 * - Loading state management
 *
 * @module hooks/useRoleDeleteDialog
 */

import type { RoleViewModel } from "@fishbowl-ai/ui-shared";
import { useRolesStore } from "@fishbowl-ai/ui-shared";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { useCallback, useState } from "react";

const logger = createLoggerSync({
  config: { name: "useRoleDeleteDialog", level: "info" },
});

interface UseRoleDeleteDialogReturn {
  isOpen: boolean;
  selectedRole: RoleViewModel | null;
  isLoading: boolean;
  openDialog: (role: RoleViewModel) => void;
  closeDialog: () => void;
  confirmDelete: (role: RoleViewModel) => Promise<void>;
}

export function useRoleDeleteDialog(): UseRoleDeleteDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { deleteRole } = useRolesStore();

  const openDialog = useCallback((role: RoleViewModel) => {
    setSelectedRole(role);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    if (isLoading) return; // Prevent closing during operation
    setIsOpen(false);
    setSelectedRole(null);
  }, [isLoading]);

  const confirmDelete = useCallback(
    async (role: RoleViewModel) => {
      setIsLoading(true);
      try {
        deleteRole(role.id);
        // Close dialog after successful deletion
        setIsOpen(false);
        setSelectedRole(null);
      } catch (error) {
        logger.error(
          "Failed to delete role:",
          error instanceof Error ? error : new Error(String(error)),
        );
        // Keep dialog open on error for retry
      } finally {
        setIsLoading(false);
      }
    },
    [deleteRole],
  );

  return {
    isOpen,
    selectedRole,
    isLoading,
    openDialog,
    closeDialog,
    confirmDelete,
  };
}

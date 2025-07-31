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

import type { CustomRoleViewModel } from "@fishbowl-ai/ui-shared";
import { useCustomRolesStore } from "@fishbowl-ai/ui-shared";
import { useCallback, useState } from "react";

interface UseRoleDeleteDialogReturn {
  isOpen: boolean;
  selectedRole: CustomRoleViewModel | null;
  isLoading: boolean;
  openDialog: (role: CustomRoleViewModel) => void;
  closeDialog: () => void;
  confirmDelete: (role: CustomRoleViewModel) => Promise<void>;
}

export function useRoleDeleteDialog(): UseRoleDeleteDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CustomRoleViewModel | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { deleteRole } = useCustomRolesStore();

  const openDialog = useCallback((role: CustomRoleViewModel) => {
    setSelectedRole(role);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    if (isLoading) return; // Prevent closing during operation
    setIsOpen(false);
    setSelectedRole(null);
  }, [isLoading]);

  const confirmDelete = useCallback(
    async (role: CustomRoleViewModel) => {
      setIsLoading(true);
      try {
        deleteRole(role.id);
        // Close dialog after successful deletion
        setIsOpen(false);
        setSelectedRole(null);
      } catch (error) {
        console.error("Failed to delete role:", error);
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

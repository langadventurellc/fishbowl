/**
 * RoleFormModal component provides modal interface for role creation and editing.
 *
 * Features:
 * - Modal dialog using shadcn/ui Dialog components
 * - Integration with CreateRoleForm component
 * - Unsaved changes protection with confirmation dialog
 * - Keyboard shortcuts (Ctrl/Cmd+S to save, Escape to close)
 * - Proper focus management and accessibility
 * - Loading states during save operations
 *
 * @module components/settings/RoleFormModal
 */

import {
  useCustomRoles,
  useUnsavedChanges,
  type RoleFormData,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useEffect } from "react";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { CreateRoleForm } from "./CreateRoleForm";
import type { RoleFormModalProps } from "./types/RoleFormModalProps";

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  role,
  onSave,
  isLoading = false,
}) => {
  const { showConfirmation } = useConfirmationDialog();
  const { hasUnsavedChanges } = useUnsavedChanges();
  const { roles } = useCustomRoles();

  // Handle modal close with unsaved changes protection
  const handleOpenChange = useCallback(
    async (open: boolean) => {
      if (!open && hasUnsavedChanges) {
        const confirmed = await showConfirmation({
          title: "Unsaved Changes",
          message:
            "You have unsaved changes. Are you sure you want to close without saving?",
          confirmText: "Close Without Saving",
          cancelText: "Continue Editing",
        });
        if (!confirmed) return;
      }
      onOpenChange(open);
    },
    [hasUnsavedChanges, showConfirmation, onOpenChange],
  );

  // Handle form cancellation
  const handleCancel = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  // Handle successful save
  const handleSave = useCallback(
    async (data: RoleFormData) => {
      await onSave(data);
      onOpenChange(false);
    },
    [onSave, onOpenChange],
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save (form will handle this through form submission)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        // The CreateRoleForm component will handle the actual submission
        // We just prevent the browser's default save dialog
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="role-form-modal max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Custom Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new custom role with specialized focus and responsibilities."
              : "Update the role name and description."}
          </DialogDescription>
        </DialogHeader>

        <CreateRoleForm
          mode={mode}
          initialData={role}
          onSave={handleSave}
          onCancel={handleCancel}
          existingRoles={roles}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

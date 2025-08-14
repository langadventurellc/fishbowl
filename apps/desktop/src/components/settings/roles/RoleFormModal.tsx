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

import type { RoleFormModalProps } from "@fishbowl-ai/ui-shared";
import {
  useRoles,
  useUnsavedChanges,
  type RoleFormData,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useEffect, useRef } from "react";
import { useConfirmationDialog } from "../../../hooks/useConfirmationDialog";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { ConfirmationDialog } from "../../ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { CreateRoleForm } from "./CreateRoleForm";

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  role,
  onSave,
  isLoading = false,
}) => {
  const { showConfirmation, confirmationDialogProps } = useConfirmationDialog();
  const { hasUnsavedChanges } = useUnsavedChanges();
  const { roles } = useRoles();

  // Focus trap setup
  const triggerRef = useRef<HTMLElement | null>(null);
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    restoreFocus: true,
    initialFocusSelector: "[data-role-modal-initial-focus]",
  });

  // Store the trigger element when modal opens and announce to screen readers
  useEffect(() => {
    if (isOpen && document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;

      // Announce modal state to screen readers
      const message =
        mode === "create"
          ? "Create role dialog opened. Press Tab to navigate between fields."
          : "Edit role dialog opened. Press Tab to navigate between fields.";
      announceToScreenReader(message, "polite");
    }
  }, [isOpen, mode]);

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
          variant: "destructive",
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

  // Keyboard shortcuts (Escape handled in DialogContent onKeyDown)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        // Trigger form submission
        const form = document.querySelector(
          ".role-form-modal form",
        ) as HTMLFormElement;
        if (form) {
          const submitEvent = new Event("submit", {
            cancelable: true,
            bubbles: true,
          });
          form.dispatchEvent(submitEvent);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={containerRef}
        className="role-form-modal max-w-2xl max-h-[80vh] overflow-y-auto"
        onOpenAutoFocus={(e) => {
          // Prevent Radix's default focus behavior
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(false);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new role with specialized focus and responsibilities."
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

      {/* Confirmation Dialog for unsaved changes */}
      {confirmationDialogProps && (
        <ConfirmationDialog {...confirmationDialogProps} />
      )}
    </Dialog>
  );
};

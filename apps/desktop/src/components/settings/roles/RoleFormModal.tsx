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
import React, { useCallback, useRef } from "react";
import { SettingsFormModal } from "../common";
import { CreateRoleForm, type CreateRoleFormRef } from "./CreateRoleForm";

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  role,
  onSave,
  isLoading = false,
}) => {
  const { hasUnsavedChanges } = useUnsavedChanges();
  const { roles } = useRoles();
  const formRef = useRef<CreateRoleFormRef>(null);

  // Handle successful save
  const handleSave = useCallback(
    async (data: RoleFormData) => {
      await onSave(data);
      onOpenChange(false);
    },
    [onSave, onOpenChange],
  );

  // Handle form cancellation
  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Get modal title and description based on mode
  const getModalTitle = () => {
    return mode === "create" ? "Create Role" : "Edit Role";
  };

  const getModalDescription = () => {
    return mode === "create"
      ? "Define a new role with specialized focus and responsibilities."
      : "Update the role name and description.";
  };

  // Get screen reader announcement
  const getAnnounceOnOpen = () => {
    return mode === "create"
      ? "Create role dialog opened. Press Tab to navigate between fields."
      : "Edit role dialog opened. Press Tab to navigate between fields.";
  };

  // Handle Ctrl+S save shortcut
  const handleRequestSave = useCallback(() => {
    // Trigger form submission by dispatching submit event
    const form = document.querySelector(
      "[data-form-modal] form",
    ) as HTMLFormElement;
    if (form) {
      const submitEvent = new Event("submit", {
        cancelable: true,
        bubbles: true,
      });
      form.dispatchEvent(submitEvent);
    }
  }, []);

  return (
    <SettingsFormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={getModalTitle()}
      description={getModalDescription()}
      className="max-h-[80vh] overflow-y-auto"
      initialFocusSelector="[data-role-modal-initial-focus]"
      announceOnOpen={getAnnounceOnOpen()}
      onRequestSave={handleRequestSave}
      confirmOnClose={{
        enabled: hasUnsavedChanges,
        message: {
          title: "Unsaved Changes",
          body: "You have unsaved changes. Are you sure you want to close without saving?",
          confirmText: "Close Without Saving",
          cancelText: "Continue Editing",
        },
        onDiscard: () => formRef.current?.resetToInitialData(),
      }}
    >
      <CreateRoleForm
        ref={formRef}
        mode={mode}
        initialData={role}
        onSave={handleSave}
        onCancel={handleCancel}
        existingRoles={roles}
        isLoading={isLoading}
      />
    </SettingsFormModal>
  );
};

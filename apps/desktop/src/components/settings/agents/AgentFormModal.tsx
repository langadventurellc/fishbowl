/**
 * AgentFormModal component provides modal interface for agent creation and editing.
 *
 * Features:
 * - Modal dialog using shadcn/ui Dialog components
 * - Integration with AgentForm component
 * - Unsaved changes protection with confirmation dialog
 * - Keyboard shortcuts (Ctrl/Cmd+S to save, Escape to close)
 * - Support for create, edit, and template modes
 * - Proper focus management and accessibility
 * - Loading states during save operations
 *
 * @module components/settings/AgentFormModal
 */

import {
  useUnsavedChanges,
  type AgentFormData,
  type AgentFormModalProps,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useEffect } from "react";
import { useConfirmationDialog } from "../../../hooks/useConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { AgentForm } from "./AgentForm";

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  agent,
  template,
  onSave,
  isLoading = false,
}) => {
  const { showConfirmation } = useConfirmationDialog();
  const { hasUnsavedChanges } = useUnsavedChanges();

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
    async (data: AgentFormData) => {
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
        // The AgentForm component will handle the actual submission
        // We just prevent the browser's default save dialog
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Determine modal content based on mode
  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Agent";
      case "edit":
        return "Edit Agent";
      case "template":
        return "Create Agent from Template";
      default:
        return "Agent Configuration";
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case "create":
        return "Configure a new AI agent with custom settings and behavior.";
      case "edit":
        return "Update the agent's configuration and settings.";
      case "template":
        return "Create a new agent based on the selected template configuration.";
      default:
        return "Configure agent settings.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="agent-form-modal max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <AgentForm
          mode={mode}
          initialData={agent}
          templateData={template}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

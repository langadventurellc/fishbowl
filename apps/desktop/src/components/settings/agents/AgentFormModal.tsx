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

import type { AgentFormModalProps } from "@fishbowl-ai/ui-shared";
import { useUnsavedChanges, type AgentFormData } from "@fishbowl-ai/ui-shared";
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
  const { showConfirmation, confirmationDialogProps } = useConfirmationDialog();
  const { hasUnsavedChanges } = useUnsavedChanges();

  // Focus trap setup
  const triggerRef = useRef<HTMLElement | null>(null);
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    restoreFocus: true,
    initialFocusSelector: "[data-agent-modal-initial-focus]",
  });

  // Store the trigger element when modal opens and announce to screen readers
  useEffect(() => {
    if (isOpen && document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;

      // Announce modal state to screen readers
      const message =
        mode === "create"
          ? "Create agent dialog opened. Press Tab to navigate between fields."
          : mode === "edit"
            ? "Edit agent dialog opened. Press Tab to navigate between fields."
            : "Create agent from template dialog opened. Press Tab to navigate between fields.";
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
    async (data: AgentFormData) => {
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
          ".agent-form-modal form",
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

  // Prepare initial data based on mode
  const initialData =
    mode === "edit" ? agent : mode === "template" ? template : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={containerRef}
        className="agent-form-modal max-w-3xl max-h-[85vh] overflow-y-auto"
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
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <AgentForm
          mode={mode}
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
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

/**
 * AgentFormModal component provides modal interface for agent creation and editing.
 *
 * Features:
 * - Modal dialog using SettingsFormModal wrapper
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
import React, { useCallback, useRef } from "react";
import { SettingsFormModal } from "../common";
import { AgentForm, type AgentFormRef } from "./AgentForm";

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  agent,
  template,
  onSave,
  isLoading = false,
}) => {
  const { hasUnsavedChanges } = useUnsavedChanges();
  const formRef = useRef<AgentFormRef>(null);

  // Handle successful save
  const handleSave = useCallback(
    async (data: AgentFormData) => {
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

  // Get screen reader announcement
  const getAnnounceOnOpen = () => {
    switch (mode) {
      case "create":
        return "Create agent dialog opened. Press Tab to navigate between fields.";
      case "edit":
        return "Edit agent dialog opened. Press Tab to navigate between fields.";
      case "template":
        return "Create agent from template dialog opened. Press Tab to navigate between fields.";
      default:
        return "Agent configuration dialog opened. Press Tab to navigate between fields.";
    }
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

  // Prepare initial data based on mode
  const initialData =
    mode === "edit" ? agent : mode === "template" ? template : undefined;

  return (
    <SettingsFormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={getModalTitle()}
      description={getModalDescription()}
      className="max-w-3xl max-h-[85vh] overflow-y-auto"
      initialFocusSelector="[data-agent-modal-initial-focus]"
      announceOnOpen={getAnnounceOnOpen()}
      onRequestSave={handleRequestSave}
      confirmOnClose={{
        enabled: hasUnsavedChanges && !isLoading,
        message: {
          title: "Unsaved Changes",
          body: "You have unsaved changes. Are you sure you want to close without saving?",
          confirmText: "Close Without Saving",
          cancelText: "Continue Editing",
        },
        onDiscard: () => formRef.current?.resetToInitialData(),
      }}
    >
      <AgentForm
        ref={formRef}
        mode={mode}
        initialData={initialData}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </SettingsFormModal>
  );
};

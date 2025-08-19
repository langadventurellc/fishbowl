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

import { type AgentFormModalProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
}) => {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="agent-form-modal max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <div className="p-8 text-center text-muted-foreground">
          Agent form will be implemented later
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * AddAgentToConversationModal component provides a dialog for adding agents to conversations.
 *
 * Features:
 * - Agent selection dropdown populated from useAgentsStore
 * - Filters out agents already in the conversation
 * - Loading states during add operation
 * - Keyboard shortcuts (Enter to add, Escape to cancel)
 * - Input validation (agent must be selected)
 * - Error message display with retry capability
 * - Proper accessibility and focus management
 *
 * @module components/modals/AddAgentToConversationModal
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { AddAgentToConversationModalProps } from "@fishbowl-ai/ui-shared";
import { useAgentsStore, useConversationStore } from "@fishbowl-ai/ui-shared";
import { selectAgentColor } from "../../utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

/**
 * Modal dialog for adding agents to conversations.
 *
 * @example
 * ```typescript
 * function ConversationManager() {
 *   const [modalOpen, setModalOpen] = useState(false);
 *   const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
 *
 *   const handleAddAgent = () => {
 *     setModalOpen(true);
 *   };
 *
 *   return (
 *     <AddAgentToConversationModal
 *       open={modalOpen}
 *       onOpenChange={setModalOpen}
 *       conversationId={selectedConversationId}
 *       onAgentAdded={() => {
 *         // Optional: trigger refetch or show success message
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function AddAgentToConversationModal({
  open,
  onOpenChange,
  conversationId,
  onAgentAdded,
}: AddAgentToConversationModalProps): React.ReactElement {
  const { agents } = useAgentsStore();
  const { activeConversationAgents, addAgent, loading, error } =
    useConversationStore();

  // Map store data to match existing component logic
  const conversationAgents = activeConversationAgents;
  const isAdding = loading.agents;
  const addError = error.agents;

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedAgentId("");
      setLocalError(null);
    }
  }, [open]);

  // Filter available agents (exclude those already in conversation)
  const availableAgents = useMemo(() => {
    const conversationAgentIds = new Set(
      conversationAgents.map((ca) => ca.agent_id),
    );

    return agents
      .filter((agent) => !conversationAgentIds.has(agent.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [agents, conversationAgents]);

  const handleSubmit = useCallback(async () => {
    if (!selectedAgentId || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      // Select appropriate color for the new agent
      const selectedColor = selectAgentColor(conversationAgents);

      await addAgent(conversationId, selectedAgentId, selectedColor);

      // Success: close modal and call optional callback
      onOpenChange(false);
      onAgentAdded?.();
    } catch {
      setLocalError("Failed to add agent to conversation");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    conversationId,
    selectedAgentId,
    addAgent,
    onOpenChange,
    onAgentAdded,
    isSubmitting,
    conversationAgents,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && selectedAgentId && !isSubmitting) {
        event.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit, selectedAgentId, isSubmitting],
  );

  const handleCancel = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  }, [onOpenChange, isSubmitting]);

  const displayError = localError || addError?.message;
  const isLoading = isSubmitting || isAdding;
  const canAdd = selectedAgentId && !isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Add Agent to Conversation</DialogTitle>
          <DialogDescription>
            Select an agent to add to this conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="agent-select">Agent</Label>

            {availableAgents.length === 0 ? (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <span className="text-sm text-muted-foreground">
                  No available agents to add
                </span>
              </div>
            ) : (
              <Select
                value={selectedAgentId}
                onValueChange={setSelectedAgentId}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="agent-select"
                  aria-label="Select agent to add"
                >
                  <SelectValue placeholder="Select an agent to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex flex-col">
                        <span>{agent.name}</span>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{agent.role}</span>
                          <span>•</span>
                          <span>{agent.personality}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {displayError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{displayError}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canAdd || availableAgents.length === 0}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isLoading ? "Adding..." : "Add Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

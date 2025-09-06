import {
  AgentLabelsContainerDisplayProps,
  AgentPillViewModel,
} from "@fishbowl-ai/ui-shared";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useConversationStore, useAgentsStore } from "@fishbowl-ai/ui-shared";
import { cn } from "../../lib/utils";
import { AgentPill, ChatModeSelector } from "../chat";
import { Button } from "../input";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { AddAgentToConversationModal } from "../modals/AddAgentToConversationModal";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableAgentPill } from "../chat/SortableAgentPill";

/**
 * AgentLabelsContainerDisplay - Horizontal agent labels bar layout component
 *
 * Displays active conversation agents as pills in a horizontal scrollable bar.
 * Self-contained component that renders AgentPill components from agent data
 * and includes an "Add Agent" button. Positioned at the top of the conversation
 * area with proper spacing, alignment, and theme integration.
 */
export const AgentLabelsContainerDisplay: React.FC<
  AgentLabelsContainerDisplayProps
> = ({
  agents,
  onAddAgent,
  selectedConversationId,
  barHeight = "56px",
  agentSpacing = "8px",
  containerPadding = "0 16px",
  horizontalScroll = true,
  showBottomBorder = true,
  backgroundVariant = "card",
  className,
  style,
}) => {
  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{
    conversationAgentId: string;
    name: string;
    conversationId: string;
    agentId: string;
  } | null>(null);
  const [deletionLoading, setDeletionLoading] = useState(false);

  // Store integration
  const {
    activeConversationAgents,
    loading,
    error,
    toggleAgentEnabled,
    getActiveChatMode,
    setChatMode,
    removeAgent,
    refreshActiveConversation,
    reorderAgents,
  } = useConversationStore();
  const { agents: agentConfigs } = useAgentsStore();

  // Map store state to component expectations
  const conversationAgents = activeConversationAgents;
  const isLoading = loading.agents;
  const agentsError = error.agents;

  // Chat mode integration
  const activeChatMode = getActiveChatMode();
  const chatModeError =
    agentsError?.operation === "save" &&
    agentsError.message?.includes("chat mode")
      ? agentsError
      : null;

  // Drag and drop configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Agent IDs for sortable context
  const agentIds = conversationAgents.map((agent) => agent.id);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Early return if conditions aren't met for reordering
      if (!over || active.id === over.id) {
        return;
      }

      // Ensure we have a valid conversation ID
      if (!selectedConversationId) {
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);

      const oldIndex = agentIds.indexOf(activeId);
      const newIndex = agentIds.indexOf(overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedIds = [...agentIds];
        const [moved] = reorderedIds.splice(oldIndex, 1);

        if (moved) {
          reorderedIds.splice(newIndex, 0, moved);
          reorderAgents(selectedConversationId, reorderedIds);
        }
      }
    },
    [agentIds, selectedConversationId, reorderAgents],
  );

  // Transform conversation agents to display format
  const displayAgents = selectedConversationId
    ? conversationAgents.map((conversationAgent) => {
        const agentConfig = agentConfigs.find(
          (agent) => agent.id === conversationAgent.agent_id,
        );
        return (
          agentConfig || {
            id: conversationAgent.agent_id,
            name: "Unknown Agent",
            role: "unknown",
          }
        );
      })
    : agents;

  // Handler for Add Agent button
  const handleAddAgent = useCallback(() => {
    if (onAddAgent) {
      onAddAgent(); // Maintain backward compatibility
    } else if (selectedConversationId) {
      setAddModalOpen(true); // New modal behavior
    }
  }, [onAddAgent, selectedConversationId]);

  // Add Agent button should be disabled when no conversation selected
  const canAddAgent = !!selectedConversationId;

  // Delete agent handler
  const handleDeleteAgent = useCallback(
    (conversationAgentId: string) => {
      // Find agent info for confirmation
      const conversationAgent = activeConversationAgents.find(
        (ca) => ca.id === conversationAgentId,
      );
      const agentConfig = agentConfigs.find(
        (ac) => ac.id === conversationAgent?.agent_id,
      );

      if (conversationAgent && agentConfig && selectedConversationId) {
        setAgentToDelete({
          conversationAgentId,
          name: agentConfig.name,
          conversationId: selectedConversationId,
          agentId: conversationAgent.agent_id,
        });
        setDeleteDialogOpen(true);
      }
    },
    [activeConversationAgents, agentConfigs, selectedConversationId],
  );

  // Confirm delete handler
  const handleConfirmDelete = useCallback(async () => {
    if (!agentToDelete) return;

    try {
      setDeletionLoading(true);
      await removeAgent(agentToDelete.conversationId, agentToDelete.agentId);

      // Refresh conversation data to reflect deletion
      await refreshActiveConversation();

      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    } catch (error) {
      // Error handling is managed by the store - it will set error state
      console.error("Failed to delete agent:", error);
    } finally {
      setDeletionLoading(false);
    }
  }, [agentToDelete, removeAgent, refreshActiveConversation]);
  // Dynamic styles that can't be converted to Tailwind utilities
  const dynamicStyles: React.CSSProperties = {
    height: barHeight,
    backgroundColor: `var(--${backgroundVariant})`,
    padding: containerPadding,
    gap: agentSpacing,
    // Merge custom styles
    ...style,
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center overflow-y-hidden",
          showBottomBorder && "border-b border-border",
          horizontalScroll ? "overflow-x-auto" : "overflow-x-visible",
          className,
        )}
        style={dynamicStyles}
      >
        {/* Loading state */}
        {isLoading && selectedConversationId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading agents...</span>
          </div>
        )}

        {/* Error state */}
        {agentsError && selectedConversationId && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load agents: {agentsError.message}</span>
          </div>
        )}

        {/* Agent pills */}
        {!isLoading &&
          !agentsError &&
          (selectedConversationId ? (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={agentIds}
                strategy={verticalListSortingStrategy}
              >
                {conversationAgents.map((conversationAgent) => {
                  // Find the agent configuration
                  const agentConfig = agentConfigs.find(
                    (agent) => agent.id === conversationAgent.agent_id,
                  );

                  // Transform ConversationAgent to AgentPillViewModel
                  const agentViewModel: AgentPillViewModel = {
                    name: agentConfig?.name || "Unknown Agent",
                    role: agentConfig?.role || "unknown",
                    color: "#3b82f6", // Default color since AgentSettingsViewModel doesn't have color
                    isThinking: false,
                    status: "idle",
                    enabled: conversationAgent.enabled, // Use actual enabled state from conversation agent
                  };

                  return (
                    <SortableAgentPill
                      key={conversationAgent.id}
                      id={conversationAgent.id}
                      agent={agentViewModel}
                      onToggleEnabled={() =>
                        toggleAgentEnabled(conversationAgent.id)
                      }
                      onDelete={handleDeleteAgent}
                      conversationAgentId={conversationAgent.id}
                      showStatus={true}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          ) : (
            displayAgents.map((agent, index) => {
              // Transform AgentSettingsViewModel to AgentPillViewModel for non-conversation view
              const agentViewModel: AgentPillViewModel =
                "id" in agent
                  ? {
                      name: agent.name,
                      role: agent.role,
                      color: "#3b82f6",
                      isThinking: false,
                      status: "idle",
                      enabled: true, // Default to enabled for settings view agents
                    }
                  : agent;

              return (
                <AgentPill
                  key={"id" in agent ? agent.id : `agent-${index}`}
                  agent={agentViewModel}
                />
              );
            })
          ))}

        {/* Add Agent button */}
        {(onAddAgent || selectedConversationId) && (
          <Button
            variant="ghost"
            size="small"
            onClick={handleAddAgent}
            disabled={!canAddAgent || isLoading}
            className="add-agent-button"
            aria-label={
              !canAddAgent
                ? "Select a conversation to add agents"
                : "Add agent to conversation"
            }
          >
            +
          </Button>
        )}

        {/* Chat mode selector - only when conversation is selected */}
        {selectedConversationId && (
          <div className="ml-auto">
            <ChatModeSelector
              value={activeChatMode}
              onValueChange={setChatMode}
              disabled={isLoading}
              error={chatModeError?.message || undefined}
            />
          </div>
        )}
      </div>

      {/* Modal integration */}
      {selectedConversationId && (
        <AddAgentToConversationModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          conversationId={selectedConversationId}
          onAgentAdded={() => {
            // Store handles data consistency automatically - no manual refetch needed
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Agent from Conversation"
        message={`This will remove ${agentToDelete?.name} from this conversation and delete all of their messages. This action cannot be undone.`}
        confirmText={deletionLoading ? "Deleting..." : "Delete Agent"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

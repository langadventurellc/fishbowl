import {
  AgentLabelsContainerDisplayProps,
  AgentPillViewModel,
} from "@fishbowl-ai/ui-shared";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useConversationAgents } from "../../hooks/conversationAgents/useConversationAgents";
import { cn } from "../../lib/utils";
import { AgentPill } from "../chat";
import { Button } from "../input";
import { AddAgentToConversationModal } from "../modals/AddAgentToConversationModal";

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

  // Hook integration
  const { conversationAgents, isLoading, error, refetch, toggleEnabled } =
    useConversationAgents(selectedConversationId || null);

  // Transform conversation agents to display format
  const displayAgents = selectedConversationId
    ? conversationAgents.map((ca) => ca.agent)
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
        {error && selectedConversationId && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load agents: {error.message}</span>
          </div>
        )}

        {/* Agent pills */}
        {!isLoading &&
          !error &&
          (selectedConversationId
            ? conversationAgents.map((conversationAgent) => {
                // Transform ConversationAgentViewModel to AgentPillViewModel
                const agentViewModel: AgentPillViewModel = {
                  name: conversationAgent.agent.name,
                  role: conversationAgent.agent.role,
                  color: "#3b82f6", // Default color since AgentSettingsViewModel doesn't have color
                  isThinking: false,
                  status: "idle",
                  enabled: conversationAgent.enabled, // Use actual enabled state from conversation agent
                };

                return (
                  <AgentPill
                    key={conversationAgent.id}
                    agent={agentViewModel}
                    onToggleEnabled={toggleEnabled}
                    conversationAgentId={conversationAgent.id}
                  />
                );
              })
            : displayAgents.map((agent, index) => {
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
              }))}

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
      </div>

      {/* Modal integration */}
      {selectedConversationId && (
        <AddAgentToConversationModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          conversationId={selectedConversationId}
          onAgentAdded={() => {
            refetch(); // Explicitly refetch to ensure UI updates
          }}
        />
      )}
    </>
  );
};

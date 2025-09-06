import { SettingsCard } from "@/components/ui";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useServices } from "@/contexts";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useLlmModels } from "@/hooks/useLlmModels";
import { cn } from "@/lib/utils";
import { announceToScreenReader } from "@/utils";
import { useGridNavigation } from "@/utils/gridNavigation";
import {
  AgentSettingsViewModel,
  getRoleById,
  useAgentsStore,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useRef, useState } from "react";

/**
 * Responsive grid layout for agent cards with keyboard navigation.
 */
export interface AgentGridProps {
  agents: AgentSettingsViewModel[];
  openEditModal: (agent: AgentSettingsViewModel) => void;
}

export const AgentGrid: React.FC<AgentGridProps> = ({
  agents,
  openEditModal,
}) => {
  const { logger } = useServices();
  const { deleteAgent } = useAgentsStore();
  const { showConfirmation, confirmationDialogProps } = useConfirmationDialog();
  const { models } = useLlmModels();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate columns based on screen size (matches Tailwind breakpoints)
  const columns = window.innerWidth >= 1024 ? 2 : 1;

  const { handleKeyDown } = useGridNavigation({
    totalItems: agents.length,
    columns,
    onFocusChange: setFocusedIndex,
    onActivate: (index) => {
      const editButton = cardRefs.current[index]?.querySelector(
        '[aria-label*="Edit"]',
      ) as HTMLButtonElement;
      editButton?.click();
    },
    announceToScreenReader,
    getItemName: (index) => agents[index]?.name || `Agent ${index + 1}`,
  });

  const handleCardFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      handleKeyDown(e, focusedIndex);
    },
    [handleKeyDown, focusedIndex],
  );

  const handleDeleteAgent = useCallback(
    async (agentId: string) => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return;

      // Prevent multiple deletions of the same agent
      if (isDeleting === agentId) return;

      logger.info("Delete agent requested", { agentId });

      try {
        setIsDeleting(agentId);

        const confirmed = await showConfirmation({
          title: "Delete Agent",
          message: `Are you sure you want to delete "${agent.name}"? This action cannot be undone.`,
          confirmText: "Delete",
          cancelText: "Cancel",
          variant: "destructive",
        });

        if (confirmed) {
          deleteAgent(agentId);
          announceToScreenReader(
            `Agent ${agent.name} has been deleted`,
            "assertive",
          );
          logger.info("Agent deleted successfully", {
            agentId,
            agentName: agent.name,
          });
        } else {
          announceToScreenReader(
            `Deletion of ${agent.name} was cancelled`,
            "polite",
          );
        }
      } catch (error) {
        logger.error(
          `Error during agent deletion for agent ${agentId}`,
          error instanceof Error ? error : new Error(String(error)),
        );
        announceToScreenReader(
          `Failed to delete agent ${agent.name}`,
          "assertive",
        );
      } finally {
        setIsDeleting(null);
      }
    },
    [agents, logger, showConfirmation, deleteAgent, isDeleting],
  );

  return (
    <div
      id="agents-grid"
      ref={gridRef}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
      role="grid"
      aria-label={`Grid of ${agents.length} agents`}
      onKeyDown={handleGridKeyDown}
      tabIndex={-1}
    >
      {agents.map((agent, index) => (
        <div
          key={agent.id}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          role="gridcell"
          tabIndex={focusedIndex === index ? 0 : -1}
          onFocus={() => handleCardFocus(index)}
          className={cn(
            "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg",
            focusedIndex === index && "ring-2 ring-accent ring-offset-2",
          )}
          aria-rowindex={Math.floor(index / columns) + 1}
          aria-colindex={(index % columns) + 1}
        >
          {(() => {
            // Get display names with business logic from AgentCard
            const roleDisplayName = getRoleById(agent.role)?.name || agent.role;

            // Find model using both configId and model id for accurate resolution
            const resolvedModel = models.find(
              (m) => m.configId === agent.llmConfigId && m.id === agent.model,
            );

            // Fallback to stored model string if not found
            const modelDisplayName = resolvedModel?.name || agent.model;

            // Combine model and role for content
            const content = `${modelDisplayName} • ${roleDisplayName}`;

            return (
              <SettingsCard
                title={agent.name}
                content={content}
                onEdit={() => {
                  openEditModal(agent);
                  announceToScreenReader(
                    `Opening edit dialog for ${agent.name}`,
                    "polite",
                  );
                }}
                onDelete={() => handleDeleteAgent(agent.id)}
              />
            );
          })()}
        </div>
      ))}
      {confirmationDialogProps && (
        <ConfirmationDialog {...confirmationDialogProps} />
      )}
    </div>
  );
};

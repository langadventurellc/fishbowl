/**
 * AgentsSection component provides agent management functionality with tab navigation.
 *
 * Features:
 * - Two-tab navigation: Library, Defaults
 * - Integration with TabContainer for consistent tab behavior
 * - Settings modal navigation state integration
 * - Responsive design and accessibility compliance
 * - 200ms animation transitions for smooth UX
 *
 * @module components/settings/AgentsSection
 */

import {
  type AgentCard as AgentCardType,
  type AgentFormData,
  type AgentsSectionProps,
  type TabConfiguration,
  useAgentsStore,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useState } from "react";
import { cn } from "../../../lib/utils";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { TabContainer } from "../TabContainer";
import { AgentFormModal } from "./AgentFormModal";
import { DefaultsTab } from "./DefaultsTab";
import { LibraryTab } from "./LibraryTab";
import { useServices } from "../../../contexts";

export const AgentsSection: React.FC<AgentsSectionProps> = ({ className }) => {
  // Get services for logger
  const { logger } = useServices();

  // Modal state management
  const [agentModalState, setAgentModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    agent?: AgentCardType;
  }>({
    isOpen: false,
    mode: "create",
  });

  // Modal control functions
  const openCreateModal = useCallback(() => {
    setAgentModalState({
      isOpen: true,
      mode: "create",
    });
  }, []);

  const openEditModal = useCallback((agent: AgentCardType) => {
    setAgentModalState({
      isOpen: true,
      mode: "edit",
      agent,
    });
  }, []);

  const closeModal = useCallback(() => {
    setAgentModalState({
      isOpen: false,
      mode: "create",
    });
  }, []);

  // Get store actions
  const { createAgent, updateAgent, error } = useAgentsStore();

  // Form save handler
  const handleAgentSave = useCallback(
    async (data: AgentFormData) => {
      try {
        if (agentModalState.mode === "create") {
          const agentId = createAgent(data);

          if (agentId) {
            // Success - close modal and announce
            closeModal();

            announceToScreenReader(
              `Agent ${data.name} created successfully`,
              "polite",
            );

            logger.info("Agent created successfully", {
              agentId,
              agentName: data.name,
              timestamp: new Date().toISOString(),
            });
          } else {
            // createAgent returns empty string on error, error is set in store
            throw new Error(error?.message || "Failed to create agent");
          }
        } else {
          // Handle edit mode - updateAgent returns void, check error state via hook
          updateAgent(agentModalState.agent!.id, data);

          // Check if error occurred (error state is already available from hook)
          if (error) {
            throw new Error(error.message || "Failed to update agent");
          }

          // Success - close modal and announce
          closeModal();

          announceToScreenReader(
            `Agent ${data.name} updated successfully`,
            "polite",
          );

          logger.info("Agent updated successfully", {
            agentId: agentModalState.agent!.id,
            agentName: data.name,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";

        announceToScreenReader(`Error: ${errorMessage}`, "assertive");

        logger.error(
          "Agent save failed",
          err instanceof Error ? err : new Error(errorMessage),
        );

        // Don't close modal on error so user can retry
      }
    },
    [
      agentModalState.mode,
      agentModalState.agent,
      createAgent,
      updateAgent,
      error,
      closeModal,
      logger,
    ],
  );

  // Tab configuration following established patterns
  const tabs: TabConfiguration[] = [
    {
      id: "library",
      label: "Library",
      content: () => (
        <LibraryTab
          openCreateModal={openCreateModal}
          openEditModal={openEditModal}
        />
      ),
    },
    {
      id: "defaults",
      label: "Defaults",
      content: () => <DefaultsTab />,
    },
  ];

  return (
    <div className={cn("agents-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Agents</h1>
        <p className="text-muted-foreground mb-6">
          Configure AI agents and their behavior settings.
        </p>
      </div>
      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="agents-tabs"
      />

      <AgentFormModal
        isOpen={agentModalState.isOpen}
        onOpenChange={closeModal}
        mode={agentModalState.mode}
        agent={agentModalState.agent}
        onSave={handleAgentSave}
        isLoading={false}
      />
    </div>
  );
};

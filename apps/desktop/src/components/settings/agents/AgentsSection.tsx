/**
 * AgentsSection component provides simplified agent management functionality.
 *
 * Features:
 * - Agent library management interface
 * - Settings modal navigation state integration
 * - Responsive design and accessibility compliance
 *
 * @module components/settings/AgentsSection
 */

import {
  type AgentCard as AgentCardType,
  type AgentFormData,
  type AgentsSectionProps,
  useAgentsStore,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useState } from "react";
import { cn } from "../../../lib/utils";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { AgentFormModal } from "./AgentFormModal";
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
  const { createAgent, updateAgent } = useAgentsStore();

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
            // Get the current error state directly from the store
            const currentError = useAgentsStore.getState().error;
            throw new Error(currentError?.message || "Failed to create agent");
          }
        } else {
          // Handle edit mode - updateAgent returns void, check error state after the call
          updateAgent(agentModalState.agent!.id, data);

          // Get the current error state directly from the store after the update
          const currentError = useAgentsStore.getState().error;
          if (currentError?.message) {
            throw new Error(currentError.message || "Failed to update agent");
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
      closeModal,
      logger,
    ],
  );

  return (
    <div className={cn("agents-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Agents</h1>
        <p className="text-muted-foreground mb-6">
          Configure AI agents and their behavior settings.
        </p>
      </div>

      <LibraryTab
        openCreateModal={openCreateModal}
        openEditModal={openEditModal}
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

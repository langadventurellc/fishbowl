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

  // Form save handler
  const handleAgentSave = useCallback(
    async (data: AgentFormData) => {
      // UI-only implementation as per project requirements
      logger.info("Agent save operation (UI-only)", {
        mode: agentModalState.mode,
        agentName: data.name,
        timestamp: new Date().toISOString(),
      });

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show user feedback
      const actionWord =
        agentModalState.mode === "edit" ? "updated" : "created";

      announceToScreenReader(
        `Agent ${data.name} ${actionWord} successfully`,
        "polite",
      );
    },
    [agentModalState.mode, logger],
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

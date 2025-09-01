/**
 * ConversationAgentsProvider component that provides conversation agents state
 * to its children via React Context.
 *
 * @module contexts/ConversationAgentsContext/ConversationAgentsProvider
 */

import React, { type ReactNode, useCallback, useEffect, useMemo } from "react";
import {
  type AgentSettingsViewModel,
  type ConversationAgentViewModel,
  useConversationStore,
  useAgentsStore,
} from "@fishbowl-ai/ui-shared";
import { type ConversationAgent } from "@fishbowl-ai/shared";
import { ConversationAgentsContext } from "./ConversationAgentsContext";
import { type UseConversationAgentsResult } from "../../hooks/conversationAgents/UseConversationAgentsResult";
import { useServices } from "../useServices";

// Provider props interface
interface ConversationAgentsProviderProps {
  /** The conversation ID to manage agents for, or null to provide empty state */
  conversationId: string | null;
  /** Children components that will have access to the conversation agents context */
  children: ReactNode;
}

/**
 * ConversationAgentsProvider component that provides conversation agents state
 * to its children via React Context.
 *
 * When conversationId is null, provides safe defaults:
 * - conversationAgents: []
 * - isLoading: false
 * - error: null
 * - All async methods become no-ops that resolve immediately
 *
 * When conversationId is provided, uses the conversation store to provide
 * all conversation agent functionality with proper state management.
 *
 * @param props - Provider configuration
 * @returns JSX provider element
 */
export function ConversationAgentsProvider({
  conversationId,
  children,
}: ConversationAgentsProviderProps) {
  const { logger } = useServices();
  const { getAgentById } = useAgentsStore();
  const {
    activeConversationId,
    activeConversationAgents,
    loading,
    error,
    selectConversation,
    addAgent: storeAddAgent,
    removeAgent: storeRemoveAgent,
    toggleAgentEnabled,
    refreshActiveConversation,
  } = useConversationStore();

  /**
   * Transform ConversationAgent to ConversationAgentViewModel by populating agent data.
   * Preserves the exact same transformation logic from the original hook.
   */
  const transformToViewModel = useCallback(
    (conversationAgent: ConversationAgent): ConversationAgentViewModel => {
      const agentSettings = getAgentById(conversationAgent.agent_id);

      // Create fallback agent if not found in store
      const agent: AgentSettingsViewModel = agentSettings || {
        id: conversationAgent.agent_id,
        name: `Unknown Agent (${conversationAgent.agent_id.slice(0, 8)})`,
        model: "Unknown Model",
        llmConfigId: "Unknown LLM Config",
        role: "Unknown Role",
        personality: "Unknown Personality",
        systemPrompt: "",
        createdAt: conversationAgent.added_at,
        updatedAt: conversationAgent.added_at,
      };

      if (!agentSettings) {
        logger.warn("Agent not found in store, using fallback data", {
          agentId: conversationAgent.agent_id,
        });
      }

      return {
        id: conversationAgent.id,
        conversationId: conversationAgent.conversation_id,
        agentId: conversationAgent.agent_id,
        agent,
        addedAt: conversationAgent.added_at,
        isActive: conversationAgent.is_active,
        enabled: conversationAgent.enabled,
        displayOrder: conversationAgent.display_order,
      };
    },
    [getAgentById, logger],
  );

  // Handle conversation selection when conversationId prop changes
  useEffect(() => {
    if (conversationId !== activeConversationId) {
      selectConversation(conversationId);
    }
  }, [conversationId, activeConversationId, selectConversation]);

  // Transform store data to hook interface with proper sorting
  const conversationAgents = useMemo(() => {
    if (!conversationId || activeConversationId !== conversationId) {
      return [];
    }
    return activeConversationAgents.map(transformToViewModel).sort((a, b) => {
      // Sort by display order first, then by added date
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
    });
  }, [
    activeConversationAgents,
    transformToViewModel,
    conversationId,
    activeConversationId,
  ]);

  // Wrapper functions to match hook interface
  const addAgent = useCallback(
    async (agentId: string) => {
      if (!conversationId) return;
      await storeAddAgent(conversationId, agentId);
    },
    [conversationId, storeAddAgent],
  );

  const removeAgent = useCallback(
    async (agentId: string) => {
      if (!conversationId) return;
      await storeRemoveAgent(conversationId, agentId);
    },
    [conversationId, storeRemoveAgent],
  );

  // Map store state to hook interface
  const value: UseConversationAgentsResult = {
    conversationAgents,
    isLoading: loading.agents,
    error: error.agents
      ? new Error(error.agents.message || "Unknown error")
      : null,
    addAgent,
    removeAgent,
    toggleEnabled: toggleAgentEnabled,
    refetch: refreshActiveConversation,
  };

  return (
    <ConversationAgentsContext.Provider value={value}>
      {children}
    </ConversationAgentsContext.Provider>
  );
}

/**
 * Hook for managing conversation agents in the desktop application.
 *
 * Provides automatic loading, error handling, and manual refresh capability
 * for conversation agent lists. Integrates with IPC communication layer to
 * interact with the main process conversation agent handlers and populates
 * agent data using the agents store.
 *
 * @module hooks/useConversationAgents
 */

import { type ConversationAgent } from "@fishbowl-ai/shared";
import {
  type AgentSettingsViewModel,
  type ConversationAgentViewModel,
  useAgentsStore,
} from "@fishbowl-ai/ui-shared";
import { useCallback, useEffect, useState } from "react";
import { useServices } from "../../contexts";
import { UseConversationAgentsResult } from "./UseConversationAgentsResult";

/**
 * Custom hook for managing conversation agents with state management.
 *
 * Follows the established useConversations pattern for consistency across the codebase.
 * Provides loading states, error handling, and real-time synchronization using the refetch pattern.
 *
 * @param conversationId - The conversation ID to load agents for, or null to clear state
 * @returns Hook result with conversation agents data and management functions
 */
export function useConversationAgents(
  conversationId: string | null,
): UseConversationAgentsResult {
  const { logger } = useServices();
  const { getAgentById } = useAgentsStore();
  const [conversationAgents, setConversationAgents] = useState<
    ConversationAgentViewModel[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Transform ConversationAgent to ConversationAgentViewModel by populating agent data.
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
        displayOrder: conversationAgent.display_order,
      };
    },
    [getAgentById, logger],
  );

  /**
   * Fetch conversation agents with proper error handling and data transformation.
   */
  const fetchConversationAgents = useCallback(async () => {
    if (!conversationId) {
      setConversationAgents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if running in Electron environment
      if (
        typeof window === "undefined" ||
        !window.electronAPI?.conversationAgent?.getByConversation ||
        typeof window.electronAPI.conversationAgent.getByConversation !==
          "function"
      ) {
        logger.warn(
          "Not running in Electron environment, skipping conversation agents load",
        );
        setConversationAgents([]);
        return;
      }

      const conversationAgentData =
        await window.electronAPI.conversationAgent.getByConversation(
          conversationId,
        );

      // Transform to ViewModels using agent store data with fallback handling
      const viewModels = conversationAgentData
        .map(transformToViewModel)
        .sort((a, b) => {
          // Sort by display order first, then by added date
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        });

      setConversationAgents(viewModels);
      logger.debug(`Loaded ${viewModels.length} conversation agents`);
    } catch (err) {
      logger.error("Failed to load conversation agents:", err as Error);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, transformToViewModel, logger]);

  /**
   * Add an agent to the conversation with refetch pattern.
   */
  const addAgent = useCallback(
    async (agentId: string) => {
      if (!conversationId) return;

      try {
        await window.electronAPI.conversationAgent.add({
          conversation_id: conversationId,
          agent_id: agentId,
        });

        await fetchConversationAgents(); // Refetch to sync state
      } catch (err) {
        setError(err as Error);
      }
    },
    [conversationId, fetchConversationAgents],
  );

  /**
   * Remove an agent from the conversation with refetch pattern.
   */
  const removeAgent = useCallback(
    async (agentId: string) => {
      if (!conversationId) return;

      try {
        await window.electronAPI.conversationAgent.remove({
          conversation_id: conversationId,
          agent_id: agentId,
        });

        await fetchConversationAgents(); // Refetch to sync state
      } catch (err) {
        setError(err as Error);
      }
    },
    [conversationId, fetchConversationAgents],
  );

  // Auto-fetch when conversation changes
  useEffect(() => {
    fetchConversationAgents();
  }, [fetchConversationAgents]);

  return {
    conversationAgents,
    isLoading,
    error,
    addAgent,
    removeAgent,
    refetch: fetchConversationAgents,
  };
}

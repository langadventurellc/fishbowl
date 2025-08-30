/**
 * Composite hook that provides messages with resolved agent names and roles.
 *
 * Combines data from messages, conversation agents, agent configs, and role configs
 * to provide fully resolved MessageViewModel objects with actual agent names and roles
 * instead of placeholder values.
 *
 * @module hooks/messages/useMessagesWithAgentData
 */

import type { MessageViewModel } from "@fishbowl-ai/ui-shared";
import { useAgentsStore, useRolesStore } from "@fishbowl-ai/ui-shared";
import { useMemo } from "react";
import { useConversationAgents } from "../conversationAgents/useConversationAgents";
import { useMessages } from "./useMessages";
import { UseMessagesWithAgentDataResult } from "./UseMessagesWithAgentDataResult";

/**
 * Custom hook that provides messages with resolved agent names and roles.
 *
 * This composite hook combines data from multiple sources:
 * - Raw messages from the database
 * - Conversation agents for the current conversation
 * - Agent configurations from the agent store
 * - Role configurations from the role store
 *
 * It transforms the raw messages into fully resolved MessageViewModel objects
 * with actual agent names and role names instead of placeholder values.
 *
 * @param conversationId - The conversation ID to load messages for, or null to skip loading
 * @returns Hook result with resolved messages and management functions
 */
export function useMessagesWithAgentData(
  conversationId: string | null,
): UseMessagesWithAgentDataResult {
  // Get raw messages
  const {
    messages: rawMessages,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
    isEmpty: rawIsEmpty,
  } = useMessages(conversationId || "skip");

  // Get conversation agents for this conversation
  const {
    conversationAgents,
    isLoading: agentsLoading,
    error: agentsError,
    refetch: refetchAgents,
  } = useConversationAgents(conversationId);

  // Get agent and role configurations from stores
  const { agents: agentConfigs } = useAgentsStore();
  const { roles: roleConfigs } = useRolesStore();

  // Create lookup maps for efficient resolution
  const agentLookup = useMemo(() => {
    const lookup = new Map<
      string,
      { agentName: string; roleName: string; agentColor: string }
    >();

    conversationAgents.forEach((conversationAgent) => {
      const agentConfig = agentConfigs.find(
        (agent) => agent.id === conversationAgent.agentId,
      );
      const roleConfig = roleConfigs.find(
        (role) => role.id === agentConfig?.role,
      );

      lookup.set(conversationAgent.id, {
        agentName: agentConfig?.name || "Unknown Agent",
        roleName: roleConfig?.name || agentConfig?.role || "Unknown Role",
        agentColor:
          agentConfig?.personality === "helpful"
            ? "#22c55e"
            : agentConfig?.personality === "creative"
              ? "#a855f7"
              : agentConfig?.personality === "analytical"
                ? "#3b82f6"
                : "#22c55e",
      });
    });

    return lookup;
  }, [conversationAgents, agentConfigs, roleConfigs]);

  // Transform raw messages to resolved MessageViewModel objects
  const messages = useMemo((): MessageViewModel[] => {
    return rawMessages.map((message) => {
      // For user messages, use "User" as both agent and role
      if (message.role === "user") {
        return {
          id: message.id,
          agent: "User",
          role: "User",
          content: message.content,
          timestamp: new Date(message.created_at).toLocaleTimeString(),
          type: "user" as const,
          isActive: message.included,
          agentColor: "#3b82f6",
        };
      }

      // For system messages, use "System" as both agent and role
      if (message.role === "system") {
        return {
          id: message.id,
          agent: "System",
          role: "System",
          content: message.content,
          timestamp: new Date(message.created_at).toLocaleTimeString(),
          type: "system" as const,
          isActive: message.included,
          agentColor: "#6b7280",
        };
      }

      // For agent messages, look up the actual agent name and role
      const agentInfo = message.conversation_agent_id
        ? agentLookup.get(message.conversation_agent_id)
        : null;

      return {
        id: message.id,
        agent: agentInfo?.agentName || "Agent",
        role: agentInfo?.roleName || "Agent",
        content: message.content,
        timestamp: new Date(message.created_at).toLocaleTimeString(),
        type: "agent" as const,
        isActive: message.included,
        agentColor: agentInfo?.agentColor || "#22c55e",
      };
    });
  }, [rawMessages, agentLookup]);

  // Combined refetch function
  const refetch = async () => {
    await Promise.all([refetchMessages(), refetchAgents()]);
  };

  return {
    messages,
    isLoading: messagesLoading || agentsLoading,
    error: messagesError || agentsError,
    refetch,
    isEmpty: rawIsEmpty,
  };
}

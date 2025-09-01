import {
  MainContentPanelDisplayProps,
  MessageViewModel,
  AgentPillViewModel,
  useConversationStore,
  useAgentsStore,
  useRolesStore,
} from "@fishbowl-ai/ui-shared";

// ErrorState type interface
interface ErrorState {
  message: string | null;
  operation: "save" | "load" | "sync" | "import" | "reset" | null;
  isRetryable: boolean;
  retryCount: number;
  timestamp: string | null;
  fieldErrors?: Array<{ field: string; message: string }>;
}
import { AlertCircle, MessageCircle } from "lucide-react";
import React, { useMemo } from "react";
import { useChatEventIntegration } from "../../hooks/chat/useChatEventIntegration";
import { MessagesRefreshContext } from "../../hooks/messages";
import { useMessageActions } from "../../hooks/services/useMessageActions";
import { cn } from "../../lib/utils";
import { MessageInputContainer } from "../input";
import { AgentLabelsContainerDisplay, ChatContainerDisplay } from "./";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import { ConversationAgentsProvider } from "../../contexts";

/**
 * MainContentPanelDisplay - Primary conversation interface layout component
 *
 * Orchestrates the main conversation area by combining agent labels, chat messages,
 * and message input components. Provides the central content area layout with
 * proper flex organization and overflow handling for the conversation interface.
 */
export const MainContentPanelDisplay: React.FC<
  MainContentPanelDisplayProps
> = ({ selectedConversationId, className, style }) => {
  // Use conversation store for messages and agents
  const {
    activeMessages,
    activeConversationAgents,
    loading,
    error,
    refreshActiveConversation,
  } = useConversationStore();

  // Get agent and role configurations from stores for message enrichment
  const { agents: agentConfigs } = useAgentsStore();
  const { roles: roleConfigs } = useRolesStore();

  // Transform raw messages to resolved MessageViewModel objects (same logic as useMessagesWithAgentData)
  const messages = useMemo((): MessageViewModel[] => {
    // Create lookup map for efficient resolution
    const agentLookup = new Map<
      string,
      { agentName: string; roleName: string; agentColor: string }
    >();

    activeConversationAgents.forEach((conversationAgent) => {
      const agentConfig = agentConfigs.find(
        (agent) => agent.id === conversationAgent.agent_id,
      );
      const roleConfig = roleConfigs.find(
        (role) => role.id === agentConfig?.role,
      );

      agentLookup.set(conversationAgent.id, {
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

    return activeMessages.map((message) => {
      // For user messages, use "you" as agent and "user" as role
      if (message.role === "user") {
        return {
          id: message.id,
          agent: "you",
          role: "user",
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
  }, [activeMessages, activeConversationAgents, agentConfigs, roleConfigs]);

  const isLoading = loading.messages || loading.agents;
  const messagesError = error.messages || error.agents;

  return (
    <MessagesRefreshContext.Provider
      value={{ refetch: refreshActiveConversation }}
    >
      <ConversationAgentsProvider
        conversationId={selectedConversationId || null}
      >
        <MainContentPanelContent
          selectedConversationId={selectedConversationId || null}
          className={className}
          style={style}
          messages={messages}
          isLoading={isLoading}
          error={messagesError}
          refetch={refreshActiveConversation}
        />
      </ConversationAgentsProvider>
    </MessagesRefreshContext.Provider>
  );
};

/**
 * Inner component that has access to MessagesRefreshContext
 */
interface MainContentPanelContentProps {
  selectedConversationId: string | null;
  className?: string;
  style?: React.CSSProperties;
  messages: MessageViewModel[];
  isLoading: boolean;
  error: ErrorState | undefined;
  refetch: () => Promise<void>;
}

const MainContentPanelContent: React.FC<MainContentPanelContentProps> = ({
  selectedConversationId,
  className,
  style,
  messages,
  isLoading,
  error,
  refetch,
}) => {
  // Initialize chat event integration for real-time agent status updates - now has access to MessagesRefreshContext
  useChatEventIntegration({ conversationId: selectedConversationId || null });

  // Message actions for context menu operations
  const { copyMessageContent, deleteMessage } = useMessageActions();
  const { showConfirmation, confirmationDialogProps } = useConfirmationDialog();

  // Empty agents array as placeholder - AgentLabelsContainerDisplay fetches its own data
  const agents: AgentPillViewModel[] = [];

  // Handle context menu actions
  const handleContextMenuAction = async (action: string, messageId: string) => {
    if (action === "copy") {
      // Find the message by ID
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        try {
          await copyMessageContent(message.content);
          // Success feedback could be added here
        } catch (error) {
          console.error("Failed to copy message:", error);
          // Error feedback could be added here
        }
      }
    } else if (action === "delete") {
      // Find the message by ID
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        try {
          // Show confirmation dialog
          const confirmed = await showConfirmation({
            title: "Delete Message",
            message:
              "Are you sure you want to delete this message? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
          });

          if (confirmed) {
            // Delete the message
            await deleteMessage(messageId);

            // Refresh messages list to reflect deletion
            await refetch();
          }
        } catch (error) {
          console.error("Failed to delete message:", error);
          // Error feedback could be added here
        }
      }
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex space-x-3">
          <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  // Enhanced error state component
  const ErrorStateComponent = ({
    error,
    onRetry,
  }: {
    error: ErrorState | null;
    onRetry: () => void;
  }) => (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Failed to load messages
        </h3>
        <p className="text-gray-600 mb-4">
          There was a problem loading the conversation.
          {error?.message && error.message !== "Failed to load messages" && (
            <span className="block text-sm mt-1 text-gray-500">
              {error.message}
            </span>
          )}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // No conversation selected state
  const NoConversationSelected = () => (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          No conversation selected
        </h3>
        <p className="text-gray-600">
          Select a conversation from the sidebar or create a new one to get
          started.
        </p>
      </div>
    </div>
  );

  // Enhanced empty state component (for when conversation is selected but has no messages)
  const EmptyConversation = () => (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          Start a conversation
        </h3>
        <p className="text-gray-600">
          Type a message below to begin chatting with your AI agents.
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={cn("flex flex-1 flex-col overflow-hidden", className)}
      style={style}
    >
      {/* Agent Labels Container */}
      <AgentLabelsContainerDisplay
        agents={agents}
        selectedConversationId={selectedConversationId}
      />

      {/* Chat Container - Add overflow constraints */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedConversationId ? (
          <NoConversationSelected />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorStateComponent error={error} onRetry={refetch} />
        ) : (
          <ChatContainerDisplay
            messages={messages}
            emptyState={<EmptyConversation />}
            onContextMenuAction={handleContextMenuAction}
          />
        )}
      </div>

      {/* Input Container - Only show if conversation is selected */}
      {selectedConversationId && (
        <MessageInputContainer
          conversationId={selectedConversationId}
          layoutVariant="default"
        />
      )}

      {/* Confirmation Dialog */}
      {confirmationDialogProps && (
        <ConfirmationDialog {...confirmationDialogProps} />
      )}
    </div>
  );
};

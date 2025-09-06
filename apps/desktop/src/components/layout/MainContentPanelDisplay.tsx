import {
  AgentPillViewModel,
  MainContentPanelDisplayProps,
  MessageViewModel,
  useAgentsStore,
  useConversationStore,
  useRolesStore,
  type ErrorState,
} from "@fishbowl-ai/ui-shared";
import { AlertCircle, MessageCircle } from "lucide-react";
import React, { useMemo, useRef } from "react";
import { useChatEventIntegration } from "../../hooks/chat/useChatEventIntegration";
import { useMessageActions } from "../../hooks/services/useMessageActions";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import { cn } from "../../lib/utils";
import { MessageInputContainer } from "../input";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { AgentLabelsContainerDisplay, ChatContainerDisplay } from "./";

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

  // Transform raw messages to resolved MessageViewModel objects with agent/role enrichment
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

  const messagesError = error.messages || error.agents;

  // Determine loading states to preserve chat list during background operations
  const showInitialSkeleton =
    !!selectedConversationId && messages.length === 0 && loading.messages;
  const showBackgroundOverlay =
    !!selectedConversationId &&
    (loading.messages || loading.agents) &&
    messages.length > 0;

  return (
    <MainContentPanelContent
      selectedConversationId={selectedConversationId || null}
      className={className}
      style={style}
      messages={messages}
      showInitialSkeleton={showInitialSkeleton}
      showBackgroundOverlay={showBackgroundOverlay}
      error={messagesError}
      refetch={refreshActiveConversation}
    />
  );
};

/**
 * Inner component that handles the main content panel content
 */
interface MainContentPanelContentProps {
  selectedConversationId: string | null;
  className?: string;
  style?: React.CSSProperties;
  messages: MessageViewModel[];
  showInitialSkeleton: boolean;
  showBackgroundOverlay: boolean;
  error: ErrorState | undefined;
  refetch: () => Promise<void>;
}

const MainContentPanelContent: React.FC<MainContentPanelContentProps> = ({
  selectedConversationId,
  className,
  style,
  messages,
  showInitialSkeleton,
  showBackgroundOverlay,
  error,
  refetch,
}) => {
  // Initialize chat event integration for real-time agent status updates
  useChatEventIntegration({ conversationId: selectedConversationId || null });

  // Message actions for context menu operations
  const { copyMessageContent, deleteMessage } = useMessageActions();
  const { showConfirmation, confirmationDialogProps } = useConfirmationDialog();

  // Ref to store scroll methods from ChatContainerDisplay
  const scrollMethodsRef = useRef<
    | {
        scrollToBottomIfPinned: (threshold?: number) => boolean;
        scrollToBottom: (behavior?: "auto" | "smooth") => void;
        wasPinned: () => boolean;
      }
    | undefined
  >(undefined);

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
        className="pt-[48px]"
      />

      {/* Chat Container - Add overflow constraints */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {!selectedConversationId ? (
          <NoConversationSelected />
        ) : showInitialSkeleton ? (
          <LoadingSkeleton />
        ) : error && messages.length === 0 ? (
          <ErrorStateComponent error={error} onRetry={refetch} />
        ) : (
          <>
            <ChatContainerDisplay
              messages={messages}
              emptyState={<EmptyConversation />}
              onContextMenuAction={handleContextMenuAction}
              onScrollMethods={(methods) => {
                scrollMethodsRef.current = methods;
              }}
            />
            {/* Background loading overlay */}
            {showBackgroundOverlay && (
              <div
                className="absolute inset-0 bg-black/5 flex items-start justify-center pt-4 pointer-events-none z-10"
                style={{ pointerEvents: "none" }}
              >
                <div className="bg-background/90 backdrop-blur-sm border rounded-full px-3 py-1 text-sm text-muted-foreground flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Syncing...
                </div>
              </div>
            )}
            {/* Inline error banner when messages exist */}
            {error && messages.length > 0 && (
              <div className="absolute top-0 left-0 right-0 bg-destructive/10 border-b border-destructive/20 p-2 z-20">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed to sync: {error.message}</span>
                  <button
                    onClick={refetch}
                    className="ml-auto text-xs underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Container - Only show if conversation is selected */}
      {selectedConversationId && (
        <MessageInputContainer
          conversationId={selectedConversationId}
          layoutVariant="default"
          scrollMethods={scrollMethodsRef.current}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmationDialogProps && (
        <ConfirmationDialog {...confirmationDialogProps} />
      )}
    </div>
  );
};

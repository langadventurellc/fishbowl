import { MainContentPanelDisplayProps } from "@fishbowl-ai/ui-shared";
import { AlertCircle, MessageCircle } from "lucide-react";
import React, { useState } from "react";
import { useChatEventIntegration } from "../../hooks/chat/useChatEventIntegration";
import { useMessagesWithAgentData } from "../../hooks/messages/useMessagesWithAgentData";
import { cn } from "../../lib/utils";
import { MessageInputContainer } from "../input";
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
  const [agents] = useState([]);

  // Initialize chat event integration for real-time agent status updates only if conversation is selected
  useChatEventIntegration({ conversationId: selectedConversationId || null });

  // Use the composite hook for messages with resolved agent names and roles
  const { messages, isLoading, error, refetch } = useMessagesWithAgentData(
    selectedConversationId || null,
  );

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
  const ErrorState = ({
    error,
    onRetry,
  }: {
    error: Error | null;
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
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <ChatContainerDisplay
            messages={messages}
            emptyState={<EmptyConversation />}
            onContextMenuAction={() => {}}
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
    </div>
  );
};

import { MainContentPanelDisplayProps } from "@fishbowl-ai/ui-shared";
import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { useChatEventIntegration } from "../../hooks/chat/useChatEventIntegration";
import { useMessages } from "../../hooks/messages/useMessages";
import { InputContainerDisplay } from "../input";
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
  const [inputText] = useState("");
  const [isManualMode] = useState(true);
  const [agents] = useState([]);

  // Initialize chat event integration for real-time agent status updates
  useChatEventIntegration({ conversationId: selectedConversationId || null });

  // Use the useMessages hook for real-time message data with loading and error states
  const {
    messages: rawMessages,
    isLoading,
    error,
    refetch,
  } = useMessages(selectedConversationId || "");

  // Transform Message[] to MessageViewModel[] for ChatContainerDisplay
  const messages = React.useMemo(() => {
    return rawMessages.map((message) => ({
      id: message.id,
      agent: message.role === "user" ? "User" : "Agent",
      role: message.role === "user" ? "User" : "Agent",
      content: message.content,
      timestamp: new Date(message.created_at).toLocaleTimeString(),
      type:
        message.role === "user"
          ? ("user" as const)
          : message.role === "system"
            ? ("system" as const)
            : ("agent" as const),
      isActive: message.included,
      agentColor: message.role === "user" ? "#3b82f6" : "#22c55e",
    }));
  }, [rawMessages]);

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

      {/* Chat Container */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
            role="status"
            aria-label="Loading messages"
          ></div>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4">
          <div className="text-red-600 text-center">
            <p className="font-medium">Failed to load messages</p>
            {error.message && error.message !== "Failed to load messages" && (
              <p className="text-sm text-gray-500">{error.message}</p>
            )}
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <ChatContainerDisplay
          messages={messages}
          onContextMenuAction={() => {}}
        />
      )}

      {/* Input Container */}
      <InputContainerDisplay
        layoutVariant="default"
        messageInputProps={{
          placeholder: "Type your message here...",
          content: inputText,
          disabled: false,
          size: "medium",
        }}
        sendButtonProps={{
          disabled: !inputText.trim(),
          loading: false,
          "aria-label": "Send message",
        }}
        modeToggleProps={{
          currentMode: isManualMode ? "manual" : "auto",
          disabled: false,
        }}
      />
    </div>
  );
};

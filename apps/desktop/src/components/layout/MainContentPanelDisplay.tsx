import React, { useState } from "react";
import { MainContentPanelDisplayProps } from "@fishbowl-ai/shared";
import { InputContainerDisplay } from "../input";
import { AgentLabelsContainerDisplay, ChatContainerDisplay } from "./";
import { cn } from "../../lib/utils";

/**
 * MainContentPanelDisplay - Primary conversation interface layout component
 *
 * Orchestrates the main conversation area by combining agent labels, chat messages,
 * and message input components. Provides the central content area layout with
 * proper flex organization and overflow handling for the conversation interface.
 */
export const MainContentPanelDisplay: React.FC<
  MainContentPanelDisplayProps
> = ({
  agents,
  messages,
  defaultInputText = "",
  defaultManualMode = true,
  className,
  style,
}) => {
  // Internal state management for input
  const [inputText] = useState(defaultInputText);
  const [isManualMode] = useState(defaultManualMode);

  return (
    <div
      className={cn("flex flex-1 flex-col overflow-hidden", className)}
      style={style}
    >
      {/* Agent Labels Container */}
      <AgentLabelsContainerDisplay
        agents={agents}
        onAddAgent={() => console.log("Demo: Adding new agent")}
      />

      {/* Chat Container */}
      <ChatContainerDisplay
        messages={messages}
        onContextMenuAction={() => {}}
      />

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

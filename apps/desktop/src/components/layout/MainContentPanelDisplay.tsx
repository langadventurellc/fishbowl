import { MainContentPanelDisplayProps } from "@fishbowl-ai/ui-shared";
import { createLoggerSync } from "@fishbowl-ai/shared";
import React, { useState } from "react";

const logger = createLoggerSync({
  config: { name: "MainContentPanelDisplay", level: "info" },
});
import { cn } from "../../lib/utils";
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
        onAddAgent={() => logger.info("Demo: Adding new agent")}
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

import React, { useState } from "react";
import { MainContentPanelDisplayProps } from "@fishbowl-ai/shared";
import { MessageItem } from "../chat";
import { InputContainerDisplay } from "../input";
import { AgentLabelsContainerDisplay, ChatContainerDisplay } from "./";

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

  // Container styles extracted from DesignPrototype.tsx lines 307-312 (contentArea)
  const containerStyles: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    // Merge custom styles
    ...style,
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Agent Labels Container */}
      <AgentLabelsContainerDisplay
        agents={agents}
        onAddAgent={() => console.log("Demo: Adding new agent")}
      />

      {/* Chat Container */}
      <ChatContainerDisplay
        messages={messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            canRegenerate={message.type === "agent"}
            onContextMenuAction={() => {}}
          />
        ))}
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

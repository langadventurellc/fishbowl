import React from "react";
import { MainContentPanelDisplayProps } from "@fishbowl-ai/shared";

export const MainContentPanelDisplay: React.FC<
  MainContentPanelDisplayProps
> = ({
  agentLabelsContainer,
  chatContainer,
  inputContainer,
  className,
  style,
}) => {
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
      {agentLabelsContainer}
      {chatContainer}
      {inputContainer}
    </div>
  );
};

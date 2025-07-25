import React from "react";
import { ConversationLayoutDisplayProps } from "@fishbowl-ai/shared";

export const ConversationLayoutDisplay: React.FC<
  ConversationLayoutDisplayProps
> = ({ sidebar, mainContent, className, style }) => {
  // Container styles extracted from DesignPrototype.tsx lines 241-245 (mainLayout)
  const containerStyles: React.CSSProperties = {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    // Merge custom styles
    ...style,
  };

  return (
    <div className={className} style={containerStyles}>
      {sidebar}
      {mainContent}
    </div>
  );
};

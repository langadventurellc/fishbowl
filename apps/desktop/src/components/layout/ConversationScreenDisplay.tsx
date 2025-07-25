import React from "react";
import { ConversationScreenDisplayProps } from "@fishbowl-ai/shared";

export const ConversationScreenDisplay: React.FC<
  ConversationScreenDisplayProps
> = ({ fullScreen = true, children, className, style, onClick }) => {
  // Container styles extracted from DesignPrototype.tsx lines 231-240
  const containerStyles: React.CSSProperties = {
    width: "100%",
    height: fullScreen ? "100vh" : "auto",
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    fontFamily: "var(--font-sans)",
    display: "flex",
    flexDirection: "column",
    transition: "background-color 0.2s, color 0.2s",
    // Merge custom styles
    ...style,
  };

  return (
    <div className={className} style={containerStyles} onClick={onClick}>
      {children}
    </div>
  );
};

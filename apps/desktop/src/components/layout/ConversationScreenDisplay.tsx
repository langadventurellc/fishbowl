import { ConversationScreenDisplayProps } from "@fishbowl-ai/ui-shared";
import React from "react";

/**
 * ConversationScreenDisplay - Root container for the conversation application
 *
 * Top-level wrapper component that provides the foundational styling and structure
 * for the entire conversation interface. Handles full-screen layout, theme variables,
 * and serves as the root container for all conversation-related components.
 */
export const ConversationScreenDisplay: React.FC<
  ConversationScreenDisplayProps
> = ({ fullScreen = true, children, className, style, onClick }) => {
  // Container styles for the full-screen conversation wrapper
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

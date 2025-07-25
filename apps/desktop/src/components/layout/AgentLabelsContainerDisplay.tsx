import React from "react";
import { AgentLabelsContainerDisplayProps } from "@fishbowl-ai/shared";
import { AgentPill } from "../chat";
import { Button } from "../input";

/**
 * AgentLabelsContainerDisplay - Horizontal agent labels bar layout component
 *
 * Displays active conversation agents as pills in a horizontal scrollable bar.
 * Self-contained component that renders AgentPill components from agent data
 * and includes an "Add Agent" button. Positioned at the top of the conversation
 * area with proper spacing, alignment, and theme integration.
 */
export const AgentLabelsContainerDisplay: React.FC<
  AgentLabelsContainerDisplayProps
> = ({
  agents,
  onAddAgent,
  barHeight = "56px",
  agentSpacing = "8px",
  containerPadding = "0 16px",
  horizontalScroll = true,
  showBottomBorder = true,
  backgroundVariant = "card",
  className,
  style,
}) => {
  // Container styles for the horizontal agent labels bar
  const containerStyles: React.CSSProperties = {
    height: barHeight,
    backgroundColor: `var(--${backgroundVariant})`,
    borderBottom: showBottomBorder ? "1px solid var(--border)" : "none",
    display: "flex",
    alignItems: "center",
    padding: containerPadding,
    gap: agentSpacing,
    overflowX: horizontalScroll ? "auto" : "visible",
    overflowY: "hidden",
    // Merge custom styles
    ...style,
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Internally generated agent pills */}
      {agents.map((agent, index) => (
        <AgentPill key={index} agent={agent} />
      ))}

      {/* Built-in "Add New Agent" button */}
      {onAddAgent && (
        <Button
          variant="ghost"
          size="small"
          onClick={onAddAgent}
          className="add-agent-button"
          aria-label="Add new agent to conversation"
        >
          +
        </Button>
      )}
    </div>
  );
};

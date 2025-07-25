import React from "react";
import { AgentLabelsContainerDisplayProps } from "@fishbowl-ai/shared";
import { AgentPill } from "../chat";
import { Button } from "../input";

/**
 * AgentLabelsContainerDisplay component provides the horizontal agent labels bar layout.
 *
 * Self-contained component that internally creates AgentPill components from agent data
 * and includes a built-in "Add New Agent" button. Manages the top area that displays
 * active agents with proper spacing, alignment, and theme integration.
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
  // Container styles extracted from DesignPrototype.tsx lines 313-321
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

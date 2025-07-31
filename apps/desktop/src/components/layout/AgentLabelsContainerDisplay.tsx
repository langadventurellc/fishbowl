import { AgentLabelsContainerDisplayProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../lib/utils";
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
  // Dynamic styles that can't be converted to Tailwind utilities
  const dynamicStyles: React.CSSProperties = {
    height: barHeight,
    backgroundColor: `var(--${backgroundVariant})`,
    padding: containerPadding,
    gap: agentSpacing,
    // Merge custom styles
    ...style,
  };

  return (
    <div
      className={cn(
        "flex items-center overflow-y-hidden",
        showBottomBorder && "border-b border-border",
        horizontalScroll ? "overflow-x-auto" : "overflow-x-visible",
        className,
      )}
      style={dynamicStyles}
    >
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

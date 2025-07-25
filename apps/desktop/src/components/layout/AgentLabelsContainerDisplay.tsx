import React from "react";
import { AgentLabelsContainerDisplayProps } from "@fishbowl-ai/shared";

/**
 * AgentLabelsContainerDisplay component provides the horizontal agent labels bar layout.
 *
 * Extracted from DesignPrototype.tsx lines 313-321 (agentLabelsBar styles).
 * Manages the top area that displays active agents with proper spacing, alignment,
 * and theme integration.
 */
export const AgentLabelsContainerDisplay: React.FC<
  AgentLabelsContainerDisplayProps
> = ({
  agentPills = [],
  actionButtons = [],
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
      {agentPills}
      {actionButtons}
    </div>
  );
};

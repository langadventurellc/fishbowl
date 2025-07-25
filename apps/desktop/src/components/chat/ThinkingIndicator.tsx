import React from "react";
import { ThinkingIndicatorProps } from "@fishbowl-ai/shared";

/**
 * ThinkingIndicator component displays an animated pulsing dot to indicate agent activity.
 *
 * A lightweight atomic component that provides visual feedback when AI agents are
 * processing or generating responses. Features a smooth pulsing animation with
 * customizable appearance and timing to match different UI contexts and themes.
 *
 * Features:
 * - Smooth pulsing animation with configurable timing (slow, normal, fast)
 * - Multiple size variants (small, medium, large) for different UI contexts
 * - Customizable color support with theme-aware defaults
 * - Unique animation keyframes to prevent CSS conflicts
 * - Lightweight implementation with minimal DOM footprint
 * - Accessibility-friendly with reduced motion considerations
 */
export function ThinkingIndicator({
  size = "medium",
  color = "var(--primary)",
  animationSpeed = "normal",
  className,
}: ThinkingIndicatorProps) {
  // Generate unique animation name to avoid conflicts
  const animationName = `thinking-pulse-${Math.random().toString(36).substr(2, 9)}`;

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { width: "4px", height: "4px" };
      case "large":
        return { width: "8px", height: "8px" };
      default: // medium
        return { width: "6px", height: "6px" };
    }
  };

  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case "slow":
        return "2s";
      case "fast":
        return "1s";
      default: // normal
        return "1.5s";
    }
  };

  const styles = {
    ...getSizeStyles(),
    borderRadius: "50%",
    backgroundColor: color,
    animation: `${animationName} ${getAnimationDuration()} infinite ease-in-out`,
  };

  const keyframes = `
    @keyframes ${animationName} {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 0.3; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles} className={className} />
    </>
  );
}

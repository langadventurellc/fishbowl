import React from "react";
import { ThinkingIndicatorProps } from "@fishbowl-ai/shared";
import { cn } from "@/lib/utils";

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
 * - Tailwind utility classes for consistent styling
 * - Lightweight implementation with minimal DOM footprint
 * - Accessibility-friendly with reduced motion considerations
 */
export function ThinkingIndicator({
  size = "medium",
  color = "var(--primary)",
  animationSpeed = "normal",
  className,
}: ThinkingIndicatorProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-1 h-1"; // 4px
      case "large":
        return "w-2 h-2"; // 8px
      default: // medium
        return "w-1.5 h-1.5"; // 6px
    }
  };

  const getAnimationClasses = () => {
    switch (animationSpeed) {
      case "slow":
        return "[animation-duration:2s]";
      case "fast":
        return "[animation-duration:1s]";
      default: // normal
        return "[animation-duration:1.5s]";
    }
  };

  return (
    <div
      style={{ backgroundColor: color }}
      className={cn(
        "rounded-full animate-pulse",
        getSizeClasses(),
        getAnimationClasses(),
        className,
      )}
    />
  );
}

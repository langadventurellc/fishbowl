import React from "react";
import { MessageAvatarProps } from "@fishbowl-ai/shared";

/**
 * MessageAvatar component displays a colored circle/pill for message sender identification.
 *
 * Extracted from DesignPrototype.tsx to create a pure display component that shows
 * agent identification through colored visual indicators. Used in message headers
 * to provide visual association between messages and their agent senders.
 *
 * Features:
 * - Colored circle/pill matching agent theme colors
 * - Multiple size variants (small, medium, large)
 * - Theme-aware styling with CSS custom properties
 * - Accessibility support with proper ARIA attributes
 * - Pure component with no state or side effects
 */
export function MessageAvatar({
  agentColor,
  agentName,
  role,
  size = "medium",
  className,
}: MessageAvatarProps) {
  // Size-based dimensions for consistent proportions
  const sizeConfig = {
    small: {
      diameter: "12px",
      fontSize: "8px",
      initials: true, // Show initials for better identification
    },
    medium: {
      diameter: "16px",
      fontSize: "10px",
      initials: true,
    },
    large: {
      diameter: "20px",
      fontSize: "12px",
      initials: true,
    },
  };

  const config = sizeConfig[size];

  // Extract initials from agent name for better visual identification
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(agentName);

  const styles = {
    avatar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: config.diameter,
      height: config.diameter,
      borderRadius: "50%",
      backgroundColor: agentColor,
      color: "white",
      fontSize: config.fontSize,
      fontWeight: "600",
      fontFamily: "var(--font-sans)",
      flexShrink: 0,
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      transition: "all 0.15s ease-in-out",
    } as const,
  };

  return (
    <div
      style={styles.avatar}
      className={className}
      title={`${agentName} (${role})`}
      aria-label={`Avatar for ${agentName}, ${role}`}
      role="img"
    >
      {config.initials ? initials : ""}
    </div>
  );
}

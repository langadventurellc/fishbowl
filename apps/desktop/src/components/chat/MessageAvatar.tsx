import { MessageAvatarProps } from "@fishbowl-ai/ui-shared";

/**
 * MessageAvatar component displays a colored circle avatar for message sender identification.
 *
 * A pure visual component that creates agent identification through colored circular avatars
 * with initials. Used in message headers to provide immediate visual association between
 * messages and their AI agent senders, enhancing conversation readability and organization.
 *
 * Features:
 * - Colored circular avatars matching agent theme colors for consistent branding
 * - Agent initials display for enhanced identification and personalization
 * - Multiple size variants (small, medium, large) for different UI contexts
 * - Responsive design with proper scaling and typography adjustments
 * - Theme-aware styling with CSS custom properties for dark/light mode support
 * - Full accessibility support with proper ARIA attributes and semantic markup
 * - Pure component design with no internal state or side effects
 * - Subtle visual enhancements with borders and shadows for depth
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

import React from "react";
import { MessageHeaderProps } from "@fishbowl-ai/shared";
import { MessageAvatar } from "./MessageAvatar";

/**
 * MessageHeader component displays message metadata with proper spacing and typography.
 *
 * A pure display component that renders message sender information including agent name,
 * role, and timestamp in a consistent, visually appealing layout. Integrates the
 * MessageAvatar component to provide visual association between messages and their senders.
 *
 * Features:
 * - Flex layout with consistent spacing (8px gap, 4px margin-bottom)
 * - Optimized typography with 12px font size and 500 weight for readability
 * - Agent color coding system for visual consistency across the conversation
 * - Integrated MessageAvatar component for immediate sender identification
 * - Support for all message types (user, agent, system) with contextual formatting
 * - Theme-aware styling using CSS custom properties for dark/light mode support
 * - Pure component design with no internal state or side effects
 * - Full accessibility support with semantic HTML and ARIA attributes
 *
 * Layout Structure:
 * [Avatar] [Agent Name | Role] — [Timestamp]
 *
 * @example
 * ```tsx
 * // Agent message header
 * <MessageHeader
 *   agentName="Technical Advisor"
 *   agentRole="Technical Advisor"
 *   agentColor="#3b82f6"
 *   timestamp="2:15 PM"
 *   messageType="agent"
 * />
 *
 * // User message header
 * <MessageHeader
 *   agentName="User"
 *   agentRole="User"
 *   agentColor="#6b7280"
 *   timestamp="2:20 PM"
 *   messageType="user"
 * />
 * ```
 */
export function MessageHeader({
  agentName,
  agentRole,
  agentColor,
  timestamp,
  messageType,
  className,
}: MessageHeaderProps) {
  // Format timestamp with dash prefix for visual consistency
  const formatTimestamp = (timestamp: string): string => {
    return `— ${timestamp}`;
  };

  // Component styles for consistent header layout and typography
  const styles = {
    header: {
      position: "relative" as const,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
      fontSize: "12px",
      fontWeight: "500",
    } as const,
    agentInfo: {
      color: agentColor,
      display: "flex",
      alignItems: "center",
      gap: "4px",
    } as const,
    agentText: {
      color: agentColor,
    } as const,
    timestamp: {
      color: "var(--muted-foreground)",
    } as const,
  };

  // Determine agent display text based on message type
  const getAgentDisplayText = (): string => {
    if (messageType === "user") {
      return `[${agentName}]`;
    } else if (messageType === "agent") {
      return `[${agentName} | ${agentRole}]`;
    } else {
      // System messages
      return `[${agentName}]`;
    }
  };

  return (
    <div
      style={styles.header}
      className={className}
      role="banner"
      aria-label={`Message from ${agentName}, ${agentRole} at ${timestamp}`}
    >
      {/* MessageAvatar for visual identification */}
      <MessageAvatar
        agentColor={agentColor}
        agentName={agentName}
        role={agentRole}
        size="small"
      />

      {/* Agent information with color coding */}
      <span style={styles.agentText}>{getAgentDisplayText()}</span>

      {/* Formatted timestamp */}
      <span style={styles.timestamp}>{formatTimestamp(timestamp)}</span>
    </div>
  );
}

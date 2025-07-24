import React from "react";
import { MessageHeaderProps } from "@fishbowl-ai/shared";
import { MessageAvatar } from "./MessageAvatar";

/**
 * MessageHeader component displays message metadata with proper spacing and typography.
 *
 * Extracted from DesignPrototype.tsx to create a pure display component that shows
 * agent name, role, and timestamp information in a consistent layout. Integrates
 * MessageAvatar component for visual association between messages and agents.
 *
 * Features:
 * - Flex layout with consistent spacing (8px gap, 4px margin-bottom)
 * - Typography styles matching DesignPrototype (12px font, 500 weight)
 * - Agent color coding for visual consistency
 * - MessageAvatar integration for sender identification
 * - Support for different message types (user, agent, system)
 * - Theme-aware styling with CSS custom properties
 * - Pure component with no state or interactive functionality
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
  // Format timestamp with dash prefix for consistency with DesignPrototype
  const formatTimestamp = (timestamp: string): string => {
    return `— ${timestamp}`;
  };

  // Component styles extracted from DesignPrototype.tsx (lines 365-373)
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

import React from "react";
import { AgentPillProps } from "@fishbowl-ai/shared";

/**
 * AgentPill component displays agent information in a pill-shaped container.
 *
 * Extracted from DesignPrototype.tsx to create a reusable atomic component
 * that shows agent name, role, and optional thinking indicator with proper
 * theme-aware styling.
 */
export function AgentPill({ agent, onClick, className }: AgentPillProps) {
  const styles = {
    agentPill: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      color: "white",
      backgroundColor: agent.color,
      cursor: onClick ? "pointer" : "default",
      transition: "opacity 0.15s ease-in-out",
      fontFamily: "var(--font-sans)",
    } as const,
    thinkingDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: "currentColor",
      opacity: 0.7,
      animation: "pulse 2s infinite",
    } as const,
  };

  const handleClick = () => {
    if (onClick) {
      onClick(agent.name);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = "0.8";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = "1";
    }
  };

  return (
    <div
      style={styles.agentPill}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(agent.name);
        }
      }}
    >
      <span>
        {agent.name} | {agent.role}
      </span>
      {agent.isThinking && <div style={styles.thinkingDot} />}
    </div>
  );
}

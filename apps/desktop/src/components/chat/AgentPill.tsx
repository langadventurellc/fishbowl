import React from "react";
import { AgentPillProps } from "@fishbowl-ai/shared";
import { cn } from "@/lib/utils";

/**
 * AgentPill component displays agent information in a pill-shaped container.
 *
 * A reusable atomic component that shows agent name, role, and optional thinking
 * indicator with proper theme-aware styling. Features hover effects, keyboard
 * navigation, and proper accessibility attributes for interactive elements.
 */
export function AgentPill({ agent, onClick, className }: AgentPillProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(agent.name);
    }
  };

  return (
    <div
      style={{ backgroundColor: agent.color }}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-opacity duration-150",
        onClick && "cursor-pointer hover:opacity-80",
        className,
      )}
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
      {agent.isThinking && (
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      )}
    </div>
  );
}

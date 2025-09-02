import React from "react";
import { cn } from "@/lib/utils";
import { AgentPillProps, useChatStore } from "@fishbowl-ai/ui-shared";

/**
 * AgentPill component displays agent information in a pill-shaped container.
 *
 * A reusable atomic component that shows agent name, role, and optional thinking
 * indicator with proper theme-aware styling. Features hover effects, keyboard
 * navigation, and proper accessibility attributes for interactive elements.
 *
 * Enhanced with real-time status integration from useChatStore when showStatus=true.
 */
export function AgentPill({
  agent,
  onClick,
  onToggleEnabled,
  conversationAgentId,
  showStatus = false,
  className,
}: AgentPillProps) {
  const { agentThinking, lastError } = useChatStore();

  const [recentlyCompleted, setRecentlyCompleted] = React.useState(false);
  const [prevThinking, setPrevThinking] = React.useState(false);

  // Derive agent status from store state when showStatus is enabled
  const agentStatus = React.useMemo(() => {
    if (!showStatus || !conversationAgentId) {
      return agent.status || (agent.isThinking ? "thinking" : "idle");
    }

    const isThinking = agentThinking[conversationAgentId] === true;
    const hasError =
      lastError[conversationAgentId] !== null &&
      lastError[conversationAgentId] !== undefined;

    if (hasError) return "error";
    if (isThinking) return "thinking";
    if (recentlyCompleted) return "complete";
    return "idle";
  }, [
    showStatus,
    conversationAgentId,
    agentThinking,
    lastError,
    agent.status,
    agent.isThinking,
    recentlyCompleted,
  ]);

  const agentError = React.useMemo(() => {
    if (!showStatus || !conversationAgentId) {
      return agent.error;
    }
    return lastError[conversationAgentId];
  }, [showStatus, conversationAgentId, lastError, agent.error]);

  // Handle completion state timing
  React.useEffect(() => {
    if (!showStatus || !conversationAgentId) return;

    const isCurrentlyThinking = agentThinking[conversationAgentId] === true;

    // If thinking changed from true to false, show complete state briefly
    if (
      prevThinking &&
      !isCurrentlyThinking &&
      !lastError[conversationAgentId]
    ) {
      setRecentlyCompleted(true);
      const timer = setTimeout(() => {
        setRecentlyCompleted(false);
      }, 2500);
      return () => clearTimeout(timer);
    }

    setPrevThinking(isCurrentlyThinking);
  }, [showStatus, conversationAgentId, agentThinking, lastError, prevThinking]);

  const handleClick = () => {
    if (onToggleEnabled && conversationAgentId) {
      onToggleEnabled(conversationAgentId);
    } else if (onClick) {
      onClick(agent.name);
    }
  };

  const isClickable = !!(onToggleEnabled || onClick);

  const getStatusAriaLabel = () => {
    const baseLabel = `${agent.name} | ${agent.role} - ${agent.enabled ? "enabled" : "disabled"}`;

    if (!showStatus) return baseLabel;

    switch (agentStatus) {
      case "thinking":
        return `${baseLabel} - currently processing`;
      case "complete":
        return `${baseLabel} - completed processing`;
      case "error":
        return `${baseLabel} - error occurred${agentError?.message ? `: ${agentError.message}` : ""}`;
      default:
        return `${baseLabel} - idle`;
    }
  };

  return (
    <div
      style={{ backgroundColor: agent.color }}
      onClick={handleClick}
      className={cn(
        "group flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all duration-150 relative",
        agent.enabled ? "opacity-100" : "opacity-50",
        agentStatus === "error" && "ring-2 ring-red-400 ring-opacity-50",
        agentStatus === "complete" && "ring-2 ring-green-400 ring-opacity-50",
        isClickable && "cursor-pointer hover:opacity-80",
        className,
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={onToggleEnabled ? agent.enabled : undefined}
      aria-label={getStatusAriaLabel()}
      title={
        agentStatus === "error" && agentError?.message
          ? agentError.message
          : undefined
      }
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          if (onToggleEnabled && conversationAgentId) {
            onToggleEnabled(conversationAgentId);
          } else if (onClick) {
            onClick(agent.name);
          }
        }
      }}
    >
      <span>
        {agent.name} | {agent.role}
      </span>

      {/* Status indicators */}
      {agentStatus === "thinking" && (
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-1 rounded-full bg-current opacity-70 animate-bounce [animation-delay:0ms]" />
          <div className="w-1 h-1 rounded-full bg-current opacity-70 animate-bounce [animation-delay:150ms]" />
          <div className="w-1 h-1 rounded-full bg-current opacity-70 animate-bounce [animation-delay:300ms]" />
        </div>
      )}

      {agentStatus === "complete" && (
        <div className="w-3 h-3 flex items-center justify-center animate-in zoom-in duration-300">
          <svg
            className="w-2.5 h-2.5 text-green-200"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {agentStatus === "error" && (
        <div className="w-3 h-3 flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-red-200"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Fallback for legacy isThinking when showStatus is false */}
      {!showStatus && agent.isThinking && (
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      )}
    </div>
  );
}

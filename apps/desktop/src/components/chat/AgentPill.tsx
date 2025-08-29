import { cn } from "@/lib/utils";
import { AgentPillProps } from "@fishbowl-ai/ui-shared";

/**
 * AgentPill component displays agent information in a pill-shaped container.
 *
 * A reusable atomic component that shows agent name, role, and optional thinking
 * indicator with proper theme-aware styling. Features hover effects, keyboard
 * navigation, and proper accessibility attributes for interactive elements.
 */
export function AgentPill({
  agent,
  onClick,
  onToggleEnabled,
  conversationAgentId,
  className,
}: AgentPillProps) {
  const handleClick = () => {
    if (onToggleEnabled && conversationAgentId) {
      onToggleEnabled(conversationAgentId);
    } else if (onClick) {
      onClick(agent.name);
    }
  };

  const isClickable = !!(onToggleEnabled || onClick);

  return (
    <div
      style={{ backgroundColor: agent.color }}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all duration-150",
        agent.enabled ? "opacity-100" : "opacity-50",
        isClickable && "cursor-pointer hover:opacity-80",
        className,
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={onToggleEnabled ? agent.enabled : undefined}
      aria-label={
        onToggleEnabled
          ? `${agent.name} | ${agent.role} - ${agent.enabled ? "enabled" : "disabled"}`
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
      {agent.isThinking && (
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      )}
    </div>
  );
}

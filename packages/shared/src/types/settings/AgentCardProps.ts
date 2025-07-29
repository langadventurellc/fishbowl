/**
 * Agent card component props
 *
 * @module types/settings/AgentCardProps
 */
import type { AgentCard } from "./AgentCard";

export interface AgentCardProps {
  /** Agent data to display */
  agent: AgentCard;
  /** Callback when edit button is clicked */
  onEdit?: (agentId: string) => void;
  /** Callback when delete button is clicked */
  onDelete?: (agentId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

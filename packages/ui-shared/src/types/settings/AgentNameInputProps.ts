import type { AgentCard } from "./AgentCard";

export interface AgentNameInputProps {
  value: string;
  onChange: (value: string) => void;
  existingAgents?: AgentCard[];
  currentAgentId?: string;
  disabled?: boolean;
  maxLength?: number;
}

/**
 * Agent interface for settings section display.
 * Represents an AI agent in the Library tab with configuration details.
 *
 * @module types/ui/settings/AgentCard
 */
export interface AgentCard {
  id: string;
  name: string;
  model: string;
  role: string;
  llmConfigId: string;
}

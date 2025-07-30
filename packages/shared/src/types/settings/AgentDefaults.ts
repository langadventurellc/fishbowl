/**
 * Agent defaults interface for Defaults tab.
 * Default values for new agent creation.
 *
 * @module types/settings/AgentDefaults
 */
export interface AgentDefaults {
  temperature: number;
  maxTokens: number;
  topP: number;
}

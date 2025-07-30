/**
 * Agent configuration interface.
 * Core settings that define agent behavior parameters.
 *
 * @module types/ui/settings/AgentConfiguration
 */
export interface AgentConfiguration {
  temperature: number;
  maxTokens: number;
  topP: number;
  model: string;
  systemPrompt?: string;
}

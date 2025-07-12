/**
 * Configuration for AI agent interactions.
 */
export interface AgentConfig {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  model?: string;
}

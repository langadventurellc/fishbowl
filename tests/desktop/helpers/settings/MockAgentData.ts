/**
 * Mock agent configuration interface for testing
 *
 * @module helpers/settings/MockAgentData
 */

export interface MockAgentData {
  name: string;
  model: string;
  role: string;
  personality: string;
  systemPrompt?: string;
}

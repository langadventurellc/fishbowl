/**
 * Creates mock analyst agent data for testing
 *
 * @module helpers/settings/createMockAnalystAgent
 */

import { randomUUID } from "crypto";
import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createMockAnalystAgent = (): AgentFormData => {
  const agentId = randomUUID().slice(0, 8);

  return {
    name: `Research Analyst ${agentId}`,
    model: "claude-3-sonnet-20240229",
    role: "test-analyst-role",
    personality: "test-analytical-personality",
    systemPrompt: `You are a research analyst agent for automated testing purposes (ID: ${agentId}). Specialized in data analysis and research. Always provide clear, analytical responses for test scenarios.`,
  };
};

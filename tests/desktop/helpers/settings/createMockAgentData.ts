/**
 * Creates mock agent data for testing
 *
 * @module helpers/settings/createMockAgentData
 */

import { randomUUID } from "crypto";
import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createMockAgentData = (
  overrides?: Partial<AgentFormData>,
): AgentFormData => {
  const agentId = randomUUID().slice(0, 8);

  return {
    name: `Test Agent ${agentId}`,
    model: "claude-3-sonnet",
    role: "test-analyst-role",
    personality: "test-professional-personality",
    systemPrompt: `You are a test agent for automated testing purposes (ID: ${agentId}). Help with testing and verification tasks. Always provide clear, actionable responses for test scenarios. Remember you are part of an automated test suite.`,
    ...overrides,
  };
};

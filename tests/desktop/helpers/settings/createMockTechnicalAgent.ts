/**
 * Creates mock technical agent data for testing
 *
 * @module helpers/settings/createMockTechnicalAgent
 */

import { randomUUID } from "crypto";
import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createMockTechnicalAgent = (): AgentFormData => {
  const agentId = randomUUID().slice(0, 8);

  return {
    name: `Technical Expert ${agentId}`,
    model: "claude-3-sonnet-20240229",
    role: "test-technical-role",
    personality: "test-logical-personality",
    systemPrompt: `You are a technical expert agent for automated testing purposes (ID: ${agentId}). Technical problem solving and system analysis specialist. Always provide logical, precise responses for test scenarios.`,
  };
};

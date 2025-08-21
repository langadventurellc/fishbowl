/**
 * Creates mock writer agent data for testing
 *
 * @module helpers/settings/createMockWriterAgent
 */

import { randomUUID } from "crypto";
import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createMockWriterAgent = (): AgentFormData => {
  const agentId = randomUUID().slice(0, 8);

  return {
    name: `Content Writer ${agentId}`,
    model: "claude-3-sonnet-20240229",
    role: "test-writer-role",
    personality: "test-creative-personality",
    systemPrompt: `You are a content writer agent for automated testing purposes (ID: ${agentId}). Creative writing and content generation specialist. Always provide creative, engaging responses for test scenarios.`,
  };
};
